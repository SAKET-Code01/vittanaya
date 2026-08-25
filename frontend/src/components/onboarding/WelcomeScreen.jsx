import React, { useState, useEffect } from 'react';

/**
 * WelcomeScreen Component (Step 1 of Onboarding)
 * 100% visually identical reproduction of the approved Step 1 reference design.
 * 
 * Animation Loop Behavior:
 * - Initial page entrance (0s)
 * - Dashboard preview micro-animations replay automatically every 10s while Step 1 is open
 * - Replay includes: Cash Flow line draw, Receivables bars rising, Financial Health ring filling to 84, Payables trend line draw, subtle preview float
 * - Logo, heading, background, CTA, and pagination dots remain completely static after initial entrance
 * - Loop cleanly terminates on unmount (leaving Step 1)
 * - Disabled if prefers-reduced-motion is active
 */
export default function WelcomeScreen({ onGetStarted, onExploreDemo }) {
  const [initialMounted, setInitialMounted] = useState(false);
  const [previewActive, setPreviewActive] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // 1. Accessibility: Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setPrefersReducedMotion(true);
      setInitialMounted(true);
      setPreviewActive(true);
      return;
    }

    // 2. Initial Mount Animation (0s)
    const initialTimer = setTimeout(() => {
      setInitialMounted(true);
      setPreviewActive(true);
    }, 40);

    // 3. 10-Second Auto-Replay Interval Loop
    const interval = setInterval(() => {
      // Briefly reset preview active state, then re-trigger transitions
      setPreviewActive(false);
      setTimeout(() => {
        setPreviewActive(true);
      }, 60);
    }, 10000);

    // Clean up timers on unmount (leaving Step 1)
    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  const noMotion = prefersReducedMotion;
  const isChartActive = noMotion || previewActive;

  return (
    <div className="min-h-screen bg-[#F9FBFE] text-slate-900 relative overflow-x-hidden flex flex-col justify-between py-6 px-4 sm:px-8 select-none">
      
      {/* Background Decorative Orbit Lines & Cyan/Blue Nodes (Completely Static) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg
          className="absolute w-full h-full opacity-60"
          viewBox="0 0 1440 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M-100 250 C 300 100, 700 80, 1100 120 C 1300 140, 1500 220, 1600 300"
            stroke="#E2E8F0"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <path
            d="M0 320 C 350 200, 750 180, 1150 230 C 1350 260, 1500 340, 1600 400"
            stroke="#E2E8F0"
            strokeWidth="1"
          />
        </svg>

        {/* Decorative static nodes */}
        <div className="absolute top-28 left-1/4 w-2.5 h-2.5 rounded-full bg-[#38BDF8]/60 shadow-sm" />
        <div className="absolute top-16 right-1/3 w-3 h-3 rounded-full bg-[#818CF8]/50 shadow-sm" />
        <div className="absolute top-48 right-[14%] w-2 h-2 rounded-full bg-[#38BDF8]/50 shadow-sm" />
      </div>

      {/* Top Header: VITTANAYA Brand (Static Logo) */}
      <header className="relative z-10 max-w-7xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* V Logo Gradient Mark */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00C6FF] via-[#0072FF] to-[#7A00FF] flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-black text-xl tracking-tight">
            V
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tight text-[#0F172A] leading-none">
              VITTANAYA
            </h1>
            <p className="text-xs font-medium text-[#64748B] tracking-normal mt-0.5">
              Financial Intelligence
            </p>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-5xl w-full mx-auto my-auto py-6 flex flex-col items-center text-center space-y-7">
        
        {/* 1. Hero Typography (Gentle initial entrance fade only; stays static afterwards) */}
        <div
          className={`space-y-3 transition-opacity duration-600 ease-out ${
            noMotion || initialMounted ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <h2 className="text-4xl sm:text-5xl lg:text-[54px] font-black text-[#0F172A] leading-[1.12] tracking-[-0.03em]">
            Let’s Onboard<br />Your Business
          </h2>
          <p className="text-sm sm:text-base text-[#64748B] font-normal leading-relaxed max-w-md mx-auto">
            One platform. Every insight.<br />
            Stronger decisions for your business.
          </p>
        </div>

        {/* 2. Central Dashboard Preview Mockup (Subtle entrance & periodic 10s micro-refresh) */}
        <div
          className={`w-full max-w-4xl bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.06)] flex flex-col md:flex-row gap-4 sm:gap-6 items-stretch text-left transition-all duration-700 ease-out ${
            noMotion || initialMounted
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-2.5'
          }`}
        >
          
          {/* Left Preview Sidebar (Static Placeholder) */}
          <div className="hidden md:flex w-44 bg-[#F8FAFC] rounded-2xl p-4 flex-col justify-between border border-slate-100">
            <div className="space-y-3.5">
              {/* Active Profile Item */}
              <div className="flex items-center space-x-3 p-2 bg-blue-50/90 rounded-xl border border-blue-100/60">
                <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="h-2.5 w-16 bg-slate-300/80 rounded-full" />
              </div>

              {/* Inactive Rows */}
              <div className="space-y-3 px-1 pt-1">
                {[1, 2, 3, 4, 5].map((row, idx) => (
                  <div key={idx} className="flex items-center space-x-3 py-1">
                    <div className="w-4 h-4 rounded text-slate-400 flex items-center justify-center">
                      {idx === 0 && (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                      {idx === 1 && (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                        </svg>
                      )}
                      {idx === 2 && (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      )}
                      {idx === 3 && (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      )}
                      {idx === 4 && (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </div>
                    <div className="h-2 w-16 bg-slate-200 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Main Dashboard Cards Area */}
          <div className="flex-1 flex flex-col space-y-4">
            
            {/* Top Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              
              {/* Card 1: Cash Flow */}
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Cash Flow</span>
                    <span className="text-xs font-bold text-emerald-500">+8.7%</span>
                  </div>
                  <h4 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight mt-1">
                    ₹12,45,000
                  </h4>
                  <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">Forward</span>
                </div>

                {/* Upward Blue Curve Sparkline (Loops every 10s) */}
                <div className="h-12 w-full pt-1 overflow-hidden">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 120 40" fill="none">
                    <defs>
                      <linearGradient id="blueGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0 34 L 15 32 L 30 26 L 45 28 L 60 20 L 75 22 L 90 14 L 105 10 L 120 4 L 120 40 L 0 40 Z"
                      fill="url(#blueGlow)"
                      className={`transition-opacity duration-700 ease-out ${
                        isChartActive ? 'opacity-100' : 'opacity-0'
                      }`}
                      style={{ transitionDelay: noMotion ? '0ms' : '450ms' }}
                    />
                    <path
                      d="M0 34 L 15 32 L 30 26 L 45 28 L 60 20 L 75 22 L 90 14 L 105 10 L 120 4"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeDasharray="160"
                      strokeDashoffset={isChartActive ? 0 : 160}
                      className="transition-all duration-800 ease-out"
                      style={{ transitionDelay: noMotion ? '0ms' : '100ms' }}
                    />
                    {/* Signal Dots */}
                    <circle
                      cx="60"
                      cy="20"
                      r="2.5"
                      fill="#3B82F6"
                      className={`transition-opacity duration-300 ${isChartActive ? 'opacity-100' : 'opacity-0'}`}
                      style={{ transitionDelay: noMotion ? '0ms' : '500ms' }}
                    />
                    <circle
                      cx="90"
                      cy="14"
                      r="2.5"
                      fill="#3B82F6"
                      className={`transition-opacity duration-300 ${isChartActive ? 'opacity-100' : 'opacity-0'}`}
                      style={{ transitionDelay: noMotion ? '0ms' : '650ms' }}
                    />
                    <circle
                      cx="120"
                      cy="4"
                      r="3"
                      fill="#3B82F6"
                      className={`transition-opacity duration-300 ${isChartActive ? 'opacity-100' : 'opacity-0'}`}
                      style={{ transitionDelay: noMotion ? '0ms' : '800ms' }}
                    />
                  </svg>
                </div>
              </div>

              {/* Card 2: Receivables */}
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col justify-between space-y-2">
                <div>
                  <span className="text-xs font-bold text-slate-800">Receivables</span>
                  <h4 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight mt-1">
                    ₹8,20,000
                  </h4>
                  <span className="text-xs font-bold text-blue-600 block mt-0.5">12 Invoices</span>
                  <span className="text-[10px] text-slate-400 block mt-1.5 font-medium">Trend</span>
                </div>

                {/* Mini Multi-Color Bar Trend Chart (Loops every 10s) */}
                <div className="h-10 flex items-end justify-between gap-1.5 px-1">
                  {[
                    { h: 'h-6', bg: 'bg-[#6366F1]', delay: '120ms' },
                    { h: 'h-4', bg: 'bg-[#818CF8]', delay: '170ms' },
                    { h: 'h-5', bg: 'bg-[#F43F5E]', delay: '220ms' },
                    { h: 'h-7', bg: 'bg-[#3B82F6]', delay: '270ms' },
                    { h: 'h-9', bg: 'bg-[#2563EB]', delay: '320ms' },
                    { h: 'h-3', bg: 'bg-[#FB923C]', delay: '370ms' },
                    { h: 'h-8', bg: 'bg-[#CBD5E1]', delay: '420ms' },
                  ].map((bar, bIdx) => (
                    <div
                      key={bIdx}
                      className={`w-2.5 ${bar.h} ${bar.bg} rounded-t-sm origin-bottom transition-transform duration-500 ease-out`}
                      style={{
                        transform: isChartActive ? 'scaleY(1)' : 'scaleY(0)',
                        transitionDelay: noMotion ? '0ms' : bar.delay,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Card 3: Financial Health Ring Gauge (Loops every 10s to exactly 84%) */}
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col items-center justify-between text-center">
                <div className="w-full flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Financial Health</span>
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-black">
                    ✓
                  </span>
                </div>

                {/* Circular Gauge */}
                <div className="relative w-20 h-20 flex items-center justify-center my-1">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    {/* Background circle */}
                    <path
                      className="text-slate-100"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    {/* Smooth Progress Arc */}
                    <path
                      className="text-[#00B4D8] transition-all duration-900 ease-out"
                      strokeDasharray={isChartActive ? '84, 100' : '0, 100'}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      style={{ transitionDelay: noMotion ? '0ms' : '150ms' }}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div
                    className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ${
                      isChartActive ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{ transitionDelay: noMotion ? '0ms' : '250ms' }}
                  >
                    <span className="text-xl font-black text-[#0F172A] leading-none">84</span>
                    <span className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">/100</span>
                  </div>
                </div>

                <span className="text-xs font-bold text-emerald-600">Stable</span>
              </div>

            </div>

            {/* Bottom Card: Payables */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-800">Payables</span>
                <div className="flex items-baseline space-x-3">
                  <span className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
                    ₹6,75,000
                  </span>
                  <span className="text-xs font-bold text-amber-500">
                    8 Obligations
                  </span>
                </div>
              </div>

              {/* Orange Wave Trendline (Loops every 10s) */}
              <div className="h-8 w-full sm:w-56 overflow-hidden">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 180 30" fill="none">
                  <defs>
                    <linearGradient id="amberGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F97316" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#F97316" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 24 L 25 12 L 50 16 L 75 8 L 100 14 L 125 10 L 150 4 L 180 1 L 180 30 L 0 30 Z"
                    fill="url(#amberGlow)"
                    className={`transition-opacity duration-700 ease-out ${
                      isChartActive ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{ transitionDelay: noMotion ? '0ms' : '550ms' }}
                  />
                  <path
                    d="M0 24 L 25 12 L 50 16 L 75 8 L 100 14 L 125 10 L 150 4 L 180 1"
                    fill="none"
                    stroke="#F97316"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="200"
                    strokeDashoffset={isChartActive ? 0 : 200}
                    className="transition-all duration-850 ease-out"
                    style={{ transitionDelay: noMotion ? '0ms' : '200ms' }}
                  />
                  {/* Signal Points */}
                  <circle
                    cx="25"
                    cy="12"
                    r="2"
                    fill="#F97316"
                    className={`transition-opacity duration-300 ${isChartActive ? 'opacity-100' : 'opacity-0'}`}
                    style={{ transitionDelay: noMotion ? '0ms' : '400ms' }}
                  />
                  <circle
                    cx="75"
                    cy="8"
                    r="2"
                    fill="#F97316"
                    className={`transition-opacity duration-300 ${isChartActive ? 'opacity-100' : 'opacity-0'}`}
                    style={{ transitionDelay: noMotion ? '0ms' : '550ms' }}
                  />
                  <circle
                    cx="125"
                    cy="10"
                    r="2"
                    fill="#F97316"
                    className={`transition-opacity duration-300 ${isChartActive ? 'opacity-100' : 'opacity-0'}`}
                    style={{ transitionDelay: noMotion ? '0ms' : '700ms' }}
                  />
                  <circle
                    cx="150"
                    cy="4"
                    r="2.5"
                    fill="#F97316"
                    className={`transition-opacity duration-300 ${isChartActive ? 'opacity-100' : 'opacity-0'}`}
                    style={{ transitionDelay: noMotion ? '0ms' : '800ms' }}
                  />
                  <circle
                    cx="180"
                    cy="1"
                    r="2.5"
                    fill="#F97316"
                    className={`transition-opacity duration-300 ${isChartActive ? 'opacity-100' : 'opacity-0'}`}
                    style={{ transitionDelay: noMotion ? '0ms' : '900ms' }}
                  />
                </svg>
              </div>
            </div>

          </div>

        </div>

        {/* 3. CTA Buttons: "Explore Demo" (Secondary) and "Get Started →" (Primary) */}
        <div
          className={`pt-2 flex flex-col items-center space-y-4 transition-all duration-600 ease-out ${
            noMotion || initialMounted
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-2'
          }`}
          style={{ transitionDelay: noMotion ? '0ms' : '200ms' }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
            {/* Secondary CTA: Explore Demo */}
            {onExploreDemo && (
              <button
                type="button"
                onClick={onExploreDemo}
                className="w-full sm:w-48 py-3.5 px-6 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border-2 border-slate-200 hover:border-slate-300 font-bold text-sm sm:text-base tracking-wide shadow-xs hover:shadow-sm transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer order-2 sm:order-1"
              >
                <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>Explore Demo</span>
              </button>
            )}

            {/* Primary CTA: Get Started → */}
            <button
              type="button"
              onClick={onGetStarted}
              className="group w-full sm:w-64 py-3.5 px-8 rounded-2xl bg-gradient-to-r from-[#7000FF] via-[#5A3FFF] to-[#00A3FF] hover:from-[#6200EA] hover:to-[#0091EA] text-white font-bold text-sm sm:text-base tracking-wide shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer order-1 sm:order-2"
            >
              <span>Get Started</span>
              <span className="text-lg transform group-hover:translate-x-1 transition-transform duration-200 ease-out">
                →
              </span>
            </button>
          </div>

          {/* 4 Pagination Progress Dots (Step 1 active) */}
          <div
            className={`flex items-center justify-center space-x-2 pt-1 transition-opacity duration-500 ${
              noMotion || initialMounted ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ transitionDelay: noMotion ? '0ms' : '300ms' }}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
            <span className="w-2 h-2 rounded-full bg-slate-300" />
            <span className="w-2 h-2 rounded-full bg-slate-300" />
            <span className="w-2 h-2 rounded-full bg-slate-300" />
          </div>
        </div>

      </main>

    </div>
  );
}
