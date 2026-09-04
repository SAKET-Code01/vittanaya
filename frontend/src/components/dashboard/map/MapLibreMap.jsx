import React, { useEffect, useRef, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { createGeoJSONCircle } from './mapProviders';

/**
 * Free Default Map Provider: MapLibre GL JS + OpenFreeMap (Liberty style)
 * 
 * Features:
 * - Real OpenFreeMap vector basemap (https://tiles.openfreemap.org/styles/liberty)
 * - True 2D flat camera and realistic 3D perspective with vector building extrusion layer
 * - Dynamic catchment buffer polygon circle
 * - Central HQ radar marker
 * - Authentic backend POIs
 * - Professional navigation, fullscreen, and pitch compass controls
 */
export default function MapLibreMap({
  centerLat,
  centerLng,
  radiusFilter,
  viewMode,
  filteredPois,
  activePoi,
  onSelectPoi,
  locationName,
  onMapLoaded,
  className = '',
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  // 1. Initialize MapLibre instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [centerLng, centerLat],
      zoom: radiusFilter === '5' ? 12.8 : radiusFilter === '10' ? 11.8 : 10.8,
      pitch: viewMode === '3d' ? 58 : 0,
      bearing: viewMode === '3d' ? -18 : 0,
      attributionControl: true,
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');

    map.on('load', () => {
      // Add dynamic 3D Building Extrusion Layer (if vector source supports it)
      try {
        const layers = map.getStyle().layers || [];
        let labelLayerId;
        for (let i = 0; i < layers.length; i++) {
          if (layers[i].type === 'symbol' && layers[i].layout && layers[i].layout['text-field']) {
            labelLayerId = layers[i].id;
            break;
          }
        }

        if (map.getSource('openmaptiles') && !map.getLayer('3d-buildings')) {
          map.addLayer(
            {
              id: '3d-buildings',
              source: 'openmaptiles',
              'source-layer': 'building',
              type: 'fill-extrusion',
              minzoom: 13,
              paint: {
                'fill-extrusion-color': [
                  'interpolate',
                  ['linear'],
                  ['get', 'render_height'],
                  0, '#1e293b',
                  25, '#334155',
                  60, '#475569',
                  120, '#64748b',
                ],
                'fill-extrusion-height': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  13, 0,
                  14.2, ['coalesce', ['get', 'render_height'], 12],
                ],
                'fill-extrusion-base': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  13, 0,
                  14.2, ['coalesce', ['get', 'render_min_height'], 0],
                ],
                'fill-extrusion-opacity': 0.75,
              },
            },
            labelLayerId
          );
        }
      } catch (err) {
        console.warn('3D building extrusion layer notice:', err);
      }

      // Add Catchment Radius Circle Layer
      const radiusKm = parseFloat(radiusFilter);
      const circleData = createGeoJSONCircle(centerLng, centerLat, radiusKm);

      if (!map.getSource('catchment-radius')) {
        map.addSource('catchment-radius', {
          type: 'geojson',
          data: circleData,
        });

        map.addLayer({
          id: 'catchment-radius-fill',
          type: 'fill',
          source: 'catchment-radius',
          paint: {
            'fill-color': '#2563EB',
            'fill-opacity': 0.08,
          },
        });

        map.addLayer({
          id: 'catchment-radius-line',
          type: 'line',
          source: 'catchment-radius',
          paint: {
            'line-color': '#3B82F6',
            'line-width': 2,
            'line-dasharray': [3, 2],
            'line-opacity': 0.75,
          },
        });
      }

      if (onMapLoaded) onMapLoaded(map);
    });

    mapInstanceRef.current = map;

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [centerLat, centerLng]);

  // 2. Camera adjustment when viewMode changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !map.isStyleLoaded()) return;

    if (viewMode === '3d') {
      map.easeTo({
        pitch: 58,
        bearing: -18,
        duration: 800,
      });
      if (map.getLayer('3d-buildings')) {
        map.setLayoutProperty('3d-buildings', 'visibility', 'visible');
      }
    } else {
      map.easeTo({
        pitch: 0,
        bearing: 0,
        duration: 800,
      });
      if (map.getLayer('3d-buildings')) {
        map.setLayoutProperty('3d-buildings', 'visibility', 'none');
      }
    }
  }, [viewMode]);

  // 3. Update Catchment Circle GeoJSON when radius changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const source = map.getSource('catchment-radius');
    if (source) {
      const radiusKm = parseFloat(radiusFilter);
      source.setData(createGeoJSONCircle(centerLng, centerLat, radiusKm));
    }

    const targetZoom = radiusFilter === '5' ? 12.8 : radiusFilter === '10' ? 11.8 : 10.8;
    map.easeTo({
      center: [centerLng, centerLat],
      zoom: targetZoom,
      duration: 600,
    });
  }, [radiusFilter, centerLat, centerLng]);

  // 4. Render Markers (HQ + Verified POIs)
  const renderMarkers = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Central Business HQ Marker
    const hqEl = document.createElement('div');
    hqEl.className = 'vittanaya-hq-marker cursor-pointer flex flex-col items-center select-none group';
    hqEl.innerHTML = `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-10 h-10 rounded-full bg-blue-500/30 animate-ping"></div>
        <div class="relative w-6 h-6 rounded-full bg-blue-600 border-2 border-white shadow-[0_0_15px_#3B82F6] flex items-center justify-center text-white text-[11px] font-black">
          ★
        </div>
      </div>
      <div class="mt-1 px-2.5 py-0.5 rounded-md bg-slate-900/90 backdrop-blur-md border border-blue-400 text-[10px] font-black text-blue-200 whitespace-nowrap shadow-xl group-hover:scale-105 transition-transform">
        📍 ${locationName} (HQ)
      </div>
    `;

    const hqMarker = new maplibregl.Marker({ element: hqEl, anchor: 'center' })
      .setLngLat([centerLng, centerLat])
      .addTo(map);
    markersRef.current.push(hqMarker);

    // Filtered POI Markers from verified backend response
    filteredPois.forEach((poi) => {
      if (poi.lat === undefined || poi.lng === undefined || poi.lat === null || poi.lng === null) return;

      const poiEl = document.createElement('div');
      poiEl.className =
        'vittanaya-poi-marker cursor-pointer flex flex-col items-center select-none group transition-transform duration-200 hover:scale-110';

      const isSelected = activePoi?.id === poi.id;
      const dotColor = poi.dot_color || 'bg-blue-400';
      const badgeBg = isSelected
        ? 'bg-blue-600 text-white border-white shadow-xl ring-2 ring-white/80'
        : 'bg-slate-900/95 text-slate-100 border-slate-700/80 shadow-lg hover:border-blue-400';

      poiEl.innerHTML = `
        <div class="px-2 py-1 rounded-lg text-[10px] font-black border backdrop-blur-md flex items-center space-x-1.5 ${badgeBg}">
          <span class="w-2 h-2 rounded-full ${dotColor} shrink-0"></span>
          <span class="truncate max-w-[120px]">${poi.name}</span>
          <span class="text-[9px] text-blue-300 font-bold">(${poi.distance_km}km)</span>
        </div>
        <div class="w-1.5 h-2.5 bg-blue-500 shadow-sm"></div>
      `;

      poiEl.addEventListener('click', (e) => {
        e.stopPropagation();
        if (onSelectPoi) onSelectPoi(poi);
        map.easeTo({
          center: [poi.lng, poi.lat],
          zoom: Math.max(map.getZoom(), 12.5),
          duration: 600,
        });
      });

      const poiMarker = new maplibregl.Marker({ element: poiEl, anchor: 'bottom' })
        .setLngLat([poi.lng, poi.lat])
        .addTo(map);
      markersRef.current.push(poiMarker);
    });
  }, [centerLat, centerLng, filteredPois, activePoi?.id, locationName, onSelectPoi]);

  useEffect(() => {
    renderMarkers();
  }, [renderMarkers]);

  // Resize listener for container mode changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.resize();
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [className]);

  return <div ref={mapContainerRef} className={`w-full h-full ${className}`} />;
}
