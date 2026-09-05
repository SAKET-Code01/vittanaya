/**
 * Frontend Scheme & Entitlement Service.
 * Connects frontend views directly to VITTANAYA Government Scheme Intelligence Engine:
 * - GET /api/v1/schemes/match
 * - POST /api/v1/scheme-match (legacy fallback)
 */

import { apiClient } from './apiClient';

export const schemeService = {
  /**
   * Discover and match government schemes based on project parameters, social category, and area type.
   * Calls GET /api/v1/schemes/match using deterministic rules against verified scheme database.
   */
  async matchSchemes(payload = {}) {
    const businessType =
      payload.business_type ||
      payload.specific_business ||
      payload.business_activity ||
      payload.category ||
      payload.business_category ||
      'General Enterprise';
    const location = payload.location || payload.location_district || payload.district || 'Odisha';
    const investment = Number(
      payload.investment ||
      payload.indicative_project_cost ||
      payload.project_cost ||
      payload.estimatedProjectCost ||
      1000000
    );
    const ownCapital = Number(
      payload.own_capital ||
      payload.available_margin_capital ||
      payload.ownCapital ||
      0
    );
    const beneficiaryCategory =
      payload.beneficiary_category ||
      payload.social_category ||
      payload.socialCategory ||
      'General';
    const areaClassification =
      payload.area_classification ||
      payload.area_type ||
      payload.areaType ||
      'Rural';

    try {
      return await apiClient.get('/schemes/match', {
        business_type: businessType,
        location: location,
        investment: investment,
        own_capital: ownCapital,
        beneficiary_category: beneficiaryCategory,
        area_classification: areaClassification,
      });
    } catch (err) {
      console.warn('GET /schemes/match fallback to POST /scheme-match:', err);
      return await apiClient.post('/scheme-match', {
        indicative_project_cost: investment,
        available_margin_capital: ownCapital,
        business_category: payload.business_category || payload.category || businessType,
        specific_business: businessType,
        location: location,
        social_category: beneficiaryCategory,
        area_type: areaClassification,
      });
    }
  },

  /**
   * Compatibility alias for getMatchedSchemes.
   */
  async getMatchedSchemes(criteria = {}) {
    return this.matchSchemes(criteria);
  },

  /**
   * Get detailed guidelines for a specific scheme code (e.g., PMEGP, MUDRA_TARUN, AIF).
   */
  async getSchemeDetails(schemeCode, criteria = {}) {
    const res = await this.matchSchemes(criteria);
    const all = [
      ...(res.ranked_schemes || []),
      ...(res.eligible_schemes || []),
      ...(res.ineligible_schemes || []),
    ];
    return all.find((s) => s.scheme_code === schemeCode) || null;
  },

  /**
   * Check eligibility against criteria.
   */
  async checkEligibility(schemeId, userProfile = {}) {
    return this.matchSchemes({ ...userProfile, scheme_id: schemeId });
  },
};
