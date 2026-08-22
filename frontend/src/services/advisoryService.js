/**
 * Frontend Advisory Service.
 * Connects frontend views to /api/v1/advisory/* endpoints.
 */

import { apiClient } from './apiClient';

export const advisoryService = {
  async getStatus() {
    return apiClient.get('/advisory/status');
  },
};
