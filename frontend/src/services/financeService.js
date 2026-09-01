/**
 * Frontend Finance & Ledger Service.
 * Connects frontend views to /api/v1/finance/* and /api/v1/dashboard/* endpoints.
 */

import { apiClient } from './apiClient';

export const financeService = {
  /**
   * Fetch financial summary and KPI payload for the authorized business.
   */
  async getDashboardSummary(businessId = null) {
    const params = businessId ? { business_id: businessId } : {};
    return apiClient.get('/dashboard/summary', params);
  },

  /**
   * Fetch transactions for the authorized business.
   */
  async getTransactions(businessId = null, limit = 100) {
    const params = { limit };
    if (businessId) params.business_id = businessId;
    return apiClient.get('/finance/transactions', params);
  },

  /**
   * Post a new ledger transaction.
   */
  async createTransaction(data) {
    return apiClient.post('/finance/transactions', data);
  },

  /**
   * Fetch receivables (dues to collect).
   */
  async getReceivables(businessId = null) {
    const params = businessId ? { business_id: businessId } : {};
    return apiClient.get('/finance/receivables', params);
  },

  /**
   * Create a new receivable entry.
   */
  async createReceivable(data) {
    return apiClient.post('/finance/receivables', data);
  },

  /**
   * Fetch payables (bills to pay).
   */
  async getPayables(businessId = null) {
    const params = businessId ? { business_id: businessId } : {};
    return apiClient.get('/finance/payables', params);
  },

  /**
   * Create a new payable entry.
   */
  async createPayable(data) {
    return apiClient.post('/finance/payables', data);
  },

  /**
   * Calculate project cost, margin money, and institutional loan structure.
   */
  async calculateFundingStructure(payload) {
    return apiClient.post('/finance/funding-structure', payload);
  },

  /**
   * Fetch 12-month deterministic cash-flow & liquidity forecast.
   */
  async getCashFlowForecast(payload) {
    return apiClient.post('/finance/cash-flow', payload);
  },
};
