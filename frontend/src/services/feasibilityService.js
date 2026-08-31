/**
 * Frontend Feasibility & Market Intelligence Service.
 * Connects frontend views to /api/v1/feasibility/* endpoints.
 */

import { apiClient } from './apiClient';

export const feasibilityService = {
  /**
   * Fetch hyper-local feasibility analysis for the given business & location parameters.
   */
  async getFeasibilityReport(businessId = null, params = {}) {
    const queryParams = { ...params };
    if (businessId) queryParams.business_id = businessId;
    return apiClient.get('/feasibility/report', queryParams);
  },

  /**
   * Fetch local catchment intelligence, points of interest, and demand/competition vectors.
   */
  async getCatchmentIntelligence(locationData = {}) {
    return apiClient.post('/feasibility/catchment', locationData);
  },

  /**
   * Request causal score explanation for a viability index or sub-score.
   */
  async getScoreExplanation(scoreId, businessId = null) {
    const params = { score_id: scoreId };
    if (businessId) params.business_id = businessId;
    return apiClient.get('/feasibility/explain', params);
  },
};
