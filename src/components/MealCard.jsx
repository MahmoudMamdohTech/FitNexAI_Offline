import React, { useState } from 'react';

const MealCard = ({ category, data, onSwap }) => {
  const [swapping, setSwapping] = useState(false);
  const meal = data.options[data.currentIndex];

  const handleSwap = async () => {
    setSwapping(true);
    await onSwap(category);
    setSwapping(false);
  };

  return (
    <div style={{ background: 'rgba(26,46,26,0.25)', border: '1px solid #283928', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span className="material-symbols-outlined" style={{ color: '#39ff14', fontSize: '20px' }}>{data.icon}</span>
        <h3 style={{ color: 'white', fontWeight: '700', fontSize: '15px' }}>{data.label}</h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        <p style={{ color: '#39ff14', fontWeight: '700', fontSize: '14px', textTransform: 'capitalize', lineHeight: '1.4' }}>
          {meal.name}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: 'auto' }}>
          <span style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600' }}>{meal.calories} kcal</span>
          <span style={{ background: 'rgba(57,255,20,0.15)', color: '#39ff14', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600' }}>P: {meal.protein}g</span>
          <span style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600' }}>C: {meal.carbs}g</span>
          <span style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600' }}>F: {meal.fat}g</span>
        </div>
      </div>
      <button
        onClick={handleSwap}
        disabled={swapping}
        style={{
          marginTop: 'auto', background: 'transparent',
          border: '1px solid #283928', color: swapping ? 'var(--text-muted)' : 'white',
          padding: '8px', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
          cursor: swapping ? 'wait' : 'pointer', transition: 'all 0.2s',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
        }}
        onMouseEnter={e => !swapping && (e.currentTarget.style.background = '#283928')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>swap_horiz</span>
        {swapping ? 'Swapping...' : 'Swap Meal'}
      </button>
    </div>
  );
};

export default MealCard;
