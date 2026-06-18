/**
 * Gujarati-specific scoring heuristics and thresholds
 */

const gujaratiThresholds = {
  tracing: {
    speedMin: 1000, // ms minimum to complete a letter
    speedMax: 10000, // ms maximum to complete a letter
    accuracyThreshold: 0.7, // 70% path match required
    reattemptPenalty: 0.1, // penalty per re-attempt
  },
  reading: {
    wordLatencyMean: 800, // ms average for known readers
    wordLatencyStdDev: 300, // standard deviation
    accuracyThreshold: 0.9, // 90% accuracy required
  },
};

export const gujaratiScorer = {
  /**
   * Evaluate tracing performance for Gujarati
   * @param {object} data - { strokePath, duration, reattempts, confidence }
   * @returns {object} score breakdown
   */
  evaluateTracing(data) {
    const { duration = 0, reattempts = 0 } = data;

    // Normalize duration
    const speedScore = this.normalizeSpeed(duration);

    // Penalty for re-attempts
    const reattemptPenalty =
      reattempts * gujaratiThresholds.tracing.reattemptPenalty;

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
      level: tracingScore > 0.7 ? 'good' : 'needs_improvement',
    };
  },

  /**
   * Evaluate reading performance for Gujarati
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

    // Latency score (closer to mean = better)
    let latencyScore;
    if (meanLatency <= gujaratiThresholds.reading.wordLatencyMean) {
      latencyScore = 1.0;
    } else {
      const latencyDeviation = meanLatency - gujaratiThresholds.reading.wordLatencyMean;
      latencyScore = Math.max(
        0,
        1 - latencyDeviation / gujaratiThresholds.reading.wordLatencyMean
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
        readingScore > 0.7
          ? 'fluent'
          : readingScore > 0.4
            ? 'moderate'
            : 'struggling',
    };
  },

  /**
   * Normalize speed score
   */
  normalizeSpeed(duration) {
    const { speedMin, speedMax } = gujaratiThresholds.tracing;
    if (duration < speedMin) return duration / speedMin; // Too fast (suspicious) - penalize
    if (duration > speedMax) return 0; // Too slow
    return 1 - (duration - speedMin) / (speedMax - speedMin);
  },
};
