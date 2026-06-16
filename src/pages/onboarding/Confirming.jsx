import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';

const LOADING_MESSAGES = [
  "Confirming plan...",
  "Generating optimal macros...",
  "Allocating personalized diet constraints...",
  "Finalizing dashboard..."
];

const Confirming = () => {
  const navigate = useNavigate();
  const [messageIndex, setMessageIndex] = useState(0);
  const [error, setError] = useState(null);
  const generationStarted = useRef(false);

  useEffect(() => {
    // Cycle through messages every 900ms
    const messageInterval = setInterval(() => {
      setMessageIndex(prev =>
        prev < LOADING_MESSAGES.length - 1 ? prev + 1 : prev
      );
    }, 900);

    const generatePlan = async () => {
        if (generationStarted.current) return;
        generationStarted.current = true;
        
        try {
            const rawUser = localStorage.getItem('fitnex_user');
            if (!rawUser) throw new Error("User not found");
            const user = JSON.parse(rawUser);
            if (!user.preferences) throw new Error("No preferences found");
            
            await userService.savePreferences(user.preferences);
            clearInterval(messageInterval);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            clearInterval(messageInterval);
            setError(err.message || "Failed to generate plan.");
        }
    };
    
    generatePlan();

    return () => {
      clearInterval(messageInterval);
    };
  }, [navigate]);

  return (
    <main className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center', maxWidth: '440px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        
        {/* Simple Neon Pulse Core */}
        {!error ? (
        <>
            <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(57, 255, 20, 0.2)',
            border: '2px solid #39ff14',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'pulse 1.5s infinite ease-in-out'
            }}>
            <span className="material-symbols-outlined" style={{ color: '#39ff14', fontSize: '32px', animation: 'spin 2s linear infinite' }}>
                sync
            </span>
            </div>

            <h2 style={{ fontSize: '26px', fontWeight: '800', margin: '0' }}>Crafting Your Plan</h2>
            
            {/* Sequential Text Loader */}
            <p style={{ color: '#39ff14', fontSize: '15px', minHeight: '22px', fontWeight: '600', letterSpacing: '0.5px' }}>
            {LOADING_MESSAGES[messageIndex]}
            </p>
        </>
        ) : (
            <>
                <div style={{ color: '#ff3333', fontSize: '48px', marginBottom: '10px' }} className="material-symbols-outlined">error</div>
                <h2 style={{ fontSize: '26px', fontWeight: '800', margin: '0', color: '#ff3333' }}>Generation Failed</h2>
                <p style={{ color: 'var(--text-muted)' }}>{error}</p>
                <button className="btn-primary" onClick={() => navigate('/setup')} style={{ marginTop: '20px' }}>Go Back to Setup</button>
            </>
        )}
      </div>
    </main>
  );
};

export default Confirming;
