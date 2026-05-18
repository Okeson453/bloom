'use strict';

/**
 * tests/unit/onboarding/scorer.test.js
 * Unit tests for the quiz scoring logic.
 * Run: npm run test:unit
 */

const { describe, it, expect, beforeEach } = require('@jest/globals');
const { scoreQuiz, buildRecommendationReason } = require('../../../api/onboarding/scorer');

describe('scoreQuiz', () => {
  describe('portfolio mapping', () => {
    it('maps score 0-3 → conservative', () => {
      const result = scoreQuiz([0, 0, 0, 0]);
      expect(result.riskScore).toBe(0);
      expect(result.portfolioId).toBe('conservative');
      expect(result.riskLevel).toBe(1);
    });

    it('maps score 4-6 → moderate', () => {
      const result = scoreQuiz([1, 1, 1, 1]);
      expect(result.riskScore).toBe(4);
      expect(result.portfolioId).toBe('moderate');
      expect(result.riskLevel).toBe(2);
    });

    it('maps score 7-9 → growth', () => {
      const result = scoreQuiz([2, 2, 2, 1]);
      expect(result.riskScore).toBe(7);
      expect(result.portfolioId).toBe('growth');
      expect(result.riskLevel).toBe(3);
    });

    it('maps score 10-12 → aggressive-growth', () => {
      const result = scoreQuiz([3, 3, 2, 3]);
      expect(result.riskScore).toBe(11);
      expect(result.portfolioId).toBe('aggressive-growth');
      expect(result.riskLevel).toBe(4);
    });

    it('maps max score 12 → aggressive-growth', () => {
      const result = scoreQuiz([3, 3, 3, 3]);
      expect(result.riskScore).toBe(12);
      expect(result.portfolioId).toBe('aggressive-growth');
    });
  });

  describe('riskPercentage', () => {
    it('returns 0% for all-zero answers', () => {
      const result = scoreQuiz([0, 0, 0, 0]);
      expect(result.riskPercentage).toBe(0);
    });

    it('returns 100% for all-max answers', () => {
      const result = scoreQuiz([3, 3, 3, 3]);
      expect(result.riskPercentage).toBe(100);
    });

    it('returns ~50% for mid-range answers', () => {
      const result = scoreQuiz([1, 2, 1, 2]);
      expect(result.riskPercentage).toBeGreaterThan(40);
      expect(result.riskPercentage).toBeLessThan(60);
    });
  });

  describe('validation', () => {
    it('throws on missing answers', () => {
      expect(() => scoreQuiz(null)).toThrow('requires exactly 4 answers');
    });

    it('throws on wrong answer count', () => {
      expect(() => scoreQuiz([1, 2])).toThrow('requires exactly 4 answers');
    });

    it('throws on answer out of range', () => {
      expect(() => scoreQuiz([0, 0, 4, 0])).toThrow('integer between 0 and 3');
    });

    it('throws on negative answer', () => {
      expect(() => scoreQuiz([0, -1, 0, 0])).toThrow('integer between 0 and 3');
    });

    it('throws on non-integer answer', () => {
      expect(() => scoreQuiz([0, 1.5, 0, 0])).toThrow('integer between 0 and 3');
    });
  });

  describe('output shape', () => {
    it('returns all expected fields', () => {
      const result = scoreQuiz([1, 2, 1, 2]);
      expect(result).toHaveProperty('riskScore');
      expect(result).toHaveProperty('portfolioId');
      expect(result).toHaveProperty('portfolioLabel');
      expect(result).toHaveProperty('riskLevel');
      expect(result).toHaveProperty('riskPercentage');
    });
  });
});

describe('buildRecommendationReason', () => {
  it('returns conservative reason for score ≤ 3', () => {
    const reason = buildRecommendationReason(2);
    expect(reason).toMatch(/stability/i);
  });

  it('returns moderate reason for score 4-6', () => {
    const reason = buildRecommendationReason(5);
    expect(reason).toMatch(/balanced/i);
  });

  it('returns growth reason for score 7-9', () => {
    const reason = buildRecommendationReason(8);
    expect(reason).toMatch(/growth/i);
  });

  it('returns aggressive reason for score 10+', () => {
    const reason = buildRecommendationReason(11);
    expect(reason).toMatch(/high volatility|maximise/i);
  });

  it('returns a non-empty string for every valid score', () => {
    for (let i = 0; i <= 12; i++) {
      expect(typeof buildRecommendationReason(i)).toBe('string');
      expect(buildRecommendationReason(i).length).toBeGreaterThan(0);
    }
  });
});
