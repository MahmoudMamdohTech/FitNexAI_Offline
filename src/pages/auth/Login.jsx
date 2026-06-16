import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);

  const emailRef = useRef(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Auto-clear error + inputs only for credential errors (user typed wrong email/pass)
  useEffect(() => {
    if (!error || error.type !== 'credentials') return;
    const timer = setTimeout(() => {
      setError(null);
      setEmail('');
      setPassword('');
      emailRef.current?.focus();
    }, 3000);
    return () => clearTimeout(timer);
  }, [error]);

  const handleLogin = async (e) => {
    e.preventDefault();

    // Validation errors — inputs stay red until user types
    if (!email.trim()) {
      setError({ type: 'validation', msg: 'Please enter your email address.' });
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }
    if (!email.includes('@')) {
      setError({ type: 'validation', msg: 'Email is missing the @ symbol.' });
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }
    const domain = email.split('@')[1];
    if (!domain || !domain.includes('.')) {
      setError({ type: 'validation', msg: 'Email is missing a domain (e.g. gmail.com).' });
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }
    if (!password) {
      setError({ type: 'validation', msg: 'Please enter your password.' });
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const user = await login(email, password);
      const setupDone = user.is_setup_completed == 1 || user.is_setup_completed === true;
      navigate(setupDone ? '/dashboard' : '/setup');
    } catch (err) {
      const msg = err.message || 'Invalid login credentials.';
      // Backend returns this specific message when email is not verified
      if (msg.toLowerCase().includes('verify your email')) {
        // Store the email so the Verify page can use it
        sessionStorage.setItem('pending_verify_email', email);
        setError({ type: 'unverified', msg });
      } else {
        setError({ type: 'credentials', msg });
      }
      setShake(true);
      setTimeout(() => setShake(false), 600);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <main className="auth-main">
        <div className={`auth-card ${shake ? 'shake' : ''}`}>
          <h1 className="auth-card-title">Welcome Back</h1>
          <p className="auth-card-subtitle">Log in to access your personalized fitness plan.</p>

          <form onSubmit={handleLogin} noValidate>
            {/* Error Banner — auto-clears for credential errors, stays for validation */}
            <div
              className={`auth-error-banner ${error ? 'visible' : ''}`}
              role="alert"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{error?.msg}</span>
            </div>
            {error?.type === 'unverified' && (
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <Link
                  to="/verify"
                  style={{ color: '#39ff14', fontWeight: '600', fontSize: '14px' }}
                >
                  Verify Email →
                </Link>
              </div>
            )}

            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <polyline points="2,4 12,13 22,4"/>
                  </svg>
                </span>
                <input
                  className={`form-input ${error ? 'input-error' : ''}`}
                  type="email"
                  id="email"
                  ref={emailRef}
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(null); }}
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  className={`form-input ${error ? 'input-error' : ''}`}
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(null); }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
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

            <div className="form-row">
              <label className="checkbox-label">
                <input type="checkbox" id="remember" name="remember" />
                Remember me
              </label>
              <Link to="/forgot-password" className="forgot-link">Forgot Password?</Link>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'LOG IN'}
            </button>
          </form>

          <div className="auth-divider"></div>
          <p className="auth-switch">Don't have an account? <Link to="/signup">Sign Up →</Link></p>
        </div>
      </main>
    </div>
  );
};

export default Login;
