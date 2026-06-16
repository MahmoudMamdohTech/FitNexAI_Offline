import React, { useState } from 'react';
import { Link } from 'react-router-dom';
const EXERCISES = [
  { name: 'Squat', muscle: 'Quadriceps', level: 'Intermediate', sets: '4×8', icon: '🏋️' },
  { name: 'Bicep Curl', muscle: 'Biceps', level: 'Beginner', sets: '3×12', icon: '💪' },
  { name: 'Push-Up', muscle: 'Chest', level: 'Beginner', sets: '3×15', icon: '🔥' },
  { name: 'Shoulder Press', muscle: 'Shoulders', level: 'Advanced', sets: '4×8', icon: '⬆️' }
];

const CodePage = () => {
  const [search, setSearch] = useState('');

  const filtered = EXERCISES.filter(ex => 
    ex.name.toLowerCase().includes(search.toLowerCase()) ||
    ex.muscle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ animation: 'fadeIn 0.6s ease-out' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Exercise <span className="neon">Library</span></h1>
        <p style={{ color: 'var(--text-muted)' }}>Explore the AI-supported exercise modules.</p>
      </header>

      <div style={{ marginBottom: '2rem' }}>
        <input 
          type="text" 
          placeholder="Search by name or muscle group..." 
          className="form-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: '400px' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {filtered.map((ex, i) => (
          <div key={i} className="preferences-card" style={{ display: 'flex', flexDirection: 'column', gap: '15px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--neon-green)' }}></div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{ex.icon} {ex.name}</h3>
              <span style={{ 
                fontSize: '0.75rem', 
                padding: '4px 8px', 
                borderRadius: '12px', 
                background: ex.level === 'Beginner' ? 'rgba(57, 255, 20, 0.1)' : ex.level === 'Intermediate' ? 'rgba(0, 243, 255, 0.1)' : 'rgba(255, 0, 85, 0.1)',
                color: ex.level === 'Beginner' ? 'var(--neon-green)' : ex.level === 'Intermediate' ? 'var(--neon-blue)' : 'var(--neon-pink)',
              }}>
                {ex.level}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <div><strong>Target:</strong><br/>{ex.muscle}</div>
              <div><strong>Protocol:</strong><br/>{ex.sets}</div>
            </div>

            <Link to="/dashboard/ai-camera" className="btn-secondary" style={{ marginTop: 'auto', textAlign: 'center', display: 'block' }}>
              LAUNCH AI COACH
            </Link>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No matching exercises found.
          </div>
        )}
      </div>
    </div>
  );
};

export default CodePage;
