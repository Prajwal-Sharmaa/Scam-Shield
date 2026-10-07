const SEVERITY_WEIGHTS = { critical: 1.0, high: 0.8, medium: 0.6, low: 0.4 };

/**
 * Calculates a normalized risk score (0–100) from detected red flags.
 * Uses a diminishing-returns formula so a single critical flag doesn't max out the score,
 * but multiple high-severity flags stack meaningfully.
 */
function calculateRiskScore(redFlags) {
  if (!redFlags || redFlags.length === 0) return { score: 0, breakdown: [] };

  const breakdown = [];
  let rawTotal = 0;

  for (const flag of redFlags) {
    const weight = SEVERITY_WEIGHTS[flag.severity] || 0.5;
    const contribution = Math.round(flag.scoreContribution * weight);
    rawTotal += contribution;
    breakdown.push({
      flag: flag.title,
      severity: flag.severity,
      raw: flag.scoreContribution,
      weighted: contribution
    });
  }

  // Apply diminishing returns: score = 100 * (1 - e^(-rawTotal/60))
  // This means: 30 raw → ~39, 60 raw → ~63, 90 raw → ~78, 120+ raw → 86+
  const score = Math.min(100, Math.round(100 * (1 - Math.exp(-rawTotal / 60))));

  return { score, rawTotal, breakdown };
}

/**
 * Maps a numeric score to a human-readable risk level.
 */
function getRiskLevel(score) {
  if (score <= 20) return 'Safe';
  if (score <= 40) return 'Low Risk';
  if (score <= 60) return 'Medium Risk';
  if (score <= 80) return 'High Risk';
  return 'Critical Risk';
}

/**
 * Determines the dominant scam category from detected red flags.
 * Uses the highest-scoring category by combined score contribution.
 */
function determinePrimaryCategory(redFlags) {
  if (!redFlags || redFlags.length === 0) return 'safe';

  const categoryScores = {};
  for (const flag of redFlags) {
    const cat = flag.category || 'social_engineering';
    categoryScores[cat] = (categoryScores[cat] || 0) + flag.scoreContribution;
  }

  return Object.entries(categoryScores).sort((a, b) => b[1] - a[1])[0][0];
}

/**
 * Calculates a confidence percentage for the detected category.
 * Higher number of matching flags = higher confidence.
 */
function calculateConfidence(redFlags, score) {
  if (redFlags.length === 0) return 95; // Confident it's safe
  if (redFlags.length === 1 && score < 30) return 55;
  if (redFlags.length >= 3) return Math.min(95, 60 + redFlags.length * 5);
  return Math.min(90, 50 + redFlags.length * 10);
}

module.exports = { calculateRiskScore, getRiskLevel, determinePrimaryCategory, calculateConfidence };
