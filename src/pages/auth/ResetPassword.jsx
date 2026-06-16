import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/authService';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!token || !email) {
      setError("Invalid password reset link. Please request a new one.");
    }
  }, [token, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token || !email) return;

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      await authService.resetPassword(email, token, password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to reset password. The link may have expired.');
      setShake(true);
      setTimeout(() => setShake(false), 600);
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="auth-page">
        <main className="auth-main">
          <div className="auth-card">
            <h1 className="auth-card-title">Invalid Link</h1>
            <p className="auth-card-subtitle">This password reset link is invalid or missing required parameters.</p>
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <Link to="/forgot-password" style={{ color: '#39ff14', fontWeight: '600' }}>
                Request New Link →
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <main className="auth-main">
        <div className={`auth-card ${shake ? 'shake' : ''}`}>
          <h1 className="auth-card-title">Create New Password</h1>
          <p className="auth-card-subtitle">
            Enter a new password for <span style={{ color: '#39ff14' }}>{email}</span>.
          </p>

          {success ? (
            <div className="auth-icon-wrapper" style={{ margin: '2rem 0' }}>
              <div className="auth-icon-circle success">
                <svg viewBox="0 0 24 24" fill="none" stroke="#39ff14" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: '32px', height: '32px' }}>
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <h3 style={{ color: 'white', marginBottom: '8px' }}>Password Reset Successful!</h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
                Redirecting you to login...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {error && (
                <div className="auth-error-banner visible" role="alert" style={{ marginBottom: '1rem' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* New Password */}
              <div className="form-group">
                <label className="form-label" htmlFor="password">New Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input
                    className={`form-input ${error && password.length < 8 ? 'input-error' : ''}`}
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(null); }}
                    placeholder="At least 8 characters"
                    required
                  />
                  <button type="button" className="input-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                        <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </span>
                  <input
                    className={`form-input ${error && password !== confirmPassword ? 'input-error' : ''}`}
                    type={showPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={e => { setConfirmPassword(e.target.value); setError(null); }}
                    placeholder="Retype your new password"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="auth-btn" disabled={loading} style={{ marginTop: '1.5rem' }}>
                {loading ? 'Saving...' : 'RESET PASSWORD'}
              </button>
            </form>
          )}

        </div>
      </main>
    </div>
  );
};

export default ResetPassword;
