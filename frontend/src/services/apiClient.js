/**
 * Native fetch-based API Client for VITTANAYA backend communication.
 * Standardizes headers, base URL handling, error parsing, and timeout handling without external dependencies.
 */

import { ENV } from '../config/env';
import { getLocale } from '../locale/LocaleContext';

class ApiClient {
  constructor(baseUrl = `${ENV.API_URL}${ENV.API_PREFIX}`) {
    this.baseUrl = baseUrl;
  }

  /**
   * Translates HTTP status codes and error bodies into friendly, actionable messages.
   */
  parseError(status, errorBody = {}) {
    if (errorBody && errorBody.detail) {
      if (typeof errorBody.detail === 'string') {
        return errorBody.detail;
      }
      if (Array.isArray(errorBody.detail)) {
        return errorBody.detail
          .map((e) => (typeof e === 'string' ? e : `${e.loc?.filter((l) => l !== 'body').join('.') || 'Field'}: ${e.msg || 'invalid entry'}`))
          .join('; ');
      }
      if (typeof errorBody.detail === 'object' && errorBody.detail.message) {
        return errorBody.detail.message;
      }
    }

    switch (status) {
      case 400:
        return 'The calculation request parameters were invalid. Please check your entries.';
      case 401:
        return 'Your session has expired. Please sign in again.';
      case 403:
        return 'You do not have permission to access this business workspace.';
      case 404:
        return "We couldn't find the requested business information.";
      case 422:
        return 'Some required information needs correction. Please review your entries.';
      case 500:
      case 502:
      case 503:
        return 'The analytical calculation service is temporarily unavailable. Please verify the backend is running and try again.';
      default:
        return `Unable to complete request (${status}). Please verify that the backend is running.`;
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Accept-Language': getLocale ? getLocale() : 'en',
      ...options.headers,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || ENV.DEFAULT_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errJson = null;
        try {
          errJson = await response.json();
        } catch {
          // Response body was not JSON
        }
        const errorDetail = this.parseError(response.status, errJson);
        const error = new Error(errorDetail);
        error.status = response.status;
        error.code = response.status >= 500 ? 'HTTP_5XX' : (response.status >= 400 ? 'HTTP_4XX' : 'HTTP_ERROR');
        error.response = errJson;
        throw error;
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        const timeoutErr = new Error('Request timed out. Please verify the calculation server is reachable.');
        timeoutErr.code = 'TIMEOUT';
        timeoutErr.status = 408;
        throw timeoutErr;
      }
      if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.message.includes('Load failed') || error.message.includes('ECONNREFUSED'))) {
        const netErr = new Error('Unable to load business financial data. Please verify that the backend is running and try again.');
        netErr.code = 'NETWORK_ERROR';
        netErr.status = 0;
        throw netErr;
      }
      throw error;
    }
  }

  get(endpoint, params = {}, options = {}) {
    const query = new URLSearchParams(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null)
    ).toString();
    const fullEndpoint = query ? `${endpoint}?${query}` : endpoint;
    return this.request(fullEndpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  patch(endpoint, body, params = {}, options = {}) {
    const query = new URLSearchParams(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null)
    ).toString();
    const fullEndpoint = query ? `${endpoint}?${query}` : endpoint;
    return this.request(fullEndpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  delete(endpoint, params = {}, options = {}) {
    const query = new URLSearchParams(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null)
    ).toString();
    const fullEndpoint = query ? `${endpoint}?${query}` : endpoint;
    return this.request(fullEndpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
