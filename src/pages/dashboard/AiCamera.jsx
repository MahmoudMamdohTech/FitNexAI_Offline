import React, { useEffect, useRef, useState, useReducer, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { gymService } from '../../services/gymService';

// check if we're in a context that allows camera access
const isSecureCameraContext = () => {
  const host = window.location.hostname;
  const isLocalhost = host === 'localhost' || host === '127.0.0.1' || host === '::1';
  return window.location.protocol === 'https:' || isLocalhost;
};

// skeleton connections for drawing pose overlay
const POSE_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5],
  [5, 6], [6, 8], [9, 10], [11, 12], [11, 13],
  [13, 15], [15, 17], [15, 19], [15, 21], [17, 19],
  [12, 14], [14, 16], [16, 18], [16, 20], [16, 22],
  [18, 20], [11, 23], [12, 24], [23, 24], [23, 25],
  [24, 26], [25, 27], [26, 28], [27, 29], [28, 30],
  [29, 31], [30, 32], [27, 31], [28, 32]
];

const drawSkeleton = (ctx, landmarks, width, height) => {
  ctx.clearRect(0, 0, width, height);
  if (!landmarks) return;

  ctx.lineWidth = 4;
  ctx.strokeStyle = '#39ff14';
  ctx.fillStyle = '#ff0055';

  // draw lines between joints
  POSE_CONNECTIONS.forEach(([i, j]) => {
    const p1 = landmarks[i];
    const p2 = landmarks[j];
    if (p1 && p2 && p1.v > 0.4 && p2.v > 0.4) {
      ctx.beginPath();
      ctx.moveTo(p1.x * width, p1.y * height);
      ctx.lineTo(p2.x * width, p2.y * height);
      ctx.stroke();
    }
  });

  // draw joint dots
  landmarks.forEach((p) => {
    if (p && p.v > 0.4) {
      ctx.beginPath();
      ctx.arc(p.x * width, p.y * height, 6, 0, 2 * Math.PI);
      ctx.fill();
    }
  });
};

// batches all analysis state into one update instead of 6 separate setStates
const initialAnalysis = {
  reps: 0,
  stage: 'idle',
  feedback: 'Stand in frame',
  confidence: 0,
  postureCorrect: true,
  processingMs: 0,
};

function analysisReducer(state, action) {
  switch (action.type) {
    case 'UPDATE':
      return {
        reps: action.payload.reps ?? state.reps,
        stage: action.payload.stage ?? state.stage,
        feedback: action.payload.feedback ?? state.feedback,
        confidence: Math.round((action.payload.confidence ?? 0) * 100),
        postureCorrect: Boolean(action.payload.posture_correct),
        processingMs: action.payload.processing_ms ?? state.processingMs,
      };
    case 'RESET':
      return { ...initialAnalysis, feedback: action.payload?.feedback || initialAnalysis.feedback };
    default:
      return state;
  }
}

const AiCamera = () => {
  const location = useLocation();
  const [selectedExercise, setSelectedExercise] = useState(location.state?.exercise || 'Squat');
  const [isRunning, setIsRunning] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [exerciseOptions, setExerciseOptions] = useState([
    'Squat', 'Bicep Curl', 'Push-Up', 'Shoulder Press',
  ]);
  const [analysisError, setAnalysisError] = useState(null);
  const [analysis, dispatch] = useReducer(analysisReducer, initialAnalysis);

  const videoRef = useRef(null);
  const captureCanvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const sessionIdRef = useRef(`session-${Date.now()}`);
  const analyzeLockRef = useRef(false);
  const startLockRef = useRef(false);
  const activeExerciseRef = useRef(selectedExercise);
  const landmarksRef = useRef(null); // latest landmarks for rAF drawing
  const rafIdRef = useRef(null);

  const releaseCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const srcObj = videoRef.current.srcObject;
      if (srcObj.getTracks) {
        srcObj.getTracks().forEach((track) => track.stop());
      }
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    activeExerciseRef.current = selectedExercise;
  }, [selectedExercise]);

  // load exercise list from backend
  useEffect(() => {
    const loadExercises = async () => {
      try {
        const exercises = await gymService.listExercises();
        const labels = exercises.map((e) => e.value).filter(Boolean);
        if (labels.length) {
          setExerciseOptions(labels);
          if (!location.state?.exercise && !labels.includes(selectedExercise)) {
            setSelectedExercise(labels[0]);
          }
        }
      } catch (err) {
        console.warn('Could not load exercise list from backend', err);
      }
    };
    loadExercises();
  }, []);

  // skeleton rendering loop (decoupled from inference for smooth visuals)
  useEffect(() => {
    if (!isRunning || !isCameraReady) {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      return;
    }

    const renderLoop = () => {
      const overlay = overlayCanvasRef.current;
      const videoEl = videoRef.current;
      if (overlay && videoEl && videoEl.videoWidth) {
        overlay.width = videoEl.videoWidth;
        overlay.height = videoEl.videoHeight;
        const ctx = overlay.getContext('2d');
        if (ctx) drawSkeleton(ctx, landmarksRef.current, overlay.width, overlay.height);
      }
      rafIdRef.current = requestAnimationFrame(renderLoop);
    };

    rafIdRef.current = requestAnimationFrame(renderLoop);
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [isRunning, isCameraReady]);

  const startCamera = async () => {
    if (startLockRef.current) return;
    startLockRef.current = true;

    if (!navigator.mediaDevices?.getUserMedia) {
      setAnalysisError('Camera is not supported in this browser. Use a modern Chrome/Edge/Safari version.');
      startLockRef.current = false;
      return;
    }

    if (!isSecureCameraContext()) {
      setAnalysisError('Camera access requires HTTPS on LAN/public domains. Use https:// for deployed/LAN access or localhost for local testing.');
      startLockRef.current = false;
      return;
    }

    try {
      sessionIdRef.current = `session-${Date.now()}`;
      setIsRunning(true);
      setIsCameraReady(false);
      dispatch({ type: 'RESET', payload: { feedback: 'Requesting camera permission...' } });
      setAnalysisError(null);
      landmarksRef.current = null;

      releaseCameraStream();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });

      streamRef.current = stream;

      await new Promise((resolve) => requestAnimationFrame(resolve));
      const videoEl = videoRef.current;
      if (!videoEl) throw new Error('Video element was not mounted');

      videoEl.srcObject = stream;
      videoEl.muted = true;
      videoEl.playsInline = true;
      await videoEl.play();

      setIsCameraReady(true);
      dispatch({ type: 'RESET', payload: { feedback: 'Camera started. Align your body in frame.' } });
    } catch (err) {
      const errName = err?.name || err?.message || 'Unknown error';
      setAnalysisError(`Could not access camera (${errName}). Please allow camera permissions or check if it is in use by another app.`);
      setIsRunning(false);
      setIsCameraReady(false);
      releaseCameraStream();
    } finally {
      startLockRef.current = false;
    }
  };

  // frame analysis loop with adaptive throttling
  useEffect(() => {
    if (!isRunning || !isCameraReady) return undefined;

    const BASE_INTERVAL = 0;    // fetch as fast as network allows
    const SLOW_INTERVAL = 100;  // minimal fallback
    let currentInterval = BASE_INTERVAL;
    let timeoutId = null;

    const analyzeNextFrame = async () => {
      if (!analyzeLockRef.current) {
        const videoEl = videoRef.current;
        const canvas = captureCanvasRef.current;

        if (videoEl && canvas && videoEl.readyState >= 2 && videoEl.videoWidth && videoEl.videoHeight) {
          analyzeLockRef.current = true;
          try {
            const MAX_WIDTH = 240;
            const scale = MAX_WIDTH / videoEl.videoWidth;
            canvas.width = MAX_WIDTH;
            canvas.height = videoEl.videoHeight * scale;

            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
              const imageSrc = canvas.toDataURL('image/jpeg', 0.3);
              if (imageSrc) {
                const frameB64 = imageSrc.split(',')[1];
                const result = await gymService.analyzeFrame(
                  sessionIdRef.current,
                  activeExerciseRef.current,
                  frameB64
                );

                // update landmarks
                landmarksRef.current = result.landmarks || null;

                // single dispatch instead of 6 separate setStates
                dispatch({ type: 'UPDATE', payload: result });

                // slow down if backend is struggling
                currentInterval = (result.processing_ms > 150) ? SLOW_INTERVAL : BASE_INTERVAL;
              }
            }
          } catch (err) {
            setAnalysisError(err.message || 'Failed to analyze camera frame.');
          } finally {
            analyzeLockRef.current = false;
          }
        }
      }

      timeoutId = setTimeout(analyzeNextFrame, currentInterval);
    };

    timeoutId = setTimeout(analyzeNextFrame, currentInterval);
    return () => { if (timeoutId) clearTimeout(timeoutId); };
  }, [isRunning, isCameraReady]);

  const stopCamera = async () => {
    setIsRunning(false);
    setIsCameraReady(false);
    releaseCameraStream();
    landmarksRef.current = null;

    try {
      await gymService.resetSession(sessionIdRef.current);
    } catch (err) {
      console.warn('Failed to reset backend session', err);
    }

    if (analysis.reps > 0) {
      try {
        await gymService.saveWorkout(activeExerciseRef.current, analysis.reps, analysis.confidence, 60);
        dispatch({ type: 'RESET', payload: { feedback: `Workout saved! ${analysis.reps} reps logged.` } });
      } catch (err) {
        console.error("Failed to save workout:", err);
      }
    }
  };

  // cleanup on unmount
  useEffect(() => {
    return () => { releaseCameraStream(); };
  }, [releaseCameraStream]);

  return (
    <div className="w-full mx-auto" style={{ animation: 'fadeIn 0.6s ease-out', maxWidth: '1200px' }}>
      <header className="mb-6 lg:mb-8">
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>AI <span className="neon">Vision</span></h1>
        <p style={{ color: 'var(--text-muted)' }}>Real-time pose analysis powered by FastAPI AI microservice.</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 items-stretch w-full">

        {/* camera viewport */}
        <div className="preferences-card flex-1 w-full relative overflow-hidden bg-black min-h-[60vh] lg:min-h-[600px]" style={{ padding: '0', border: '2px solid var(--neon-green)', borderRadius: '16px' }}>
          {isRunning ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', position: 'absolute', inset: 0 }}
              />
              <canvas ref={captureCanvasRef} style={{ display: 'none' }} />
              <canvas
                ref={overlayCanvasRef}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  objectFit: 'cover',
                  transform: 'scaleX(-1)'
                }}
              />

              {/* overlay stats */}
              <div className="absolute top-4 left-4 lg:top-5 lg:left-5 bg-black/60 px-3 py-2 lg:px-5 lg:py-3 rounded-xl border border-[#39ff14]">
                <div className="text-[#aaa] text-[10px] lg:text-xs font-bold">EXERCISE</div>
                <div className="text-white text-lg lg:text-2xl font-black">{selectedExercise.toUpperCase()}</div>
              </div>

              <div className="absolute top-4 right-4 lg:top-5 lg:right-5 bg-black/60 px-4 py-2 lg:px-7 lg:py-3 rounded-xl border border-[#39ff14] text-center">
                <div className="text-[#aaa] text-[10px] lg:text-xs font-bold">REPS</div>
                <div className="text-[#39ff14] text-3xl lg:text-[42px] font-black leading-none">{analysis.reps}</div>
              </div>

              <div className="absolute bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 bg-[#39ff14]/20 px-4 py-2 lg:px-6 lg:py-2 rounded-full backdrop-blur-sm border border-[#39ff14] text-white font-semibold whitespace-nowrap text-sm lg:text-base">
                {analysis.feedback}
              </div>

              <div className="absolute bottom-20 lg:bottom-[82px] left-4 lg:left-5 bg-black/60 p-2 lg:p-3 rounded-lg border border-[#39ff14] text-white text-[10px] lg:text-xs">
                <div>Confidence: {analysis.confidence}%</div>
                <div>Posture: {analysis.postureCorrect ? 'Correct' : 'Needs Fix'}</div>
                <div>Latency: {analysis.processingMs} ms</div>
              </div>
            </>
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '64px', color: '#333', marginBottom: '16px' }}>videocam_off</span>
              <h3 style={{ color: '#888' }}>CAMERA INACTIVE</h3>
            </div>
          )}
        </div>

        {/* controls sidebar */}
        <div className="flex flex-col gap-5 w-full lg:w-[320px] shrink-0">
          <div className="preferences-card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '15px' }}>Configuration</h3>
            <label className="form-label">Active Exercise</label>
            <select
              className="form-input"
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              disabled={isRunning}
            >
              {exerciseOptions.map((exercise) => (
                <option key={exercise} value={exercise}>{exercise}</option>
              ))}
            </select>
          </div>

          <div className="preferences-card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '15px' }}>Session Control</h3>
            {!isRunning ? (
              <button onClick={startCamera} className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined">play_circle</span> Start Camera
              </button>
            ) : (
              <button onClick={stopCamera} style={{ width: '100%', padding: '14px', fontSize: '16px', background: 'rgba(255,0,0,0.1)', color: '#ff4444', border: '1px solid #ff4444', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined">stop_circle</span> Stop & Save
              </button>
            )}
          </div>

          {isRunning && (
            <div className="preferences-card" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #222' }}>
              <div style={{ color: '#aaa', fontSize: '12px', marginBottom: '5px' }}>Live State</div>
              <div style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>{analysis.stage.toUpperCase()}</div>
            </div>
          )}

          {analysisError && (
            <div className="preferences-card" style={{ background: 'rgba(255, 0, 0, 0.1)', border: '1px solid #ff4444', color: '#ff9090' }}>
              {analysisError}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AiCamera;
