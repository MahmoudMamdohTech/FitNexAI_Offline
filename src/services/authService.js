// Auth Service — signup, login, logout, OTP, session management
import api from './api';

export const authService = {
  async login(email, password) {
    const res = await api.post('/api/v1/auth/login', { email, password });
    localStorage.setItem('fitnex_token', res.token);
    localStorage.setItem('fitnex_user', JSON.stringify(res.user));
    return res.user;
  },

  async signup(name, email, password) {
    const res = await api.post('/api/v1/auth/signup', { name, email, password });
    // store pending email so Verify page knows where OTP was sent
    sessionStorage.setItem('pending_verify_email', res.email);
    return res;
  },

  async verifyOTP(email, code) {
    const res = await api.post('/api/v1/auth/verify-otp', { email, code });
    localStorage.setItem('fitnex_token', res.token);
    localStorage.setItem('fitnex_user', JSON.stringify(res.user));
    sessionStorage.removeItem('pending_verify_email');
    return res.user;
  },

  async resendOTP(email) {
    return api.post('/api/v1/auth/resend-otp', { email });
  },

  // verify token on page load to rehydrate session
  async verifyToken() {
    const token = localStorage.getItem('fitnex_token');
    if (!token) return null;
    try {
      const user = await api.get('/api/v1/auth/me');
      localStorage.setItem('fitnex_user', JSON.stringify(user));
      return user;
    } catch {
      localStorage.removeItem('fitnex_token');
      localStorage.removeItem('fitnex_user');
      return null;
    }
  },

  async logout() {
    localStorage.removeItem('fitnex_user');
    localStorage.removeItem('fitnex_token');
  },

  async forgotPassword(email) {
    return api.post('/api/v1/auth/forgot-password', { email });
  },

  async resetPassword(email, token, new_password) {
    return api.post('/api/v1/auth/reset-password', { email, token, new_password });
  },

  getCurrentUser() {
    const raw = localStorage.getItem('fitnex_user');
    return raw ? JSON.parse(raw) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('fitnex_token');
  },
};
