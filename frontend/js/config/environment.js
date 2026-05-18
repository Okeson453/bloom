// ─────────────────────────────────────────────────────────────────
// Environment Configuration
// ─────────────────────────────────────────────────────────────────
// Copy this file to .env.local and update values

// Application Environment
export const ENVIRONMENT = process.env.REACT_APP_ENV || 'development';

// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || (() => {
    if (ENVIRONMENT === 'production') {
        return 'https://api.bloomfinance.com/api/v1';
    }
    if (ENVIRONMENT === 'staging') {
        return 'https://api-staging.bloomfinance.com/api/v1';
    }
    return 'http://localhost:3000/v1'; // Local development
})();

// Feature Flags
export const FEATURES = {
    ENABLE_CRYPTO: process.env.REACT_APP_ENABLE_CRYPTO === 'true' || ENVIRONMENT === 'production',
    ENABLE_GOALS: process.env.REACT_APP_ENABLE_GOALS === 'true' || true,
    ENABLE_LEARN: process.env.REACT_APP_ENABLE_LEARN === 'true' || true,
    ENABLE_ADVANCED_ANALYTICS: process.env.REACT_APP_ENABLE_ANALYTICS === 'true' || ENVIRONMENT === 'production',
};

// Polling & Refresh Intervals (ms)
export const POLLING_INTERVALS = {
    QUOTES: 30000,              // 30 seconds
    HOLDINGS: 60000,            // 1 minute
    PORTFOLIO_PERFORMANCE: 300000, // 5 minutes
    PRICES: 60000,              // 1 minute
};

// Timeout Settings (ms)
export const TIMEOUTS = {
    API_REQUEST: 10000,         // 10 seconds
    FILE_UPLOAD: 30000,         // 30 seconds
};

// Cache Settings (seconds)
export const CACHE_TTL = {
    PORTFOLIOS: 3600,           // 1 hour
    ARTICLES: 3600,             // 1 hour
    MARKET_QUOTES: 60,          // 1 minute
    HOLDINGS: 300,              // 5 minutes
};

// Logging
export const LOGGING = {
    ENABLED: process.env.REACT_APP_DEBUG === 'true' || ENVIRONMENT !== 'production',
    LEVEL: process.env.REACT_APP_LOG_LEVEL || 'info', // debug, info, warn, error
};

// Analytics
export const ANALYTICS = {
    ENABLED: ENVIRONMENT === 'production',
    GOOGLE_ANALYTICS_ID: process.env.REACT_APP_GA_ID || '',
    MIXPANEL_TOKEN: process.env.REACT_APP_MIXPANEL_TOKEN || '',
};

// Error Tracking
export const ERROR_TRACKING = {
    ENABLED: ENVIRONMENT === 'production',
    SENTRY_DSN: process.env.REACT_APP_SENTRY_DSN || '',
};

// Storage
export const STORAGE = {
    PREFIX: 'bloom_',
    USE_LOCAL_STORAGE: true,
    USE_SESSION_STORAGE: false,
};

// UI Defaults
export const UI = {
    THEME_MODE: 'light', // light or dark
    DATE_FORMAT: 'MM/DD/YYYY',
    CURRENCY: 'USD',
    LOCALE: 'en-US',
    ITEMS_PER_PAGE: 20,
};

// Validation
export const VALIDATION = {
    MIN_PASSWORD_LENGTH: 8,
    MIN_INVESTMENT: 100,
    MAX_INVESTMENT: 1000000,
};

export default {
    ENVIRONMENT,
    API_BASE_URL,
    FEATURES,
    POLLING_INTERVALS,
    TIMEOUTS,
    CACHE_TTL,
    LOGGING,
    ANALYTICS,
    ERROR_TRACKING,
    STORAGE,
    UI,
    VALIDATION,
};
