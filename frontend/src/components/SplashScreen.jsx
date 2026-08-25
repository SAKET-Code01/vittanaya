import React, { useState, useEffect, useRef } from 'react';
import VittanayaLogo from './common/VittanayaLogo';
import './SplashScreen.css';

/**
 * SplashScreen Component
 * 
 * Production-ready launch / splash transition screen for VITTANAYA.
 * 
 * Features:
 * - Desktop-first, responsive SaaS/fintech aesthetic
 * - Clean light-blue radial gradient background
 * - Centered official VITTANAYA brand mark & hierarchy
 * - Minimal segmented loading progress bar
 * - Auto-transition after ~1.8 seconds via `onComplete` callback
 * - Respects `prefers-reduced-motion`
 * - Clean timeout cleanup on unmount
 * 
 * @param {Object} props
 * @param {Function} [props.onComplete] Callback invoked when the splash animation completes
 * @param {number} [props.duration=1800] Display duration in milliseconds before calling onComplete
 */
export default function SplashScreen({ onComplete, duration = 1800 }) {
  const [isExiting, setIsExiting] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    // 1. Accessibility: check prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // Immediate or ultra-short transition for reduced motion users
      const quickTimer = setTimeout(() => {
        if (onCompleteRef.current) {
          onCompleteRef.current();
        }
      }, 500);
      return () => clearTimeout(quickTimer);
    }

    // 2. Start smooth exit slightly before completion duration
    const exitLeadTime = 320; // ms to trigger fade-out
    const exitTimerTime = Math.max(duration - exitLeadTime, 800);

    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, exitTimerTime);

    // 3. Trigger onComplete callback at full duration
    const completionTimer = setTimeout(() => {
      if (onCompleteRef.current) {
        onCompleteRef.current();
      }
    }, duration);

    // Cleanup timers when component unmounts
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(completionTimer);
    };
  }, [duration]);

  return (
    <div
      className={`splash-screen-container ${isExiting ? 'splash-exiting' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="VITTANAYA Splash Screen"
    >
      {/* Screen-reader descriptive text */}
      <span className="splash-sr-only">
        VITTANAYA - Hyper-Local Business Advisory. Understand. Plan. Grow. Loading application...
      </span>

      {/* Background Decorative Elements (Subtle & Non-competing) */}
      <div className="splash-bg-decorations" aria-hidden="true">
        {/* Soft Ambient Radial Glows */}
        <div className="splash-ambient-glow splash-glow-top" />
        <div className="splash-ambient-glow splash-glow-bottom-left" />
        <div className="splash-ambient-glow splash-glow-bottom-right" />

        {/* Faint Dotted Matrix Pattern */}
        <div className="splash-dots-pattern" />

        {/* Concentric Orbits & Flowing Bottom Wave Lines */}
        <svg
          className="splash-orbits-svg"
          viewBox="0 0 1440 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Top Conic / Orbit Lines */}
          <path
            d="M-100 240 C 300 110, 700 90, 1100 130 C 1300 150, 1500 230, 1600 310"
            stroke="#93C5FD"
            strokeWidth="1.2"
            strokeDasharray="4 6"
            strokeOpacity="0.4"
          />
          <path
            d="M0 310 C 350 200, 750 180, 1150 230 C 1350 260, 1500 340, 1600 400"
            stroke="#CBD5E1"
            strokeWidth="1"
            strokeOpacity="0.35"
          />
          <circle cx="720" cy="450" r="320" stroke="#93C5FD" strokeWidth="1" strokeDasharray="3 7" strokeOpacity="0.25" />
          <circle cx="720" cy="450" r="460" stroke="#C4B5FD" strokeWidth="1" strokeOpacity="0.2" />

          {/* Bottom Left Flowing Wave */}
          <path
            d="M-50 820 C 150 780, 280 860, 480 840 C 600 825, 700 850, 800 890"
            stroke="#38BDF8"
            strokeWidth="1.5"
            strokeOpacity="0.22"
          />
          
          {/* Bottom Right Flowing Wave */}
          <path
            d="M700 880 C 850 830, 1020 860, 1200 820 C 1320 790, 1420 810, 1520 850"
            stroke="#818CF8"
            strokeWidth="1.5"
            strokeOpacity="0.22"
          />
        </svg>
      </div>

      {/* Main Center Content */}
      <main className="splash-main-content">
        {/* Official VITTANAYA Logo */}
        <div className="flex flex-col items-center justify-center mb-4">
          <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-xl border border-slate-100 flex items-center justify-center">
            <VittanayaLogo size="lg" className="h-12 sm:h-14" />
          </div>
        </div>
      </main>

      {/* Loading Indicator (Bottom-Center) */}
      <footer className="splash-footer" aria-hidden="true">
        <div
          className="splash-progress-track"
          role="progressbar"
          aria-label="Loading application"
        >
          <span className="splash-progress-segment" />
          <span className="splash-progress-segment" />
          <span className="splash-progress-segment" />
          <span className="splash-progress-segment" />
        </div>
      </footer>
    </div>
  );
}
