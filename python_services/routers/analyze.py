"""
Gym Vision Router — /api/v1/analyze
Accepts a Base64 JPEG frame from the frontend, runs MediaPipe PoseLandmarker,
and returns rep count, posture feedback, and landmark coords for AR overlay.
"""

import base64
import logging
import os
import time
from typing import Optional

import cv2
import numpy as np
from fastapi import APIRouter, HTTPException
from mediapipe import Image as MpImage, ImageFormat
from mediapipe.tasks.python.vision import (
    PoseLandmarker,
    PoseLandmarkerOptions,
    RunningMode,
)
from mediapipe.tasks.python import BaseOptions
from pydantic import BaseModel, Field

logger = logging.getLogger("gym_service.analyze")
router = APIRouter(tags=["Gym Analysis"])

# lazy-load PoseLandmarker so other endpoints still work if the model file is missing
_MODEL_PATH = os.path.normpath(
    os.path.join(os.path.dirname(__file__), "..", "pose_landmarker_full.task")
)
_landmarker = None


def _get_landmarker() -> PoseLandmarker:
    global _landmarker
    if _landmarker is not None:
        return _landmarker

    if not os.path.exists(_MODEL_PATH):
        raise HTTPException(
            status_code=503,
            detail=(
                "Pose model not found. Run `python setup_model.py` inside "
                "`python_services` to download pose_landmarker_full.task."
            ),
        )

    options = PoseLandmarkerOptions(
        base_options=BaseOptions(model_asset_path=_MODEL_PATH),
        running_mode=RunningMode.IMAGE,
        num_poses=1,
        min_pose_detection_confidence=0.5,
        min_pose_presence_confidence=0.5,
        min_tracking_confidence=0.5,
    )
    _landmarker = PoseLandmarker.create_from_options(options)
    logger.info("PoseLandmarker model loaded: %s", _MODEL_PATH)
    return _landmarker


# landmark indices
class LM:
    RIGHT_SHOULDER = 12
    LEFT_SHOULDER  = 11
    RIGHT_ELBOW    = 14
    LEFT_ELBOW     = 13
    RIGHT_WRIST    = 16
    LEFT_WRIST     = 15
    RIGHT_HIP      = 24
    LEFT_HIP       = 23
    RIGHT_KNEE     = 26
    LEFT_KNEE      = 25
    RIGHT_ANKLE    = 28
    LEFT_ANKLE     = 27

SUPPORTED_EXERCISES = ["Squat", "Bicep Curl", "Push-Up", "Shoulder Press"]


# request/response schemas
class FrameRequest(BaseModel):
    session_id: str  = Field(..., description="Unique session identifier per user/exercise")
    exercise:   str  = Field(..., description="Squat | Bicep Curl | Push-Up | Shoulder Press")
    frame_b64:  str  = Field(..., description="Base64-encoded JPEG frame (no data-URI prefix)")


class AnalysisResponse(BaseModel):
    session_id:          str
    exercise:            str
    reps:                int
    stage:               Optional[str]
    posture_correct:     bool
    feedback:            str
    confidence:          float
    angle:               Optional[float]
    landmarks_detected:  bool
    processing_ms:       float
    landmarks:           Optional[list] = None


class SessionResetRequest(BaseModel):
    session_id: str


# in-memory session state (keyed by session_id)
_sessions: dict[str, dict] = {}

# constants for stable rep counting
MIN_VISIBILITY = 0.5
SMOOTHING_ALPHA = 0.65      # EMA weight — higher = faster reaction
MIN_ANGLE_TRAVEL = 18.0     # degrees the angle must move to count
REP_COOLDOWN_MS = 200       # min ms between rep counts


# geometry helpers
def _angle(a, b, c) -> float:
    a, b, c = np.array(a), np.array(b), np.array(c)
    radians = (
        np.arctan2(c[1] - b[1], c[0] - b[0])
        - np.arctan2(a[1] - b[1], a[0] - b[0])
    )
    angle = float(np.abs(radians * 180.0 / np.pi))
    return 360 - angle if angle > 180 else angle


def _pt(lm_list, idx: int):
    lm = lm_list[idx]
    return [lm.x, lm.y]


def _vis(lm_list, idx: int) -> float:
    return float(lm_list[idx].visibility) if lm_list[idx].visibility is not None else 0.0


def _side_visible(lm_list, *indices) -> bool:
    return all(_vis(lm_list, i) >= MIN_VISIBILITY for i in indices)


def _smooth_angle(state: dict, key: str, raw_angle: float) -> float:
    prev = state.get(key)
    if prev is None:
        state[key] = raw_angle
        return raw_angle
    smoothed = SMOOTHING_ALPHA * raw_angle + (1 - SMOOTHING_ALPHA) * prev
    state[key] = smoothed
    return smoothed


def _best_side_angle(lm, state, key_prefix,
                     r_indices: tuple, l_indices: tuple) -> float | None:
    """Compute angle for the best-visible side, or average both if both visible."""
    r_ok = _side_visible(lm, *r_indices)
    l_ok = _side_visible(lm, *l_indices)

    if r_ok and l_ok:
        r_angle = _angle(_pt(lm, r_indices[0]), _pt(lm, r_indices[1]), _pt(lm, r_indices[2]))
        l_angle = _angle(_pt(lm, l_indices[0]), _pt(lm, l_indices[1]), _pt(lm, l_indices[2]))
        raw = (r_angle + l_angle) / 2
    elif r_ok:
        raw = _angle(_pt(lm, r_indices[0]), _pt(lm, r_indices[1]), _pt(lm, r_indices[2]))
    elif l_ok:
        raw = _angle(_pt(lm, l_indices[0]), _pt(lm, l_indices[1]), _pt(lm, l_indices[2]))
    else:
        return None

    return _smooth_angle(state, f"_smooth_{key_prefix}", raw)


def _can_count_rep(state: dict) -> bool:
    now = time.perf_counter() * 1000
    last = state.get("_last_rep_ms", 0)
    if now - last < REP_COOLDOWN_MS:
        return False
    return True


def _mark_rep_counted(state: dict):
    state["_last_rep_ms"] = time.perf_counter() * 1000


def _check_angle_travel(state: dict, angle: float, stage: str) -> bool:
    """Track peak angles per stage to ensure minimum travel before counting."""
    if stage == "up":
        peak = state.get("_peak_up", angle)
        state["_peak_up"] = max(peak, angle)
        return True
    elif stage == "down":
        valley = state.get("_valley_down", angle)
        state["_valley_down"] = min(valley, angle)
        return True
    return True


# exercise analyzers
# each returns: (counter, stage, posture_correct, feedback, angle)

def _analyze_squat(lm, state):
    knee_angle = _best_side_angle(
        lm, state, "squat_knee",
        (LM.RIGHT_HIP, LM.RIGHT_KNEE, LM.RIGHT_ANKLE),
        (LM.LEFT_HIP,  LM.LEFT_KNEE,  LM.LEFT_ANKLE),
    )
    if knee_angle is None:
        return state["counter"], state["stage"], True, "Body not fully visible", None

    back_angle = _best_side_angle(
        lm, state, "squat_back",
        (LM.RIGHT_SHOULDER, LM.RIGHT_HIP, LM.RIGHT_KNEE),
        (LM.LEFT_SHOULDER,  LM.LEFT_HIP,  LM.LEFT_KNEE),
    )

    counter, stage = state["counter"], state["stage"]

    if knee_angle > 155:
        if stage == "down":
            valley = state.get("_valley_down", knee_angle)
            if (knee_angle - valley) >= MIN_ANGLE_TRAVEL and _can_count_rep(state):
                counter += 1
                _mark_rep_counted(state)
        stage = "up"
        state["_peak_up"] = knee_angle
    elif knee_angle < 100:
        stage = "down"
        state["_valley_down"] = knee_angle

    posture_correct, feedback = True, "Good form"
    if stage == "down" and knee_angle > 110:
        posture_correct, feedback = False, "Go lower"
    if back_angle is not None and back_angle < 45:
        posture_correct, feedback = False, "Keep back straight"

    return counter, stage, posture_correct, feedback, round(knee_angle, 1)


def _analyze_bicep_curl(lm, state):
    elbow_angle = _best_side_angle(
        lm, state, "curl_elbow",
        (LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW, LM.RIGHT_WRIST),
        (LM.LEFT_SHOULDER,  LM.LEFT_ELBOW,  LM.LEFT_WRIST),
    )
    if elbow_angle is None:
        return state["counter"], state["stage"], True, "Arms not visible", None

    counter, stage = state["counter"], state["stage"]

    if elbow_angle > 150:
        stage = "down"
        state["_peak_up"] = elbow_angle
    if elbow_angle < 55 and stage == "down":
        peak = state.get("_peak_up", elbow_angle)
        if (peak - elbow_angle) >= MIN_ANGLE_TRAVEL and _can_count_rep(state):
            stage = "up"
            counter += 1
            _mark_rep_counted(state)
            state["_valley_down"] = elbow_angle

    posture_correct, feedback = True, "Good form"
    if elbow_angle > 70 and stage == "up":
        posture_correct, feedback = False, "Curl higher"

    return counter, stage, posture_correct, feedback, round(elbow_angle, 1)


def _analyze_pushup(lm, state):
    elbow_angle = _best_side_angle(
        lm, state, "pushup_elbow",
        (LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW, LM.RIGHT_WRIST),
        (LM.LEFT_SHOULDER,  LM.LEFT_ELBOW,  LM.LEFT_WRIST),
    )
    if elbow_angle is None:
        return state["counter"], state["stage"], True, "Arms not visible", None

    body_line_angle = _best_side_angle(
        lm, state, "pushup_body",
        (LM.RIGHT_SHOULDER, LM.RIGHT_HIP, LM.RIGHT_ANKLE),
        (LM.LEFT_SHOULDER,  LM.LEFT_HIP,  LM.LEFT_ANKLE),
    )

    counter, stage = state["counter"], state["stage"]

    if elbow_angle > 155:
        if stage == "down":
            valley = state.get("_valley_down", elbow_angle)
            if (elbow_angle - valley) >= MIN_ANGLE_TRAVEL and _can_count_rep(state):
                counter += 1
                _mark_rep_counted(state)
        stage = "up"
        state["_peak_up"] = elbow_angle
    elif elbow_angle < 90:
        stage = "down"
        state["_valley_down"] = elbow_angle

    posture_correct, feedback = True, "Good form"
    if stage == "down" and elbow_angle > 95:
        posture_correct, feedback = False, "Go lower"
    if body_line_angle is not None and body_line_angle < 150:
        posture_correct, feedback = False, "Keep body straight"

    return counter, stage, posture_correct, feedback, round(elbow_angle, 1)


def _analyze_shoulder_press(lm, state):
    elbow_angle = _best_side_angle(
        lm, state, "press_elbow",
        (LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW, LM.RIGHT_WRIST),
        (LM.LEFT_SHOULDER,  LM.LEFT_ELBOW,  LM.LEFT_WRIST),
    )
    if elbow_angle is None:
        return state["counter"], state["stage"], True, "Arms not visible", None

    counter, stage = state["counter"], state["stage"]

    if elbow_angle < 90:
        stage = "down"
        state["_valley_down"] = elbow_angle
    if elbow_angle > 155 and stage == "down":
        valley = state.get("_valley_down", elbow_angle)
        if (elbow_angle - valley) >= MIN_ANGLE_TRAVEL and _can_count_rep(state):
            stage = "up"
            counter += 1
            _mark_rep_counted(state)
            state["_peak_up"] = elbow_angle

    posture_correct, feedback = True, "Good form"
    if elbow_angle < 150 and stage == "up":
        posture_correct, feedback = False, "Extend arms fully"

    return counter, stage, posture_correct, feedback, round(elbow_angle, 1)


ANALYZERS = {
    "Squat":          _analyze_squat,
    "Bicep Curl":     _analyze_bicep_curl,
    "Push-Up":        _analyze_pushup,
    "Shoulder Press": _analyze_shoulder_press,
}


# endpoints
@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_frame(req: FrameRequest):
    t0 = time.perf_counter()

    if req.exercise not in SUPPORTED_EXERCISES:
        raise HTTPException(
            status_code=422,
            detail=f"Unsupported exercise. Choose from: {SUPPORTED_EXERCISES}",
        )

    # decode base64 JPEG
    try:
        img_bytes = base64.b64decode(req.frame_b64)
        arr   = np.frombuffer(img_bytes, dtype=np.uint8)
        frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        if frame is None:
            raise ValueError("cv2.imdecode returned None")
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid frame data: {exc}")

    # run PoseLandmarker
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    mp_image  = MpImage(image_format=ImageFormat.SRGB, data=rgb_frame)
    detection = _get_landmarker().detect(mp_image)

    landmarks_detected = bool(detection.pose_landmarks)
    confidence  = 0.0
    posture_correct, feedback, angle = True, "No body detected", None

    state = _sessions.setdefault(req.session_id, {"counter": 0, "stage": None})

    lm_list = []
    if landmarks_detected:
        lm = detection.pose_landmarks[0]

        # normalized coords for the AR skeleton overlay
        lm_list = [{"x": p.x, "y": p.y, "v": p.visibility} for p in lm]

        # rough confidence from avg visibility of key joints
        try:
            vis_values = [
                detection.pose_world_landmarks[0][LM.RIGHT_SHOULDER].visibility,
                detection.pose_world_landmarks[0][LM.RIGHT_HIP].visibility,
                detection.pose_world_landmarks[0][LM.RIGHT_KNEE].visibility,
            ]
            confidence = float(np.mean([v for v in vis_values if v is not None]))
        except Exception:
            confidence = 1.0

        analyzer = ANALYZERS[req.exercise]
        counter, stage, posture_correct, feedback, angle = analyzer(lm, state)
        state["counter"] = counter
        state["stage"]   = stage

    processing_ms = round((time.perf_counter() - t0) * 1000, 2)

    return AnalysisResponse(
        session_id=req.session_id,
        exercise=req.exercise,
        reps=state["counter"],
        stage=state["stage"],
        posture_correct=posture_correct,
        feedback=feedback,
        confidence=round(confidence, 3),
        angle=angle,
        landmarks_detected=landmarks_detected,
        processing_ms=processing_ms,
        landmarks=lm_list if landmarks_detected else None
    )


@router.post("/reset-session")
async def reset_session(req: SessionResetRequest):
    """Reset rep counter and stage for a given session."""
    _sessions.pop(req.session_id, None)
    return {"status": "ok", "session_id": req.session_id}


@router.get("/exercises")
async def list_exercises():
    return {
        "exercises": [
            {"value": "Squat",          "muscles": "Quads, Glutes, Core"},
            {"value": "Bicep Curl",     "muscles": "Biceps, Forearms"},
            {"value": "Push-Up",        "muscles": "Chest, Triceps, Shoulders"},
            {"value": "Shoulder Press", "muscles": "Deltoids, Triceps"},
        ]
    }
