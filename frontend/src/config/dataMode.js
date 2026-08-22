/**
 * Data Mode Configuration
 *
 * Controlled integration boundary between prototype mock state and production backend API.
 * - DEMO: Isolated preset data for presentations (no persistence/backend calls).
 * - LOCAL: Browser localStorage state.
 * - API: Production REST API integration with FastAPI backend.
 */

export const DATA_MODE = {
  DEMO: 'DEMO',
  LOCAL: 'LOCAL',
  API: 'API',
};

// Default mode maintains isolated demo compatibility while enabling progressive API migration
export const CURRENT_DATA_MODE = DATA_MODE.DEMO;
