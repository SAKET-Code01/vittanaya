/**
 * Frontend Business Profile Service.
 * Connects frontend views to /api/v1/business endpoints.
 */

import { apiClient } from './apiClient';

export const businessService = {
  async getBusiness(businessId = 1) {
    return apiClient.get('/business', { business_id: businessId });
  },

  async createBusiness(data) {
    return apiClient.post('/business', data);
  },

  async updateBusiness(data, businessId = 1) {
    return apiClient.patch('/business', data, { business_id: businessId });
  },
};
