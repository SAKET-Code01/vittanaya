import React from 'react';

/**
 * SelectedBusinessHeader Component — 100% Faithful to Reference
 */
export default function SelectedBusinessHeader({
  currentProfile,
  onOpenChangeBusiness,
  className = '',
}) {
  const businessName = currentProfile?.name || currentProfile?.businessName || 'Selected Business';
  const locationStr = currentProfile?.location || ([currentProfile?.city || currentProfile?.locality || currentProfile?.village, currentProfile?.district, currentProfile?.state].filter(Boolean).join(', ') || 'Location not specified');
  const investmentRange = currentProfile?.project_cost ? `₹${(Number(currentProfile.project_cost) / 100000).toFixed(1)} Lakhs` : (currentProfile?.investmentRange || 'Cost not configured');
  const assessmentDate = currentProfile?.assessmentDate || (currentProfile?.created_at ? new Date(currentProfile.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }));

  return (
    <div className={`w-full flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 ${className}`}>
      
      {/* 1. Left: Business Avatar, Name, Location & Investment Range */}
      <div className="flex items-center space-x-4">
        
        {/* Circular Business Graphic Avatar */}
        <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-xs flex-shrink-0 bg-gradient-to-br from-blue-700 to-slate-900 flex items-center justify-center relative text-white font-black text-xl">
          {businessName.slice(0, 2).toUpperCase()}
        </div>

        {/* Info Column */}
        <div className="space-y-0.5">
          <p className="text-xs font-semibold text-slate-500">
            Selected Business
          </p>

          <div className="flex items-center space-x-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {businessName}
            </h1>
            <button
              type="button"
              onClick={onOpenChangeBusiness}
              className="px-2.5 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors cursor-pointer border border-blue-200/60"
            >
              Change
            </button>
          </div>

          <div className="flex items-center space-x-1 text-xs text-slate-600 font-medium">
            <svg className="w-3.5 h-3.5 text-slate-500" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            <span>{locationStr}</span>
          </div>

          <div className="flex items-center space-x-3 text-xs pt-0.5">
            <span className="font-semibold text-slate-500">Investment Range</span>
            <span className="font-extrabold text-slate-900">{investmentRange}</span>
          </div>
        </div>

      </div>

      {/* 2. Right: Assessment Date Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs px-4 py-3 flex items-center space-x-3.5 self-start md:self-auto min-w-[190px]">
        <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="3" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="8" y1="2" x2="8" y2="5" />
            <line x1="16" y1="2" x2="16" y2="5" />
            <circle cx="8" cy="13" r="1" fill="currentColor" />
            <circle cx="12" cy="13" r="1" fill="currentColor" />
            <circle cx="16" cy="13" r="1" fill="currentColor" />
            <circle cx="8" cy="17" r="1" fill="currentColor" />
            <circle cx="12" cy="17" r="1" fill="currentColor" />
          </svg>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-500">
            Assessment Date
          </p>
          <p className="text-sm font-extrabold text-slate-900 leading-tight">
            {assessmentDate}
          </p>
        </div>
      </div>

    </div>
  );
}
