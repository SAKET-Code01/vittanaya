/**
 * Frontend Action Plan & Milestone Service.
 * Connects frontend views to /api/v1/action-plan/* endpoints.
 */

import { apiClient } from './apiClient';

export const actionPlanService = {
  /**
   * Fetch structured action roadmap and milestones for the authorized business.
   */
  async getActionPlan(businessId = null) {
    const params = businessId ? { business_id: businessId } : {};
    return apiClient.get('/action-plan', params);
  },

  /**
   * Update status of a specific milestone or task item.
   */
  async updateTaskStatus(taskId, status, businessId = null) {
    const params = businessId ? { business_id: businessId } : {};
    return apiClient.patch(`/action-plan/tasks/${taskId}`, { status }, params);
  },

  /**
   * Generate an official statutory readiness certificate/DPR package.
   */
  async exportDPRPackage(businessId = null) {
    const params = businessId ? { business_id: businessId } : {};
    return apiClient.post('/action-plan/export-dpr', {}, { params });
  },
};
