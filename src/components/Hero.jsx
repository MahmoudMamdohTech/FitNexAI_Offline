import React from 'react';
import { Link } from 'react-router-dom';
import sarah from '../assets/sarah.png';
import mike from '../assets/mike.png';
import elena from '../assets/elena.png';

const Hero = () => {
  return (
    <section className="hero">
      <div className="container">
        <h1 className="hero-title">
          Sculpt Your<br />
          <span className="neon">Best Self.</span>
        </h1>
        <p className="hero-subtitle">
          One platform to track your macros, plan your lifts, and visualize your
          progress with science-based tools. Join 10,000+ users transforming
          their lives.
        </p>
        <div className="hero-cta">
          <Link to="/signup" className="btn-primary">Start Your Journey Free</Link>
        </div>
        <div className="hero-social-proof">
          <div className="avatar-group">
            <img src={sarah} alt="Sarah" />
            <img src={mike} alt="Mike" />
            <img src={elena} alt="Elena" />
          </div>
          <div className="rating-info">
            <div className="stars">★★★★★</div>
            <div className="rating-text">Rated 4.9/5 by power users</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
