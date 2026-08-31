/**
 * Frontend Scheme & Entitlement Service.
 * Connects frontend views to /api/v1/schemes/* endpoints.
 */

import { apiClient } from './apiClient';

export const schemeService = {
  /**
   * Discover and match government schemes based on social category, area type, and project size.
   */
  async getMatchedSchemes(criteria = {}) {
    return apiClient.post('/schemes/match', criteria);
  },

  /**
   * Get detailed guidelines, subsidy limits, and eligibility criteria for a specific scheme.
   */
  async getSchemeDetails(schemeId) {
    return apiClient.get(`/schemes/${schemeId}`);
  },

  /**
   * Check eligibility against required documents and missing prerequisites.
   */
  async checkEligibility(schemeId, userProfile = {}) {
    return apiClient.post(`/schemes/${schemeId}/eligibility`, userProfile);
  },
};
