import React, { useState, useEffect, useCallback, useRef } from 'react';
import locationService from '../../services/locationService';
import MapLibreMap from './map/MapLibreMap';
import Google3DMap from './map/Google3DMap';
import {
  PROVIDER_MAPLIBRE,
  PROVIDER_GOOGLE_3D,
  isGoogle3DConfigured,
  PROVENANCE_CONFIGS,
} from './map/mapProviders';

/**
 * LocalMarketMap Component — Production-Quality Hyper-Local Market Map
 * 
 * Architecture:
 * - Provider A (Default Free): MapLibre GL JS + OpenFreeMap Liberty Vector Basemap
 * - Provider B (Optional Premium): Google Maps Platform Photorealistic 3D Tiles
 * - Modes: Normal Card, Expanded Modal (88-92vw), Fullscreen View (100vw x 100dvh)
 * - Real geodesic catchment radius (5, 10, 15 km)
 * - Authentic VITTANAYA business HQ & backend spatial POIs
 * - Full data provenance handling (VERIFIED_LOCAL, BENCHMARK_ESTIMATE, etc.)
 * - Zero fabricated coordinates or artificial SVG maps
 */
export default function LocalMarketMap({
  locationName = 'Kuarmunda',
  districtName = 'Sundargarh',
  category = 'Transport & Logistics',
  locationFull = 'Kuarmunda, Kuarmunda Block, Sundargarh, Odisha',
  currentProfile = null,
  onMapDataLoaded = null,
}) {
  // Sizing mode: 'normal' | 'expanded' | 'fullscreen'
  const [sizeMode, setSizeMode] = useState('normal');

  // Camera perspective: '2d' | '3d'
  const [viewMode, setViewMode] = useState('2d');

  // Catchment radius filter: '5' | '10' | '15'
  const [radiusFilter, setRadiusFilter] = useState('15');

  // Category filter: 'all' | 'demand' | 'logistics' | 'industrial'
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Active POI inspector tooltip
  const [activePoi, setActivePoi] = useState(null);

  // Live backend data
  const [mapData, setMapData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Active Map Provider: 'maplibre' | 'google3d'
  const hasGoogle = isGoogle3DConfigured();
  const [activeProvider, setActiveProvider] = useState(PROVIDER_MAPLIBRE);

  const containerRef = useRef(null);

  // 1. Fetch live backend spatial market POIs & district intelligence
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    locationService
      .getMarketMapData({
        location: locationName,
        district: districtName,
        category: category,
        radius_km: parseInt(radiusFilter, 10),
        business_id: currentProfile?.id || null,
      })
      .then((res) => {
        if (isMounted) {
          if (res && res.pois) {
            setMapData(res);
            if (onMapDataLoaded) onMapDataLoaded(res);
          } else {
            setMapData(null);
          }
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Market map spatial data error:', err);
        if (isMounted) {
          setMapData(null);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [locationName, districtName, category, radiusFilter, currentProfile?.id]);

  // 2. Lock body scroll when expanded or fullscreen
  useEffect(() => {
    if (sizeMode !== 'normal') {
      const orig = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = orig;
      };
    }
  }, [sizeMode]);

  // 3. Keyboard Escape handler to exit fullscreen or expanded mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (sizeMode === 'fullscreen') {
          setSizeMode('expanded');
        } else if (sizeMode === 'expanded') {
          setSizeMode('normal');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sizeMode]);

  // 4. Resolve Center Coordinates
  const centerLat = mapData?.center_lat ?? 22.2858;
  const centerLng = mapData?.center_lng ?? 84.7766;

  // 5. Filter POIs strictly from verified backend records
  const rawPois = mapData?.pois || [];
  const filteredPois = rawPois.filter((poi) => {
    const poiDist = poi.distance_km ?? poi.distance ?? 0;
    const withinRadius = poiDist <= parseFloat(radiusFilter);
    const matchesCat = selectedCategory === 'all' || poi.type === selectedCategory;
    return withinRadius && matchesCat;
  });

  // 6. Handle 2D / 3D Switch
  const handleToggleViewMode = (mode) => {
    setViewMode(mode);
    if (mode === '3d' && hasGoogle) {
      setActiveProvider(PROVIDER_GOOGLE_3D);
    } else {
      setActiveProvider(PROVIDER_MAPLIBRE);
    }
  };

  // 7. Resolve Provenance
  const provenanceKey = mapData?.provenance || (mapData?.is_local_verified ? 'VERIFIED_LOCAL' : 'BENCHMARK_ESTIMATE');
  const provenance = PROVENANCE_CONFIGS[provenanceKey] || PROVENANCE_CONFIGS.VERIFIED_LOCAL;
  const sourceAuth = mapData?.source_authority || 'NABARD Odisha PLP 2025-26';
  const hasInsufficientData = !isLoading && (!mapData || filteredPois.length === 0);

  // Provider label calculation
  const getProviderBadgeLabel = () => {
    if (viewMode === '3d' && activeProvider === PROVIDER_GOOGLE_3D) {
      return 'Google Photorealistic 3D (Active)';
    }
    if (viewMode === '3d') {
      return 'MapLibre 3D Vector';
    }
    return 'OpenFreeMap 2D Vector (Free)';
  };

  // Determine outer container styling based on sizeMode
  const getContainerWrapperClasses = () => {
    if (sizeMode === 'fullscreen') {
      return 'fixed inset-0 z-50 w-screen h-[100dvh] bg-slate-950 flex flex-col animate-fadeIn select-none';
    }
    if (sizeMode === 'expanded') {
      return 'fixed inset-3 sm:inset-6 md:inset-10 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 animate-fadeIn select-none';
    }
    return 'relative w-full rounded-3xl overflow-hidden border border-slate-700/80 bg-[#0F172A] shadow-2xl flex flex-col justify-between select-none';
  };

  const getInnerCardClasses = () => {
    if (sizeMode === 'expanded') {
      return 'w-full h-full rounded-3xl overflow-hidden border border-slate-700 bg-[#0F172A] shadow-2xl flex flex-col justify-between';
    }
    if (sizeMode === 'fullscreen') {
      return 'w-full h-full flex flex-col justify-between';
    }
    return 'w-full flex flex-col justify-between';
  };

  const getMapCanvasHeightClass = () => {
    if (sizeMode === 'fullscreen') {
      return 'flex-1 w-full min-h-0';
    }
    if (sizeMode === 'expanded') {
      return 'flex-1 w-full min-h-0';
    }
    return 'w-full h-[380px] sm:h-[440px]';
  };

  return (
    <div ref={containerRef} className={getContainerWrapperClasses()}>
      <div className={getInnerCardClasses()}>

        {/* 1. Modern Header Control Bar */}
        <div className="flex-shrink-0 z-20 px-3.5 sm:px-4 py-3 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
          {/* Left: Active Location & Data Provenance Badge */}
          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            {/* Location Badge */}
            <div className="flex items-center space-x-2 px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-100 shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse shrink-0" />
              <span className="truncate max-w-[150px] sm:max-w-[210px]">
                {locationName} ({districtName})
              </span>
            </div>

            {/* Provenance Badge */}
            <div
              className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold border flex items-center space-x-1.5 ${provenance.badgeClass}`}
              title={`Provenance: ${provenance.desc} • Authority: ${sourceAuth}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${provenance.dotClass} shrink-0`} />
              <span>{provenance.label}</span>
            </div>

            {/* Provider Indicator Pill */}
            <div className="hidden md:flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-bold text-slate-300">
              <span className="text-slate-400">Engine:</span>
              <span className={activeProvider === PROVIDER_GOOGLE_3D ? 'text-amber-400' : 'text-blue-400'}>
                {getProviderBadgeLabel()}
              </span>
            </div>

            {/* Catchment Radius Selector */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold shadow-inner">
              <span className="px-2 text-slate-400 text-[10px] font-black uppercase tracking-wider hidden sm:inline">
                Radius:
              </span>
              {['5', '10', '15'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRadiusFilter(r)}
                  className={`px-2.5 py-0.5 rounded-lg transition-all cursor-pointer ${
                    radiusFilter === r
                      ? 'bg-blue-600 text-white shadow-sm font-extrabold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  aria-label={`Catchment ${r} kilometers`}
                >
                  0-{r} km
                </button>
              ))}
            </div>
          </div>

          {/* Right: Category Filter + 2D/3D + Expand + Fullscreen Controls */}
          <div className="flex items-center space-x-2">
            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-950 text-slate-200 text-xs font-bold border border-slate-800 rounded-xl px-2.5 py-1 focus:outline-none focus:border-blue-500 cursor-pointer hidden lg:block"
              aria-label="Filter Map Zones"
            >
              <option value="all">All Market Zones</option>
              <option value="demand">High Demand</option>
              <option value="logistics">Logistics Hubs</option>
              <option value="industrial">Industrial Zones</option>
            </select>

            {/* 2D vs 3D Switch Pill */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-extrabold shadow-inner">
              <button
                type="button"
                onClick={() => handleToggleViewMode('2d')}
                className={`px-2.5 sm:px-3 py-1 rounded-lg transition-all flex items-center space-x-1 cursor-pointer ${
                  viewMode === '2d'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="2D Vector Flat View (OpenFreeMap)"
                aria-label="Switch to 2D flat view"
              >
                <span>🗺️ 2D</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleViewMode('3d')}
                className={`px-2.5 sm:px-3 py-1 rounded-lg transition-all flex items-center space-x-1 cursor-pointer ${
                  viewMode === '3d'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
                title={hasGoogle ? 'Google Photorealistic 3D (Active)' : 'MapLibre 3D Vector with Building Extrusion'}
                aria-label="Switch to 3D perspective view"
              >
                <span>🧊 3D</span>
              </button>
            </div>

            {/* Sizing: Expand / Restore (Desktop) */}
            <button
              type="button"
              onClick={() => setSizeMode(sizeMode === 'expanded' ? 'normal' : 'expanded')}
              className={`w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hidden sm:flex items-center justify-center transition-colors cursor-pointer border border-slate-700 ${
                sizeMode === 'expanded' ? 'ring-2 ring-blue-500' : ''
              }`}
              title={sizeMode === 'expanded' ? 'Restore Default Card Size' : 'Expand Map Window'}
              aria-label={sizeMode === 'expanded' ? 'Restore default size' : 'Expand map window'}
            >
              {sizeMode === 'expanded' ? (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="4 14 10 14 10 20" />
                  <polyline points="20 10 14 10 14 4" />
                  <line x1="14" y1="10" x2="21" y2="3" />
                  <line x1="3" y1="21" x2="10" y2="14" />
                </svg>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 3 21 3 21 9" />
                  <polyline points="9 21 3 21 3 15" />
                  <line x1="21" y1="3" x2="14" y2="10" />
                  <line x1="3" y1="21" x2="10" y2="14" />
                </svg>
              )}
            </button>

            {/* Sizing: Fullscreen / Exit Fullscreen */}
            <button
              type="button"
              onClick={() => setSizeMode(sizeMode === 'fullscreen' ? 'normal' : 'fullscreen')}
              className={`w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors cursor-pointer border border-slate-700 ${
                sizeMode === 'fullscreen' ? 'ring-2 ring-blue-500' : ''
              }`}
              title={sizeMode === 'fullscreen' ? 'Exit Full Screen' : 'Enter Full Screen View'}
              aria-label={sizeMode === 'fullscreen' ? 'Exit full screen' : 'Enter full screen'}
            >
              {sizeMode === 'fullscreen' ? (
                <span className="text-xs font-extrabold text-blue-400">✕</span>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* 2. Map Canvas Container with Dynamic Provider Rendering */}
        <div className={`relative overflow-hidden bg-[#0B1329] ${getMapCanvasHeightClass()}`}>
          {/* Loading Indicator */}
          {isLoading && (
            <div className="absolute z-30 inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center space-x-2.5 text-xs font-extrabold text-blue-300">
              <span className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <span>Loading vector basemap & verified spatial records...</span>
            </div>
          )}

          {/* Insufficient Local Data State */}
          {hasInsufficientData && (
            <div className="absolute inset-0 z-25 flex flex-col items-center justify-center bg-slate-950/75 backdrop-blur-xs p-6 text-center text-white">
              <div className="w-11 h-11 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center mb-2 text-xl">
                📍
              </div>
              <p className="text-sm font-black text-rose-200">Insufficient Local Data</p>
              <p className="text-xs text-slate-400 max-w-xs mt-1">
                No verified spatial market records found for {locationName} ({districtName}) within {radiusFilter} km.
              </p>
            </div>
          )}

          {/* Active Provider Rendering */}
          {viewMode === '3d' && activeProvider === PROVIDER_GOOGLE_3D && hasGoogle ? (
            <Google3DMap
              centerLat={centerLat}
              centerLng={centerLng}
              radiusFilter={radiusFilter}
              filteredPois={filteredPois}
              activePoi={activePoi}
              onSelectPoi={(poi) => setActivePoi(poi)}
              locationName={locationName}
              onFallbackToMapLibre={() => setActiveProvider(PROVIDER_MAPLIBRE)}
            />
          ) : (
            <MapLibreMap
              centerLat={centerLat}
              centerLng={centerLng}
              radiusFilter={radiusFilter}
              viewMode={viewMode}
              filteredPois={filteredPois}
              activePoi={activePoi}
              onSelectPoi={(poi) => setActivePoi(poi)}
              locationName={locationName}
              className="w-full h-full"
            />
          )}

          {/* 3. Floating Detail Inspector Tooltip */}
          {activePoi && (
            <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-84 z-30 p-4 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700 shadow-2xl animate-fadeIn text-white select-text">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      activePoi.dot_color || activePoi.dotColor || 'bg-blue-400'
                    }`}
                  />
                  <span className="text-xs font-black">{activePoi.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActivePoi(null)}
                  className="text-slate-400 hover:text-white text-xs font-bold px-1.5 py-0.5 rounded-lg hover:bg-slate-800 cursor-pointer"
                  aria-label="Close POI details"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 my-2.5 text-[10px]">
                <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400 block">Distance from HQ</span>
                  <span className="text-xs font-bold text-white">
                    {activePoi.distance_km ?? activePoi.distance} km
                  </span>
                </div>
                <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400 block">Demand Signal</span>
                  <span className="text-xs font-bold text-blue-400">
                    {activePoi.demand_score || activePoi.demandScore}
                  </span>
                </div>
              </div>

              <p className="text-[10.5px] text-slate-300 font-medium leading-relaxed">
                {activePoi.details}
              </p>

              {activePoi.provenance && (
                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[9px] text-slate-400">
                  <span>Provenance:</span>
                  <span className="text-emerald-400 font-bold">{activePoi.provenance}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 4. Bottom Legend & Live Metrics Bar */}
        <div className="flex-shrink-0 z-20 px-4 py-2.5 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-4 flex-wrap gap-y-1 text-[10px] font-bold text-slate-300">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_6px_#F43F5E]" />
              <span>High Demand Zone</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_6px_#3B82F6]" />
              <span>Logistics Terminal</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10B981]" />
              <span>Agri Procurement</span>
            </div>
          </div>

          <div className="text-[10px] sm:text-[10.5px] text-slate-400 font-bold flex items-center space-x-1.5">
            <span>Authority:</span>
            <span className="text-blue-400 uppercase tracking-wide truncate max-w-[190px]">
              {sourceAuth}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
