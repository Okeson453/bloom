// ─────────────────────────────────────────────────────────────────
// API Configuration
// ─────────────────────────────────────────────────────────────────

// Determine API base URL based on environment
const getApiBaseUrl = () => {
    if (typeof window !== 'undefined' && window.location) {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;

        // Local development
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:3001/api';
        }

        // Production or deployed environments
        // If frontend and backend are on different Vercel projects/domains, 
        // you MUST set the backend URL explicitly
        
        // Check for environment variable set at build time
        if (typeof window !== 'undefined' && window.__BACKEND_URL__) {
            return window.__BACKEND_URL__;
        }

        // For development: if running on Vercel preview/production,
        // assume backend is at a specific domain pattern
        // IMPORTANT: Update this to match your actual backend deployment URL
        if (hostname.includes('bloom')) {
            // Example: if frontend is at bloom-frontend.vercel.app
            // Update backend URL to your actual backend deployment
            return 'https://bloom-drj4684uf-okesons-projects.vercel.app/api';
        }

        // Fallback: try same origin (works if frontend and backend share the same domain)
        return `${protocol}//${hostname}/api`;
    }

    // Fallback for SSR/edge environments
    return '/api';
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
