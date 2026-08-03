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
        threshold: 0,
        // Positive bottom margin extends the observed area below the actual
        // viewport, so the reveal fires while the section is still below the
        // fold — giving the 0.8s fade-in time to finish before the user
        // scrolls it into view, instead of seeing it appear blank then fly in.
        rootMargin: '0px 0px 200px 0px',
      }
    );

    const targets = document.querySelectorAll('.reveal');
    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}
