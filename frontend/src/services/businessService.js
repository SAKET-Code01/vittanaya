/**
 * Frontend Business Profile Service.
 * Connects frontend views to /api/v1/business endpoints with dynamic business scoping.
 */

import { apiClient } from './apiClient';

export const businessService = {
  /**
   * Fetch current authorized business profile.
   * If businessId is null, resolves for the active session's authorized business.
   */
  async getBusiness(businessId = null) {
    const params = businessId ? { business_id: businessId } : {};
    return apiClient.get('/business', params);
  },

  /**
   * Create a new business proposal or registration.
   */
  async createBusiness(data) {
    return apiClient.post('/business', data);
  },

  /**
   * Update current authorized business profile.
   */
  async updateBusiness(data, businessId = null) {
    const params = businessId ? { business_id: businessId } : {};
    return apiClient.patch('/business', data, params);
  },
};
