/**
 * Risk calculation engine
 * Combines tracing + reading signals → Low/Moderate/High dyslexia risk
 */

/**
 * Calculate overall dyslexia risk from scoring components
 * @param {object} tracingScore - from heuristics.evaluateTracing()
 * @param {object} readingScore - from heuristics.evaluateReading()
 * @returns {object} risk level and reasoning
 */
export function calculateRisk(tracingScore, readingScore) {
  // Weights for each component
  const tracingWeight = 0.35; // Fine motor + letter recognition
  const readingWeight = 0.65; // Reading fluency is more predictive

  // Normalize scores to 0-1 scale
  const normalizedTracing = normalizeScore(tracingScore?.score || 0);
  const normalizedReading = normalizeScore(readingScore?.score || 0);

  // Combined risk (inverted: higher score = lower risk)
  const combinedScore =
    normalizedTracing * tracingWeight + normalizedReading * readingWeight;

  // Risk classification thresholds
  let riskLevel, riskDescription;

  if (combinedScore >= 0.7) {
    riskLevel = 'LOW';
    riskDescription =
      'Child shows typical development in letter tracing and reading fluency.';
  } else if (combinedScore >= 0.4) {
    riskLevel = 'MODERATE';
    riskDescription =
      'Child shows some difficulty; further monitoring and intervention recommended.';
  } else {
    riskLevel = 'HIGH';
    riskDescription =
      'Child shows significant difficulty; professional dyslexia assessment recommended.';
  }

  // Identify specific areas of concern
  const concerns = [];
  if (normalizedTracing < 0.5) {
    concerns.push('Fine motor/letter recognition challenges');
  }
  if (normalizedReading < 0.5) {
    concerns.push('Reading fluency/comprehension delays');
  }

  return {
    overallRisk: riskLevel,
    riskScore: combinedScore,
    description: riskDescription,
    concerns,
    confidence: calculateConfidence(tracingScore, readingScore),
    tracingContribution: normalizedTracing,
    readingContribution: normalizedReading,
    recommendations: getRecommendations(riskLevel),
  };
}

/**
 * Normalize a score to 0-1 scale (higher = better)
 */
function normalizeScore(score) {
  return Math.max(0, Math.min(1, score));
}

/**
 * Calculate confidence in the risk assessment
 * Higher when we have more data
 */
function calculateConfidence(tracingScore, readingScore) {
  let confidence = 0.5; // base confidence

  if (tracingScore && tracingScore.reattempts !== undefined) {
    confidence += 0.15; // tracing data present
  }

  if (readingScore && readingScore.itemCount > 0) {
    confidence += Math.min(0.2, readingScore.itemCount * 0.025); // reading data present
  }

  return Math.min(1, confidence);
}

/**
 * Get personalized recommendations based on risk level
 */
function getRecommendations(riskLevel) {
  const recommendations = {
    LOW: [
      'Continue regular reading practice',
      'Monitor letter formation in writing',
      'Encourage reading of age-appropriate materials',
    ],
    MODERATE: [
      'Increase letter formation practice',
      'Use multi-sensory reading interventions',
      'Consider phonics-based instruction',
      'Schedule follow-up assessment in 3-4 weeks',
    ],
    HIGH: [
      'Refer to dyslexia specialist',
      'Implement specialized intervention program',
      'Consider auditory/visual learning adjustments',
      'Conduct comprehensive psychoeducational evaluation',
    ],
  };

  return recommendations[riskLevel] || [];
}
