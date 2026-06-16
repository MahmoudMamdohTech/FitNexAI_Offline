// Gym Service — AI Camera analysis + workout persistence
import api from './api';

export const gymService = {
  async listExercises() {
    const res = await api.get('/api/v1/exercises');
    return res.exercises ?? [];
  },

  async analyzeFrame(sessionId, exercise, frameB64) {
    return await api.post('/api/v1/analyze', {
      session_id: sessionId,
      exercise,
      frame_b64: frameB64,
    });
  },

  async resetSession(sessionId) {
    return await api.post('/api/v1/reset-session', {
      session_id: sessionId,
    });
  },

  // user_id comes from JWT on the server
  async saveWorkout(exercise, reps, score = 0, durationSeconds = 0) {
    return await api.post('/api/v1/gym/workout', {
      exercise,
      reps,
      score,
      duration_seconds: durationSeconds,
    });
  },

  async getWorkoutHistory(limit = 50) {
    return await api.get(`/api/v1/gym/history?limit=${limit}`);
  },
};
