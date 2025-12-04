/**
 * SRS Engine Unit Tests
 *
 * TDD Step 1: Write tests first (RED)
 * Tests the core SRS calculation logic extracted from page.tsx
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  calculateNextReview,
  type SrsInput,
  type SrsResult,
  SRS_INTERVALS,
  MAX_SRS_LEVEL,
  clampSrsLevel,
} from '@/lib/engine/srs';

describe('SRS Engine', () => {
  beforeEach(() => {
    // Use fake timers for deterministic date testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('calculateNextReview', () => {
    describe('correct answer progression', () => {
      it('should increase srsLevel from 0 to 1 when answer is correct', () => {
        const input: SrsInput = {
          srsLevel: 0,
          status: 'not_attempted',
          timesAnsweredCorrectly: 0,
          timesAnsweredIncorrectly: 0,
        };

        const result = calculateNextReview(input, true);

        expect(result.srsLevel).toBe(1);
        expect(result.status).toBe('passed_once');
        expect(result.timesAnsweredCorrectly).toBe(1);
      });

      it('should increase srsLevel from 1 to 2 (mastered) when answer is correct', () => {
        const input: SrsInput = {
          srsLevel: 1,
          status: 'passed_once',
          timesAnsweredCorrectly: 1,
          timesAnsweredIncorrectly: 0,
        };

        const result = calculateNextReview(input, true);

        expect(result.srsLevel).toBe(2);
        expect(result.status).toBe('mastered');
        expect(result.nextReviewAt).toBeNull();
      });

      it('should not exceed MAX_SRS_LEVEL (2) even with multiple correct answers', () => {
        const input: SrsInput = {
          srsLevel: 2,
          status: 'mastered',
          timesAnsweredCorrectly: 5,
          timesAnsweredIncorrectly: 0,
        };

        const result = calculateNextReview(input, true);

        expect(result.srsLevel).toBe(2);
        expect(result.srsLevel).toBeLessThanOrEqual(MAX_SRS_LEVEL);
      });

      it('should set nextReviewAt to 10 minutes for srsLevel 1', () => {
        const input: SrsInput = {
          srsLevel: 0,
          status: 'not_attempted',
          timesAnsweredCorrectly: 0,
          timesAnsweredIncorrectly: 0,
        };

        const result = calculateNextReview(input, true);
        const now = new Date();
        const expectedTime = new Date(now.getTime() + SRS_INTERVALS.LEARNING);

        expect(result.nextReviewAt).not.toBeNull();
        expect(new Date(result.nextReviewAt!).getTime()).toBe(expectedTime.getTime());
      });
    });

    describe('incorrect answer handling', () => {
      it('should reset srsLevel to 0 when answer is incorrect', () => {
        const input: SrsInput = {
          srsLevel: 1,
          status: 'passed_once',
          timesAnsweredCorrectly: 1,
          timesAnsweredIncorrectly: 0,
        };

        const result = calculateNextReview(input, false);

        expect(result.srsLevel).toBe(0);
        expect(result.status).toBe('attempted');
        expect(result.timesAnsweredIncorrectly).toBe(1);
      });

      it('should schedule nextReviewAt to 30 seconds after incorrect answer', () => {
        const input: SrsInput = {
          srsLevel: 1,
          status: 'passed_once',
          timesAnsweredCorrectly: 1,
          timesAnsweredIncorrectly: 0,
        };

        const result = calculateNextReview(input, false);
        const now = new Date();
        const expectedTime = new Date(now.getTime() + SRS_INTERVALS.FAILED);

        expect(result.nextReviewAt).not.toBeNull();
        expect(new Date(result.nextReviewAt!).getTime()).toBe(expectedTime.getTime());
      });

      it('should reset mastered question to srsLevel 0 on incorrect', () => {
        const input: SrsInput = {
          srsLevel: 2,
          status: 'mastered',
          timesAnsweredCorrectly: 5,
          timesAnsweredIncorrectly: 0,
        };

        const result = calculateNextReview(input, false);

        expect(result.srsLevel).toBe(0);
        expect(result.status).toBe('attempted');
      });
    });

    describe('edge cases', () => {
      it('should handle negative srsLevel by clamping to 0', () => {
        const input: SrsInput = {
          srsLevel: -5,
          status: 'not_attempted',
          timesAnsweredCorrectly: 0,
          timesAnsweredIncorrectly: 0,
        };

        const result = calculateNextReview(input, true);

        expect(result.srsLevel).toBeGreaterThanOrEqual(0);
        expect(result.srsLevel).toBe(1); // -5 clamped to 0, then +1
      });

      it('should handle srsLevel above MAX by clamping', () => {
        const input: SrsInput = {
          srsLevel: 100,
          status: 'mastered',
          timesAnsweredCorrectly: 10,
          timesAnsweredIncorrectly: 0,
        };

        const result = calculateNextReview(input, true);

        expect(result.srsLevel).toBeLessThanOrEqual(MAX_SRS_LEVEL);
      });

      it('should handle NaN srsLevel by defaulting to 0', () => {
        const input: SrsInput = {
          srsLevel: NaN,
          status: 'not_attempted',
          timesAnsweredCorrectly: 0,
          timesAnsweredIncorrectly: 0,
        };

        const result = calculateNextReview(input, true);

        expect(Number.isNaN(result.srsLevel)).toBe(false);
        expect(result.srsLevel).toBe(1);
      });

      it('should handle undefined counts gracefully', () => {
        const input: SrsInput = {
          srsLevel: 0,
          status: 'not_attempted',
          timesAnsweredCorrectly: undefined as unknown as number,
          timesAnsweredIncorrectly: undefined as unknown as number,
        };

        const result = calculateNextReview(input, true);

        expect(result.timesAnsweredCorrectly).toBe(1);
        expect(result.timesAnsweredIncorrectly).toBe(0);
      });
    });
  });

  describe('clampSrsLevel', () => {
    it('should clamp negative values to 0', () => {
      expect(clampSrsLevel(-1)).toBe(0);
      expect(clampSrsLevel(-100)).toBe(0);
    });

    it('should clamp values above MAX to MAX', () => {
      expect(clampSrsLevel(3)).toBe(2);
      expect(clampSrsLevel(100)).toBe(2);
    });

    it('should return valid values unchanged', () => {
      expect(clampSrsLevel(0)).toBe(0);
      expect(clampSrsLevel(1)).toBe(1);
      expect(clampSrsLevel(2)).toBe(2);
    });

    it('should handle NaN by returning 0', () => {
      expect(clampSrsLevel(NaN)).toBe(0);
    });

    it('should handle Infinity by returning MAX', () => {
      expect(clampSrsLevel(Infinity)).toBe(2);
      expect(clampSrsLevel(-Infinity)).toBe(0);
    });
  });

  describe('SRS_INTERVALS constants', () => {
    it('should have correct interval values', () => {
      expect(SRS_INTERVALS.FAILED).toBe(30 * 1000); // 30 seconds
      expect(SRS_INTERVALS.LEARNING).toBe(10 * 60 * 1000); // 10 minutes
      expect(SRS_INTERVALS.MASTERED).toBe(0); // No review needed
    });
  });
});
