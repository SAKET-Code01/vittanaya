/**
 * Frontend Finance & Ledger Service.
 * Connects frontend views to /api/v1/finance/* and /api/v1/dashboard/* endpoints.
 */

import { apiClient } from './apiClient';

export const financeService = {
  async getDashboardSummary(businessId = 1) {
    return apiClient.get('/dashboard/summary', { business_id: businessId });
  },

  async getTransactions(businessId = 1, limit = 100) {
    return apiClient.get('/finance/transactions', { business_id: businessId, limit });
  },

  async createTransaction(data) {
    return apiClient.post('/finance/transactions', data);
  },

  async getReceivables(businessId = 1) {
    return apiClient.get('/finance/receivables', { business_id: businessId });
  },

  async createReceivable(data) {
    return apiClient.post('/finance/receivables', data);
  },

  async getPayables(businessId = 1) {
    return apiClient.get('/finance/payables', { business_id: businessId });
  },

  async createPayable(data) {
    return apiClient.post('/finance/payables', data);
  },
};
