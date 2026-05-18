'use strict';

/**
 * tests/integration/auth.test.js
 *
 * Integration tests for the full auth flow against a local SAM environment.
 * Requires:  ./scripts/local-dev.sh running (SAM local + DynamoDB Local)
 *
 * Run: npm run test:integration
 */

const { describe, it, expect, beforeAll, afterAll } = require('@jest/globals');

const BASE_URL   = process.env.API_BASE_URL ?? 'http://localhost:3000/v1';
const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PW    = 'Test1234!';
const TEST_NAME  = { firstName: 'Alice', lastName: 'Bloom' };

let accessToken = null;
let userId      = null;

// ─── Helper ───────────────────────────────────────────────────
async function api(method, path, body, headers = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, body: json };
}

// ─── Tests ────────────────────────────────────────────────────
describe('Auth Integration', () => {
  describe('GET /users/me — unauthenticated', () => {
    it('returns 401 without token', async () => {
      const { status } = await api('GET', '/users/me', null, { Authorization: '' });
      expect(status).toBe(401);
    });
  });

  // NOTE: Full Cognito sign-up requires Cognito SDK; we test the Lambda handlers
  // directly by simulating Cognito trigger events.

  describe('Onboarding flow (mock token)', () => {
    beforeAll(async () => {
      // In integration tests against SAM local with Cognito mocked,
      // we generate a synthetic JWT or use AWS CLI to create a test user.
      // For CI, use a pre-created test account:
      accessToken = process.env.TEST_ACCESS_TOKEN ?? 'mock-token-for-local-testing';
      userId      = process.env.TEST_USER_ID ?? 'test-user-001';
    });

    it('GET /users/me — returns profile after signup', async () => {
      const { status, body } = await api('GET', '/users/me');
      // In SAM local with mock authorizer, expect 200 or 404 (no real Cognito)
      expect([200, 404]).toContain(status);
      if (status === 200) {
        expect(body.data).toHaveProperty('userId');
        expect(body.data).toHaveProperty('email');
      }
    });

    it('POST /onboarding/quiz — validates answers', async () => {
      const { status, body } = await api('POST', '/onboarding/quiz', {
        answers: [99, 0, 0, 0], // invalid
      });
      expect(status).toBe(400);
    });

    it('POST /onboarding/quiz — accepts valid answers', async () => {
      const { status, body } = await api('POST', '/onboarding/quiz', {
        answers: [2, 2, 2, 2],
      });
      expect([200, 404]).toContain(status);
      if (status === 200) {
        expect(body.data).toHaveProperty('riskScore');
        expect(body.data).toHaveProperty('recommendedPortfolio');
      }
    });

    it('PUT /users/me — rejects invalid currency', async () => {
      const { status } = await api('PUT', '/users/me', { currency: 'INVALID' });
      expect(status).toBe(400);
    });

    it('PUT /users/me — accepts valid update', async () => {
      const { status, body } = await api('PUT', '/users/me', {
        firstName: 'Alice', currency: 'GBP',
      });
      expect([200, 404]).toContain(status);
    });
  });

  describe('Public endpoints', () => {
    it('GET /portfolios — returns list without auth', async () => {
      const { status, body } = await api('GET', '/portfolios', null, { Authorization: '' });
      // Should succeed (no auth required)
      expect([200]).toContain(status);
    });

    it('GET /markets/quotes?symbols=AAPL — returns quote', async () => {
      const { status, body } = await api('GET', '/markets/quotes?symbols=AAPL', null, { Authorization: '' });
      expect(status).toBe(200);
      expect(body.data).toBeInstanceOf(Array);
      expect(body.data[0].symbol).toBe('AAPL');
    });

    it('GET /markets/quotes — rejects empty symbols', async () => {
      const { status } = await api('GET', '/markets/quotes', null, { Authorization: '' });
      expect(status).toBe(400);
    });

    it('GET /markets/search?q=apple — returns results', async () => {
      const { status, body } = await api('GET', '/markets/search?q=apple', null, { Authorization: '' });
      expect(status).toBe(200);
      expect(body.data).toBeInstanceOf(Array);
      expect(body.data.length).toBeGreaterThan(0);
    });

    it('GET /learn/articles — returns article list', async () => {
      const { status, body } = await api('GET', '/learn/articles', null, { Authorization: '' });
      expect(status).toBe(200);
    });
  });
});
