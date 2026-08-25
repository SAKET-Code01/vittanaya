import React, { useState } from 'react';

/**
 * 3D/Local Market Map Visualization
 */
function LocalMarketMap({ locationName = 'Indore', category = 'Transport & Logistics' }) {
  const [is3D, setIs3D] = useState(true);
  const [radius, setRadius] = useState('0-15 km');

  return (
    <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-900 shadow-inner flex flex-col justify-between select-none">
      
      {/* 3D Map Aerial Urban Vector Canvas */}
      <svg
        viewBox="0 0 450 300"
        className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 ${
          is3D ? 'scale-105 perspective-origin-center' : 'scale-100'
        }`}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="heatGreen" cx="50%" cy="55%" r="48%">
            <stop offset="0%" stopColor="#EF4444" stopOpacity="0.45" />
            <stop offset="35%" stopColor="#F59E0B" stopOpacity="0.35" />
            <stop offset="70%" stopColor="#10B981" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0F172A" stopOpacity="0.05" />
          </radialGradient>
          <linearGradient id="gridGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#334155" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#1E293B" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* 3D Terrain Base Background with Roads and City Texture */}
        <rect width="450" height="300" fill="url(#gridGrad)" />

        {/* Satellite Road & Street Grid */}
        <g stroke="#475569" strokeWidth="0.8" opacity="0.6">
          <line x1="0" y1="60" x2="450" y2="60" />
          <line x1="0" y1="120" x2="450" y2="120" />
          <line x1="0" y1="180" x2="450" y2="180" />
          <line x1="0" y1="240" x2="450" y2="240" />
          <line x1="60" y1="0" x2="60" y2="300" />
          <line x1="140" y1="0" x2="140" y2="300" />
          <line x1="225" y1="0" x2="225" y2="300" />
          <line x1="310" y1="0" x2="310" y2="300" />
          <line x1="390" y1="0" x2="390" y2="300" />
        </g>

        {/* Highways Arteries */}
        <g stroke="#CBD5E1" strokeWidth="2.5" opacity="0.75" strokeLinecap="round">
          <path d="M 0 100 Q 150 140 225 165 T 450 180" />
          <path d="M 120 0 Q 180 90 225 165 T 280 300" />
        </g>

        {/* Multi-tier Concentric Heat Radar Rings */}
        <circle cx="225" cy="165" r="130" fill="url(#heatGreen)" />
        
        {/* Radar Rings */}
        <circle cx="225" cy="165" r="120" stroke="#10B981" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
        <circle cx="225" cy="165" r="85" stroke="#F59E0B" strokeWidth="1" opacity="0.7" />
        <circle cx="225" cy="165" r="50" stroke="#EF4444" strokeWidth="1.2" opacity="0.85" />

        {/* Labeled Point 1: Industrial Area (Top Left, Purple) */}
        <g transform="translate(105, 75)">
          <rect x="-10" y="-12" width="80" height="20" rx="10" fill="#1E293B" stroke="#A855F7" strokeWidth="1.5" />
          <circle cx="-1" cy="-2" r="3" fill="#A855F7" />
          <text x="32" y="2" textAnchor="middle" fill="#F1F5F9" fontSize="8" fontWeight="bold">Industrial Area</text>
        </g>

        {/* Labeled Point 2: Warehouse Cluster (Top Right, Blue) */}
        <g transform="translate(325, 75)">
          <rect x="-10" y="-12" width="88" height="20" rx="10" fill="#1E293B" stroke="#3B82F6" strokeWidth="1.5" />
          <circle cx="-1" cy="-2" r="3" fill="#3B82F6" />
          <text x="36" y="2" textAnchor="middle" fill="#F1F5F9" fontSize="8" fontWeight="bold">Warehouse Cluster</text>
        </g>

        {/* Labeled Point 3: Transport Hub (Bottom Left, Orange) */}
        <g transform="translate(90, 215)">
          <rect x="-10" y="-12" width="76" height="20" rx="10" fill="#1E293B" stroke="#F97316" strokeWidth="1.5" />
          <circle cx="-1" cy="-2" r="3" fill="#F97316" />
          <text x="30" y="2" textAnchor="middle" fill="#F1F5F9" fontSize="8" fontWeight="bold">Transport Hub</text>
        </g>

        {/* Labeled Point 4: High Demand Zone (Right, Red) */}
        <g transform="translate(315, 190)">
          <rect x="-10" y="-12" width="84" height="20" rx="10" fill="#1E293B" stroke="#EF4444" strokeWidth="1.5" />
          <circle cx="-1" cy="-2" r="3" fill="#EF4444" />
          <text x="34" y="2" textAnchor="middle" fill="#F1F5F9" fontSize="8" fontWeight="bold">High Demand Zone</text>
        </g>

        {/* Labeled Point 5: Commercial Zone (Bottom Center, Blue) */}
        <g transform="translate(210, 245)">
          <rect x="-10" y="-12" width="78" height="18" rx="9" fill="#1E293B" stroke="#0284C7" strokeWidth="1.5" />
          <text x="29" y="1" textAnchor="middle" fill="#F1F5F9" fontSize="7.5" fontWeight="bold">Commercial Zone</text>
        </g>

        {/* Center Primary City Pin (Green) */}
        <g transform="translate(225, 165)">
          {/* Animated ripple */}
          <circle cx="0" cy="0" r="16" fill="#10B981" opacity="0.25" className="animate-ping" />
          {/* Center Pin Body */}
          <path d="M 0 0 C -8 -16, 8 -16, 0 0" fill="#15803D" stroke="#FFFFFF" strokeWidth="1.5" />
          <circle cx="0" cy="-8" r="4" fill="#FFFFFF" />
          {/* City Name Badge */}
          <rect x="-30" y="-28" width="60" height="18" rx="9" fill="#FFFFFF" stroke="#16A34A" strokeWidth="1.5" />
          <text x="0" y="-16" textAnchor="middle" fill="#0F172A" fontSize="9" fontWeight="900">{locationName}</text>
        </g>
      </svg>

      {/* Top Overlays: Radius & 2D/3D Toggle */}
      <div className="relative z-10 p-3 flex items-center justify-between w-full">
        {/* Radius Badge */}
        <div className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200 text-xs font-bold text-slate-800 shadow-xs">
          Radius: {radius}
        </div>

        {/* 2D / 3D Toggle */}
        <div className="flex bg-slate-900/80 backdrop-blur-sm p-0.5 rounded-xl border border-slate-700 text-xs font-bold shadow-xs">
          <button
            type="button"
            onClick={() => setIs3D(false)}
            className={`px-2.5 py-0.5 rounded-lg transition-colors ${
              !is3D ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            2D
          </button>
          <button
            type="button"
            onClick={() => setIs3D(true)}
            className={`px-2.5 py-0.5 rounded-lg transition-colors ${
              is3D ? 'bg-emerald-700 text-white shadow-2xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            3D
          </button>
        </div>
      </div>

      {/* Bottom Map Legend */}
      <div className="relative z-10 px-3 py-1.5 bg-slate-900/90 backdrop-blur-sm border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[10px] font-semibold text-slate-300">
        <div className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Low Opportunity</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>Medium Opportunity</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span>High Opportunity</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-purple-500" />
          <span>Industrial Area</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span>Warehouse</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-orange-500" />
          <span>Transport Hub</span>
        </div>
      </div>

    </div>
  );
}

/**
 * MarketInsightSection Component — Left 2/3 Middle Card with Map & "Why This Opportunity?"
 */
export default function MarketInsightSection({
  currentProfile,
  onNavigate,
  className = '',
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const locationName = (currentProfile?.location || 'Indore, Madhya Pradesh').split(',')[0].trim();
  const locationFull = currentProfile?.location || 'Indore, Madhya Pradesh';
  const businessName = currentProfile?.name || currentProfile?.category || 'Transport & Logistics';

  const reasons = [
    {
      id: 1,
      icon: (
        <svg className="w-4 h-4 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="3" width="15" height="13" />
          <polygon points="16,8 20,8 23,11 23,16 16,16" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      ),
      title: 'High logistics demand',
      desc: 'Growing industrial & e-commerce activities driving transport demand.',
      impact: 'High Impact',
      impactType: 'high',
    },
    {
      id: 2,
      icon: (
        <svg className="w-4 h-4 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.284a2.25 2.25 0 00-2.012 0L2.618 5.721a1.125 1.125 0 00-.618.995v11.85c0 .418.234.8.618.995l4.875 2.437c.318.158.69.158 1.008 0l4.875-2.437a2.25 2.25 0 012.012 0z" />
        </svg>
      ),
      title: 'Excellent connectivity',
      desc: 'Well-connected by road & highways to major cities.',
      impact: 'High Impact',
      impactType: 'high',
    },
    {
      id: 3,
      icon: (
        <svg className="w-4 h-4 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
        </svg>
      ),
      title: 'Industrial growth',
      desc: 'Multiple industrial zones generating continuous freight movement.',
      impact: 'Medium Impact',
      impactType: 'medium',
    },
  ];

  const extraReasons = [
    {
      id: 4,
      icon: (
        <svg className="w-4 h-4 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 3" />
        </svg>
      ),
      title: 'Short turnaround cycles',
      desc: 'Local arterial routes ensure rapid transit and same-day fleet turnaround.',
      impact: 'Medium Impact',
    },
    {
      id: 5,
      icon: (
        <svg className="w-4 h-4 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
      ),
      title: 'Competitive driver availability',
      desc: 'High local availability of licensed commercial operators with low wage inflation.',
      impact: 'High Impact',
    },
  ];

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between ${className}`}>
      
      {/* 1. Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <h2 className="text-base font-extrabold text-slate-900">
            Market Insight
          </h2>
          <div className="flex items-center space-x-1 text-xs text-slate-500 font-medium">
            <svg className="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            <span>{locationFull}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate && onNavigate('feasibility')}
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors flex items-center space-x-1 cursor-pointer"
        >
          <span>View Full Insights</span>
          <span>→</span>
        </button>
      </div>

      {/* 2. Middle Body: Left 3D Map + Right Why This Opportunity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 my-4 items-start">
        
        {/* Left Sub-Column: 3D Market Map (7 cols) */}
        <div className="lg:col-span-7">
          <LocalMarketMap locationName={locationName} category={businessName} />
        </div>

        {/* Right Sub-Column: Why This Opportunity? (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
          
          {/* Sub-Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <h3 className="text-xs font-bold text-slate-800">
                Why This Opportunity?
              </h3>
              <span className="text-slate-400 text-xs cursor-help">ⓘ</span>
            </div>

            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200/60 flex items-center space-x-1">
              <span>Dynamic for Business</span>
              <span>⌄</span>
            </span>
          </div>

          {/* 3 Opportunity Reason Items */}
          <div className="space-y-3">
            {reasons.map((item) => (
              <div key={item.id} className="flex items-start space-x-3">
                {/* Square Icon Box */}
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {item.icon}
                </div>

                {/* Details & Badge */}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 leading-tight">
                      {item.title}
                    </h4>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200/50">
                      {item.impact}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}

            {/* Extra Reasons when expanded */}
            {isExpanded && extraReasons.map((item) => (
              <div key={item.id} className="flex items-start space-x-3 pt-1 animate-fadeIn">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 leading-tight">{item.title}</h4>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                      {item.impact}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Expand Toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="text-xs font-bold text-slate-800 hover:text-emerald-700 transition-colors flex items-center space-x-1 pt-1 cursor-pointer self-start"
          >
            <span>{isExpanded ? '– Show less' : '+ 3 more reasons'}</span>
            <span className="text-xs">{isExpanded ? '⌃' : '⌄'}</span>
          </button>

        </div>

      </div>

    </div>
  );
}
