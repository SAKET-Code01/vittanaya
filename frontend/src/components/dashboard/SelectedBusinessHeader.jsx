import React from 'react';

/**
 * SelectedBusinessHeader Component — 100% Faithful to Reference
 */
export default function SelectedBusinessHeader({
  currentProfile,
  onOpenChangeBusiness,
  className = '',
}) {
  const businessName = currentProfile?.name || currentProfile?.category || 'Transport & Logistics';
  const locationStr = currentProfile?.location || 'Indore, Madhya Pradesh';
  const investmentRange = currentProfile?.investmentRange || '₹8L – ₹45L';
  const assessmentDate = currentProfile?.assessmentDate || '17 May 2025';

  return (
    <div className={`w-full flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 ${className}`}>
      
      {/* 1. Left: Business Avatar, Name, Location & Investment Range */}
      <div className="flex items-center space-x-4">
        
        {/* Circular Business Graphic Avatar */}
        <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full overflow-hidden border-2 border-white shadow-md flex-shrink-0 bg-slate-100 flex items-center justify-center relative">
          <svg viewBox="0 0 80 80" className="w-full h-full">
            {/* Sky background */}
            <rect width="80" height="80" fill="#38BDF8" />
            {/* Mountain backdrop */}
            <polygon points="0,50 25,25 50,50 80,30 80,80 0,80" fill="#166534" />
            <polygon points="10,50 35,32 60,50 80,42 80,80 10,80" fill="#15803D" />
            {/* Road */}
            <polygon points="30,80 50,80 43,45 37,45" fill="#334155" />
            <line x1="40" y1="46" x2="40" y2="78" stroke="#FDE047" strokeWidth="1.5" strokeDasharray="3 3" />
            {/* Truck / Transport Vehicle */}
            <rect x="24" y="48" width="16" height="14" rx="2" fill="#FFFFFF" />
            <rect x="18" y="53" width="7" height="9" rx="1.5" fill="#0284C7" />
            <circle cx="21" cy="63" r="2.5" fill="#0F172A" />
            <circle cx="36" cy="63" r="2.5" fill="#0F172A" />
          </svg>
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
              className="px-2.5 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-colors cursor-pointer border border-emerald-200/60"
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
