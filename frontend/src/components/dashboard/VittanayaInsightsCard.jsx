import React from 'react';

/**
 * VittanayaInsightsCard Component
 * 
 * Level 3 Contextual Intelligence:
 * Clean, structured cards highlighting opportunity signals, capital gap, eligible schemes, and advisory recommendations.
 */
export default function VittanayaInsightsCard({
  currentProfile,
  onNavigate,
  className = '',
}) {
  const businessName = currentProfile?.name || currentProfile?.businessName || currentProfile?.category || 'Transport & Logistics';

  const insights = [
    {
      id: 'opportunity',
      title: 'Strong Opportunity',
      desc: `Demand outlook is positive for ${businessName} in your selected catchment area.`,
      iconBg: 'bg-blue-50 text-blue-600 border border-blue-100/80',
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
      title: 'Capital Leverage',
      desc: 'Margin money structure enables up to 6.6x leverage via central credit frameworks.',
      iconBg: 'bg-indigo-50 text-indigo-600 border border-indigo-100/80',
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
      desc: '3 verified credit-linked schemes match your beneficiary and area profile.',
      iconBg: 'bg-sky-50 text-sky-600 border border-sky-100/80',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6" />
        </svg>
      ),
      route: 'scheme',
    },
    {
      id: 'risk',
      title: 'Statutory Advisory',
      desc: 'Prioritize Udyam Aadhaar and local trade clearance prior to loan filing.',
      iconBg: 'bg-slate-100 text-slate-700 border border-slate-200/80',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      route: 'action-plan',
    },
  ];

  return (
    <div className={`bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-7 flex flex-col justify-between space-y-4 ${className}`}>

      {/* 1. Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <span className="text-sm font-black">✦</span>
          </div>
          <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-slate-900">
            Vittanaya Insights
          </h2>
        </div>
        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100/80">
          Live AI
        </span>
      </div>

      {/* 2. 4 Insight Rows */}
      <div className="divide-y divide-slate-100 my-1 flex-1">
        {insights.map((item) => (
          <div
            key={item.id}
            onClick={() => onNavigate && onNavigate(item.route)}
            className="py-3 flex items-start space-x-3 cursor-pointer group hover:bg-slate-50 -mx-2 px-2 rounded-xl transition-colors"
          >
            {/* Round Icon */}
            <div className={`w-8 h-8 rounded-xl ${item.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs`}>
              {item.icon}
            </div>

            {/* Details */}
            <div className="flex-1 space-y-0.5">
              <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                {item.title}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                {item.desc}
              </p>
            </div>

            {/* Right Arrow */}
            <div className="text-slate-400 group-hover:text-blue-600 font-bold text-xs pt-1 transition-colors">
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
          className="text-xs font-bold text-blue-700 hover:text-blue-800 transition-colors flex items-center space-x-1 cursor-pointer"
        >
          <span>View Full Advisory Report</span>
          <span>→</span>
        </button>
      </div>

    </div>
  );
}
