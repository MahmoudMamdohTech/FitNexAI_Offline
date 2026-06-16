import { useEffect } from 'react';

/**
 * useScrollReveal — triggers .revealed class on elements with [data-reveal]
 * when they enter the viewport. Replaces raw document.querySelectorAll in Home.jsx.
 */
const useScrollReveal = () => {
  useEffect(() => {
    const revealEls = document.querySelectorAll('[data-reveal]');
    if (!revealEls.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -20px 0px' }
    );

    revealEls.forEach((el) => observer.observe(el));

    // Immediately reveal elements already in view on mount
    setTimeout(() => {
      revealEls.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
          el.classList.add('revealed');
        }
      });
    }, 100);

    return () => observer.disconnect();
  }, []);
};

export default useScrollReveal;
