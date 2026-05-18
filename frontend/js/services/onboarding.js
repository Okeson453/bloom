// ─────────────────────────────────────────────────────────────────
// Onboarding Service
// ─────────────────────────────────────────────────────────────────

import httpClient from './http.js';
import { API_CONFIG } from '../config/api.js';

class OnboardingService {
    /**
     * Submit quiz answers
     */
    async submitQuiz(answers) {
        try {
            const response = await httpClient.post(
                API_CONFIG.ENDPOINTS.ONBOARDING.SUBMIT_QUIZ,
                { answers }
            );
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to submit quiz',
            };
        }
    }

    /**
     * Complete onboarding
     */
    async complete(portfolioChoice) {
        try {
            const response = await httpClient.post(
                API_CONFIG.ENDPOINTS.ONBOARDING.COMPLETE,
                { portfolioChoice }
            );
            return {
                success: true,
                message: 'Onboarding completed',
                data: response.data,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to complete onboarding',
            };
        }
    }
}

export default new OnboardingService();
