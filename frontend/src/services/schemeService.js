/**
 * Frontend Scheme & Entitlement Service.
 * Connects frontend views directly to VITTANAYA Scheme Match Engine:
 * - POST /api/v1/scheme-match
 */

import { apiClient } from './apiClient';

export const schemeService = {
  /**
   * Discover and match government schemes based on project parameters, social category, and area type.
   */
  async matchSchemes(payload = {}) {
    return apiClient.post('/scheme-match', {
      indicative_project_cost: Number(payload.indicative_project_cost || payload.project_cost || 200000),
      available_margin_capital: Number(payload.available_margin_capital || payload.own_capital || 50000),
      business_category: payload.business_category || payload.category || 'Retail',
      specific_business: payload.specific_business || payload.name || payload.business_activity || 'General Enterprise',
      location: payload.location || payload.location_district || 'Odisha',
      social_category: payload.social_category || 'General',
      area_type: payload.area_type || 'Rural',
    });
  },

  /**
   * Compatibility alias for getMatchedSchemes.
   */
  async getMatchedSchemes(criteria = {}) {
    return this.matchSchemes(criteria);
  },

  /**
   * Get detailed guidelines for a specific scheme code (e.g., PMEGP, MUDRA_SHISHU).
   */
  async getSchemeDetails(schemeCode) {
    const res = await this.matchSchemes({});
    const all = [...(res.eligible_schemes || []), ...(res.ineligible_schemes || [])];
    return all.find((s) => s.scheme_code === schemeCode) || null;
  },

  /**
   * Check eligibility against criteria.
   */
  async checkEligibility(schemeId, userProfile = {}) {
    return this.matchSchemes({ ...userProfile, scheme_id: schemeId });
  },
};
