/**
 * Map Provider Abstraction & Data Constants for VITTANAYA
 */

export const PROVIDER_MAPLIBRE = 'maplibre';
export const PROVIDER_GOOGLE_3D = 'google3d';

/**
 * Returns the Google Maps API Key if configured in Vite environment variables.
 * Never hardcodes credentials.
 */
export function getGoogleMapsApiKey() {
  const key = import.meta.env?.VITE_GOOGLE_MAPS_API_KEY;
  return key && typeof key === 'string' && key.trim().length > 0 ? key.trim() : null;
}

/**
 * Checks whether Google Photorealistic 3D is configured.
 */
export function isGoogle3DConfigured() {
  return Boolean(getGoogleMapsApiKey());
}

/**
 * Generate a GeoJSON polygon approximating a circle on WGS84 coordinates.
 */
export function createGeoJSONCircle(centerLng, centerLat, radiusInKm, points = 64) {
  const coords = [];
  const distanceX = radiusInKm / (111.32 * Math.cos((centerLat * Math.PI) / 180));
  const distanceY = radiusInKm / 110.574;

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    coords.push([centerLng + x, centerLat + y]);
  }
  coords.push(coords[0]);

  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [coords],
    },
    properties: {
      radius: radiusInKm,
    },
  };
}

/**
 * Provenance badge configurations.
 */
export const PROVENANCE_CONFIGS = {
  VERIFIED_LOCAL: {
    label: '✓ VERIFIED LOCAL',
    desc: 'Government Directory / District Registry Verified',
    badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
    dotClass: 'bg-emerald-400',
  },
  BENCHMARK_ESTIMATE: {
    label: '⚡ BENCHMARK ESTIMATE',
    desc: 'State Industry & Statistical PLP Benchmark',
    badgeClass: 'bg-blue-950/80 text-blue-300 border-blue-500/40',
    dotClass: 'bg-blue-400',
  },
  USER_PROVIDED: {
    label: '👤 USER PROVIDED',
    desc: 'Entrepreneur Stated Inflow / Self Reported',
    badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
    dotClass: 'bg-amber-400',
  },
  CALCULATED: {
    label: '📐 CALCULATED',
    desc: 'Derived via Spatial Geometry & AHP Weightings',
    badgeClass: 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40',
    dotClass: 'bg-indigo-400',
  },
  INSUFFICIENT_DATA: {
    label: '⚠️ INSUFFICIENT LOCAL DATA',
    desc: 'No Verified Records Found for Catchment',
    badgeClass: 'bg-rose-950/80 text-rose-300 border-rose-500/40',
    dotClass: 'bg-rose-400',
  },
};
