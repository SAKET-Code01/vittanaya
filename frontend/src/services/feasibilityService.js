/**
 * Frontend Feasibility & Market Intelligence Service.
 * Connects frontend views directly to VITTANAYA Insights endpoints:
 * - POST /api/v1/feasibility
 * - POST /api/v1/project-cost
 * - POST /api/v1/risk-analysis
 * - POST /api/v1/simulation
 * - POST /api/v1/analyze (Unified Intelligence)
 * - POST /api/v1/advisor (AI Business Advisor)
 */

import { apiClient } from './apiClient';

export const feasibilityService = {
  /**
   * Fetch hyper-local feasibility analysis for the given business & location parameters.
   */
  async analyzeFeasibility(payload) {
    return apiClient.post('/feasibility', {
      business_id: payload.business_id || payload.id || null,
      business_name: payload.business_name || payload.name || payload.businessName || null,
      business_category: payload.business_category || payload.category || 'Retail',
      specific_business: payload.specific_business || payload.business_activity || payload.industry || payload.category || 'General Enterprise',
      location: payload.location || payload.location_district || payload.district || 'Odisha',
      scale: payload.scale || null,
    });
  },

  /**
   * Lookup official indicative project cost from 200+ Odisha cost library.
   */
  async getProjectCost(payload) {
    return apiClient.post('/project-cost', {
      business_id: payload.business_id || payload.id || null,
      business_name: payload.business_name || payload.name || payload.businessName || null,
      business_activity: payload.business_activity || payload.industry || payload.specific_business || payload.category || 'Commercial Broiler Farming',
      business_category: payload.business_category || payload.category || null,
      location: payload.location || payload.location_district || payload.district || 'Odisha',
      scale: payload.scale || null,
    });
  },

  /**
   * Evaluate multi-dimensional risk exposure.
   */
  async analyzeRisk(payload) {
    return apiClient.post('/risk-analysis', {
      business_id: payload.business_id || payload.id || null,
      business_name: payload.business_name || payload.name || payload.businessName || null,
      business_category: payload.business_category || payload.category || 'General',
      specific_business: payload.business_activity || payload.industry || payload.specific_business || payload.category || 'General Enterprise',
      indicative_project_cost: Number(payload.indicative_project_cost || payload.project_cost || 200000),
      available_margin_capital: Number(payload.available_margin_capital || payload.own_capital || 50000),
      financing_requirement: Number(payload.financing_requirement || 150000),
      location: payload.location || payload.location_district || payload.district || 'Odisha',
      seasonality_factor: payload.seasonality_factor || null,
    });
  },

  /**
   * Run isolated What-If scenario simulation without mutating baseline.
   */
  async runSimulation(payload) {
    return apiClient.post('/simulation', {
      baseline_project_cost: Number(payload.baseline_project_cost || 200000),
      baseline_available_margin: Number(payload.baseline_available_margin || 50000),
      baseline_sales_annual: Number(payload.baseline_sales_annual || 600000),
      baseline_operating_cost_annual: Number(payload.baseline_operating_cost_annual || 400000),
      sales_change: Number(payload.sales_change || 0.0),
      cost_change: Number(payload.cost_change || 0.0),
      price_change: Number(payload.price_change || 0.0),
      financing_change: Number(payload.financing_change || 0.0),
      demand_change: Number(payload.demand_change || 0.0),
    });
  },

  /**
   * Run full Unified Insights analysis across all 6 engines.
   */
  async getUnifiedInsights(payload) {
    return apiClient.post('/insights/analyze', {
      business_id: payload.business_id || payload.id || null,
      business_name: payload.business_name || payload.name || payload.businessName || null,
      business_activity: payload.business_activity || payload.industry || payload.category || null,
      available_margin_capital: Number(payload.available_margin_capital || payload.own_capital || payload.ownCapital || 50000),
      business_category: payload.business_category || payload.category || payload.businessType || 'General',
      specific_business: payload.business_activity || payload.industry || payload.specific_business || payload.category || 'General Enterprise',
      location: payload.location || payload.location_district || payload.district || 'Odisha',
      scale: payload.scale || null,
      social_category: payload.social_category || payload.socialCategory || 'General',
      area_type: payload.area_type || payload.areaType || 'Rural',
      baseline_sales_annual: payload.baseline_sales_annual ? Number(payload.baseline_sales_annual) : null,
      baseline_operating_cost_annual: payload.baseline_operating_cost_annual ? Number(payload.baseline_operating_cost_annual) : null,
      simulation_inputs: payload.simulation_inputs || null,
    });
  },

  /**
   * Request AI Business Advisor synthesis over structured results.
   */
  async getAdvisorAdvice(payload) {
    return apiClient.post('/advisor', payload);
  },

  /**
   * Fetch authoritative AHP criterion weights and audit trail.
   */
  async getAhpWeights() {
    return apiClient.get('/ahp/weights');
  },

  /**
   * Fetch authoritative AHP-weighted feasibility score and per-criterion lineage for a persisted business.
   */
  async getBusinessFeasibility(businessId) {
    return apiClient.get(`/ahp/business-feasibility/${businessId}`);
  },

  /**
   * Fetch 8-step AHP scoring methodology guide and multi-expert dataset.
   */
  async getMethodologyGuide() {
    return apiClient.get('/ahp/methodology-guide');
  },

  /**
   * Compute dynamic AHP-weighted score from 5 raw criterion scores (0-100 scale).
   */
  async calculateWeightedScore(rawScores, rawScoreSources = {}) {
    return apiClient.post('/ahp/calculate-feasibility', {
      raw_scores: rawScores,
      raw_score_sources: rawScoreSources,
    });
  },

  /**
   * Compatibility alias for feasibility report.
   */
  async getFeasibilityReport(businessId = null, params = {}) {
    return this.analyzeFeasibility(params);
  },

  /**
   * Compatibility alias for catchment intelligence.
   */
  async getCatchmentIntelligence(locationData = {}) {
    return this.analyzeFeasibility(locationData);
  },

  /**
   * Compatibility alias for score explanation.
   */
  async getScoreExplanation(scoreId, businessId = null) {
    if (businessId) {
      return this.getBusinessFeasibility(businessId);
    }
    return apiClient.get('/feasibility', { score_id: scoreId });
  },
};

