import React, { useState, useEffect, useRef } from 'react';
import { getGoogleMapsApiKey } from './mapProviders';

/**
 * Optional Premium Provider: Google Maps Platform Photorealistic 3D Maps
 * 
 * - Only initialized if VITE_GOOGLE_MAPS_API_KEY is present
 * - Dynamically loads Google Maps JavaScript API with 'maps3d' library
 * - Renders photorealistic 3D terrain and building meshes
 * - Graceful fallback to Free MapLibre 3D if script load fails or key is unauthorized
 */
export default function Google3DMap({
  centerLat,
  centerLng,
  radiusFilter,
  filteredPois,
  activePoi,
  onSelectPoi,
  locationName,
  onFallbackToMapLibre,
  className = '',
}) {
  const [loadState, setLoadState] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const containerRef = useRef(null);
  const mapElementRef = useRef(null);

  const apiKey = getGoogleMapsApiKey();

  useEffect(() => {
    if (!apiKey) {
      setLoadState('error');
      setErrorMessage('Google Maps API Key not configured (VITE_GOOGLE_MAPS_API_KEY).');
      if (onFallbackToMapLibre) onFallbackToMapLibre();
      return;
    }

    let isMounted = true;

    // Helper to initialize the 3D element once script is loaded
    const init3DMap = () => {
      try {
        if (!containerRef.current || !isMounted) return;

        // Clear existing children
        containerRef.current.innerHTML = '';

        // Create Google 3D Map Web Component
        // Google Maps 3D Maps element: <gmp-map-3d>
        const map3D = document.createElement('gmp-map-3d');
        map3D.setAttribute('center', `${centerLat},${centerLng},300`);
        map3D.setAttribute('tilt', '62.5');
        map3D.setAttribute('heading', '-15');
        map3D.setAttribute('range', radiusFilter === '5' ? '2500' : radiusFilter === '10' ? '4500' : '7500');
        map3D.style.width = '100%';
        map3D.style.height = '100%';

        // Add Central HQ Marker
        const hqMarker = document.createElement('gmp-marker-3d');
        hqMarker.setAttribute('position', `${centerLat},${centerLng},10`);
        hqMarker.setAttribute('title', `${locationName} (HQ)`);
        hqMarker.setAttribute('label', '📍 HQ');
        map3D.appendChild(hqMarker);

        // Add POI Markers
        filteredPois.forEach((poi) => {
          if (poi.lat != null && poi.lng != null) {
            const m = document.createElement('gmp-marker-3d');
            m.setAttribute('position', `${poi.lat},${poi.lng},10`);
            m.setAttribute('title', poi.name);
            m.setAttribute('label', poi.name.slice(0, 3));
            m.addEventListener('gmp-click', () => {
              if (onSelectPoi) onSelectPoi(poi);
            });
            map3D.appendChild(m);
          }
        });

        containerRef.current.appendChild(map3D);
        mapElementRef.current = map3D;
        setLoadState('ready');
      } catch (err) {
        console.warn('Google 3D initialization warning:', err);
        if (isMounted) {
          setLoadState('error');
          setErrorMessage(err.message || 'Google 3D Map failed to initialize.');
        }
      }
    };

    // Check if script is already present
    if (window.google && window.google.maps && window.google.maps.maps3d) {
      init3DMap();
      return;
    }

    const scriptId = 'vittanaya-google-maps-3d-script';
    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=alpha&libraries=maps3d`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        if (isMounted) init3DMap();
      };

      script.onerror = () => {
        if (isMounted) {
          setLoadState('error');
          setErrorMessage('Failed to load Google 3D Maps API. Network or domain restriction.');
        }
      };

      document.head.appendChild(script);
    } else {
      script.addEventListener('load', init3DMap);
    }

    return () => {
      isMounted = false;
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [apiKey, centerLat, centerLng, radiusFilter, filteredPois]);

  if (loadState === 'error') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-slate-950/80 text-center text-white select-none">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xl mb-3">
          🌐
        </div>
        <h4 className="text-sm font-black text-amber-200">
          Google 3D Provider Notice
        </h4>
        <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">
          {errorMessage || 'Google Photorealistic 3D could not be loaded.'}
        </p>
        <button
          type="button"
          onClick={onFallbackToMapLibre}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md flex items-center space-x-2 cursor-pointer"
        >
          <span>Switch to Free MapLibre 3D</span>
          <span>→</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      {loadState === 'loading' && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/80 text-xs font-bold text-blue-300 space-x-2">
          <span className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          <span>Connecting to Google Photorealistic 3D Tiles...</span>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
