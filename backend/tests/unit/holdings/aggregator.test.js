'use strict';

const { describe, it, expect } = require('@jest/globals');
const { buildTimeSeries } = require('../../../api/holdings/aggregator');

const makeSnapshots = (days, startVal = 1000, dailyGrowth = 10) =>
  Array.from({ length: days }, (_, i) => ({
    date:          `2025-01-${String(i + 1).padStart(2, '0')}`,
    totalValue:    startVal + i * dailyGrowth,
    totalInvested: startVal,
  }));

describe('buildTimeSeries', () => {
  it('returns empty points and zero stats for no snapshots', () => {
    const { points, stats } = buildTimeSeries([], '1M');
    expect(points).toHaveLength(0);
    expect(stats.startValue).toBe(0);
    expect(stats.endValue).toBe(0);
  });

  it('returns correct start and end values', () => {
    const snaps  = makeSnapshots(10, 1000, 50);
    const { stats } = buildTimeSeries(snaps, '1M');
    expect(stats.startValue).toBe(1000);
    expect(stats.endValue).toBe(1450);
  });

  it('computes gainLoss correctly', () => {
    const snaps  = makeSnapshots(10, 1000, 50);
    const { stats } = buildTimeSeries(snaps, '1M');
    expect(stats.gainLoss).toBe(450);
  });

  it('computes gainPct correctly', () => {
    // Start $1000, end $1500 → +50%
    const snaps  = makeSnapshots(11, 1000, 50);
    const { stats } = buildTimeSeries(snaps, '1M');
    expect(stats.gainPct).toBeCloseTo(50, 0);
  });

  it('identifies positive performance', () => {
    const snaps  = makeSnapshots(5, 1000, 100);
    const { stats } = buildTimeSeries(snaps, '1M');
    expect(stats.isPositive).toBe(true);
  });

  it('identifies negative performance', () => {
    const snaps  = makeSnapshots(5, 1000, -100);
    const { stats } = buildTimeSeries(snaps, '1M');
    expect(stats.isPositive).toBe(false);
  });

  it('never returns more than 31 points (chart optimisation)', () => {
    const snaps   = makeSnapshots(365, 1000, 1);
    const { points } = buildTimeSeries(snaps, '1Y');
    expect(points.length).toBeLessThanOrEqual(31);
  });

  it('always includes the last snapshot as the final point', () => {
    const snaps   = makeSnapshots(100, 1000, 5);
    const { points } = buildTimeSeries(snaps, '1Y');
    const lastSnap  = snaps[snaps.length - 1];
    const lastPoint = points[points.length - 1];
    expect(lastPoint.value).toBe(lastSnap.totalValue);
  });

  it('returns all points when fewer than 30 snapshots', () => {
    const snaps   = makeSnapshots(15, 1000, 20);
    const { points } = buildTimeSeries(snaps, '1M');
    expect(points).toHaveLength(15);
  });

  it('point shape has required fields', () => {
    const snaps   = makeSnapshots(5, 1000, 10);
    const { points } = buildTimeSeries(snaps, '1M');
    for (const p of points) {
      expect(p).toHaveProperty('date');
      expect(p).toHaveProperty('value');
      expect(p).toHaveProperty('invested');
    }
  });

  it('stat shape has required fields', () => {
    const snaps = makeSnapshots(3, 1000, 10);
    const { stats } = buildTimeSeries(snaps, '1M');
    ['startValue', 'endValue', 'gainLoss', 'gainPct', 'maxValue', 'minValue', 'isPositive', 'range', 'pointCount']
      .forEach(k => expect(stats).toHaveProperty(k));
  });
});
