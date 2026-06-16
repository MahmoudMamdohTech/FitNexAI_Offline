import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

const Verify = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState(null);
  const [resendMsg, setResendMsg] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const inputs = useRef([]);
  const navigate = useNavigate();
  const { verifyOTP } = useAuth();

  // Get the pending email from sessionStorage on mount only
  const [email] = useState(() => sessionStorage.getItem('pending_verify_email'));

  // If there's no pending email in sessionStorage, user shouldn't be here
  useEffect(() => {
    if (!email) {
      navigate('/signup');
    }
  }, [email, navigate]);

  // Countdown for resend cooldown
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // digits only
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(null);
    // Auto-advance to next field
    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = pasted.split('');
    setOtp([...newOtp, ...Array(6 - newOtp.length).fill('')]);
    inputs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const user = await verifyOTP(email, code);
      // Navigate based on whether user already completed setup
      const setupDone = user.is_setup_completed === true || user.is_setup_completed === 1;
      navigate(setupDone ? '/dashboard' : '/setup');
    } catch (err) {
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
      setError(err.message || 'Invalid code. Please try again.');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    setResendMsg(null);
    setError(null);
    try {
      await authService.resendOTP(email);
      setResendMsg('A new code has been sent to your email.');
      setCountdown(60); // 60-second cooldown
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } catch {
      setResendMsg('Failed to resend. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(?=@)/, (_, a, b) => a + '*'.repeat(b.length))
    : '';

  return (
    <div className="auth-page">
      <main className="auth-main" style={{ marginTop: '5rem' }}>
        <div className="auth-card">
          {/* Icon */}
          <div className="auth-icon-wrapper">
            <div className="auth-icon-circle">
              <svg viewBox="0 0 24 24" fill="none" stroke="#39ff14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '28px', height: '28px' }}>
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.95 12a19.79 19.79 0 0 1-3-8.59A2 2 0 0 1 4 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
          </div>

          <h1 className="auth-card-title">Verify Your Email</h1>
          <p className="auth-card-subtitle">
            Enter the 6-digit code sent to{' '}
            <span style={{ color: '#39ff14', fontWeight: '600' }}>{maskedEmail}</span>
          </p>

          <form onSubmit={handleVerify} noValidate>
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

            {resendMsg && (
              <div className="auth-success-banner">
                {resendMsg}
              </div>
            )}

            {/* OTP Inputs */}
            <div className="otp-container" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => inputs.current[i] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  className={`otp-input ${digit ? 'filled' : ''}`}
                />
              ))}
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Verifying...' : 'VERIFY CODE'}
            </button>
          </form>

          <div className="auth-divider"></div>
          <p className="auth-switch">
            Didn't receive a code?{' '}
            <span
              style={{
                color: countdown > 0 ? 'rgba(255,255,255,0.35)' : '#39ff14',
                fontWeight: '600',
                cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                transition: 'color 0.2s',
              }}
              onClick={handleResend}
            >
              {resending ? 'Sending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend →'}
            </span>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Verify;
