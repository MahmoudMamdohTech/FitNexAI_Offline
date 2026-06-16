import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import LoadingSpinner from '../../components/LoadingSpinner';

const Review = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await userService.getProfile();
        setUser(data);
      } catch {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  if (loading) return <LoadingSpinner />;
  if (!user || !user.preferences) return <div>No preferences found. <button onClick={() => navigate('/setup')}>Go Back</button></div>;

  const prefs = user.preferences;
  const goalMap = { 1: "Weight Gain", 2: "Weight Loss", 3: "Maintenance" };
  const getGoal = () => goalMap[prefs.goal] || "Maintenance";

  return (
    <main className="container" style={{ paddingTop: '80px', paddingBottom: '60px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 className="auth-card-title">Review Profile</h1>
        <p className="auth-card-subtitle">Confirm your details before we generate your plan.</p>
      </div>

      <div className="preferences-card" style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* Core Stats */}
        <div>
          <h3 style={{ color: 'var(--neon-green)', marginBottom: '16px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Core Biometrics</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Height</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{prefs.height} cm</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Weight</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{prefs.weight} kg</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Age</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{prefs.age}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Gender</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{prefs.gender}</div>
            </div>
          </div>
        </div>

        {/* Objective */}
        <div>
          <h3 style={{ color: 'var(--neon-green)', marginBottom: '16px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Objective</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Primary Goal</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{getGoal()}</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginTop: '20px' }}>
          <button className="auth-btn" style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'white' }} onClick={() => navigate('/setup')}>
            Edit Details
          </button>
          <button className="btn-primary" style={{ flex: 2, textAlign: 'center' }} onClick={() => navigate('/confirming')}>
            Confirm & Generate
          </button>
        </div>
      </div>
    </main>
  );
};

export default Review;
