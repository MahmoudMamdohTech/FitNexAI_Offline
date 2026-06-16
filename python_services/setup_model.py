"""
FitNex AI – Unified Service Setup Script
Run this once before starting the service:
    python setup_model.py

Downloads the MediaPipe PoseLandmarker model (~9MB).
"""

import os
import sys
import urllib.request

MODEL_URL  = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task"
MODEL_PATH = os.path.join(os.path.dirname(__file__), "pose_landmarker_full.task")


def download_model():
    if os.path.exists(MODEL_PATH):
        size = os.path.getsize(MODEL_PATH)
        print(f"✓ Model already exists ({size:,} bytes). Skipping download.")
        return

    print("Downloading MediaPipe PoseLandmarker model (~9 MB)…")
    print(f"  URL : {MODEL_URL}")
    print(f"  Dest: {MODEL_PATH}")

    def _progress(block_num, block_size, total_size):
        downloaded = block_num * block_size
        pct = min(100, int(downloaded / total_size * 100)) if total_size > 0 else 0
        bar = "█" * (pct // 5) + "░" * (20 - pct // 5)
        sys.stdout.write(f"\r  [{bar}] {pct}%")
        sys.stdout.flush()

    urllib.request.urlretrieve(MODEL_URL, MODEL_PATH, _progress)
    print(f"\n✓ Downloaded: {os.path.getsize(MODEL_PATH):,} bytes")


if __name__ == "__main__":
    download_model()
    print("\nAll done! Start the unified service with:")
    print("  uvicorn main:app --host 0.0.0.0 --port 8000 --reload")
