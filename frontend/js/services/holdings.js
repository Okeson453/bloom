// ─────────────────────────────────────────────────────────────────
// Holdings Service
// ─────────────────────────────────────────────────────────────────

import httpClient from './http.js';
import { API_CONFIG } from '../config/api.js';

class HoldingsService {
    /**
     * List user holdings
     */
    async listHoldings() {
        try {
            const response = await httpClient.get(API_CONFIG.ENDPOINTS.HOLDINGS.LIST);
            return {
                success: true,
                data: response.data || [],
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to fetch holdings',
                data: [],
            };
        }
    }

    /**
     * Get holdings performance
     */
    async getPerformance(period = '1M') {
        try {
            const response = await httpClient.get(
                API_CONFIG.ENDPOINTS.HOLDINGS.PERFORMANCE,
                { period }
            );
            return {
                success: true,
                data: response.data || {},
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to fetch performance',
                data: {},
            };
        }
    }
}

export default new HoldingsService();
