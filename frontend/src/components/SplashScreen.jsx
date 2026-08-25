import React, { useState, useEffect, useRef } from "react";
import "./SplashScreen.css";

/**
 * SplashScreen Component
 *
 * Guaranteed Startup Sequence for VITTANAYA.
 * 
 * Animation Sequence (2.5s Total + 0.5s Exit Transition):
 * 1. Step 1 (0.0s - 0.5s): Upward blue growth line rises from bottom to center.
 * 2. Step 2 (0.5s - 1.1s): Line unfolds and morphs into the monumental "V" brand mark.
 * 3. Step 3 (1.1s - 1.6s): Data intelligence nodes and connection beams bloom around the "V".
 * 4. Step 4 (1.6s - 2.5s): VITTANAYA typography & "Financial Intelligence for Rural Entrepreneurs" reveal.
 * 5. Step 5 (2.5s - 3.0s): Smooth fade-out and blur exit transition into the main application.
 *
 * Props:
 * @param {Function} onFinish - Callback invoked when splash finishes to reveal the application.
 */
export default function SplashScreen({ onFinish }) {
  const [step, setStep] = useState(1);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const isFinishedRef = useRef(false);

  const completeSplash = () => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    setIsFadingOut(true);
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 500);
  };

  useEffect(() => {
    // Check accessibility: prefers-reduced-motion
    if (
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setStep(4);
      const quickTimer = setTimeout(() => completeSplash(), 800);
      return () => clearTimeout(quickTimer);
    }

    // Choreographed animation timeline
    const tStep2 = setTimeout(() => setStep(2), 500);   // 0.5s: Growth line morphs into "V"
    const tStep3 = setTimeout(() => setStep(3), 1100);  // 1.1s: Data network nodes bloom
    const tStep4 = setTimeout(() => setStep(4), 1600);  // 1.6s: VITTANAYA typography & subtitle
    const tFadeOut = setTimeout(() => completeSplash(), 2500); // 2.5s: Initiate fade out

    // Instant skip on click or keyboard press
    const handleKey = () => completeSplash();
    window.addEventListener("keydown", handleKey);

    return () => {
      clearTimeout(tStep2);
      clearTimeout(tStep3);
      clearTimeout(tStep4);
      clearTimeout(tFadeOut);
      window.removeEventListener("keydown", handleKey);
    };
  }, []);

  return (
    <div
      onClick={completeSplash}
      className={`vittanaya-splash-wrapper ${isFadingOut ? "splash-fading-out" : ""}`}
      role="dialog"
      aria-label="VITTANAYA Loading"
    >
      {/* Background Ambient Lighting System */}
      <div className="splash-ambient-bg" aria-hidden="true">
        <div className="splash-radial-glow" />
        <div className="splash-grid-overlay" />
        <span className="splash-particle-point splash-pt-1" />
        <span className="splash-particle-point splash-pt-2" />
        <span className="splash-particle-point splash-pt-3" />
        <span className="splash-particle-point splash-pt-4" />
      </div>

      {/* Top Spacer for Layout Balance */}
      <div className="splash-top-spacer" />

      {/* Main Centered Stage */}
      <main className="splash-center-stage">
        
        {/* SVG Drawing Canvas */}
        <div className="splash-canvas-box">
          <svg
            className="splash-svg-canvas"
            viewBox="0 0 260 260"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="fintechBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1D4ED8" />
                <stop offset="50%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#60A5FA" />
              </linearGradient>

              <filter id="softFintechGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* STEP 1: Upward Growth Line (0s - 0.5s) */}
            {step === 1 && (
              <g>
                <circle cx="130" cy="215" r="3" fill="#2563EB" opacity="0.6" />
                <line
                  x1="130"
                  y1="215"
                  x2="130"
                  y2="50"
                  stroke="url(#fintechBlueGrad)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  className="splash-line-draw"
                />
                <circle
                  cx="130"
                  cy="50"
                  r="5"
                  fill="#60A5FA"
                  filter="url(#softFintechGlow)"
                  className="splash-line-photon"
                />
              </g>
            )}

            {/* STEP 2 & BEYOND: Monumental VITTANAYA "V" Logo */}
            {step >= 2 && (
              <g className={`splash-v-wrapper ${step >= 3 ? "v-soft-pulse" : ""}`}>
                {/* Luminous Glow Halo */}
                {step >= 3 && (
                  <path
                    d="M 45 60 L 130 210 L 215 60 L 172 60 L 130 145 L 88 60 Z"
                    fill="url(#fintechBlueGrad)"
                    opacity="0.2"
                    filter="url(#softFintechGlow)"
                    className="v-aura-halo"
                  />
                )}

                {/* Left Wing */}
                <path
                  d="M 45 60 L 130 210 L 130 145 L 88 60 Z"
                  fill="url(#fintechBlueGrad)"
                  className="v-left-wing"
                />

                {/* Right Ascending Wing */}
                <path
                  d="M 130 210 L 215 60 L 172 60 L 130 145 Z"
                  fill="url(#fintechBlueGrad)"
                  className="v-right-wing"
                />

                {/* Center Spine */}
                <path
                  d="M 130 210 L 130 145"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  opacity="0.9"
                />

                {/* Geometric Vertex Points */}
                <circle cx="45" cy="60" r="3.5" fill="#3B82F6" />
                <circle cx="215" cy="60" r="4" fill="#60A5FA" filter="url(#softFintechGlow)" />
                <circle cx="130" cy="210" r="4.5" fill="#1D4ED8" />
              </g>
            )}

            {/* STEP 3: Data Network Nodes & Beams */}
            {step >= 3 && (
              <g className="splash-data-nodes">
                <line x1="25" y1="125" x2="72" y2="115" stroke="#3B82F6" strokeWidth="1" strokeDasharray="3 3" opacity="0.35" />
                <line x1="235" y1="125" x2="188" y2="115" stroke="#3B82F6" strokeWidth="1" strokeDasharray="3 3" opacity="0.35" />
                <line x1="60" y1="195" x2="105" y2="180" stroke="#2563EB" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
                <line x1="200" y1="195" x2="155" y2="180" stroke="#2563EB" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />

                <circle cx="25" cy="125" r="3.5" fill="#2563EB" filter="url(#softFintechGlow)" className="data-node-dot" />
                <circle cx="235" cy="125" r="4" fill="#3B82F6" filter="url(#softFintechGlow)" className="data-node-dot" />
                <circle cx="60" cy="195" r="3" fill="#60A5FA" className="data-node-dot" />
                <circle cx="200" cy="195" r="3" fill="#60A5FA" className="data-node-dot" />
              </g>
            )}
          </svg>
        </div>

        {/* STEP 4: Brand Reveal */}
        <div className={`splash-brand-reveal ${step >= 4 ? "visible" : ""}`}>
          <h1 className="splash-brand-title">VITTANAYA</h1>
          <p className="splash-brand-subtitle">Financial Intelligence for Rural Entrepreneurs</p>
        </div>

      </main>

      {/* Bottom Protocol Footer */}
      <footer className="splash-bottom-bar">
        <span>© 2026 VITTANAYA</span>
        <span>Click anywhere to enter →</span>
      </footer>

    </div>
  );
}
