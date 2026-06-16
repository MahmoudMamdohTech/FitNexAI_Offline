import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', textAlign: 'center', padding: '40px 24px' }}>
      {/* Glowing 404 */}
      <div style={{ position: 'relative', marginBottom: '32px' }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '220px', height: '220px',
          background: 'radial-gradient(circle, rgba(57,255,20,0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'pulse 3s ease-in-out infinite',
        }}></div>
        <h1 style={{
          fontSize: 'clamp(96px, 16vw, 160px)',
          fontWeight: '900',
          lineHeight: 1,
          color: 'white',
          textShadow: '0 0 40px rgba(57,255,20,0.6)',
          position: 'relative',
          letterSpacing: '-0.04em',
        }}>
          4<span style={{ color: '#39ff14' }}>0</span>4
        </h1>
      </div>

      <h2 style={{ fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: '700', marginBottom: '12px', color: 'white' }}>
        Page Not Found
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '15px', maxWidth: '400px', lineHeight: 1.6, marginBottom: '36px' }}>
        Looks like you wandered off the training path. This page doesn't exist.
      </p>

      <Link
        to="/"
        className="btn-primary"
        style={{ fontSize: '15px', padding: '14px 36px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
        Return Home
      </Link>
    </main>
  );
};

export default NotFound;
