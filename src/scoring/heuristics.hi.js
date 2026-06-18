/**
 * Hindi/Devanagari-specific scoring heuristics and thresholds
 */

const hindiThresholds = {
  tracing: {
    speedMin: 1200, // ms minimum to complete a letter
    speedMax: 12000, // ms maximum to complete a letter
    accuracyThreshold: 0.65, // 65% path match required (Devanagari is more complex)
    reattemptPenalty: 0.12, // penalty per re-attempt
  },
  reading: {
    wordLatencyMean: 900, // ms average for known readers (slightly slower than Gujarati)
    wordLatencyStdDev: 350, // standard deviation
    accuracyThreshold: 0.85, // 85% accuracy required
  },
};

export const hindiScorer = {
  /**
   * Evaluate tracing performance for Hindi
   * @param {object} data - { strokePath, duration, reattempts, confidence }
   * @returns {object} score breakdown
   */
  evaluateTracing(data) {
    const { duration = 0, reattempts = 0 } = data;

    // Normalize duration
    const speedScore = this.normalizeSpeed(duration);

    // Penalty for re-attempts
    const reattemptPenalty =
      reattempts * hindiThresholds.tracing.reattemptPenalty;

    // Combined score
    const tracingScore = Math.max(
      0,
      speedScore - reattemptPenalty
    );

    return {
      score: tracingScore,
      speedScore,
      reattempts,
      duration,
      level: tracingScore > 0.65 ? 'good' : 'needs_improvement',
    };
  },

  /**
   * Evaluate reading performance for Hindi
   * @param {array} data - array of { word, latency, correct }
   * @returns {object} score breakdown
   */
  evaluateReading(data) {
    if (!data || data.length === 0) {
      return { score: 0, level: 'no_data' };
    }

    // Calculate average latency
    const latencies = data.map((item) => item.latency || 0);
    const meanLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;

    // Calculate accuracy
    const correctCount = data.filter((item) => item.correct).length;
    const accuracy = correctCount / data.length;

    // Latency score
    let latencyScore;
    if (meanLatency <= hindiThresholds.reading.wordLatencyMean) {
      latencyScore = 1.0;
    } else {
      const latencyDeviation = meanLatency - hindiThresholds.reading.wordLatencyMean;
      latencyScore = Math.max(
        0,
        1 - latencyDeviation / hindiThresholds.reading.wordLatencyMean
      );
    }

    // Combined score
    const readingScore = latencyScore * 0.4 + accuracy * 0.6;

    return {
      score: readingScore,
      meanLatency,
      accuracy,
      itemCount: data.length,
      level:
        readingScore > 0.65
          ? 'fluent'
          : readingScore > 0.35
            ? 'moderate'
            : 'struggling',
    };
  },

  /**
   * Normalize speed score
   */
  normalizeSpeed(duration) {
    const { speedMin, speedMax } = hindiThresholds.tracing;
    if (duration < speedMin) return duration / speedMin; // Too fast (suspicious) - penalize
    if (duration > speedMax) return 0; // Too slow
    return 1 - (duration - speedMin) / (speedMax - speedMin);
  },
};
