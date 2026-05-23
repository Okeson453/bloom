// ─────────────────────────────────────────────────────────────────
// HTTP Client Service
// ─────────────────────────────────────────────────────────────────

import { API_CONFIG } from '../config/api.js';

class HttpClient {
    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
        this.timeout = API_CONFIG.TIMEOUT;
        this.authToken = localStorage.getItem('bloom_auth_token') || null;
        this.refreshToken = localStorage.getItem('bloom_refresh_token') || null;
    }

    /**
     * Set authentication tokens
     */
    setAuthTokens(accessToken, refreshToken, idToken) {
        this.authToken = accessToken;
        this.refreshToken = refreshToken;

        localStorage.setItem('bloom_auth_token', accessToken);
        if (refreshToken) localStorage.setItem('bloom_refresh_token', refreshToken);
        if (idToken) localStorage.setItem('bloom_id_token', idToken);
    }

    /**
     * Clear authentication tokens
     */
    clearAuthTokens() {
        this.authToken = null;
        this.refreshToken = null;

        localStorage.removeItem('bloom_auth_token');
        localStorage.removeItem('bloom_refresh_token');
        localStorage.removeItem('bloom_id_token');
    }

    /**
     * Get authentication headers
     */
    getAuthHeaders() {
        const headers = {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        };

        if (this.authToken) {
            headers['Authorization'] = `Bearer ${this.authToken}`;
        }

        return headers;
    }

    /**
     * Build full URL from endpoint
     */
    buildUrl(endpoint, params = {}) {
        let url = `${this.baseURL}${endpoint}`;

        // Replace path parameters
        Object.entries(params).forEach(([key, value]) => {
            url = url.replace(`:${key}`, value);
        });

        return url;
    }

    /**
     * Make HTTP request with retry logic
     */
    async request(method, endpoint, data = null, params = {}, options = {}) {
        const url = this.buildUrl(endpoint, params);
        const headers = this.getAuthHeaders();

        // Skip authorization header if requested (e.g., for token refresh)
        if (options.skipAuth) {
            delete headers['Authorization'];
        }

        const fetchOptions = {
            method,
            headers,
            ...options,
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            fetchOptions.body = JSON.stringify(data);
        }

        // Add query parameters for GET requests
        if (method === 'GET' && Object.keys(data || {}).length > 0) {
            const queryParams = new URLSearchParams(data);
            url += `?${queryParams.toString()}`;
        }

        let lastError;

        // Retry logic
        for (let attempt = 0; attempt < API_CONFIG.RETRY_ATTEMPTS; attempt++) {
            try {
                const response = await Promise.race([
                    fetch(url, fetchOptions),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Request timeout')), this.timeout)
                    ),
                ]);

                // Handle 401 - token refresh
                if (response.status === 401 && this.refreshToken && attempt === 0) {
                    await this.refreshAuthToken();
                    return this.request(method, endpoint, data, params, options);
                }

                const responseData = await response.json().catch(() => null);

                if (!response.ok) {
                    throw {
                        status: response.status,
                        message: responseData?.error || response.statusText,
                        details: responseData,
                    };
                }

                return {
                    success: true,
                    status: response.status,
                    data: responseData,
                };

            } catch (error) {
                lastError = error;

                // Don't retry on client errors (4xx)
                if (error.status && error.status >= 400 && error.status < 500) {
                    throw error;
                }

                // Wait before retry
                if (attempt < API_CONFIG.RETRY_ATTEMPTS - 1) {
                    await new Promise(resolve =>
                        setTimeout(resolve, API_CONFIG.RETRY_DELAY * (attempt + 1))
                    );
                }
            }
        }

        throw lastError || new Error('Request failed after retries');
    }

    /**
     * Refresh authentication token
     */
    async refreshAuthToken() {
        try {
            const response = await this.request(
                'POST',
                API_CONFIG.ENDPOINTS.AUTH.REFRESH,
                { refresh_token: this.refreshToken },
                {},
                { skipAuth: true }
            );

            if (response.success && response.data.accessToken) {
                this.setAuthTokens(
                    response.data.accessToken,
                    response.data.refreshToken || this.refreshToken,
                    response.data.idToken
                );
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
            this.clearAuthTokens();
            // Redirect to login
            window.location.hash = '#/login';
        }
    }

    // ────────────────────────────────────────────────────────────
    // HTTP Methods
    // ────────────────────────────────────────────────────────────

    async get(endpoint, params = {}, options = {}) {
        return this.request('GET', endpoint, params, {}, options);
    }

    async post(endpoint, data = {}, params = {}, options = {}) {
        return this.request('POST', endpoint, data, params, options);
    }

    async put(endpoint, data = {}, params = {}, options = {}) {
        return this.request('PUT', endpoint, data, params, options);
    }

    async delete(endpoint, params = {}, options = {}) {
        return this.request('DELETE', endpoint, null, params, options);
    }
}

export default new HttpClient();
