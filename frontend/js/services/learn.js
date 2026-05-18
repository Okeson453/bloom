// ─────────────────────────────────────────────────────────────────
// Learn Service
// ─────────────────────────────────────────────────────────────────

import httpClient from './http.js';
import { API_CONFIG } from '../config/api.js';

class LearnService {
    /**
     * List learning articles
     */
    async listArticles(filters = {}) {
        try {
            const response = await httpClient.get(
                API_CONFIG.ENDPOINTS.LEARN.LIST_ARTICLES,
                filters
            );
            return {
                success: true,
                data: response.data || [],
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to fetch articles',
                data: [],
            };
        }
    }

    /**
     * Get single article
     */
    async getArticle(slug) {
        try {
            const response = await httpClient.get(
                API_CONFIG.ENDPOINTS.LEARN.GET_ARTICLE,
                {},
                { slug }
            );
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to fetch article',
            };
        }
    }

    /**
     * Track learning progress
     */
    async trackProgress(articleId, completed = true) {
        try {
            const response = await httpClient.post(
                API_CONFIG.ENDPOINTS.LEARN.TRACK_PROGRESS,
                { articleId, completed }
            );
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to track progress',
            };
        }
    }
}

export default new LearnService();
