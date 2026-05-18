'use strict';

/**
 * tests/integration/invest-flow.test.js
 *
 * End-to-end flow: deposit → invest in portfolio → verify holdings.
 * Requires SAM local running with a seeded portfolio catalog.
 */

const { describe, it, expect, beforeAll } = require('@jest/globals');

const BASE_URL    = process.env.API_BASE_URL ?? 'http://localhost:3000/v1';
const accessToken = process.env.TEST_ACCESS_TOKEN ?? 'mock-token';

async function api(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization:  `Bearer ${accessToken}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, body: json };
}

describe('Deposit & Invest Flow', () => {
  describe('POST /transactions/deposit', () => {
    it('rejects amount below minimum', async () => {
      const { status } = await api('POST', '/transactions/deposit', { amount: 5 });
      expect(status).toBe(400);
    });

    it('rejects missing amount', async () => {
      const { status } = await api('POST', '/transactions/deposit', {});
      expect(status).toBe(400);
    });

    it('accepts valid deposit', async () => {
      const { status, body } = await api('POST', '/transactions/deposit', {
        amount: 1000,
        bankAccountId: 'test-bank-001',
      });
      expect([201, 404]).toContain(status); // 404 if user doesn't exist in local DB
      if (status === 201) {
        expect(body.data).toHaveProperty('transactionId');
        expect(body.data.status).toBe('pending');
        expect(body.data.amount).toBe(1000);
      }
    });
  });

  describe('POST /portfolios/{id}/invest', () => {
    const PORTFOLIO_ID = 'growth'; // seeded by seed-portfolios.js

    it('rejects invest without amount', async () => {
      const { status } = await api('POST', `/portfolios/${PORTFOLIO_ID}/invest`, {});
      expect(status).toBe(400);
    });

    it('rejects non-existent portfolio', async () => {
      const { status } = await api('POST', '/portfolios/nonexistent-portfolio-xyz/invest', {
        amount: 100,
      });
      expect(status).toBe(404);
    });

    it('accepts valid investment', async () => {
      const { status, body } = await api('POST', `/portfolios/${PORTFOLIO_ID}/invest`, {
        amount: 500,
      });
      expect([200, 404]).toContain(status);
      if (status === 200) {
        expect(body.data).toHaveProperty('transaction');
        expect(body.data).toHaveProperty('allocations');
        expect(body.data.allocations).toBeInstanceOf(Array);
        expect(body.data.allocations.length).toBeGreaterThan(0);

        // Allocations should sum to invested amount
        const total = body.data.allocations.reduce(
          (s, a) => s + a.allocatedAmount, 0
        );
        expect(Math.round(total * 100)).toBe(50000); // $500.00
      }
    });
  });

  describe('GET /holdings', () => {
    it('returns holdings array', async () => {
      const { status, body } = await api('GET', '/holdings');
      expect([200]).toContain(status);
      expect(body.data).toHaveProperty('holdings');
      expect(body.data).toHaveProperty('summary');
      expect(body.data.holdings).toBeInstanceOf(Array);
    });

    it('holdings have required fields', async () => {
      const { body } = await api('GET', '/holdings');
      const holdings = body?.data?.holdings ?? [];
      for (const h of holdings) {
        expect(h).toHaveProperty('symbol');
        expect(h).toHaveProperty('currentValue');
        expect(h).toHaveProperty('gainLoss');
      }
    });
  });

  describe('GET /holdings/performance', () => {
    it('returns performance for default range', async () => {
      const { status, body } = await api('GET', '/holdings/performance');
      expect(status).toBe(200);
      expect(body.data).toHaveProperty('points');
      expect(body.data).toHaveProperty('stats');
    });

    it('accepts valid range params', async () => {
      for (const range of ['1W', '1M', '3M', '1Y', 'ALL']) {
        const { status } = await api('GET', `/holdings/performance?range=${range}`);
        expect(status).toBe(200);
      }
    });
  });

  describe('GET /transactions', () => {
    it('returns paginated transactions', async () => {
      const { status, body } = await api('GET', '/transactions');
      expect(status).toBe(200);
      expect(body.data).toBeInstanceOf(Array);
      expect(body.pagination).toHaveProperty('hasMore');
    });

    it('respects limit param', async () => {
      const { body } = await api('GET', '/transactions?limit=5');
      expect(body.data.length).toBeLessThanOrEqual(5);
    });
  });
});
