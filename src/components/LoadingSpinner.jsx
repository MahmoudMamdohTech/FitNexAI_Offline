import React from 'react';

const LoadingSpinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '2rem' }}>
    <svg className="spinner" viewBox="0 0 50 50" style={{ width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}>
      <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="5" strokeDasharray="31 31"></circle>
    </svg>
  </div>
);

export default LoadingSpinner;
