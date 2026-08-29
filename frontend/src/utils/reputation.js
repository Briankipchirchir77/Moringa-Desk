/**
 * Calculates user total score based on actions and activity multiplier.
 */
export const calculateReputationScore = (actionsCount = 0, multiplier = 10) => {
  if (actionsCount < 0) return 0;
  return Math.floor(actionsCount * multiplier);
};

/**
 * Determines the tier badge based on the reputation score.
 */
export const getReputationBadge = (score = 0) => {
  if (score >= 500) return 'Gold';
  if (score >= 200) return 'Silver';
  if (score >= 50) return 'Bronze';
  return 'Novice';
};

/**
 * Calculates percentage progress toward the next tier.
 */
export const getProgressToNextTier = (score = 0) => {
  if (score >= 500) return 100;
  if (score >= 200) return Math.min(100, Math.floor(((score - 200) / 300) * 100));
  if (score >= 50) return Math.min(100, Math.floor(((score - 50) / 150) * 100));
  return Math.min(100, Math.floor((score / 50) * 100));
};