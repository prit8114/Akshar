/**
 * Shared scoring interface
 * Orchestrates per-script engines (Gujarati & Hindi)
 * Checks for trained ML models, falls back to heuristic scoring
 */

import { gujaratiScorer } from './heuristics.gu';
import { hindiScorer } from './heuristics.hi';
import { calculateRisk } from './riskCalculator';
import { predictWithModel } from './classifierLoader';
import { extractFeatures, validateFeatures } from './featureExtractor';

/**
 * Main scoring engine coordinator
 */
export const scoringEngine = {
  /**
   * Score tracing performance for a given script
   * @param {string} script - 'gu' (Gujarati) or 'hi' (Hindi)
   * @param {object} tracingData - stroke path, duration, re-attempts
   * @returns {object} tracing score and details
   */
  scoreTracing(script, tracingData) {
    const scorer = script === 'gu' ? gujaratiScorer : hindiScorer;
    return scorer.evaluateTracing(tracingData);
  },

  /**
   * Score reading performance for a given script
   * @param {string} script - 'gu' (Gujarati) or 'hi' (Hindi)
   * @param {array} readingData - per-word latency and accuracy
   * @returns {object} reading score and details
   */
  scoreReading(script, readingData) {
    const scorer = script === 'gu' ? gujaratiScorer : hindiScorer;
    return scorer.evaluateReading(readingData);
  },

  /**
   * Calculate overall risk level from tracing and reading scores
   * @param {object} tracingScore
   * @param {object} readingScore
   * @returns {object} risk level and reasoning
   */
  calculateOverallRisk(tracingScore, readingScore) {
    return calculateRisk(tracingScore, readingScore);
  },

  /**
   * Generate full assessment report
   * PHASE 2: Checks for trained ML model; falls back to heuristic
   * @param {string} script - 'gu' or 'hi'
   * @param {object} tracingData
   * @param {array} readingData
   * @returns {Promise<object>} complete assessment
   */
  async generateReport(script, tracingData, readingData) {
    const tracingScore = this.scoreTracing(script, tracingData);
    const readingScore = this.scoreReading(script, readingData);

    // Extract features for ML model
    const features = extractFeatures(tracingData, readingData);
    validateFeatures(features);

    // Try ML prediction first
    let riskAssessment = null;
    let scoringMethod = 'heuristic';

    try {
      const mlPrediction = await predictWithModel(script, features);
      if (mlPrediction) {
        // Convert ML prediction to risk assessment format
        riskAssessment = {
          overallRisk: mlPrediction.risk_level,
          riskScore: mlPrediction.risk_score,
          description: `ML model prediction: ${mlPrediction.risk_level} risk`,
          concerns: [],
          confidence: mlPrediction.confidence,
          tracingContribution: tracingScore.score,
          readingContribution: readingScore.score,
          recommendations: this.getRecommendations(mlPrediction.risk_level),
          modelType: mlPrediction.model_type,
        };
        scoringMethod = 'ml';
      }
    } catch (error) {
      console.warn('ML model prediction failed, using heuristic fallback:', error);
    }

    // Fall back to heuristic if ML not available
    if (!riskAssessment) {
      riskAssessment = this.calculateOverallRisk(tracingScore, readingScore);
    }

    return {
      script,
      tracingScore,
      readingScore,
      riskAssessment,
      scoringMethod,
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * Get recommendations based on risk level
   */
  getRecommendations(riskLevel) {
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
  },
};
