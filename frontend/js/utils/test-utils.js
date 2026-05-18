// ─────────────────────────────────────────────────────────────────
// Testing Utilities & Mock Services
// ─────────────────────────────────────────────────────────────────

/**
 * Test Service Calls
 * Run these in browser console for quick testing
 */

// Test Authentication Flow
export async function testAuthFlow() {
    console.log('=== Testing Auth Flow ===');

    const { default: authService } = await import('./services/auth.js');

    // Test signup
    console.log('Testing signup...');
    const signupResult = await authService.signup(
        `test-${Date.now()}@example.com`,
        'TestPassword123!',
        'Test',
        'User'
    );
    console.log('Signup result:', signupResult);

    // Test login
    if (signupResult.success) {
        console.log('Testing login...');
        const loginResult = await authService.login(
            signupResult.userId || `test-${Date.now()}@example.com`,
            'TestPassword123!'
        );
        console.log('Login result:', loginResult);
    }
}

// Test Portfolio Service
export async function testPortfolioService() {
    console.log('=== Testing Portfolio Service ===');

    const { default: portfoliosService } = await import('./services/portfolios.js');

    // Test list portfolios
    console.log('Fetching portfolios...');
    const listResult = await portfoliosService.listPortfolios();
    console.log('Portfolios:', listResult);

    if (listResult.success && listResult.data.length > 0) {
        const portfolioId = listResult.data[0].id || listResult.data[0].portfolioId;

        // Test get single portfolio
        console.log(`Fetching portfolio ${portfolioId}...`);
        const getResult = await portfoliosService.getPortfolio(portfolioId);
        console.log('Portfolio details:', getResult);
    }
}

// Test Markets Service
export async function testMarketsService() {
    console.log('=== Testing Markets Service ===');

    const { default: marketsService } = await import('./services/markets.js');

    // Test get quotes
    console.log('Fetching quotes for AAPL, GOOGL...');
    const quotesResult = await marketsService.getQuotes(['AAPL', 'GOOGL']);
    console.log('Quotes:', quotesResult);

    // Test get indices
    console.log('Fetching indices...');
    const indicesResult = await marketsService.getIndices();
    console.log('Indices:', indicesResult);

    // Test search
    console.log('Searching for "apple"...');
    const searchResult = await marketsService.search('apple');
    console.log('Search results:', searchResult);
}

// Test Holdings Service
export async function testHoldingsService() {
    console.log('=== Testing Holdings Service ===');

    const { default: holdingsService } = await import('./services/holdings.js');
    const { default: authService } = await import('./services/auth.js');

    if (!authService.isLoggedIn()) {
        console.log('⚠️ Not logged in. Please login first.');
        return;
    }

    // Test list holdings
    console.log('Fetching holdings...');
    const holdingsResult = await holdingsService.listHoldings();
    console.log('Holdings:', holdingsResult);

    // Test performance
    console.log('Fetching performance...');
    const perfResult = await holdingsService.getPerformance('1M');
    console.log('Performance:', perfResult);
}

// Test Goals Service
export async function testGoalsService() {
    console.log('=== Testing Goals Service ===');

    const { default: goalsService } = await import('./services/goals.js');
    const { default: authService } = await import('./services/auth.js');

    if (!authService.isLoggedIn()) {
        console.log('⚠️ Not logged in. Please login first.');
        return;
    }

    // Test list goals
    console.log('Fetching goals...');
    const goalsResult = await goalsService.listGoals();
    console.log('Goals:', goalsResult);

    // Test create goal
    console.log('Creating goal...');
    const createResult = await goalsService.createGoal({
        name: `Test Goal ${Date.now()}`,
        description: 'A test goal for integration testing',
        targetAmount: 10000,
        targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'test',
    });
    console.log('Create result:', createResult);
}

// Test Transactions Service
export async function testTransactionsService() {
    console.log('=== Testing Transactions Service ===');

    const { default: transactionsService } = await import('./services/transactions.js');
    const { default: authService } = await import('./services/auth.js');

    if (!authService.isLoggedIn()) {
        console.log('⚠️ Not logged in. Please login first.');
        return;
    }

    // Test list transactions
    console.log('Fetching transactions...');
    const listResult = await transactionsService.listTransactions();
    console.log('Transactions:', listResult);
}

// Test Learn Service
export async function testLearnService() {
    console.log('=== Testing Learn Service ===');

    const { default: learnService } = await import('./services/learn.js');

    // Test list articles
    console.log('Fetching articles...');
    const articlesResult = await learnService.listArticles();
    console.log('Articles:', articlesResult);

    if (articlesResult.success && articlesResult.data.length > 0) {
        const articleSlug = articlesResult.data[0].slug;

        // Test get single article
        console.log(`Fetching article ${articleSlug}...`);
        const articleResult = await learnService.getArticle(articleSlug);
        console.log('Article:', articleResult);
    }
}

// Run All Tests
export async function runAllTests() {
    console.log('🧪 Starting comprehensive integration tests...\n');

    try {
        await testMarketsService();
        console.log('\n');

        await testPortfolioService();
        console.log('\n');

        await testLearnService();
        console.log('\n');

        console.log('=== Authentication Required Tests ===');
        console.log('Please login first, then run:');
        console.log('  testHoldingsService()');
        console.log('  testTransactionsService()');
        console.log('  testGoalsService()');

        console.log('\n✅ Basic tests completed!');
    } catch (error) {
        console.error('❌ Test error:', error);
    }
}

// Performance Monitoring
export function setupPerformanceMonitoring() {
    const originalFetch = window.fetch;

    window.fetch = function (...args) {
        const startTime = performance.now();
        return originalFetch.apply(this, args)
            .then(response => {
                const duration = performance.now() - startTime;
                const url = args[0];
                console.log(`📊 ${url}: ${duration.toFixed(2)}ms`);
                return response;
            })
            .catch(error => {
                const duration = performance.now() - startTime;
                const url = args[0];
                console.error(`❌ ${url} failed: ${duration.toFixed(2)}ms`, error);
                throw error;
            });
    };
}

// Export test utilities
export default {
    testAuthFlow,
    testPortfolioService,
    testMarketsService,
    testHoldingsService,
    testGoalsService,
    testTransactionsService,
    testLearnService,
    runAllTests,
    setupPerformanceMonitoring,
};

// ────────────────────────────────────────────────────────────────
// Usage in Browser Console:
// ────────────────────────────────────────────────────────────────
//
// import testUtils from './test-utils.js';
//
// // Run all tests
// testUtils.runAllTests();
//
// // Run specific test
// testUtils.testPortfolioService();
//
// // Enable performance monitoring
// testUtils.setupPerformanceMonitoring();
//
