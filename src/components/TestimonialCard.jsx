import React from 'react';

const TestimonialCard = ({ name, role, text, img }) => {
  return (
    <div className="testimonial-card">
      <div className="testimonial-author">
        <img src={img} alt={name} />
        <div className="author-info">
          <h4>{name}</h4>
          <div className="author-role">{role}</div>
        </div>
      </div>
      <p className="testimonial-text">
        "{text}"
      </p>
    </div>
  );
};

export default TestimonialCard;
