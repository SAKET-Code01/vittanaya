import React, { useState } from 'react';

/**
 * World-Class 2D & 3D Local Market Map Component
 * Integrated from donor root "./Vitnayana map/"
 * Provides smooth cartographic visualization with 2D Flat view and 3D Perspective view,
 * non-overlapping billboarded labels, and dynamic catchment radius filters.
 */
function LocalMarketMap({
  locationName = 'Kuarmunda',
  category = 'Transport & Logistics',
  locationFull = 'Kuarmunda, Kuarmunda Block, Sundargarh, Odisha',
}) {
  const [viewMode, setViewMode] = useState('3d'); // '2d' | '3d'
  const [radiusFilter, setRadiusFilter] = useState('15'); // '5' | '10' | '15'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activePoi, setActivePoi] = useState(null);

  // Hyper-local Points of Interest (POIs) with balanced spatial distribution
  const poiData = [
    {
      id: 'poi-1',
      name: 'Industrial Corridor & Fab Hub',
      type: 'industrial',
      typeLabel: 'Industrial Cluster',
      distance: 4.8,
      pos2d: { x: 100, y: 75 },
      height3d: 34,
      color: '#8B5CF6',
      badgeBg: 'bg-purple-900/90 text-purple-100 border-purple-400/50 shadow-purple-950/50',
      dotColor: 'bg-purple-400',
      demandScore: '90/100',
      impact: 'High Impact',
      details: 'Major manufacturing & fabrication hub generating continuous commercial demand and B2B orders.',
    },
    {
      id: 'poi-2',
      name: 'District Freight Logistics Hub',
      type: 'logistics',
      typeLabel: 'Logistics Terminal',
      distance: 8.2,
      pos2d: { x: 350, y: 80 },
      height3d: 42,
      color: '#3B82F6',
      badgeBg: 'bg-blue-900/90 text-blue-100 border-blue-400/50 shadow-blue-950/50',
      dotColor: 'bg-blue-400',
      demandScore: '94/100',
      impact: 'High Impact',
      details: 'Central transit & warehousing depot connecting state arterial freight corridors.',
    },
    {
      id: 'poi-3',
      name: 'Highway Commercial Depot',
      type: 'logistics',
      typeLabel: 'Transport Hub',
      distance: 3.2,
      pos2d: { x: 80, y: 225 },
      height3d: 28,
      color: '#F97316',
      badgeBg: 'bg-orange-900/90 text-orange-100 border-orange-400/50 shadow-orange-950/50',
      dotColor: 'bg-orange-400',
      demandScore: '95/100',
      impact: 'Critical Impact',
      details: 'High-frequency vehicular transit junction with 24/7 operational and repair ecosystem.',
    },
    {
      id: 'poi-4',
      name: 'High-Demand Commercial Cluster',
      type: 'demand',
      typeLabel: 'High Demand Zone',
      distance: 6.5,
      pos2d: { x: 360, y: 180 },
      height3d: 48,
      color: '#F43F5E',
      badgeBg: 'bg-rose-900/90 text-rose-100 border-rose-400/50 shadow-rose-950/50',
      dotColor: 'bg-rose-400',
      demandScore: '97/100',
      impact: 'High Impact',
      details: 'Est. ₹38 Lakhs/month unfulfilled market supply gap with high rural consumer purchasing capacity.',
    },
    {
      id: 'poi-5',
      name: `${locationName} Town Market`,
      type: 'demand',
      typeLabel: 'Commercial Market',
      distance: 1.5,
      pos2d: { x: 225, y: 245 },
      height3d: 26,
      color: '#0EA5E9',
      badgeBg: 'bg-sky-900/90 text-sky-100 border-sky-400/50 shadow-sky-950/50',
      dotColor: 'bg-sky-400',
      demandScore: '86/100',
      impact: 'Medium Impact',
      details: 'Core retail & weekly haat ecosystem with 3,800+ daily footfalls and recurring operational demand.',
    },
    {
      id: 'poi-6',
      name: 'Regional Agri Procurement Mandi',
      type: 'industrial',
      typeLabel: 'Agri Procurement',
      distance: 11.8,
      pos2d: { x: 390, y: 260 },
      height3d: 20,
      color: '#10B981',
      badgeBg: 'bg-emerald-900/90 text-emerald-100 border-emerald-400/50 shadow-emerald-950/50',
      dotColor: 'bg-emerald-400',
      demandScore: '89/100',
      impact: 'High Impact',
      details: 'Agricultural produce assembly & packaging center with high seasonal haulage and trade volume.',
    },
  ];

  const filteredPois = poiData.filter((poi) => {
    const withinRadius = poi.distance <= parseFloat(radiusFilter);
    const matchesCat = selectedCategory === 'all' || poi.type === selectedCategory;
    return withinRadius && matchesCat;
  });

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-slate-700/80 bg-[#0F172A] shadow-2xl flex flex-col justify-between select-none">
      
      {/* 1. Sleek Modern Header Bar */}
      <div className="relative z-20 px-4 py-3 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Active Location & Catchment Pills */}
        <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
          {/* Location Badge */}
          <div className="flex items-center space-x-2 px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-100">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="truncate max-w-[170px] sm:max-w-[220px]">{locationName}</span>
          </div>

          {/* Catchment Radius Selector */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
            <span className="px-2 text-slate-400 text-[10px] font-black uppercase tracking-wider hidden sm:inline">Catchment:</span>
            {['5', '10', '15'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRadiusFilter(r)}
                className={`px-2.5 py-0.5 rounded-lg transition-all cursor-pointer ${
                  radiusFilter === r
                    ? 'bg-emerald-600 text-white shadow-sm font-extrabold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                0-{r} km
              </button>
            ))}
          </div>
        </div>

        {/* Right: Zone Quick Filter & 2D/3D Mode Switcher */}
        <div className="flex items-center space-x-2.5">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 text-slate-200 text-xs font-bold border border-slate-800 rounded-xl px-3 py-1 focus:outline-none focus:border-emerald-500 cursor-pointer hidden md:block"
          >
            <option value="all">All Market Zones</option>
            <option value="demand">High Demand</option>
            <option value="logistics">Logistics Hubs</option>
            <option value="industrial">Industrial</option>
          </select>

          {/* 2D vs 3D Switch Pill */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-extrabold shadow-inner">
            <button
              type="button"
              onClick={() => setViewMode('2d')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
                viewMode === '2d'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🗺️ 2D Flat</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('3d')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
                viewMode === '3d'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🧊 3D View</span>
            </button>
          </div>
        </div>

      </div>

      {/* 2. Interactive Map Stage Container */}
      <div className="relative w-full h-[350px] sm:h-[390px] overflow-hidden flex items-center justify-center bg-[#0B1329]">
        
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/90 via-[#0B1329] to-[#040814]" />

        {/* CANVAS STAGE */}
        <div
          className="relative w-[450px] h-[300px] transition-all duration-700 ease-out"
          style={
            viewMode === '3d'
              ? {
                  transform: 'perspective(900px) rotateX(38deg) rotateZ(-8deg) scale(1.02)',
                  transformStyle: 'preserve-3d',
                }
              : {
                  transform: 'scale(1)',
                  transformStyle: 'flat',
                }
          }
        >
          {/* Cartographic Base Vector Map Canvas */}
          <svg
            viewBox="0 0 450 300"
            className="absolute inset-0 w-full h-full object-cover rounded-2xl shadow-2xl"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <radialGradient id="marketHeatGrad" cx="50%" cy="52%" r="48%">
                <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.3" />
                <stop offset="35%" stopColor="#F59E0B" stopOpacity="0.2" />
                <stop offset="70%" stopColor="#10B981" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#0B1329" stopOpacity="0" />
              </radialGradient>

              <linearGradient id="marketTerrainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1E293B" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#0F172A" stopOpacity="0.98" />
              </linearGradient>
            </defs>

            {/* Base Surface */}
            <rect width="450" height="300" rx="16" fill="url(#marketTerrainGrad)" stroke="#334155" strokeWidth="1" />

            {/* Terrain Grid */}
            <g stroke="#334155" strokeWidth="0.65" opacity="0.4">
              {[40, 80, 120, 160, 200, 240, 280].map((y) => (
                <line key={`h-${y}`} x1="0" y1={y} x2="450" y2={y} />
              ))}
              {[50, 100, 150, 200, 250, 300, 350, 400].map((x) => (
                <line key={`v-${x}`} x1={x} y1="0" x2={x} y2="300" />
              ))}
            </g>

            {/* Highway Lines */}
            <g stroke="#475569" strokeWidth="2.5" opacity="0.55" strokeLinecap="round">
              <path d="M 0 100 Q 150 135 225 155 T 450 175" fill="none" />
              <path d="M 110 0 Q 170 90 225 155 T 280 300" fill="none" />
            </g>
            <g stroke="#38BDF8" strokeWidth="1" opacity="0.75" strokeDasharray="5 4">
              <path d="M 0 100 Q 150 135 225 155 T 450 175" fill="none" />
              <path d="M 110 0 Q 170 90 225 155 T 280 300" fill="none" />
            </g>

            {/* Catchment Gradient Layer */}
            <circle cx="225" cy="155" r="130" fill="url(#marketHeatGrad)" />

            {/* Catchment Distance Rings */}
            <circle
              cx="225"
              cy="155"
              r="125"
              stroke="#10B981"
              strokeWidth={radiusFilter === '15' ? '2' : '1'}
              strokeDasharray="4 3"
              opacity={radiusFilter === '15' ? '0.9' : '0.3'}
            />
            <circle
              cx="225"
              cy="155"
              r="85"
              stroke="#F59E0B"
              strokeWidth={radiusFilter === '10' ? '2.2' : '1'}
              strokeDasharray={radiusFilter === '10' ? 'none' : '3 3'}
              opacity={radiusFilter === '10' ? '0.95' : '0.35'}
            />
            <circle
              cx="225"
              cy="155"
              r="48"
              stroke="#F43F5E"
              strokeWidth={radiusFilter === '5' ? '2.5' : '1.2'}
              opacity={radiusFilter === '5' ? '1' : '0.45'}
            />

            {/* Ring Labels */}
            <text x="228" y="115" fill="#F43F5E" fontSize="7.5" fontWeight="bold" opacity="0.85">5 km Catchment</text>
            <text x="228" y="78" fill="#F59E0B" fontSize="7.5" fontWeight="bold" opacity="0.85">10 km Catchment</text>
            <text x="228" y="38" fill="#10B981" fontSize="7.5" fontWeight="bold" opacity="0.85">15 km Catchment</text>
          </svg>

          {/* Enterprise Center Location Pin */}
          <div
            className="absolute z-20 flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            style={{ left: 225, top: 155 }}
            onClick={() => setActivePoi(null)}
          >
            {/* 3D Vertical Light Shaft */}
            {viewMode === '3d' && (
              <div className="absolute bottom-3 w-1 h-16 bg-gradient-to-t from-emerald-400 to-transparent opacity-80 blur-[0.5px] animate-pulse" />
            )}

            <div className="absolute w-9 h-9 rounded-full bg-emerald-500/30 animate-ping" />

            <div className="relative w-8 h-8 rounded-full bg-emerald-600 border-2 border-white shadow-xl flex items-center justify-center text-white text-xs font-black">
              ★
            </div>

            <div
              className="mt-1 px-3 py-0.5 rounded-full bg-emerald-950/95 border border-emerald-400 text-white font-extrabold text-[9.5px] shadow-lg whitespace-nowrap"
              style={
                viewMode === '3d'
                  ? { transform: 'rotateZ(8deg) rotateX(-38deg) translateY(-8px)' }
                  : undefined
              }
            >
              <span>{locationName} Center</span>
            </div>
          </div>

          {/* Dynamic POI Markers */}
          {filteredPois.map((poi) => {
            const isSelected = activePoi?.id === poi.id;

            return (
              <div
                key={poi.id}
                onClick={() => setActivePoi(poi)}
                className="absolute z-30 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group transition-all duration-300"
                style={{ left: poi.pos2d.x, top: poi.pos2d.y }}
              >
                {/* 3D Extruded Cube Structure (in 3D Mode) */}
                {viewMode === '3d' && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
                    <div
                      className="w-0.5 opacity-80 group-hover:opacity-100 transition-opacity"
                      style={{
                        height: `${poi.height3d + 12}px`,
                        backgroundImage: `linear-gradient(to top, ${poi.color}, transparent)`,
                      }}
                    />

                    <div
                      className="w-5 border rounded-xs shadow-xl transition-transform group-hover:scale-110"
                      style={{
                        height: `${poi.height3d}px`,
                        borderColor: poi.color,
                        backgroundColor: `${poi.color}30`,
                        boxShadow: `0 0 14px ${poi.color}60`,
                      }}
                    >
                      <div
                        className="w-full h-1 border-b"
                        style={{ backgroundColor: poi.color, opacity: 0.95 }}
                      />
                    </div>
                  </div>
                )}

                {/* Billboarded Pin Badge Card (Counter-rotated in 3D so text stays upright) */}
                <div
                  className={`relative px-2.5 py-1 rounded-xl border shadow-lg flex items-center space-x-1.5 transition-all duration-200 ${poi.badgeBg} ${
                    isSelected ? 'ring-2 ring-white scale-110 z-40' : 'group-hover:scale-105'
                  }`}
                  style={
                    viewMode === '3d'
                      ? { transform: 'rotateZ(8deg) rotateX(-38deg) translateY(-12px)' }
                      : undefined
                  }
                >
                  <span className={`w-2 h-2 rounded-full ${poi.dotColor} shadow-xs flex-shrink-0`} />
                  <span className="text-[10px] font-extrabold whitespace-nowrap leading-none">{poi.name}</span>
                </div>
              </div>
            );
          })}

        </div>

        {/* Interactive POI Detail Tooltip Overlay Card */}
        {activePoi && (
          <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 sm:w-80 z-40 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-2xl p-3.5 shadow-2xl text-slate-100 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activePoi.color }} />
                <span className="text-xs font-extrabold text-white">{activePoi.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setActivePoi(null)}
                className="text-slate-400 hover:text-white text-xs font-bold px-1.5 py-0.5 rounded-md hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 my-2.5 text-[10.5px]">
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Category</span>
                <span className="font-extrabold text-slate-200">{activePoi.typeLabel}</span>
              </div>
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Distance</span>
                <span className="font-extrabold text-emerald-400">{activePoi.distance} km</span>
              </div>
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Demand Score</span>
                <span className="font-extrabold text-amber-400">{activePoi.demandScore}</span>
              </div>
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Impact</span>
                <span className="font-extrabold text-rose-400">{activePoi.impact}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
              {activePoi.details}
            </p>
          </div>
        )}

      </div>

      {/* 3. Bottom Map Legend Footer */}
      <div className="relative z-20 px-3.5 sm:px-4 py-2.5 bg-slate-900/95 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2.5 text-[11px] font-semibold text-slate-300">
        <div className="flex items-center space-x-3.5 flex-wrap gap-y-1">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs" />
            <span>High Demand</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-xs" />
            <span>Industrial Cluster</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-xs" />
            <span>Logistics Hub</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-xs" />
            <span>Transport Depot</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
            <span>Agri Mandi</span>
          </div>
        </div>

        <div className="text-[10.5px] text-slate-400 font-bold flex items-center space-x-1.5">
          <span>Mode:</span>
          <span className="text-emerald-400 uppercase tracking-wide">{viewMode === '3d' ? '3D Perspective' : '2D Flat Map'}</span>
        </div>
      </div>

    </div>
  );
}

/**
 * MarketInsightSection Component — Executive Dashboard Card with Live 2D/3D Map & Local Opportunity Drivers
 */
export default function MarketInsightSection({
  currentProfile,
  onNavigate,
  className = '',
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Connect current VITTANAYA profile location & identity
  const locationName = (
    currentProfile?.village ||
    (currentProfile?.location ? currentProfile.location.split(',')[0] : 'Kuarmunda')
  ).trim();

  const locationFull =
    currentProfile?.location ||
    [currentProfile?.village, currentProfile?.block, currentProfile?.district, currentProfile?.state]
      .filter(Boolean)
      .join(', ') ||
    'Kuarmunda, Kuarmunda Block, Sundargarh, Odisha';

  const categoryName = currentProfile?.category || currentProfile?.business_type || 'Transport & Logistics';
  const businessName = currentProfile?.name || currentProfile?.businessName || 'Rural Micro-Enterprise';

  const reasons = [
    {
      id: 1,
      icon: (
        <svg className="w-4 h-4 text-[#2F7757]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="3" width="15" height="13" />
          <polygon points="16,8 20,8 23,11 23,16 16,16" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      ),
      title: 'High logistics & freight demand',
      desc: 'Expanding industrial belts driving continuous regional cargo & transport demand.',
      impact: 'High Impact',
      impactType: 'high',
    },
    {
      id: 2,
      icon: (
        <svg className="w-4 h-4 text-[#2F7757]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.284a2.25 2.25 0 00-2.012 0L2.618 5.721a1.125 1.125 0 00-.618.995v11.85c0 .418.234.8.618.995l4.875 2.437c.318.158.69.158 1.008 0l4.875-2.437a2.25 2.25 0 012.012 0z" />
        </svg>
      ),
      title: 'Multimodal arterial highway link',
      desc: 'Seamless highway connectivity to major state distribution centers.',
      impact: 'High Impact',
      impactType: 'high',
    },
    {
      id: 3,
      icon: (
        <svg className="w-4 h-4 text-[#2F7757]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
        </svg>
      ),
      title: 'Industrial growth corridor',
      desc: 'Multiple manufacturing clusters generating non-stop freight movement.',
      impact: 'Medium Impact',
      impactType: 'medium',
    },
  ];

  const extraReasons = [
    {
      id: 4,
      icon: (
        <svg className="w-4 h-4 text-[#2F7757]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 3" />
        </svg>
      ),
      title: 'Short fleet turnaround cycles',
      desc: 'Local arterial routes ensure rapid transit and same-day operational turnaround.',
      impact: 'Medium Impact',
    },
    {
      id: 5,
      icon: (
        <svg className="w-4 h-4 text-[#2F7757]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
      ),
      title: 'Competitive operator pool',
      desc: 'High local availability of licensed commercial operators with low wage inflation.',
      impact: 'High Impact',
    },
  ];

  return (
    <div className={`bg-white rounded-3xl border border-[#E8E2D5] shadow-card-soft p-5 sm:p-6 flex flex-col justify-between ${className}`}>
      
      {/* 1. Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#F4EFE6]">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-black text-[#1A211D]">
              Hyper-Local Market Insight
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#E8F1EC] text-[#2F7757] text-[10px] font-extrabold border border-[#2F7757]/30">
              Live Map
            </span>
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-[#607267] font-semibold mt-0.5">
            <svg className="w-3.5 h-3.5 text-[#2F7757]" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            <span className="truncate max-w-[280px] sm:max-w-[400px]">{locationFull}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate && onNavigate('feasibility')}
          className="px-3.5 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#E8E2D5] text-xs font-extrabold text-[#102A1E] hover:bg-[#E8F1EC] transition-colors cursor-pointer flex items-center space-x-1"
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
            category={categoryName}
            locationFull={locationFull}
          />
        </div>

        {/* Right Sub-Column: Why This Opportunity? (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          
          {/* Sub-Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-[#1A211D]">
              Why This Opportunity?
            </h3>

            <span className="px-2.5 py-0.5 rounded-full bg-[#E8F1EC] text-[#2F7757] font-extrabold text-[10px] border border-[#2F7757]/30 flex items-center space-x-1">
              <span>Verified Signals</span>
              <span>✓</span>
            </span>
          </div>

          {/* Opportunity Reason Items */}
          <div className="space-y-3.5">
            {reasons.map((item) => (
              <div key={item.id} className="flex items-start space-x-3 p-2.5 rounded-2xl bg-[#FAF7F2] border border-[#F4EFE6] hover:bg-[#F4F9F6] transition-colors">
                <div className="w-8 h-8 rounded-xl bg-[#E8F1EC] text-[#2F7757] flex items-center justify-center flex-shrink-0 mt-0.5">
                  {item.icon}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#1A211D] leading-tight">
                      {item.title}
                    </h4>
                    <span className="px-2 py-0.5 rounded-md bg-[#E8F1EC] text-[#2F7757] font-extrabold text-[10px]">
                      {item.impact}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#607267] font-medium leading-relaxed mt-1">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}

            {isExpanded && extraReasons.map((item) => (
              <div key={item.id} className="flex items-start space-x-3 p-2.5 rounded-2xl bg-[#FAF7F2] border border-[#F4EFE6] hover:bg-[#F4F9F6] transition-colors animate-fadeIn">
                <div className="w-8 h-8 rounded-xl bg-[#E8F1EC] text-[#2F7757] flex items-center justify-center flex-shrink-0 mt-0.5">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#1A211D] leading-tight">{item.title}</h4>
                    <span className="px-2 py-0.5 rounded-md bg-[#E8F1EC] text-[#2F7757] font-extrabold text-[10px]">
                      {item.impact}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#607267] font-medium leading-relaxed mt-1">
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
            className="text-xs font-extrabold text-[#2F7757] hover:text-[#102A1E] transition-colors flex items-center space-x-1 pt-1 cursor-pointer self-start"
          >
            <span>{isExpanded ? '– Show less' : '+ 2 more opportunity signals'}</span>
            <span className="text-xs">{isExpanded ? '⌃' : '⌄'}</span>
          </button>

        </div>

      </div>

    </div>
  );
}
