import { useEffect } from 'react';

/**
 * Observes all elements with the `reveal` class and adds `reveal--visible`
 * when they enter the viewport, triggering the CSS fade-in/slide-up animation.
 */
export function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal--visible');
            // Once revealed, stop watching it
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,      // trigger when 12% of element is visible
        rootMargin: '0px 0px -40px 0px', // slight bottom offset for earlier trigger
      }
    );

    const targets = document.querySelectorAll('.reveal');
    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}
