// ─────────────────────────────────────────────────────────────────
// Goals Service
// ─────────────────────────────────────────────────────────────────

import httpClient from './http.js';
import { API_CONFIG } from '../config/api.js';

class GoalsService {
    /**
     * List user goals
     */
    async listGoals() {
        try {
            const response = await httpClient.get(API_CONFIG.ENDPOINTS.GOALS.LIST);
            return {
                success: true,
                data: response.data || [],
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to fetch goals',
                data: [],
            };
        }
    }

    /**
     * Create new goal
     */
    async createGoal(goal) {
        try {
            const response = await httpClient.post(
                API_CONFIG.ENDPOINTS.GOALS.CREATE,
                goal
            );
            return {
                success: true,
                data: response.data,
                message: 'Goal created successfully',
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to create goal',
            };
        }
    }

    /**
     * Update goal
     */
    async updateGoal(id, goal) {
        try {
            const response = await httpClient.put(
                API_CONFIG.ENDPOINTS.GOALS.UPDATE,
                goal,
                { id }
            );
            return {
                success: true,
                data: response.data,
                message: 'Goal updated successfully',
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to update goal',
            };
        }
    }

    /**
     * Delete goal
     */
    async deleteGoal(id) {
        try {
            const response = await httpClient.delete(
                API_CONFIG.ENDPOINTS.GOALS.DELETE,
                { id }
            );
            return {
                success: true,
                message: 'Goal deleted successfully',
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to delete goal',
            };
        }
    }
}

export default new GoalsService();
