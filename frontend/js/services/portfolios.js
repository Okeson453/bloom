// ─────────────────────────────────────────────────────────────────
// Portfolios Service
// ─────────────────────────────────────────────────────────────────

import httpClient from './http.js';
import { API_CONFIG } from '../config/api.js';

class PortfoliosService {
    /**
     * List all available portfolios
     */
    async listPortfolios(filters = {}) {
        try {
            const response = await httpClient.get(
                API_CONFIG.ENDPOINTS.PORTFOLIOS.LIST,
                filters
            );
            return {
                success: true,
                data: response.data || [],
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to fetch portfolios',
                data: [],
            };
        }
    }

    /**
     * Get single portfolio details
     */
    async getPortfolio(id) {
        try {
            const response = await httpClient.get(
                API_CONFIG.ENDPOINTS.PORTFOLIOS.GET,
                {},
                { id }
            );
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to fetch portfolio',
            };
        }
    }

    /**
     * Invest in a portfolio
     */
    async invest(id, amount) {
        try {
            const response = await httpClient.post(
                API_CONFIG.ENDPOINTS.PORTFOLIOS.INVEST,
                { amount },
                { id }
            );
            return {
                success: true,
                data: response.data,
                message: 'Investment successful',
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Investment failed',
            };
        }
    }

    /**
     * Rebalance portfolio
     */
    async rebalance(id) {
        try {
            const response = await httpClient.post(
                API_CONFIG.ENDPOINTS.PORTFOLIOS.REBALANCE,
                {},
                { id }
            );
            return {
                success: true,
                data: response.data,
                message: 'Portfolio rebalanced',
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Rebalancing failed',
            };
        }
    }
}

export default new PortfoliosService();
