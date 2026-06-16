import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// password strength calculator
function getPasswordStrength(password) {
  if (!password) return { level: 0, label: '', color: '', tip: '' };

  let score = 0;
  const tips = [];

  // Length scoring
  if (password.length >= 6) score += 1;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;

  // Complexity scoring
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score += 1;
  } else {
    tips.push('Mix upper & lowercase');
  }

  if (/\d/.test(password)) {
    score += 1;
  } else {
    tips.push('Add a number');
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 1;
  } else {
    tips.push('Add a symbol (!@#$)');
  }

  // Map score to levels
  if (score <= 2) return { level: 1, label: 'Weak', color: '#ff4444', tip: tips[0] || 'Too short' };
  if (score <= 3) return { level: 2, label: 'Fair', color: '#ffaa00', tip: tips[0] || 'Getting better' };
  if (score <= 4) return { level: 3, label: 'Good', color: '#44cc44', tip: tips[0] || 'Almost there' };
  return { level: 4, label: 'Strong', color: '#39ff14', tip: 'Excellent password!' };
}

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [shake, setShake] = useState(false);

  const navigate = useNavigate();
  const { signup } = useAuth();

  // Real-time password strength
  const strength = useMemo(() => getPasswordStrength(password), [password]);

  // Password match check
  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSignup = async (e) => {
    e.preventDefault();

    // Validation
    if (!username.trim()) {
      triggerError('Please enter a username.');
      return;
    }
    if (!email.trim()) {
      triggerError('Please enter your email address.');
      return;
    }
    if (!password) {
      triggerError('Please create a password.');
      return;
    }
    if (password.length < 6) {
      triggerError('Password must be at least 6 characters.');
      return;
    }
    if (strength.level < 2) {
      triggerError('Your password is too weak. Add numbers, symbols, or uppercase letters.');
      return;
    }
    if (password !== confirmPassword) {
      triggerError('Passwords do not match.');
      return;
    }

    const terms = document.getElementById('terms');
    if (terms && !terms.checked) {
      triggerError('Please agree to the Terms & Conditions.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await signup(username, email, password);
      navigate('/verify');
    } catch (err) {
      triggerError(err.message || 'Error signing up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  function triggerError(msg) {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 600);
  }

  return (
    <div className="auth-page">
      <main className="auth-main" style={{ marginTop: '5rem' }}>
        <div className={`auth-card ${shake ? 'shake' : ''}`}>
          <h1 className="auth-card-title">Create Account</h1>
          <p className="auth-card-subtitle">Join us and start your fitness journey.</p>

          <form onSubmit={handleSignup} noValidate>
            {/* Error Banner */}
            <div className={`auth-error-banner ${error ? 'visible' : ''}`} role="alert">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>

            {/* Username */}
            <div className="form-group">
              <label className="form-label" htmlFor="username">Username</label>
              <div className="input-wrapper">
                <input
                  className="form-input"
                  type="text"
                  id="username"
                  value={username}
                  onChange={e => { setUsername(e.target.value); setError(null); }}
                  placeholder="Username"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <input
                  className="form-input"
                  type="email"
                  id="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(null); }}
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            {/* Password + Strength Meter */}
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div className="input-wrapper">
                <input
                  className="form-input"
                  type="password"
                  id="password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(null); }}
                  placeholder="Min. 6 characters"
                  required
                />
              </div>

              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <div className="password-strength-wrap">
                  <div className="password-strength-bar">
                    {[1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className="strength-segment"
                        style={{
                          background: i <= strength.level ? strength.color : 'rgba(255,255,255,0.08)',
                          boxShadow: i <= strength.level ? `0 0 8px ${strength.color}40` : 'none',
                        }}
                      />
                    ))}
                  </div>
                  <div className="password-strength-info">
                    <span className="strength-label" style={{ color: strength.color }}>
                      {strength.label}
                    </span>
                    {strength.tip && strength.level < 4 && (
                      <span className="strength-tip">{strength.tip}</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-wrapper">
                <input
                  className={`form-input ${passwordMismatch ? 'input-error' : ''}`}
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setError(null); }}
                  placeholder="Confirm password"
                  required
                />
              </div>
              {passwordMismatch && (
                <p className="field-error">Passwords don't match</p>
              )}
            </div>

            <div className="form-row">
              <label className="checkbox-label" style={{ marginBottom: '1rem' }}>
                <input type="checkbox" id="terms" required />
                I agree to the Terms &amp; Conditions
              </label>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Creating account...' : 'SIGN UP'}
            </button>
          </form>

          <div className="auth-divider"></div>
          <p className="auth-switch">Already have an account? <Link to="/login">Log In →</Link></p>
        </div>
      </main>
    </div>
  );
};

export default Signup;
