// ─────────────────────────────────────────────────────────────────
// API Configuration
// ─────────────────────────────────────────────────────────────────

// Determine API base URL based on environment
const getApiBaseUrl = () => {
    if (typeof window !== 'undefined' && window.location) {
        const hostname = window.location.hostname;
        const port = window.location.port;

        // Local development
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:3000/api';
        }

        // Production or deployed environments
        if (hostname.includes('bloomfinance') || hostname.includes('bloom-')) {
            return `https://${hostname}/api`;
        }
    }

    // Default fallback (browser-safe)
    return 'http://localhost:3000/api';
};

export const API_CONFIG = {
    BASE_URL: getApiBaseUrl(),
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,

    // API Endpoints grouped by resource
    ENDPOINTS: {
        // Auth (Cognito-managed)
        AUTH: {
            SIGNUP: '/auth/signup',
            LOGIN: '/auth/login',
            LOGOUT: '/auth/logout',
            REFRESH: '/auth/refresh',
            CONFIRM_SIGNUP: '/auth/confirm-signup',
            RESEND_CODE: '/auth/resend-code',
            FORGOT_PASSWORD: '/auth/forgot-password',
            CONFIRM_PASSWORD: '/auth/confirm-password',
        },

        // Users
        USERS: {
            GET_PROFILE: '/users/me',
            UPDATE_PROFILE: '/users/me',
            DELETE_ACCOUNT: '/users/me',
        },

        // Onboarding
        ONBOARDING: {
            SUBMIT_QUIZ: '/onboarding/quiz',
            COMPLETE: '/onboarding/complete',
        },

        // Portfolios
        PORTFOLIOS: {
            LIST: '/portfolios',
            GET: '/portfolios/:id',
            INVEST: '/portfolios/:id/invest',
            REBALANCE: '/portfolios/:id/rebalance',
        },

        // Holdings
        HOLDINGS: {
            LIST: '/holdings',
            PERFORMANCE: '/holdings/performance',
        },

        // Transactions
        TRANSACTIONS: {
            DEPOSIT: '/transactions/deposit',
            WITHDRAW: '/transactions/withdraw',
            LIST: '/transactions',
        },

        // Goals
        GOALS: {
            LIST: '/goals',
            CREATE: '/goals',
            UPDATE: '/goals/:id',
            DELETE: '/goals/:id',
        },

        // Markets
        MARKETS: {
            QUOTES: '/markets/quotes',
            INDICES: '/markets/indices',
            SEARCH: '/markets/search',
        },

        // Learn
        LEARN: {
            LIST_ARTICLES: '/learn/articles',
            GET_ARTICLE: '/learn/articles/:slug',
            TRACK_PROGRESS: '/learn/progress',
        },
    }
};

export default API_CONFIG;
