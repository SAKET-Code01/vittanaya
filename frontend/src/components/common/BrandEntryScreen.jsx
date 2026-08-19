import React, { useEffect, useState } from 'react';

/**
 * BrandEntryScreen Component (3D Glassmorphic Version)
 * A premium entry animation (1.5-1.8s) showcasing VITTANAYA's dimensional glass surfaces,
 * central 3D logo depth, and connecting financial signal particles.
 */
export default function BrandEntryScreen({ onComplete }) {
  const [stage, setStage] = useState(1); // 1: Glass base forms, 2: Financial particles connect, 3: Financial Intelligence, 4: Reveal
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    // Respect reduced-motion preferences
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onComplete?.();
      return;
    }

    const timer1 = setTimeout(() => setStage(2), 350);
    const timer2 = setTimeout(() => setStage(3), 850);
    const timer3 = setTimeout(() => {
      setStage(4);
      setFadingOut(true);
    }, 1450);
    const timer4 = setTimeout(() => onComplete?.(), 1800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  return (
    <div
      onClick={() => onComplete?.()}
      className={`fixed inset-0 z-50 bg-[#070A10] flex flex-col items-center justify-center cursor-pointer select-none transition-opacity duration-400 ease-out overflow-hidden ${
        fadingOut ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100 scale-100'
      }`}
    >
      {/* 3D Dimensional Background Lighting */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/[0.07] blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-amber-500/[0.06] blur-[150px] pointer-events-none" />

      {/* Main Glass Assembly Container */}
      <div className="relative flex flex-col items-center max-w-sm px-6 text-center space-y-6 z-10">
        
        {/* Animated Central 3D Glass Emblem */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          {/* Glass Outer Shield */}
          <div
            className={`absolute inset-0 rounded-3xl border border-amber-500/25 bg-amber-500/[0.03] backdrop-blur-xl shadow-2xl transition-all duration-700 ${
              stage >= 2 ? 'scale-105 opacity-100 ring-1 ring-amber-400/30' : 'scale-75 opacity-0'
            }`}
          />

          {/* Orbiting Financial Data Particles */}
          <div
            className={`absolute -top-2 -left-4 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-bold shadow-md backdrop-blur-md transition-all duration-500 ${
              stage >= 2 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-3 scale-90'
            }`}
          >
            +₹ Inflow
          </div>

          <div
            className={`absolute -bottom-2 -right-4 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono text-[10px] font-bold shadow-md backdrop-blur-md transition-all duration-500 delay-100 ${
              stage >= 2 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-3 scale-90'
            }`}
          >
            -₹ Outflow
          </div>

          <div
            className={`absolute top-1/2 -right-7 -translate-y-1/2 px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono text-[10px] font-bold shadow-md backdrop-blur-md transition-all duration-500 delay-200 ${
              stage >= 2 ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-3 scale-90'
            }`}
          >
            Runway
          </div>

          {/* Central 3D Logo Cube */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-2xl shadow-amber-500/40 text-slate-950 font-black text-3xl tracking-wider transform transition-transform duration-500 hover:scale-105 border border-amber-300/40">
            V
          </div>
        </div>

        {/* Brand Typography */}
        <div className="space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <h1 className="text-2xl font-black tracking-wider text-white drop-shadow-md">
              VITTANAYA
            </h1>
            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-xs">
              S42
            </span>
          </div>

          <p
            className={`text-xs font-medium text-slate-300 tracking-wide transition-all duration-500 ${
              stage >= 2 ? 'opacity-100' : 'opacity-0 translate-y-1'
            }`}
          >
            Consent-Based MSME Cash-Flow Digital Twin
          </p>
        </div>

        {/* Financial Intelligence Activation Tag */}
        <div
          className={`flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/80 text-[11px] text-slate-200 font-medium shadow-lg backdrop-blur-md transition-all duration-500 ${
            stage >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
          <span className="font-semibold text-amber-400">Financial Intelligence</span>
        </div>

        {/* Skip instruction */}
        <p className="text-[10px] text-slate-400 pt-2">
          Click anywhere to skip
        </p>
      </div>
    </div>
  );
}
