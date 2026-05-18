// ─────────────────────────────────────────────────────────────────
// Authentication Service
// ─────────────────────────────────────────────────────────────────

import httpClient from './http.js';
import { API_CONFIG } from '../config/api.js';

class AuthService {
    constructor() {
        this.isAuthenticated = !!localStorage.getItem('bloom_auth_token');
        this.user = this.loadUser();
    }

    /**
     * Load user from localStorage
     */
    loadUser() {
        const userJson = localStorage.getItem('bloom_user');
        return userJson ? JSON.parse(userJson) : null;
    }

    /**
     * Save user to localStorage
     */
    saveUser(user) {
        this.user = user;
        localStorage.setItem('bloom_user', JSON.stringify(user));
    }

    /**
     * Sign up new user
     */
    async signup(email, password, firstName, lastName) {
        try {
            const response = await httpClient.post(API_CONFIG.ENDPOINTS.AUTH.SIGNUP, {
                email,
                password,
                given_name: firstName,
                family_name: lastName,
            });

            return {
                success: true,
                message: 'Signup successful. Please check your email to verify.',
                userId: response.data?.userId,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Signup failed',
                details: error.details,
            };
        }
    }

    /**
     * Confirm signup with verification code
     */
    async confirmSignup(email, code) {
        try {
            const response = await httpClient.post(
                API_CONFIG.ENDPOINTS.AUTH.CONFIRM_SIGNUP,
                { email, code }
            );

            return {
                success: true,
                message: 'Email verified successfully',
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Verification failed',
            };
        }
    }

    /**
     * Login user
     */
    async login(email, password) {
        try {
            const response = await httpClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
                email,
                password,
            });

            if (response.success && response.data) {
                const { accessToken, refreshToken, idToken, user } = response.data;

                // Set tokens
                httpClient.setAuthTokens(accessToken, refreshToken, idToken);
                this.isAuthenticated = true;

                // Save user info
                if (user) {
                    this.saveUser(user);
                }

                return {
                    success: true,
                    message: 'Login successful',
                    user,
                };
            }
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Login failed',
                details: error.details,
            };
        }
    }

    /**
     * Logout user
     */
    async logout() {
        try {
            await httpClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {});
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            httpClient.clearAuthTokens();
            this.isAuthenticated = false;
            this.user = null;
            localStorage.removeItem('bloom_user');
        }
    }

    /**
     * Resend verification code
     */
    async resendCode(email) {
        try {
            const response = await httpClient.post(
                API_CONFIG.ENDPOINTS.AUTH.RESEND_CODE,
                { email }
            );

            return {
                success: true,
                message: 'Verification code sent',
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to resend code',
            };
        }
    }

    /**
     * Request password reset
     */
    async forgotPassword(email) {
        try {
            const response = await httpClient.post(
                API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD,
                { email }
            );

            return {
                success: true,
                message: 'Reset instructions sent to email',
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to reset password',
            };
        }
    }

    /**
     * Confirm password reset
     */
    async confirmPassword(email, code, newPassword) {
        try {
            const response = await httpClient.post(
                API_CONFIG.ENDPOINTS.AUTH.CONFIRM_PASSWORD,
                { email, code, newPassword }
            );

            return {
                success: true,
                message: 'Password reset successful',
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Password reset failed',
            };
        }
    }

    /**
     * Check if user is authenticated
     */
    isLoggedIn() {
        return this.isAuthenticated && !!httpClient.authToken;
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        return this.user;
    }

    /**
     * Get auth token
     */
    getAuthToken() {
        return httpClient.authToken;
    }
}

export default new AuthService();
