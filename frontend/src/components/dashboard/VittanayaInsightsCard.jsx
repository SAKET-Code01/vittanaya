import React from 'react';

/**
 * VittanayaInsightsCard Component — 100% Faithful to Reference
 */
export default function VittanayaInsightsCard({
  currentProfile,
  onNavigate,
  className = '',
}) {
  const businessName = currentProfile?.name || currentProfile?.category || 'Transport & Logistics';

  const insights = [
    {
      id: 'opportunity',
      title: 'Strong Opportunity',
      desc: `Demand outlook is positive for ${businessName} in your selected area.`,
      iconBg: 'bg-emerald-100 text-emerald-700',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="3" fill="currentColor" />
        </svg>
      ),
      route: 'feasibility',
    },
    {
      id: 'financing',
      title: 'Financing Gap',
      desc: 'You need additional ₹6,50,000 to start this business.',
      iconBg: 'bg-purple-100 text-purple-700',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="6" cy="6" r="3" />
          <circle cx="18" cy="18" r="3" />
          <path d="M8.5 8.5L15.5 15.5" />
        </svg>
      ),
      route: 'financial-plan',
    },
    {
      id: 'scheme',
      title: 'Scheme Match',
      desc: '3 financing options match your profile. Check eligible schemes now.',
      iconBg: 'bg-amber-100 text-amber-800',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6" />
        </svg>
      ),
      route: 'scheme',
    },
    {
      id: 'risk',
      title: 'Risk Advisory',
      desc: 'Fuel price volatility may impact profitability. Consider risk mitigation.',
      iconBg: 'bg-sky-100 text-sky-700',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      route: 'feasibility',
    },
  ];

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between ${className}`}>
      
      {/* 1. Header */}
      <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
        <span className="text-emerald-600 text-sm font-bold">✦</span>
        <h2 className="text-base font-extrabold text-slate-900">
          Vittanaya Insights
        </h2>
      </div>

      {/* 2. 4 Insight Rows */}
      <div className="divide-y divide-slate-100 my-2 flex-1">
        {insights.map((item) => (
          <div
            key={item.id}
            onClick={() => onNavigate && onNavigate(item.route)}
            className="py-3.5 flex items-start space-x-3.5 cursor-pointer group hover:bg-slate-50/80 -mx-2 px-2 rounded-xl transition-colors"
          >
            {/* Round Icon */}
            <div className={`w-8 h-8 rounded-full ${item.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs`}>
              {item.icon}
            </div>

            {/* Details */}
            <div className="flex-1 space-y-0.5">
              <h3 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                {item.title}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium leading-snug">
                {item.desc}
              </p>
            </div>

            {/* Right Arrow */}
            <div className="text-slate-400 group-hover:text-slate-700 font-bold text-xs pt-1 transition-colors">
              ›
            </div>
          </div>
        ))}
      </div>

      {/* 3. Bottom Link */}
      <div className="pt-2 border-t border-slate-100 flex justify-end">
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('feasibility')}
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors flex items-center space-x-1 cursor-pointer"
        >
          <span>View Full Advisory Report</span>
          <span>→</span>
        </button>
      </div>

    </div>
  );
}
