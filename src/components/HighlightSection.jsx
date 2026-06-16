import React from 'react';
import athleteImg from '../assets/athlete.png';

const HighlightSection = () => {
  return (
    <section className="highlight-section">
      <div className="container">
        <div className="highlight-card">
          <div className="highlight-content">
            <span className="new-feature-badge">NEW FEATURE</span>
            <h2>Train like a pro, eat like a champion.</h2>
            <p>
              Our extensive database of over 10,000 foods and 2,000 exercises ensures you never miss a beat. Syncs with
              Apple Health and Google Fit.
            </p>
            <ul className="highlight-list">
              <li>
                <div className="check-icon">
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1.5 6 4.5 9 10.5 3" />
                  </svg>
                </div>
                Real-time macro tracking
              </li>
              <li>
                <div className="check-icon">
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1.5 6 4.5 9 10.5 3" />
                  </svg>
                </div>
                Custom workout builder
              </li>
              <li>
                <div className="check-icon">
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1.5 6 4.5 9 10.5 3" />
                  </svg>
                </div>
                Community challenges
              </li>
            </ul>
          </div>
          <div className="highlight-image">
            <img src={athleteImg} alt="Athlete training" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HighlightSection;
