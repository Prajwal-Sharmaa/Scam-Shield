const { detectRedFlags, highlightSuspiciousContent } = require('./redFlagDetector');
const { calculateRiskScore, getRiskLevel, determinePrimaryCategory, calculateConfidence } = require('./riskScorer');
const { generateExplanation, generateRecommendations } = require('./recommendationEngine');
const { CATEGORY_LABELS } = require('./patterns');

/**
 * Main message analysis entry point.
 * Accepts message text and optional metadata, returns a full analysis result.
 */
function analyzeMessage(text, options = {}) {
  const { sourceType = 'other', sender = '' } = options;

  // Detect red flags
  const redFlags = detectRedFlags(text);

  // Score
  const { score, rawTotal, breakdown } = calculateRiskScore(redFlags);
  const riskLevel = getRiskLevel(score);
  const category = determinePrimaryCategory(redFlags);
  const confidence = calculateConfidence(redFlags, score);

  // Highlight suspicious phrases
  const highlightedContent = highlightSuspiciousContent(text, redFlags);

  // Explain and recommend
  const explanation = generateExplanation(riskLevel, category, redFlags, score);
  const recommendations = generateRecommendations(riskLevel, category);

  return {
    scanType: 'message',
    sourceType,
    originalContent: text,
    sender,
    riskScore: score,
    riskLevel,
    category,
    categoryLabel: CATEGORY_LABELS[category] || category,
    confidence,
    explanation,
    recommendations,
    redFlags,
    scoreBreakdown: { rawTotal, breakdown },
    highlightedContent,
    analyzedAt: new Date().toISOString()
  };
}

module.exports = { analyzeMessage };
