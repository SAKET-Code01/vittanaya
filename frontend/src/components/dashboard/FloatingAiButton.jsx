import React, { useState } from 'react';

/**
 * FloatingAiButton Component — Circular Green Floating Button (~50px up from bottom-right)
 */
export default function FloatingAiButton({ onClick, className = '' }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 cursor-pointer select-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      title="Ask VITTANAYA AI Business Advisor"
    >
      <div className="relative vt-float">
        {/* Main Circular Glass Emerald Button */}
        <button
          type="button"
          className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[#15803D]/95 to-[#22C55E]/95 text-white shadow-[0_12px_32px_rgba(16,185,129,0.35)] hover:shadow-[0_16px_42px_rgba(16,185,129,0.5)] hover:scale-105 active:scale-95 transition-all duration-200 border border-white/70 backdrop-blur-md flex items-center justify-center cursor-pointer ring-1 ring-emerald-300/40"
          aria-label="Ask VITTANAYA AI"
        >
          {/* Cute Robot / AI Mascot Vector */}
          <svg className="w-8 h-8" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Robot Head */}
            <rect x="10" y="14" width="28" height="22" rx="11" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
            {/* Dark Visor */}
            <rect x="14" y="19" width="20" height="11" rx="5.5" fill="#0F172A" />
            {/* Glowing Mint Eyes */}
            <circle cx="19" cy="24.5" r="2.5" fill="#22C55E" />
            <circle cx="29" cy="24.5" r="2.5" fill="#22C55E" />
            {/* Antenna */}
            <line x1="24" y1="8" x2="24" y2="14" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="24" cy="7" r="2.5" fill="#FDE047" />
            {/* Ears */}
            <rect x="6" y="21" width="4" height="8" rx="2" fill="#FFFFFF" />
            <rect x="38" y="21" width="4" height="8" rx="2" fill="#FFFFFF" />
          </svg>
        </button>

        {/* Small Red Notification Badge Dot */}
        <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-[#EF4444] border-2 border-white shadow-xs animate-pulse" />

        {/* Hover Tooltip */}
        {isHovered && (
          <div className="absolute right-16 top-2 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold whitespace-nowrap shadow-lg animate-fadeInScale pointer-events-none">
            Ask VITTANAYA AI
          </div>
        )}
      </div>
    </div>
  );
}
