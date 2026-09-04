import React, { useState } from 'react';
import LocalMarketMap from './LocalMarketMap';


/**
 * MarketInsightSection Component — Executive Dashboard Card with Live 2D/3D Map & Local Opportunity Drivers
 */
export default function MarketInsightSection({
  currentProfile,
  onNavigate,
  className = '',
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [marketData, setMarketData] = useState(null);

  // Connect current VITTANAYA profile location & identity
  const locationName = (
    currentProfile?.village ||
    (currentProfile?.location ? currentProfile.location.split(',')[0] : 'Kuarmunda')
  ).trim();

  const districtName = currentProfile?.location_district || currentProfile?.district || 'Sundargarh';

  const locationFull =
    currentProfile?.location ||
    [currentProfile?.village, currentProfile?.block, districtName, currentProfile?.state || 'Odisha']
      .filter(Boolean)
      .join(', ') ||
    'Kuarmunda, Kuarmunda Block, Sundargarh, Odisha';

  const categoryName = currentProfile?.category || currentProfile?.business_type || 'Transport & Logistics';
  const businessName = currentProfile?.businessName || currentProfile?.name || 'Rural Micro-Enterprise';

  // Deterministic opportunity reasons derived from live spatial market data
  const pois = marketData?.pois || [];
  const topPoi = pois[0];
  const secondPoi = pois[1];

  const reasons = [
    {
      id: 1,
      icon: (
        <svg className="w-4 h-4 text-blue-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      title: 'Catchment Demand Trajectory',
      desc: marketData?.opportunity_summary || `Surging demand signals for verified ${categoryName} in ${districtName} catchment.`,
      impact: 'High Impact',
    },
    {
      id: 2,
      icon: (
        <svg className="w-4 h-4 text-blue-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      ),
      title: 'Commercial Corridor Reach',
      desc: marketData?.market_reach_description || `Direct trade routes and logistical connectivity in ${districtName}.`,
      impact: 'Favorable',
    },
    {
      id: 3,
      icon: (
        <svg className="w-4 h-4 text-blue-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87" />
          <path d="M16 3.13a4 4 0 010 7.75" />
        </svg>
      ),
      title: topPoi ? topPoi.name : 'Local Commercial Synergy',
      desc: topPoi ? topPoi.details : `Active local commercial buyers provide recurring trade volume for ${categoryName}.`,
      impact: topPoi?.impact || 'High Impact',
    },
  ];

  const extraReasons = [
    {
      id: 4,
      icon: (
        <svg className="w-4 h-4 text-blue-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
          <path d="M13 16V6a1 1 0 00-1-1H4" />
        </svg>
      ),
      title: secondPoi ? secondPoi.name : 'Supply Chain Efficiency',
      desc: secondPoi ? secondPoi.details : `Local supply chain linkages minimize operational turnaround cycles.`,
      impact: secondPoi?.impact || 'Medium Impact',
    },
    {
      id: 5,
      icon: (
        <svg className="w-4 h-4 text-blue-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
      ),
      title: 'Institutional Planning Alignment',
      desc: `Sector alignment with ${marketData?.source_authority || 'district MSME development benchmarks'}.`,
      impact: 'Favorable',
    },
  ];

  return (
    <div className={`bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6 flex flex-col justify-between ${className}`}>

      {/* 1. Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-black text-slate-900">
              Hyper-Local Market Insight
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-extrabold border border-blue-200/70">
              Live Map
            </span>
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-semibold mt-0.5">
            <svg className="w-3.5 h-3.5 text-blue-700" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            <span className="truncate max-w-[280px] sm:max-w-[400px]">{locationFull}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate && onNavigate('feasibility')}
          className="px-3.5 py-1.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs font-extrabold text-slate-800 hover:bg-blue-50/30 transition-colors cursor-pointer flex items-center space-x-1"
        >
          <span>Feasibility Report</span>
          <span>→</span>
        </button>
      </div>

      {/* 2. Middle Body: Left Live 2D/3D Map + Right Opportunity Drivers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-4 items-start">

        {/* Left Sub-Column: Live 2D/3D Market Map (7 cols) */}
        <div className="lg:col-span-7">
          <LocalMarketMap
            locationName={locationName}
            districtName={districtName}
            category={categoryName}
            locationFull={locationFull}
            currentProfile={currentProfile}
            onMapDataLoaded={setMarketData}
          />
        </div>

        {/* Right Sub-Column: Why This Opportunity? (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">

          {/* Sub-Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900">
              Why This Opportunity?
            </h3>

            {marketData?.is_local_verified ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-[10px] border border-emerald-200/70 flex items-center space-x-1" title={marketData?.source_authority || 'Verified Local Data'}>
                <span>Verified Local Data</span>
                <span>✓</span>
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-extrabold text-[10px] border border-blue-200/70 flex items-center space-x-1" title={marketData?.source_authority || 'District Benchmark Estimate'}>
                <span>District Benchmark</span>
              </span>
            )}
          </div>

          {/* Opportunity Reason Items */}
          <div className="space-y-3.5">
            {reasons.map((item) => (
              <div key={item.id} className="flex items-start space-x-3 p-2.5 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-blue-50/30 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {item.icon}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 leading-tight">
                      {item.title}
                    </h4>
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-extrabold text-[10px]">
                      {item.impact}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}

            {isExpanded && extraReasons.map((item) => (
              <div key={item.id} className="flex items-start space-x-3 p-2.5 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-blue-50/30 transition-colors animate-fadeIn">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 leading-tight">{item.title}</h4>
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-extrabold text-[10px]">
                      {item.impact}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1">
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
            className="text-xs font-extrabold text-blue-700 hover:text-blue-900 transition-colors flex items-center space-x-1 pt-1 cursor-pointer self-start"
          >
            <span>{isExpanded ? '– Show less' : '+ 2 more opportunity signals'}</span>
            <span className="text-xs">{isExpanded ? '⌃' : '⌄'}</span>
          </button>

        </div>

      </div>

    </div>
  );
}
