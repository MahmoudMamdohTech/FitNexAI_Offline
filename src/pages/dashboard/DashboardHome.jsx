import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatCard from '../../components/StatCard';
import MealCard from '../../components/MealCard';
// da el dashboard elly feh data el user w el calories w kol elkalam el 7lw da
const DashboardHome = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('exercises');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardService.getDashboardStats();
        setStats(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleSwap = async (category) => {
    try {
      await dashboardService.swapMeal(category);

      setStats(prev => {
        const catStats = { ...prev[category] };
        catStats.currentIndex = (catStats.currentIndex + 1) % (catStats.options.length || 1);
        return { ...prev, [category]: catStats };
      });
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error) return (
    <div style={{ textAlign: 'center', padding: '60px 24px' }}>
      <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#f87171', display: 'block', marginBottom: '12px' }}>error_outline</span>
      <p style={{ color: '#f87171', marginBottom: '16px' }}>{error}</p>
      <button className="btn-primary" onClick={() => navigate('/login')}>Return to Login</button>
    </div>
  );

  if (!stats) return <LoadingSpinner />;

  return (
    <>
      {/* hero banner */}
      <section style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url("https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=1200")', backgroundSize: 'cover', backgroundPosition: 'center', transition: 'transform 0.7s ease' }}></div>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0a1a0a 0%, rgba(10,26,10,0.55) 60%, transparent 100%)' }}></div>
        <div style={{ position: 'relative', zIndex: 1, padding: '32px 40px' }}>
          <h2 style={{ color: 'white', fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: '900', lineHeight: 1.2, marginBottom: '8px' }}>
            Today's Focus: <span style={{ color: '#39ff14' }}>Home Workout Essentials</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', maxWidth: '520px' }}>
            Master bodyweight movements with AI-powered form correction. You're doing great!
          </p>
        </div>
      </section>

      {/* macro stats */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <StatCard icon="local_fire_department" iconColor="#39ff14" label="Daily Calories" value={stats.dailyCalories} unit="kcal" />
        <StatCard icon="egg_alt" iconColor="#60a5fa" label="Protein" value={stats.dailyProtein} unit="g" />
        <StatCard icon="grain" iconColor="#facc15" label="Carbohydrates" value={stats.dailyCarbs} unit="g" />
        <StatCard icon="water_drop" iconColor="#fb923c" label="Fat" value={stats.dailyFat} unit="g" />
      </section>

      {/* tabs */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid #283928', paddingBottom: '0' }}>
          {[{ id: 'exercises', label: 'Exercises' }, { id: 'meals', label: 'Diet Plan' }].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '12px 4px', fontWeight: '700', fontSize: '14px',
                borderBottom: `2px solid ${activeTab === tab.id ? '#39ff14' : 'transparent'}`,
                color: activeTab === tab.id ? '#39ff14' : '#9cba9c',
                transition: 'all 0.2s', letterSpacing: '0.04em',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* exercises tab */}
        {activeTab === 'exercises' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
            {[
              { name: 'Squat', desc: 'Fundamental lower body movement.', icon: '🏋️' },
              { name: 'Bicep Curl', desc: 'Classic arm builder.', icon: '💪' },
              { name: 'Push-Up', desc: 'Bodyweight chest compound.', icon: '🔥' },
              { name: 'Shoulder Press', desc: 'Overhead strength builder.', icon: '🧗' },
            ].map(ex => (
              <div key={ex.name} style={{ background: 'rgba(26,46,26,0.25)', border: '1px solid #283928', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', transition: 'border-color 0.2s', cursor: 'default' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(57,255,20,0.35)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#283928'}
              >
                <span style={{ fontSize: '28px' }}>{ex.icon}</span>
                <div>
                  <h3 style={{ color: 'white', fontWeight: '700', fontSize: '15px', marginBottom: '4px' }}>{ex.name}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{ex.desc}</p>
                </div>
                <Link to="/dashboard/ai-camera" state={{ exercise: ex.name }} style={{ background: '#39ff14', color: '#000', fontWeight: '700', fontSize: '13px', padding: '10px', borderRadius: '8px', textAlign: 'center', textDecoration: 'none', marginTop: 'auto', letterSpacing: '0.04em' }}>
                  START AI COACH
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* meals tab */}
        {activeTab === 'meals' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
            {['breakfast', 'lunch', 'dinner', 'snack'].map(cat => {
              if (!stats[cat]) return null;
              return (
                <MealCard
                  key={cat}
                  category={cat}
                  data={stats[cat]}
                  onSwap={handleSwap}
                />
              );
            })}
          </div>
        )}
      </section>
    </>
  );
};

export default DashboardHome;
