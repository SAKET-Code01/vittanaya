/**
 * Environment configuration for frontend client.
 */

export const ENV = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  API_PREFIX: '/api/v1',
  IS_PRODUCTION: import.meta.env.PROD || false,
  DEFAULT_TIMEOUT_MS: 10000,
};
