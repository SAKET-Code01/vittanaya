import React from 'react';

/**
 * Inline SVG Icon System
 */
function HeroIcon({ name, size = 16, className = '' }) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className,
    'aria-hidden': true,
  };

  switch (name) {
    case 'award':
      return (
        <svg {...props}>
          <circle cx="12" cy="8" r="7" />
          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
        </svg>
      );
    case 'map-pin':
      return (
        <svg {...props}>
          <path d="M20 10c0 5.5-8 11-8 11S4 15.5 4 10a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );
    case 'arrow-right':
      return (
        <svg {...props}>
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      );
    case 'spark':
      return (
        <svg {...props}>
          <path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z" />
          <path d="m19 16 .5 2.5L22 19l-2.5.5L19 22l-.5-2.5L16 19l2.5-.5L19 16Z" />
        </svg>
      );
    default:
      return null;
  }
}

/**
 * DashboardHero Component
 * 
 * Level 1 Hero Section for the New Business Idea stage.
 * Uses a deep navy / cobalt atmospheric design system with desktop-only
 * hover particle sparks and static mobile fallback.
 */
export default function DashboardHero({
  profile = {},
  subsidyPct = null,
  ownCapital = null,
  feasibilityScore = null,
  feasibilityStatus = null,
  isLoading = false,
  onNavigate,
}) {
  const businessName = profile.businessName || profile.name || 'New Proposed Venture';
  const category = profile.category || profile.type || 'Micro Enterprise';
  const industry = profile.industry || profile.description || 'Proposed rural business activity';
  const location = profile.location || ([profile.village, profile.district, profile.state].filter(Boolean).join(', ') || 'Odisha, India');
  const socialCategory = profile.socialCategory || profile.social_category || 'General';
  const areaType = profile.areaType || profile.area_type || 'Rural';

  const safeOwnCapital = ownCapital != null ? Number(ownCapital) : (profile.own_capital != null ? Number(profile.own_capital) : null);

  const handleAction = (destination) => {
    if (typeof onNavigate === 'function') {
      onNavigate(destination);
    }
  };

  const statusBadgeStyle = (() => {
    if (feasibilityScore == null) return 'bg-slate-500/20 text-slate-300 border-slate-400/30';
    if (feasibilityScore >= 75) return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30';
    if (feasibilityScore >= 60) return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
    if (feasibilityScore >= 45) return 'bg-amber-500/20 text-amber-300 border-amber-400/30';
    return 'bg-rose-500/20 text-rose-300 border-rose-400/30';
  })();

  const computedStatus = feasibilityStatus || (
    feasibilityScore != null
      ? (feasibilityScore >= 75 ? 'HIGH POTENTIAL' : feasibilityScore >= 60 ? 'GOOD POTENTIAL' : feasibilityScore >= 45 ? 'MODERATE POTENTIAL' : 'HIGH RISK / EARLY')
      : null
  );

  return (
    <section className="hero-spark-card relative overflow-hidden rounded-3xl border border-blue-500/25 bg-gradient-to-br from-[#060D1D] via-[#0B1736] to-[#0A1128] p-6 sm:p-8 lg:p-10 shadow-2xl backdrop-blur-xl transition-all duration-300">
      
      {/* 1. Atmospheric Ambient Glow */}
      <div className="hero-glow-pulse absolute -top-16 -right-16 w-96 h-96 rounded-full bg-blue-600/20 blur-[100px] pointer-events-none transition-all duration-700" />
      <div className="absolute -bottom-20 left-1/4 w-80 h-80 rounded-full bg-indigo-500/15 blur-[90px] pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-64 h-64 rounded-full bg-sky-500/10 blur-[80px] pointer-events-none" />

      {/* 2. Desktop-Only Subtle Particle Sparks (Hidden & Static on Mobile/Touch) */}
      <div className="hero-spark-particle hero-spark-p1 absolute top-12 right-1/4 w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_10px_#38BDF8]" />
      <div className="hero-spark-particle hero-spark-p2 absolute top-28 right-16 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_#60A5FA]" />
      <div className="hero-spark-particle hero-spark-p3 absolute bottom-16 right-1/3 w-2.5 h-2.5 rounded-full bg-sky-200 shadow-[0_0_12px_#BAE6FD]" />
      <div className="hero-spark-particle hero-spark-p4 absolute bottom-24 left-1/3 w-1.5 h-1.5 rounded-full bg-blue-300 shadow-[0_0_8px_#93C5FD]" />
      <div className="hero-spark-particle hero-spark-p5 absolute top-20 left-1/2 w-2 h-2 rounded-full bg-indigo-300 shadow-[0_0_10px_#A5B4FC]" />

      {/* 3. Hero Content Layout */}
      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        
        {/* Left Sub-Column: Business & Stage Identity */}
        <div className="space-y-4 max-w-3xl">
          
          {/* Stage & Classification Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3.5 py-1 rounded-full text-[11px] font-extrabold tracking-wider uppercase bg-blue-600 text-white shadow-sm shadow-blue-500/30 flex items-center gap-1.5">
              <HeroIcon name="spark" size={12} />
              <span>Stage: New Business Idea</span>
            </span>
            <span className="px-3.5 py-1 rounded-full text-[11px] font-bold bg-white/10 backdrop-blur-md text-blue-100 border border-white/15">
              {socialCategory} Beneficiary • {areaType} Area
            </span>
          </div>

          {/* Business Name (Strongest Visual Element) */}
          <div className="space-y-1.5 pt-1">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1] drop-shadow-sm">
              {businessName}
            </h1>

            {/* Category & Location */}
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-300 font-semibold pt-1">
              <span className="flex items-center gap-1.5 text-blue-300">
                <HeroIcon name="award" size={15} />
                <span>{category}</span>
              </span>
              <span className="text-slate-500">•</span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <HeroIcon name="map-pin" size={15} className="text-blue-400" />
                <span>{location}</span>
              </span>
            </div>
          </div>

          {/* Contextual Summary */}
          <p className="text-xs sm:text-sm text-slate-300/90 font-normal leading-relaxed max-w-2xl pt-1">
            Authoritative feasibility assessment calibrated for <strong className="text-white font-semibold">{industry}</strong>.
            {safeOwnCapital != null && safeOwnCapital > 0 ? (
              <> Available margin capital of <strong className="text-emerald-400 font-bold">₹{safeOwnCapital.toLocaleString('en-IN')}</strong></>
            ) : (
              <> Margin capital awaiting verification</>
            )}
            {subsidyPct != null && subsidyPct > 0 ? (
              <> qualifies for up to <strong className="text-blue-300 font-bold">{subsidyPct}% government subsidy</strong> under verified schemes.</>
            ) : (
              <> with subsidy matching evaluated across central & state frameworks.</>
            )}
          </p>
        </div>

        {/* Right Sub-Column: Viability Index Box / Score Dial */}
        <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/[0.08] backdrop-blur-xl border border-white/15 shadow-xl gap-4 shrink-0 w-full sm:w-64 lg:w-72">
          <div className="text-center space-y-1 w-full">
            <span className="text-[10px] font-black text-blue-200/90 uppercase tracking-widest block">
              Feasibility Score
            </span>
            
            {isLoading ? (
              <div className="py-2 space-y-2 animate-pulse">
                <div className="h-10 w-24 bg-white/20 rounded-lg mx-auto" />
                <div className="h-4 w-28 bg-white/15 rounded-md mx-auto" />
              </div>
            ) : feasibilityScore != null ? (
              <>
                <div className="flex items-baseline justify-center gap-1 mt-1">
                  <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                    {Math.round(feasibilityScore)}
                  </span>
                  <span className="text-base font-bold text-blue-300/70">/100</span>
                </div>
                <div className="pt-1">
                  <span className={`inline-block px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${statusBadgeStyle}`}>
                    {computedStatus}
                  </span>
                </div>
              </>
            ) : (
              <div className="py-2">
                <span className="text-lg sm:text-xl font-extrabold text-slate-300 block">
                  Not available
                </span>
                <span className="text-[10px] font-medium text-slate-400 block mt-1">
                  Insufficient data
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleAction('feasibility')}
            className="w-full px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-lg shadow-blue-600/30 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <span>Feasibility Report</span>
            <HeroIcon name="arrow-right" size={14} />
          </button>
        </div>

      </div>
    </section>
  );
}
