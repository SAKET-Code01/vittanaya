import React from 'react';
import ruralBg from '../../assets/ruralbg.png';
import vittanayaLogo from '../../assets/vittanaya-logo.png';
import './WelcomeScreen.css';

/**
 * WelcomeScreen Component (Step 1 of Onboarding)
 * 
 * Premium Fintech SaaS Landing Experience (Stripe / Revolut / Ramp / Mercury style).
 * - Shared ruralbg.png backdrop with subtle white diffusion overlay.
 * - Official VITTANAYA Brand Logo asset in header.
 * - Subtly animated Hyper-Local Business Advisory pill.
 * - Monumental gradient wordmark and clear value proposition.
 * - 100% Single-Screen Viewport Fit: Zero scrolling on desktop/laptop.
 * 
 * Props:
 * @param {Function} onGetStarted - Primary CTA to begin onboarding.
 * @param {Function} onExploreDemo - Secondary CTA to enter demo workspace.
 */
export default function WelcomeScreen({ onGetStarted, onExploreDemo }) {
  return (
    <div 
      className="h-screen max-h-screen w-full text-slate-900 relative overflow-y-auto md:overflow-hidden flex flex-col justify-between selection:bg-blue-600 selection:text-white px-5 sm:px-8 py-3.5 sm:py-5"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0.55)), url(${ruralBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
      }}
    >
      
      {/* =========================================================================
          ENHANCED FINTECH AMBIENT LIGHTING & STRUCTURAL GRID
          ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        
        {/* --- LAYER 1: Multi-Point Soft Radial Lighting (3% - 8% Opacity) --- */}
        {/* Top-Center Wordmark Backlight */}
        <div 
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-[950px] h-[450px] opacity-75 blur-3xl pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 65% 50% at 50% 0%, rgba(37, 99, 235, 0.12), rgba(96, 165, 250, 0.06) 45%, transparent 75%)'
          }}
        />
        {/* Top-Left Ambient Blue Glow */}
        <div 
          className="absolute top-10 left-[6%] w-[420px] h-[360px] opacity-60 blur-3xl pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 40% 40%, rgba(59, 130, 246, 0.07), transparent 70%)'
          }}
        />
        {/* Top-Right Ambient Indigo Glow */}
        <div 
          className="absolute top-14 right-[6%] w-[460px] h-[380px] opacity-55 blur-3xl pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 60% 40%, rgba(99, 102, 241, 0.06), transparent 70%)'
          }}
        />
        {/* Bottom-Center Base Glow */}
        <div 
          className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[650px] h-[320px] opacity-45 blur-3xl pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 70% 50% at 50% 100%, rgba(56, 189, 248, 0.06), transparent 70%)'
          }}
        />
        
        {/* --- LAYER 2: Ultra-Light Structural Financial Grid (Bloomberg / Stripe / Linear Grade) --- */}
        <div 
          className="absolute inset-0 opacity-[0.028]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #0F172A 1px, transparent 1px),
              linear-gradient(to bottom, #0F172A 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse 85% 70% at 50% 30%, #000 45%, transparent 95%)',
            WebkitMaskImage: 'radial-gradient(ellipse 85% 70% at 50% 30%, #000 45%, transparent 95%)'
          }}
        />

        {/* --- LAYER 3: Abstract Data-Flow Paths & Knowledge Graph Vectors (2% - 5% Opacity) --- */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.035] sm:opacity-[0.045]"
          viewBox="0 0 1440 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          {/* Upper Financial Intelligence Flow Trajectory */}
          <path
            d="M -100 210 C 260 130, 580 270, 940 150 C 1180 70, 1380 230, 1600 170"
            stroke="#2563EB"
            strokeWidth="1.5"
            strokeDasharray="4 8"
          />
          {/* Lower Capital Network Arc */}
          <path
            d="M -80 490 C 300 430, 660 570, 1100 470 C 1340 410, 1490 530, 1620 490"
            stroke="#3B82F6"
            strokeWidth="1.2"
            strokeDasharray="6 10"
          />
          {/* Diagonal Knowledge Flow Link */}
          <path
            d="M 120 -60 C 320 280, 680 340, 1320 860"
            stroke="#6366F1"
            strokeWidth="1"
            strokeDasharray="3 12"
          />
          {/* Concentric Coordinate Orbit Ring (Upper Right) */}
          <circle
            cx="1200"
            cy="190"
            r="210"
            stroke="#2563EB"
            strokeWidth="1"
            strokeDasharray="2 10"
          />
          {/* Concentric Coordinate Orbit Ring (Lower Left) */}
          <circle
            cx="220"
            cy="690"
            r="170"
            stroke="#3B82F6"
            strokeWidth="1"
            strokeDasharray="3 12"
          />
        </svg>

        {/* --- LAYER 4: Intelligence Signals & Network Accent Points (Desktop Richness, Hidden on Mobile) --- */}
        <div className="absolute inset-0 pointer-events-none hidden md:block" aria-hidden="true">
          {/* Node 1: Upper Left Signal */}
          <div className="absolute top-[18%] left-[14%] flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-blue-500/30 ring-4 ring-blue-500/10 animate-pulse" />
          </div>
          {/* Node 2: Upper Right Signal */}
          <div className="absolute top-[22%] right-[15%] flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/25 ring-4 ring-indigo-500/10" />
          </div>
          {/* Node 3: Mid Left Network Point */}
          <div className="absolute top-[52%] left-[8%] flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600/25 ring-2 ring-blue-500/10" />
          </div>
          {/* Node 4: Mid Right Network Point */}
          <div className="absolute top-[58%] right-[10%] flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/25 ring-2 ring-cyan-500/10" />
          </div>
          {/* Node 5: Lower Negative Space Accents */}
          <div className="absolute bottom-[17%] left-[17%] flex items-center justify-center">
            <span className="w-1 h-1 rounded-full bg-blue-500/25" />
          </div>
          <div className="absolute bottom-[19%] right-[19%] flex items-center justify-center">
            <span className="w-1 h-1 rounded-full bg-indigo-500/25" />
          </div>
        </div>

      </div>

      {/* =========================================================================
          TOP NAVIGATION BAR (Official Brand Header - Clean Top Right)
          ========================================================================= */}
      <header className="relative z-10 max-w-6xl w-full mx-auto flex items-center justify-start shrink-0">
        <div className="flex items-center">
          <img 
            src={vittanayaLogo} 
            alt="VITTANAYA - Financial Intelligence for Rural Entrepreneurs" 
            className="vittanaya-brand-logo"
          />
        </div>
      </header>

      {/* =========================================================================
          MAIN CONTENT AREA (Compressed for Single-Screen Viewport Fit)
          ========================================================================= */}
      <main className="relative z-10 max-w-5xl w-full mx-auto my-auto flex flex-col items-center text-center justify-center shrink">
        
        {/* -------------------------------------------------------------------
            SECTION 1: HERO (Monumental Blue Gradient Fade Wordmark)
            ------------------------------------------------------------------- */}
        <section className="flex flex-col items-center max-w-4xl mx-auto">
          
          {/* Subtle Polished Animated Category Pill */}
          <div className="hyperlocal-advisory-pill mb-2 sm:mb-3">
            <span className="hyperlocal-advisory-dot" aria-hidden="true" />
            <span className="hyperlocal-advisory-text">
              HYPER-LOCAL BUSINESS ADVISORY
            </span>
          </div>

          {/* Monumental Blue Gradient Fade Typography: VITTANAYA */}
          <h1 className="text-[clamp(52px,7.5vw,94px)] font-black tracking-[-0.045em] leading-[0.92] select-none">
            <span 
              className="bg-clip-text text-transparent bg-gradient-to-b from-[#0A2540] via-[#2563EB] to-[#60A5FA]"
              style={{
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 2px 14px rgba(37, 99, 235, 0.12))'
              }}
            >
              VITTANAYA
            </span>
          </h1>

          {/* Subheading: Financial Intelligence for Rural Entrepreneurs */}
          <h2 className="text-[clamp(16px,1.9vw,24px)] font-semibold tracking-tight text-slate-800 mt-2 sm:mt-3 max-w-2xl leading-snug">
            Financial Intelligence for Rural Entrepreneurs
          </h2>

          {/* Value Sentence: One platform • Smarter decisions • Stronger businesses */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 text-xs sm:text-sm md:text-[15px] text-slate-600 font-medium mt-1.5 sm:mt-2 tracking-normal">
            <span>One platform</span>
            <span className="text-blue-500 font-bold">•</span>
            <span>Smarter decisions</span>
            <span className="text-blue-500 font-bold">•</span>
            <span>Stronger businesses</span>
          </div>

        </section>

        {/* -------------------------------------------------------------------
            SECTION 2: THREE FEATURES ROW (Typography-First Minimal Columns)
            ------------------------------------------------------------------- */}
        <section className="w-full mt-4 sm:mt-6 pt-3.5 sm:pt-4 border-t border-slate-200/70">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-6 lg:gap-8 text-left">
            
            {/* Block 1: Business Planning */}
            <div className="flex flex-col space-y-1">
              <span className="text-[10px] sm:text-[11px] font-bold text-blue-700/90 uppercase tracking-widest">
                01 / Strategy
              </span>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Business Planning
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-600 font-normal leading-relaxed">
                Build sustainable business plans backed by local insights.
              </p>
            </div>

            {/* Block 2: Financial Structuring */}
            <div className="flex flex-col space-y-1">
              <span className="text-[10px] sm:text-[11px] font-bold text-blue-700/90 uppercase tracking-widest">
                02 / Capital
              </span>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Financial Structuring
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-600 font-normal leading-relaxed">
                Understand capital requirements, cash flow and growth potential.
              </p>
            </div>

            {/* Block 3: Government Schemes */}
            <div className="flex flex-col space-y-1">
              <span className="text-[10px] sm:text-[11px] font-bold text-blue-700/90 uppercase tracking-widest">
                03 / Entitlements
              </span>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Government Schemes
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-600 font-normal leading-relaxed">
                Discover schemes and funding opportunities relevant to your business.
              </p>
            </div>

          </div>
        </section>

        {/* -------------------------------------------------------------------
            SECTION 3: CTA BUTTONS (Explore Demo & Get Started)
            ------------------------------------------------------------------- */}
        <section className="mt-4 sm:mt-6 flex flex-col items-center space-y-2 shrink-0">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
            
            {/* Secondary CTA: Explore Demo */}
            {onExploreDemo && (
              <button
                type="button"
                id="landing-explore-demo-btn"
                onClick={onExploreDemo}
                className="w-full sm:w-auto px-6 py-2.5 sm:py-3 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-slate-950 border border-slate-300/90 hover:border-slate-400 font-semibold text-xs sm:text-sm tracking-tight transition-all duration-200 cursor-pointer flex items-center justify-center shadow-xs"
              >
                <span>Explore Demo</span>
              </button>
            )}

            {/* Primary CTA: Get Started */}
            <button
              type="button"
              id="landing-get-started-btn"
              onClick={onGetStarted}
              className="w-full sm:w-auto px-7 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 hover:from-blue-800 hover:to-indigo-700 text-white font-semibold text-xs sm:text-sm tracking-tight shadow-md shadow-blue-600/25 hover:shadow-lg hover:shadow-blue-600/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <span>Get Started</span>
              <span className="text-sm">→</span>
            </button>

          </div>

          {/* Minimalist Trust Indicator */}
          <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium">
            Free and open for rural micro-enterprises • Powered by deterministic financial intelligence
          </p>
        </section>

      </main>

      {/* =========================================================================
          FOOTER (Single-Line Minimalist Protocol Line)
          ========================================================================= */}
      <footer className="relative z-10 max-w-6xl w-full mx-auto px-2 flex flex-col sm:flex-row items-center justify-between text-[10px] sm:text-[11px] text-slate-500 gap-1 shrink-0 pt-1">
        <span>© 2026 VITTANAYA • All rights reserved</span>
        <span>Ministry of Social Justice and Empowerment (MoSJE)</span>
      </footer>

    </div>
  );
}
