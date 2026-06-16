import React from 'react';

const StatCard = ({ icon, iconColor, label, value, unit }) => (
  <div style={{ background: 'rgba(26,46,26,0.4)', border: '1px solid #283928', padding: '24px', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span className="material-symbols-outlined" style={{ color: iconColor, fontSize: '22px' }}>{icon}</span>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500' }}>{label}</p>
    </div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
      <span style={{ fontSize: '36px', fontWeight: '900', color: iconColor, lineHeight: 1 }}>{value}</span>
      <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{unit}</span>
    </div>
  </div>
);

export default StatCard;
