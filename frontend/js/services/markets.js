// ─────────────────────────────────────────────────────────────────
// Markets Service
// ─────────────────────────────────────────────────────────────────

import httpClient from './http.js';
import { API_CONFIG } from '../config/api.js';

class MarketsService {
    /**
     * Get market quotes
     */
    async getQuotes(symbols) {
        try {
            const response = await httpClient.get(
                API_CONFIG.ENDPOINTS.MARKETS.QUOTES,
                { symbols: Array.isArray(symbols) ? symbols.join(',') : symbols }
            );
            return {
                success: true,
                data: response.data || {},
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to fetch quotes',
                data: {},
            };
        }
    }

    /**
     * Get market indices (S&P 500, Dow Jones, etc.)
     */
    async getIndices() {
        try {
            const response = await httpClient.get(API_CONFIG.ENDPOINTS.MARKETS.INDICES);
            return {
                success: true,
                data: response.data || {},
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to fetch indices',
                data: {},
            };
        }
    }

    /**
     * Search for market assets
     */
    async search(query, type = null) {
        try {
            const params = { q: query };
            if (type) params.type = type;

            const response = await httpClient.get(API_CONFIG.ENDPOINTS.MARKETS.SEARCH, params);
            return {
                success: true,
                data: response.data || [],
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Search failed',
                data: [],
            };
        }
    }
}

export default new MarketsService();
