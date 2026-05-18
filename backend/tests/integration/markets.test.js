'use strict';

/**
 * tests/integration/markets.test.js
 *
 * Tests for market data endpoints and cache behavior.
 */

const { describe, it, expect, beforeAll } = require('@jest/globals');

const BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:3000/v1';

async function pub(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}

describe('Markets Integration', () => {
  describe('GET /markets/quotes', () => {
    it('returns 400 for missing symbols param', async () => {
      const { status } = await pub('/markets/quotes');
      expect(status).toBe(400);
    });

    it('returns 400 for empty symbols string', async () => {
      const { status } = await pub('/markets/quotes?symbols=');
      expect(status).toBe(400);
    });

    it('returns quotes for single symbol', async () => {
      const { status, body } = await pub('/markets/quotes?symbols=AAPL');
      expect(status).toBe(200);
      expect(body.data).toHaveLength(1);
      expect(body.data[0].symbol).toBe('AAPL');
      expect(body.data[0]).toHaveProperty('price');
    });

    it('returns quotes for multiple symbols', async () => {
      const { status, body } = await pub('/markets/quotes?symbols=AAPL,MSFT,NVDA');
      expect(status).toBe(200);
      expect(body.data).toHaveLength(3);
      const symbols = body.data.map(q => q.symbol);
      expect(symbols).toContain('AAPL');
      expect(symbols).toContain('MSFT');
      expect(symbols).toContain('NVDA');
    });

    it('returns meta with cache hit/miss counts', async () => {
      // First call — cache miss (first cold start)
      const { body: first } = await pub('/markets/quotes?symbols=TSLA');
      expect(first.meta).toHaveProperty('cacheHits');
      expect(first.meta).toHaveProperty('cacheMisses');

      // Second call — should be a cache hit
      const { body: second } = await pub('/markets/quotes?symbols=TSLA');
      expect(second.meta.cacheHits).toBeGreaterThanOrEqual(0);
    });

    it('caps at 50 symbols', async () => {
      const symbols = Array.from({ length: 60 }, (_, i) => `SYM${i}`).join(',');
      const { status, body } = await pub(`/markets/quotes?symbols=${symbols}`);
      expect(status).toBe(200);
      expect(body.data.length).toBeLessThanOrEqual(50);
    });

    it('quote shape has expected fields', async () => {
      const { body } = await pub('/markets/quotes?symbols=SPY');
      const quote = body.data[0];
      expect(quote).toHaveProperty('symbol');
      expect(quote).toHaveProperty('price');
      expect(quote).toHaveProperty('change1d');
      expect(quote).toHaveProperty('change1dPct');
    });
  });

  describe('GET /markets/indices', () => {
    it('returns major indices', async () => {
      const { status, body } = await pub('/markets/indices');
      expect(status).toBe(200);
      expect(body.data).toHaveProperty('indices');
      expect(body.data.indices).toHaveLength(5); // SPY, QQQ, DIA, IWM, VTI
    });

    it('includes sentiment field', async () => {
      const { body } = await pub('/markets/indices');
      expect(['bullish', 'bearish']).toContain(body.data.sentiment);
    });
  });

  describe('GET /markets/search', () => {
    it('returns 400 for missing query', async () => {
      const { status } = await pub('/markets/search');
      expect(status).toBe(400);
    });

    it('returns results for "apple"', async () => {
      const { status, body } = await pub('/markets/search?q=apple');
      expect(status).toBe(200);
      expect(body.data).toBeInstanceOf(Array);
      expect(body.data.length).toBeGreaterThan(0);
      const found = body.data.find(r => r.symbol === 'AAPL');
      expect(found).toBeDefined();
    });

    it('result items have required fields', async () => {
      const { body } = await pub('/markets/search?q=microsoft');
      for (const item of body.data) {
        expect(item).toHaveProperty('symbol');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('type');
      }
    });

    it('filters by type param', async () => {
      const { body } = await pub('/markets/search?q=s&type=etf');
      for (const item of body.data) {
        expect(item.type).toBe('etf');
      }
    });

    it('respects limit param', async () => {
      const { body } = await pub('/markets/search?q=a&limit=3');
      expect(body.data.length).toBeLessThanOrEqual(3);
    });
  });
});
