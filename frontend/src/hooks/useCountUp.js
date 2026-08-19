import { useState, useEffect } from 'react';

/**
 * Custom hook for smooth numerical count-up animation.
 * 
 * @param {number} endValue - Target final number
 * @param {number} duration - Animation duration in ms (default: 1200ms)
 * @param {boolean} trigger - Whether animation is active
 * @returns {number} Current animated value
 */
export function useCountUp(endValue, duration = 1200, trigger = true) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Respect reduced-motion preferences
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(endValue);
      return;
    }

    if (!trigger || typeof endValue !== 'number' || isNaN(endValue)) {
      setCount(endValue || 0);
      return;
    }

    let startTime = null;
    let animationFrameId;

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = easeOutCubic(progress);

      setCount(Math.round(easedProgress * endValue));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(endValue);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [endValue, duration, trigger]);

  return count;
}
