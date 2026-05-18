'use strict';

const { describe, it, expect } = require('@jest/globals');
const { allocate, mergeHoldings } = require('../../../api/portfolios/allocator');

describe('allocate', () => {
  const ASSETS = [
    { symbol: 'AAPL', weight: 0.5, price: 180 },
    { symbol: 'MSFT', weight: 0.3, price: 380 },
    { symbol: 'NVDA', weight: 0.2, price: 600 },
  ];

  it('splits $1000 correctly by weight', () => {
    const result = allocate(1000, ASSETS);
    expect(result.find(r => r.symbol === 'AAPL').allocatedAmount).toBe(500);
    expect(result.find(r => r.symbol === 'MSFT').allocatedAmount).toBe(300);
    expect(result.find(r => r.symbol === 'NVDA').allocatedAmount).toBe(200);
  });

  it('allocations always sum to the total amount', () => {
    const amounts = [100, 999.99, 10_000, 3];
    for (const amount of amounts) {
      const result = allocate(amount, ASSETS);
      const sum = result.reduce((s, r) => s + r.allocatedAmount, 0);
      expect(Math.round(sum * 100)).toBe(Math.round(amount * 100));
    }
  });

  it('computes fractional units when price provided', () => {
    const result = allocate(1000, ASSETS);
    const aapl   = result.find(r => r.symbol === 'AAPL');
    // $500 / $180 per share ≈ 2.7778 units
    expect(aapl.units).toBeCloseTo(500 / 180, 3);
  });

  it('handles unequal weights that do not cleanly divide', () => {
    const assets = [
      { symbol: 'A', weight: 1, price: 100 },
      { symbol: 'B', weight: 1, price: 100 },
      { symbol: 'C', weight: 1, price: 100 },
    ];
    const result = allocate(100, assets);
    const total  = result.reduce((s, r) => s + r.allocatedAmount, 0);
    expect(Math.round(total * 100)).toBe(10000); // 100.00
  });

  it('normalises weights that do not sum to 1', () => {
    const assets = [
      { symbol: 'X', weight: 2 },
      { symbol: 'Y', weight: 2 },
    ];
    const result = allocate(200, assets);
    // Both should get exactly $100
    expect(result[0].allocatedAmount).toBe(100);
    expect(result[1].allocatedAmount).toBe(100);
  });

  it('throws if totalAmount is 0 or negative', () => {
    expect(() => allocate(0,   ASSETS)).toThrow('totalAmount must be > 0');
    expect(() => allocate(-10, ASSETS)).toThrow('totalAmount must be > 0');
  });

  it('throws if assets array is empty', () => {
    expect(() => allocate(100, [])).toThrow('must not be empty');
  });
});

describe('mergeHoldings', () => {
  it('creates new position when symbol not in existing', () => {
    const result = mergeHoldings({}, [
      { symbol: 'AAPL', allocatedAmount: 500, units: 2.5, weight: 0.5 },
    ]);
    expect(result[0].symbol).toBe('AAPL');
    expect(result[0].units).toBe(2.5);
    expect(result[0].totalInvested).toBe(500);
  });

  it('averages cost correctly on existing position', () => {
    const existing = {
      AAPL: { units: 2, avgCost: 200, totalInvested: 400 },
    };
    const result = mergeHoldings(existing, [
      { symbol: 'AAPL', allocatedAmount: 400, units: 2, weight: 0.5 },
    ]);
    // Avg cost = $800 / 4 units = $200
    expect(result[0].units).toBe(4);
    expect(result[0].totalInvested).toBe(800);
    expect(result[0].avgCost).toBe(200);
  });

  it('handles multiple symbols', () => {
    const result = mergeHoldings({}, [
      { symbol: 'A', allocatedAmount: 100, units: 1, weight: 0.5 },
      { symbol: 'B', allocatedAmount: 100, units: 2, weight: 0.5 },
    ]);
    expect(result).toHaveLength(2);
    expect(result.map(r => r.symbol)).toContain('A');
    expect(result.map(r => r.symbol)).toContain('B');
  });
});
