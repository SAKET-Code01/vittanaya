/**
 * Frontend Authentication Service stub.
 * Provides safe integration contract for Phase 1.
 */

import { apiClient } from './apiClient';

export const authService = {
  async getStatus() {
    return apiClient.get('/auth/status');
  },

  async login(email, password) {
    // Placeholder returning structured mock response
    return {
      authenticated: false,
      message: 'Authentication service will be connected in future phase.',
    };
  },

  async logout() {
    return { success: true };
  },
};
