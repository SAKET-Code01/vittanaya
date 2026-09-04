/**
 * Frontend Business Readiness & Requirement Tracking Service.
 * Connects frontend views to /api/v1/readiness/* endpoints.
 */

import { apiClient } from './apiClient';

export const readinessService = {
  /**
   * Fetch authoritative readiness evaluation, scores, and category breakdowns.
   */
  async getReadiness(businessId) {
    if (!businessId) return null;
    return apiClient.get(`/readiness/${businessId}`);
  },

  /**
   * Fetch list of resolved requirements and statutory gates for business.
   */
  async getRequirements(businessId) {
    if (!businessId) return [];
    return apiClient.get(`/readiness/${businessId}/requirements`);
  },

  /**
   * Update statutory requirement verification or completion status.
   */
  async updateRequirement(businessId, requirementId, payload) {
    return apiClient.patch(`/readiness/${businessId}/requirements/${requirementId}`, payload);
  },
};
