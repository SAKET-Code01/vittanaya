import React, { useState, useEffect, useRef } from 'react';

/**
 * StartupOpeningAnimation Component — NEXT-GENERATION FINANCIAL INTELLIGENCE BOOT SEQUENCE
 * 
 * Concept Narrative:
 * FINANCIAL ACTIVITY (₹, +, −, %, ↗, ↘)
 *    ↓
 * DATA FLOWS (Semantic Inflows/Outflows)
 *    ↓
 * TRANSACTION NETWORK (Revenue → Receivables → Cash → Expenses → Payables)
 *    ↓
 * CASH FLOW (Past → Now → Future)
 *    ↓
 * ANALYSIS (Risk, Liquidity, Runway)
 *    ↓
 * PREDICTION (Forecast Corridor)
 *    ↓
 * CONVERGENCE & VITTANAYA SIGNATURE FORM
 *    ↓
 * SINGLE EMERALD PULSE
 *    ↓
 * PARTICLES BECOME BRAND (V-I-T-T-A-N-A-Y-A 80ms progressive assemble)
 *    ↓
 * BRAND LIGHT SWEEP
 *    ↓
 * TAGLINE & FINANCIAL SIGNATURE LINE (Ending in Leaf Accent)
 *    ↓
 * BRAND HOLD & SEAMLESS TRANSITION
 * 
 * Total Duration: approx 10.0–10.8 seconds
 */
export default function StartupOpeningAnimation({ onComplete }) {
  const [phase, setPhase] = useState(1);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const animationCompleteRef = useRef(false);

  const BRAND_LETTERS = ['V', 'I', 'T', 'T', 'A', 'N', 'A', 'Y', 'A'];

  const finishAnimation = () => {
    if (animationCompleteRef.current) return;
    animationCompleteRef.current = true;
    setIsFadingOut(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 750);
  };

  useEffect(() => {
    // Accessibility check: prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReducedMotion(true);
      setPhase(14);
      const quickTimer = setTimeout(() => finishAnimation(), 1400);
      return () => clearTimeout(quickTimer);
    }

    // Master narrative timeline sequence
    const t2 = setTimeout(() => setPhase(2), 800);    // Phase 2: Financial Signals (₹, +, -, %, ↗, ↘)
    const t3 = setTimeout(() => setPhase(3), 2000);   // Phase 3: Transaction Network (Revenue -> Cash -> Payables)
    const t4 = setTimeout(() => setPhase(4), 3500);   // Phase 4: Cash Flow Graph (Past -> Now -> Future)
    const t5 = setTimeout(() => setPhase(5), 4700);   // Phase 5: Financial Analysis & Radar Core
    const t6 = setTimeout(() => setPhase(6), 5800);   // Phase 6: Risk + Liquidity Scan Results
    const t7 = setTimeout(() => setPhase(7), 6500);   // Phase 7: Prediction Forecast Corridor
    const t8 = setTimeout(() => setPhase(8), 7200);   // Phase 8 & 9: Convergence into VITTANAYA Signature Form
    const t9 = setTimeout(() => setPhase(10), 7800);  // Phase 10: The Single Pulse
    const t10 = setTimeout(() => setPhase(11), 8300); // Phase 11: Particles assemble VITTANAYA letters
    const t11 = setTimeout(() => setPhase(12), 9000); // Phase 12: Brand Light Sweep
    const t12 = setTimeout(() => setPhase(13), 9500); // Phase 13 & 14: Tagline & Financial Signature Line
    const t13 = setTimeout(() => setPhase(15), 10200); // Phase 15: Final Brand Hold
    const t14 = setTimeout(() => finishAnimation(), 11000); // Phase 16: Smooth Transition into App

    // Absolute hard safety fallback timer (max 12s)
    const safetyFallback = setTimeout(() => {
      finishAnimation();
    }, 12000);

    // Skip immediately on click or keyboard press
    const handleKeyDown = () => finishAnimation();
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
      clearTimeout(t7);
      clearTimeout(t8);
      clearTimeout(t9);
      clearTimeout(t10);
      clearTimeout(t11);
      clearTimeout(t12);
      clearTimeout(t13);
      clearTimeout(t14);
      clearTimeout(safetyFallback);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div
      onClick={finishAnimation}
      className={`fixed inset-0 z-[99999] bg-[#05080E] text-white flex flex-col items-center justify-center select-none cursor-pointer overflow-hidden transition-all duration-800 ease-out ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background Ambient Glow & Financial Grid System */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        {/* Central Emerald Ambient Glow */}
        <div
          className={`w-[740px] h-[740px] rounded-full bg-emerald-500/10 blur-[150px] transition-all duration-1000 ${
            phase >= 8 ? 'opacity-100 scale-110' : phase >= 3 ? 'opacity-70 scale-100' : 'opacity-30 scale-75'
          }`}
        />
        {/* Secondary Purple Intelligence Ambient Accent Glow */}
        <div
          className={`absolute w-[520px] h-[520px] rounded-full bg-purple-500/8 blur-[120px] transition-all duration-1000 ${
            phase >= 4 && phase <= 8 ? 'opacity-90 scale-105' : 'opacity-0 scale-50'
          }`}
        />
        {/* Secondary Cyan Data Ambient Glow */}
        <div
          className={`absolute w-[460px] h-[460px] rounded-full bg-cyan-500/8 blur-[100px] transition-all duration-1000 ${
            phase >= 2 ? 'opacity-80 scale-100' : 'opacity-0 scale-50'
          }`}
        />
        {/* Subtle Financial Graph Coordinate Matrix */}
        <div
          className="absolute inset-0 opacity-[0.035] bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:28px_28px]"
        />
      </div>

      {/* Main Visual Composition Container */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-5 max-w-xl w-full px-6">
        
        {/* SVG Drawing Canvas (340x340) */}
        <div className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center">
          
          {/* Phase 1–7: Center Quantum Pulse Point */}
          <div
            className={`absolute w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-[0_0_28px_#10B981] transition-all duration-700 ease-out z-20 ${
              phase === 1
                ? 'opacity-100 scale-125 animate-ping'
                : phase >= 2 && phase <= 7
                ? 'opacity-70 scale-90'
                : 'opacity-0 scale-0'
            }`}
          />
          <div
            className={`absolute w-2 h-2 rounded-full bg-white transition-opacity duration-500 z-20 ${
              phase >= 1 && phase <= 8 ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* SVG Animated Canvas */}
          <svg
            className={`w-full h-full transform overflow-visible ${
              phase === 10 ? 'anim-single-pulse' : ''
            }`}
            viewBox="0 0 340 340"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Luminous Emerald Gradient for Outer Contour */}
              <linearGradient id="vittanayaGlowGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#047857" stopOpacity="0.2" />
                <stop offset="45%" stopColor="#10B981" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#34D399" stopOpacity="1" />
              </linearGradient>

              {/* Inner Harmonic Venation Gradient */}
              <linearGradient id="vittanayaInnerGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#059669" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#34D399" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#6EE7B7" stopOpacity="1" />
              </linearGradient>

              {/* Cyan / Teal Data Stream Gradient */}
              <linearGradient id="vittanayaCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06B6D4" />
                <stop offset="50%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#34D399" />
              </linearGradient>

              {/* Cash Flow Historical vs Forecast Gradient */}
              <linearGradient id="cashFlowPastGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#10B981" stopOpacity="1" />
                <stop offset="100%" stopColor="#34D399" stopOpacity="1" />
              </linearGradient>

              <linearGradient id="cashFlowFutureGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#34D399" />
                <stop offset="50%" stopColor="#A855F7" />
                <stop offset="100%" stopColor="#C084FC" />
              </linearGradient>

              {/* Ambient Glow Filters */}
              <filter id="glowFilter" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* =================================================================== */}
            {/* PHASE 1: SYSTEM AWAKENING & FINANCIAL GRID                         */}
            {/* =================================================================== */}
            {phase === 1 && (
              <>
                <circle cx="170" cy="170" r="14" stroke="#10B981" fill="none" className="anim-signal-ring" />
                {/* Horizontal Financial Levels */}
                <line x1="40" y1="120" x2="300" y2="120" stroke="rgba(16, 185, 129, 0.12)" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="20" y1="170" x2="320" y2="170" stroke="rgba(16, 185, 129, 0.25)" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="40" y1="220" x2="300" y2="220" stroke="rgba(16, 185, 129, 0.12)" strokeWidth="1" strokeDasharray="4 4" />
                {/* Vertical Data Time Steps */}
                <line x1="100" y1="40" x2="100" y2="300" stroke="rgba(6, 182, 212, 0.12)" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="170" y1="20" x2="170" y2="320" stroke="rgba(6, 182, 212, 0.25)" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="240" y1="40" x2="240" y2="300" stroke="rgba(6, 182, 212, 0.12)" strokeWidth="1" strokeDasharray="4 4" />
              </>
            )}

            {/* =================================================================== */}
            {/* PHASE 2: FINANCIAL SIGNALS (₹, +, -, %, ↗, ↘)                       */}
            {/* =================================================================== */}
            {phase >= 2 && phase <= 7 && (
              <>
                {/* Inflow Stream (+₹ / ↗) [Green] */}
                <path d="M 35 65 Q 110 85 170 170" stroke="#34D399" strokeWidth="1.8" fill="none" strokeDasharray="4 4" className="anim-stream-inflow" />
                <text x="30" y="60" fill="#34D399" fontSize="11" fontFamily="sans-serif" fontWeight="bold" opacity="0.9">+₹</text>
                <text x="65" y="80" fill="#10B981" fontSize="9" fontFamily="sans-serif" opacity="0.75">↗</text>

                {/* Outflow Stream (- / ↘) [Red] */}
                <path d="M 305 65 Q 230 85 170 170" stroke="#FB7185" strokeWidth="1.8" fill="none" strokeDasharray="4 4" className="anim-stream-outflow" />
                <text x="295" y="60" fill="#FB7185" fontSize="11" fontFamily="sans-serif" fontWeight="bold" opacity="0.9">−₹</text>
                <text x="260" y="80" fill="#F43F5E" fontSize="9" fontFamily="sans-serif" opacity="0.75">↘</text>

                {/* Margin Ratio Stream (%) [Purple] */}
                <path d="M 40 275 Q 115 255 170 170" stroke="#C084FC" strokeWidth="1.8" fill="none" strokeDasharray="4 4" className="anim-stream-inflow" />
                <text x="35" y="290" fill="#C084FC" fontSize="11" fontFamily="sans-serif" fontWeight="bold" opacity="0.9">% Margin</text>

                {/* Information Telemetry [Blue] */}
                <path d="M 300 275 Q 225 255 170 170" stroke="#06B6D4" strokeWidth="1.8" fill="none" strokeDasharray="4 4" className="anim-stream-outflow" />
                <text x="270" y="290" fill="#06B6D4" fontSize="11" fontFamily="sans-serif" fontWeight="bold" opacity="0.9">Telemetry</text>
              </>
            )}

            {/* =================================================================== */}
            {/* PHASE 3: TRANSACTION NETWORK (Revenue -> Cash -> Payables)         */}
            {/* =================================================================== */}
            {phase >= 3 && phase <= 7 && (
              <>
                {/* Revenue to Receivables Track */}
                <path d="M 75 110 L 125 140 L 170 170" stroke="rgba(52, 211, 153, 0.6)" strokeWidth="1.6" strokeDasharray="3 3" />
                <circle cx="75" cy="110" r="3.5" fill="#34D399" filter="url(#nodeGlow)" />
                <text x="45" y="105" fill="#34D399" fontSize="8" fontFamily="monospace" opacity="0.8">REVENUE</text>

                {/* Receivables Node */}
                <circle cx="125" cy="140" r="3.2" fill="#10B981" filter="url(#nodeGlow)" />
                <text x="100" y="132" fill="#10B981" fontSize="8" fontFamily="monospace" opacity="0.75">RECEIVABLES</text>

                {/* Cash Central Hub */}
                <circle cx="170" cy="170" r="4.5" fill="#6EE7B7" filter="url(#glowFilter)" />
                <text x="160" y="190" fill="#6EE7B7" fontSize="8" fontFamily="monospace" fontWeight="bold" opacity="0.9">CASH</text>

                {/* Expenses to Payables Track */}
                <path d="M 170 170 L 215 140 L 265 110" stroke="rgba(251, 113, 133, 0.6)" strokeWidth="1.6" strokeDasharray="3 3" />
                <circle cx="215" cy="140" r="3.2" fill="#FB7185" filter="url(#nodeGlow)" />
                <text x="215" y="132" fill="#FB7185" fontSize="8" fontFamily="monospace" opacity="0.75">EXPENSES</text>

                <circle cx="265" cy="110" r="3.5" fill="#F43F5E" filter="url(#nodeGlow)" />
                <text x="250" y="105" fill="#F43F5E" fontSize="8" fontFamily="monospace" opacity="0.8">PAYABLES</text>
              </>
            )}

            {/* =================================================================== */}
            {/* PHASE 4: CASH FLOW GRAPH (PAST -> NOW -> FUTURE)                    */}
            {/* =================================================================== */}
            {phase >= 4 && phase <= 7 && (
              <>
                {/* Historical Cash Flow Curve (Past -> Now) */}
                <path
                  d="M 30 225 C 65 210, 95 145, 125 155 C 150 165, 165 215, 170 170"
                  stroke="url(#cashFlowPastGrad)"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  filter="url(#glowFilter)"
                  fill="none"
                  className="anim-cash-curve"
                />
                <text x="35" y="240" fill="#06B6D4" fontSize="8" fontFamily="monospace">PAST</text>

                {/* NOW Milestone Node */}
                <circle cx="170" cy="170" r="5" fill="#34D399" filter="url(#glowFilter)" className="animate-ping" />
                <circle cx="170" cy="170" r="3.5" fill="#FFFFFF" />
                <text x="160" y="158" fill="#FFFFFF" fontSize="9" fontFamily="monospace" fontWeight="bold">NOW</text>
              </>
            )}

            {/* =================================================================== */}
            {/* PHASE 5 & 6: FINANCIAL ANALYSIS RADAR CORE & RISK/LIQUIDITY SCAN    */}
            {/* =================================================================== */}
            {phase >= 5 && phase <= 7 && (
              <>
                {/* Concentric Rotating Radar Rings */}
                <circle
                  cx="170"
                  cy="170"
                  r="136"
                  stroke="rgba(16, 185, 129, 0.15)"
                  strokeWidth="1"
                  strokeDasharray="4 6"
                  className="animate-spin-slow origin-center"
                />
                <circle
                  cx="170"
                  cy="170"
                  r="92"
                  stroke="rgba(168, 85, 247, 0.18)"
                  strokeWidth="1"
                  strokeDasharray="2 8"
                  className="animate-spin-reverse-slow origin-center"
                />
                <circle
                  cx="170"
                  cy="170"
                  r="55"
                  stroke="rgba(6, 182, 212, 0.2)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
              </>
            )}

            {/* =================================================================== */}
            {/* PHASE 7: PREDICTION FORECAST CORRIDOR (NOW -> FUTURE)              */}
            {/* =================================================================== */}
            {phase >= 7 && phase <= 7 && (
              <>
                {/* Forecast Upper & Lower Uncertainty Bounds */}
                <path
                  d="M 170 170 C 200 130, 235 90, 310 65"
                  stroke="rgba(192, 132, 252, 0.3)"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                  fill="none"
                />
                <path
                  d="M 170 170 C 200 160, 235 140, 310 115"
                  stroke="rgba(192, 132, 252, 0.3)"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                  fill="none"
                />

                {/* Primary Forecast Path (Purple / Glowing) */}
                <path
                  d="M 170 170 C 200 145, 235 110, 310 85"
                  stroke="url(#cashFlowFutureGrad)"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  filter="url(#glowFilter)"
                  fill="none"
                  className="anim-forecast-line"
                />
                <circle cx="310" cy="85" r="4.5" fill="#C084FC" filter="url(#glowFilter)" className="animate-pulse" />
                <text x="260" y="78" fill="#C084FC" fontSize="9" fontFamily="monospace" fontWeight="bold">FORECAST ↗</text>
              </>
            )}

            {/* =================================================================== */}
            {/* PHASE 8–16: VITTANAYA SIGNATURE FORM (FINANCE + INTELLIGENCE)      */}
            {/* =================================================================== */}
            {phase >= 8 && (
              <>
                {/* Outer Left Leaf Contour */}
                <path
                  d="M 170 285 C 95 240 68 145 105 82 C 138 35 170 28 170 28"
                  stroke="url(#vittanayaGlowGrad)"
                  strokeWidth="3.4"
                  strokeLinecap="round"
                  filter="url(#glowFilter)"
                  className="anim-draw-leaf-left"
                />

                {/* Outer Right Leaf Contour */}
                <path
                  d="M 170 285 C 245 240 272 145 235 82 C 202 35 170 28 170 28"
                  stroke="url(#vittanayaGlowGrad)"
                  strokeWidth="3.4"
                  strokeLinecap="round"
                  filter="url(#glowFilter)"
                  className="anim-draw-leaf-right"
                />

                {/* Inner Left Harmonic Venation Arc */}
                <path
                  d="M 170 260 C 115 220 95 150 120 100 C 145 65 170 45 170 45"
                  stroke="url(#vittanayaInnerGrad)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeDasharray="4 2"
                  className="anim-draw-leaf-inner-left"
                />

                {/* Inner Right Harmonic Venation Arc */}
                <path
                  d="M 170 260 C 225 220 245 150 220 100 C 195 65 170 45 170 45"
                  stroke="url(#vittanayaInnerGrad)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeDasharray="4 2"
                  className="anim-draw-leaf-inner-right"
                />

                {/* Central Stem: Ascending Financial Growth Spine */}
                <path
                  d="M 170 285 Q 166 185 170 28"
                  stroke="#34D399"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  filter="url(#glowFilter)"
                  className="anim-draw-stem"
                />

                {/* Financial Candlestick Trend Graph */}
                <path
                  d="M 170 235 L 138 200 L 170 172 L 212 135 L 170 100 L 198 68 L 170 28"
                  stroke="url(#vittanayaCyanGrad)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#glowFilter)"
                  className="anim-draw-chart-path"
                />

                {/* Secondary Momentum Polyline */}
                <path
                  d="M 170 265 L 195 230 L 170 210 L 140 160 L 170 140 L 150 85 L 170 28"
                  stroke="rgba(6, 182, 212, 0.45)"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="anim-draw-chart-secondary"
                />

                {/* Circuit Branches */}
                <path d="M 170 210 L 122 178 L 102 188" stroke="rgba(52, 211, 153, 0.75)" strokeWidth="1.5" strokeLinecap="round" className="anim-draw-branch" />
                <path d="M 170 150 L 118 122 L 126 100" stroke="rgba(52, 211, 153, 0.75)" strokeWidth="1.5" strokeLinecap="round" className="anim-draw-branch" />
                <path d="M 170 185 L 218 158 L 238 168" stroke="rgba(52, 211, 153, 0.75)" strokeWidth="1.5" strokeLinecap="round" className="anim-draw-branch" />
                <path d="M 170 120 L 222 98 L 212 76" stroke="rgba(52, 211, 153, 0.75)" strokeWidth="1.5" strokeLinecap="round" className="anim-draw-branch" />

                {/* Milestone Nodes */}
                <circle cx="138" cy="200" r="3.5" fill="#34D399" filter="url(#nodeGlow)" />
                <circle cx="212" cy="135" r="4" fill="#34D399" filter="url(#glowFilter)" />
                <circle cx="198" cy="68" r="4" fill="#34D399" filter="url(#glowFilter)" />
                <circle cx="170" cy="28" r="5" fill="#6EE7B7" filter="url(#glowFilter)" className="animate-ping" />
                <circle cx="170" cy="28" r="3.2" fill="#FFFFFF" />

                {/* Flowing Data Photons on Completed Geometry */}
                <circle r="3.2" fill="#FFFFFF" filter="url(#glowFilter)">
                  <animateMotion path="M 170 285 C 95 240 68 145 105 82 C 138 35 170 28 170 28" dur="2.2s" repeatCount="indefinite" />
                </circle>
                <circle r="3.2" fill="#34D399" filter="url(#glowFilter)">
                  <animateMotion path="M 170 285 C 245 240 272 145 235 82 C 202 35 170 28 170 28" dur="2.2s" begin="0.4s" repeatCount="indefinite" />
                </circle>
                <circle r="3.8" fill="#6EE7B7" filter="url(#glowFilter)">
                  <animateMotion path="M 170 235 L 138 200 L 170 172 L 212 135 L 170 100 L 198 68 L 170 28" dur="1.6s" repeatCount="indefinite" />
                </circle>
              </>
            )}
          </svg>
        </div>

        {/* ======================================================================= */}
        {/* PHASE 6 SCAN METRICS (CASH FLOW / RISK / LIQUIDITY)                    */}
        {/* ======================================================================= */}
        {phase >= 5 && phase <= 7 && (
          <div className="flex items-center justify-center space-x-4 text-[10px] font-mono tracking-wider">
            <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-slate-400">CASH FLOW</span>
              <span className="text-emerald-400 font-bold">{phase >= 6 ? 'MAPPED' : 'ANALYZING...'}</span>
            </div>
            <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
              <span className="text-slate-400">RISK</span>
              <span className="text-purple-400 font-bold">{phase >= 6 ? 'ANALYZED' : 'ANALYZING...'}</span>
            </div>
            <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
              <span className="text-slate-400">LIQUIDITY</span>
              <span className="text-cyan-400 font-bold">{phase >= 6 ? 'STABLE' : 'ANALYZING...'}</span>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* PHASES 11–15: BRAND REVEAL, LIGHT SWEEP, TAGLINE & SIGNATURE LINE      */}
        {/* ======================================================================= */}
        <div className="flex flex-col items-center text-center space-y-2">
          
          {/* Narrative Boot Subtitle Feedback */}
          <div className="min-h-[16px] text-[10px] text-slate-400 font-mono tracking-widest uppercase transition-opacity duration-300">
            {phase === 1 && <span className="text-emerald-400">SYSTEM AWAKENING...</span>}
            {phase === 2 && <span className="text-emerald-400">RECEIVING FINANCIAL SIGNALS...</span>}
            {phase === 3 && <span className="text-cyan-400">CONSTRUCTING TRANSACTION NETWORK...</span>}
            {phase === 4 && <span className="text-emerald-300">SYNTHESIZING CASH FLOW DYNAMICS...</span>}
            {phase === 5 && <span className="text-purple-400">ANALYZING RISK & LIQUIDITY...</span>}
            {phase === 6 && <span className="text-purple-300">CALIBRATING PREDICTION ENGINE...</span>}
            {phase === 7 && <span className="text-purple-400">EXTENDING FORECAST CORRIDOR...</span>}
            {phase >= 8 && phase < 15 && <span className="text-emerald-400">INTELLIGENCE CONVERGENCE COMPLETE</span>}
            {phase >= 15 && <span className="text-emerald-400 font-bold">FINANCIAL INTELLIGENCE ACTIVE</span>}
          </div>

          {/* Main Brand Wordmark — Revealed Letter-by-Letter (80ms Stagger) */}
          <div className="flex items-center justify-center space-x-[0.22em] text-3xl sm:text-4xl lg:text-5xl font-black tracking-[0.22em] uppercase font-sans select-none min-h-[48px]">
            {phase >= 11 &&
              BRAND_LETTERS.map((letter, index) => (
                <span
                  key={index}
                  className={`anim-letter ${phase >= 12 ? 'brand-light-sweep' : 'text-white'}`}
                  style={{
                    animationDelay: `${index * 80}ms`,
                  }}
                >
                  {letter}
                </span>
              ))}
          </div>

          {/* Tagline: Financial Intelligence (Phase 13+) */}
          {phase >= 13 && (
            <div className="flex items-center space-x-3 anim-tagline">
              <span className="w-8 h-[1px] bg-emerald-500/50 shadow-[0_0_8px_#10B981]" />
              <p className="text-xs sm:text-sm font-semibold tracking-[0.34em] uppercase text-emerald-400 font-sans">
                Financial Intelligence
              </p>
              <span className="w-8 h-[1px] bg-emerald-500/50 shadow-[0_0_8px_#10B981]" />
            </div>
          )}

          {/* Phase 14: Animated Financial Signature Line with Leaf Accent */}
          {phase >= 13 && (
            <div className="pt-2 flex items-center justify-center">
              <svg width="220" height="24" viewBox="0 0 220 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Financial Signature Graph: Low -> Rise -> Dip -> Recover */}
                <path
                  d="M 10 18 L 45 18 L 75 8 L 110 19 L 155 6 L 195 6"
                  stroke="url(#vittanayaGlowGrad)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="anim-sig-line"
                />
                {/* Glowing Terminal Point Blooming into a Leaf Accent */}
                <circle cx="195" cy="6" r="3" fill="#34D399" filter="url(#nodeGlow)" />
                <path
                  d="M 195 6 C 198 2 205 3 207 6 C 205 9 198 10 195 6 Z"
                  fill="#6EE7B7"
                  className="anim-leaf-accent"
                />
              </svg>
            </div>
          )}
        </div>

      </div>

      {/* Bottom Skip Action */}
      <div className="absolute bottom-6 text-[10px] font-mono tracking-wider text-slate-500 opacity-60 hover:opacity-100 transition-opacity">
        Click anywhere or press any key to skip
      </div>

    </div>
  );
}
