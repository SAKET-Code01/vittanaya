/**
 * Frontend Advisory Service.
 * Connects frontend views to /api/v1/advisory/* endpoints.
 */

import { apiClient } from './apiClient';

export const advisoryService = {
  /**
   * Get advisory engine operational status.
   */
  async getStatus() {
    return apiClient.get('/advisory/status');
  },

  /**
   * Send entrepreneur question to real backend API grounded chatbot.
   * @param {Object} payload - ChatRequest object
   */
  async sendChatMessage(payload) {
    return apiClient.post('/advisory/chat', payload);
  },
};
