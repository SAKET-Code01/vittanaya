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
      business_category: payload.business_category || payload.category || 'Retail',
      specific_business: payload.specific_business || payload.business_activity || payload.name || 'General Enterprise',
      location: payload.location || payload.location_district || 'Odisha',
      scale: payload.scale || null,
    });
  },

  /**
   * Lookup official indicative project cost from 200+ Odisha cost library.
   */
  async getProjectCost(payload) {
    return apiClient.post('/project-cost', {
      business_activity: payload.business_activity || payload.specific_business || payload.name || 'Commercial Broiler Farming',
      business_category: payload.business_category || payload.category || null,
      location: payload.location || payload.location_district || 'Odisha',
      scale: payload.scale || null,
    });
  },

  /**
   * Evaluate multi-dimensional risk exposure.
   */
  async analyzeRisk(payload) {
    return apiClient.post('/risk-analysis', {
      business_category: payload.business_category || payload.category || 'General',
      specific_business: payload.specific_business || payload.name || 'General Enterprise',
      indicative_project_cost: Number(payload.indicative_project_cost || payload.project_cost || 200000),
      available_margin_capital: Number(payload.available_margin_capital || payload.own_capital || 50000),
      financing_requirement: Number(payload.financing_requirement || 150000),
      location: payload.location || payload.location_district || 'Odisha',
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
      available_margin_capital: Number(payload.available_margin_capital || payload.own_capital || 50000),
      business_category: payload.business_category || payload.category || 'Retail',
      specific_business: payload.specific_business || payload.name || payload.business_activity || 'General Enterprise',
      location: payload.location || payload.location_district || 'Odisha',
      scale: payload.scale || null,
      social_category: payload.social_category || 'General',
      area_type: payload.area_type || 'Rural',
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
    return apiClient.get('/feasibility', { score_id: scoreId });
  },
};
