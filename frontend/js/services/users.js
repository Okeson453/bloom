// ─────────────────────────────────────────────────────────────────
// Users Service
// ─────────────────────────────────────────────────────────────────

import httpClient from './http.js';
import { API_CONFIG } from '../config/api.js';

class UsersService {
    /**
     * Get current user profile
     */
    async getProfile() {
        try {
            const response = await httpClient.get(API_CONFIG.ENDPOINTS.USERS.GET_PROFILE);
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to fetch profile',
            };
        }
    }

    /**
     * Update user profile
     */
    async updateProfile(profile) {
        try {
            const response = await httpClient.put(
                API_CONFIG.ENDPOINTS.USERS.UPDATE_PROFILE,
                profile
            );
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to update profile',
            };
        }
    }

    /**
     * Delete account
     */
    async deleteAccount(password) {
        try {
            const response = await httpClient.delete(API_CONFIG.ENDPOINTS.USERS.DELETE_ACCOUNT, {
                password,
            });
            return {
                success: true,
                message: 'Account deleted successfully',
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to delete account',
            };
        }
    }
}

export default new UsersService();
