import {
  calculateReputationScore,
  getReputationBadge,
  getProgressToNextTier,
} from './reputation';

describe('Reputation Utilities', () => {
  describe('calculateReputationScore', () => {
    test('calculates basic score correctly', () => {
      expect(calculateReputationScore(5, 10)).toBe(50);
    });

    test('returns 0 for negative actions count', () => {
      expect(calculateReputationScore(-3)).toBe(0);
    });

    test('defaults multiplier to 10', () => {
      expect(calculateReputationScore(4)).toBe(40);
    });
  });

  describe('getReputationBadge', () => {
    test('returns Novice for scores below 50', () => {
      expect(getReputationBadge(20)).toBe('Novice');
    });

    test('returns Bronze for scores between 50 and 199', () => {
      expect(getReputationBadge(50)).toBe('Bronze');
      expect(getReputationBadge(199)).toBe('Bronze');
    });

    test('returns Silver for scores between 200 and 499', () => {
      expect(getReputationBadge(200)).toBe('Silver');
    });

    test('returns Gold for scores 500 and above', () => {
      expect(getReputationBadge(500)).toBe('Gold');
      expect(getReputationBadge(1000)).toBe('Gold');
    });
  });

  describe('getProgressToNextTier', () => {
    test('calculates Novice to Bronze progress correctly', () => {
      expect(getProgressToNextTier(25)).toBe(50);
    });

    test('returns 100% when max tier (Gold) is reached', () => {
      expect(getProgressToNextTier(500)).toBe(100);
    });
  });
});