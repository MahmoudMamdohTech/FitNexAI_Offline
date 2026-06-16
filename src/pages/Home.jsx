import React from 'react';
import Hero from '../components/Hero';
import FeatureCard from '../components/FeatureCard';
import HighlightSection from '../components/HighlightSection';
import TestimonialCard from '../components/TestimonialCard';
import useScrollReveal from '../hooks/useScrollReveal';

import sarah from '../assets/sarah.png';
import mike from '../assets/mike.png';
import elena from '../assets/elena.png';
// de el splash awl 7aga lma btft7 el website
const STEPS = [
  {
    number: '01',
    title: 'Create Your Account',
    description: 'Sign up in seconds — no credit card required. Your data stays private and secure with JWT encryption.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="22" y1="11" x2="16" y2="11" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Set Your Profile',
    description: 'Tell us your goals, body stats, and food preferences. Our AI calibrates everything to your unique needs.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Get Your AI Plan',
    description: 'Receive a personalized meal plan and start tracking workouts with our real-time AI camera coach.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
];

const Home = () => {
  useScrollReveal();

  return (
    <>
      <Hero />

      {/* da el section elly feh el features */}
      <section className="features-section" id="features">
        <div className="container">
          <div className="section-header" data-reveal>
            <h2 className="section-title">Smarter Fitness &amp; Nutrition</h2>
            <p className="section-subtitle">Unlock your potential with tools designed for efficiency.</p>
          </div>

          <div className="features-grid">
            <FeatureCard
              title="Smart Meal Plans"
              description="Customized nutrition plans that adapt to your daily calorie needs automatically."
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18M3 12h18M3 18h18" />
                  <circle cx="7" cy="6" r="2" fill="currentColor" stroke="none" />
                  <circle cx="7" cy="12" r="2" fill="currentColor" stroke="none" />
                  <circle cx="7" cy="18" r="2" fill="currentColor" stroke="none" />
                </svg>
              }
            />
            <FeatureCard
              title="AI Camera Coach"
              description="Real-time pose estimation counts your reps and corrects your form using your webcam."
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              }
            />
            <FeatureCard
              title="Progress Analytics"
              description="Visualize your body transformation with detailed charts and timeline projections."
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                  <polyline points="16 7 22 7 22 13" />
                </svg>
              }
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="how-it-works-section" id="how-it-works">
        <div className="container">
          <div className="section-header" data-reveal>
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Three simple steps to transform your fitness journey.</p>
          </div>

          <div className="steps-grid">
            {STEPS.map((step, i) => (
              <div className="step-card" key={i} data-reveal>
                <div className="step-number">{step.number}</div>
                <div className="step-icon-wrap">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
                {i < STEPS.length - 1 && <div className="step-connector" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      <HighlightSection />

      {/* Success Stories */}
      <section className="testimonials-section" id="stories">
        <div className="container">
          <div className="section-header" data-reveal>
            <h2 className="section-title">Success Stories</h2>
          </div>

          <div className="testimonials-grid">
            <TestimonialCard
              name="Sarah Jenkins"
              role="Lost 8kg in 3 months"
              text="The macro tracker is a game changer. I finally understand what my body needs to fuel my workouts."
              img={sarah}
            />
            <TestimonialCard
              name="Mike Ross"
              role="Added 20kg to bench press"
              text="Simple, effective, and straight to the point. The analytics help me break through my plateaus."
              img={mike}
            />
            <TestimonialCard
              name="Elena Rodriguez"
              role="Running first marathon"
              text="It keeps me accountable and organized. The streak feature keeps me motivated throughout the week."
              img={elena}
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
