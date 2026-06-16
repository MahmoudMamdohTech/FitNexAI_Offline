// FitNex AI — Unified API Client
// Single client for all backend calls. JWT is auto-attached.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function apiFetch(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const token = localStorage.getItem('fitnex_token');

  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const config = { headers, ...options };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  let res;
  try {
    res = await fetch(url, config);
  } catch (networkError) {
    throw new Error('Network error — check your connection or backend server.');
  }

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    // auto-logout on 401 only if user was already logged in (token expired)
    if (res.status === 401 && token) {
      localStorage.removeItem('fitnex_token');
      localStorage.removeItem('fitnex_user');
      window.location.href = '/login';
    }
    const msg = json.detail || json.message || json.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return json;
}

export const api = {
  get: (path) => apiFetch(path, { method: 'GET' }),
  post: (path, payload) => apiFetch(path, { method: 'POST', body: payload }),
  put: (path, payload) => apiFetch(path, { method: 'PUT', body: payload }),
  delete: (path) => apiFetch(path, { method: 'DELETE' }),
};

export default api;
