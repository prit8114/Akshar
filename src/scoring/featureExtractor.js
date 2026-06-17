/**
 * featureExtractor.js
 * Converts raw tracing + reading capture data into model input features
 * Ensures consistent feature vectors for ML model prediction
 */

/**
 * Extract features from raw tracing and reading data
 * @param {object} tracingData - { strokePath, duration, reattempts, confidence }
 * @param {array} readingData - [{ word, latency, correct }, ...]
 * @returns {array} feature vector for ML model
 */
export function extractFeatures(tracingData, readingData) {
  const tracingFeatures = extractTracingFeatures(tracingData);
  const readingFeatures = extractReadingFeatures(readingData);

  // Combine: [tracing_features..., reading_features...]
  return [...tracingFeatures, ...readingFeatures];
}

/**
 * Extract features from tracing task data
 * Features:
 *  0. normalized_duration (0-1)
 *  1. reattempt_count
 *  2. stroke_smoothness (0-1)
 *  3. pen_pressure_consistency (0-1)
 *  4. direction_changes_ratio (0-1)
 *  5. bounding_box_coverage (0-1)
 */
export function extractTracingFeatures(tracingData) {
  if (!tracingData) {
    return [0, 0, 0, 0, 0, 0]; // Default zeros
  }

  const {
    strokes = [],
    duration = 0,
    reattempts = 0,
    confidence = 0,
  } = tracingData;

  // Feature 0: Normalized duration (typical: 1-10 seconds)
  const normalizedDuration = Math.min(1, duration / 10000);

  // Feature 1: Re-attempt count (capped at 5)
  const reattemptCount = Math.min(1, reattempts / 5);

  // Feature 2: Stroke smoothness (fewer, longer strokes = smoother)
  const strokeSmoothness = computeStrokeSmoothness(strokes);

  // Feature 3: Pen pressure consistency (based on confidence)
  const penConsistency = confidence;

  // Feature 4: Direction changes ratio
  const directionChanges = computeDirectionChanges(strokes);

  // Feature 5: Bounding box coverage (how much of canvas is used)
  const boundingBoxCoverage = computeBoundingBoxCoverage(strokes);

  return [
    normalizedDuration,
    reattemptCount,
    strokeSmoothness,
    penConsistency,
    directionChanges,
    boundingBoxCoverage,
  ];
}

/**
 * Extract features from reading task data
 * Features:
 *  0. mean_latency_normalized (0-1)
 *  1. latency_std_dev_normalized (0-1)
 *  2. accuracy_ratio (0-1)
 *  3. latency_variability (0-1)
 *  4. word_count
 *  5. correct_count_ratio (0-1)
 */
export function extractReadingFeatures(readingData) {
  if (!readingData || readingData.length === 0) {
    return [0, 0, 0, 0, 0, 0]; // Default zeros if no reading data
  }

  const latencies = readingData.map((item) => item.latency || 0);
  const correctCount = readingData.filter((item) => item.correct).length;

  // Feature 0: Mean latency (typical: 500-2000 ms)
  const meanLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
  const normalizedMeanLatency = Math.min(1, meanLatency / 2000);

  // Feature 1: Std dev of latencies
  const variance =
    latencies.reduce((sum, lat) => sum + Math.pow(lat - meanLatency, 2), 0) /
    latencies.length;
  const stdDev = Math.sqrt(variance);
  const normalizedStdDev = Math.min(1, stdDev / 1000);

  // Feature 2: Accuracy ratio
  const accuracyRatio = correctCount / readingData.length;

  // Feature 3: Latency variability (coefficient of variation)
  const latencyVariability = meanLatency > 0 ? stdDev / meanLatency : 0;
  const normalizedVariability = Math.min(1, latencyVariability);

  // Feature 4: Word count (normalized)
  const wordCount = Math.min(1, readingData.length / 10);

  // Feature 5: Correct count ratio
  const correctRatio = correctCount / readingData.length;

  return [
    normalizedMeanLatency,
    normalizedStdDev,
    accuracyRatio,
    normalizedVariability,
    wordCount,
    correctRatio,
  ];
}

/**
 * Helper: Compute stroke smoothness
 * Fewer strokes = smoother (higher score)
 */
function computeStrokeSmoothness(strokes) {
  if (!strokes || strokes.length === 0) return 0;

  // Ideal is 1-2 strokes, penalty for more
  const strokePenalty = Math.min(1, strokes.length / 5);
  return Math.max(0, 1 - strokePenalty);
}

/**
 * Helper: Compute direction changes
 * Ratio of direction changes to total segments
 */
function computeDirectionChanges(strokes) {
  let totalSegments = 0;
  let directionChangeCount = 0;

  for (const stroke of strokes || []) {
    const points = stroke.points || [];
    if (points.length < 2) continue;

    let prevDirection = null;
    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      const angle = Math.atan2(dy, dx);

      if (prevDirection !== null) {
        const angleDiff = Math.abs(angle - prevDirection);
        if (angleDiff > 0.5) {
          directionChangeCount++;
        }
      }

      prevDirection = angle;
      totalSegments++;
    }
  }

  if (totalSegments === 0) return 0;
  return Math.min(1, directionChangeCount / totalSegments);
}

/**
 * Helper: Compute bounding box coverage
 * What percentage of the canvas is used
 */
function computeBoundingBoxCoverage(strokes) {
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;

  for (const stroke of strokes || []) {
    for (const point of stroke.points || []) {
      minX = Math.min(minX, point.x || 0);
      maxX = Math.max(maxX, point.x || 0);
      minY = Math.min(minY, point.y || 0);
      maxY = Math.max(maxY, point.y || 0);
    }
  }

  if (
    minX === Infinity ||
    maxX === -Infinity ||
    minY === Infinity ||
    maxY === -Infinity
  ) {
    return 0;
  }

  // Typical canvas: 400x300
  const width = maxX - minX;
  const height = maxY - minY;
  const coverage = (width * height) / (400 * 300);

  return Math.min(1, coverage);
}

/**
 * Get feature names for interpretability
 */
export function getFeatureNames() {
  return [
    // Tracing features
    'tracing_normalized_duration',
    'tracing_reattempt_count',
    'tracing_stroke_smoothness',
    'tracing_pen_consistency',
    'tracing_direction_changes',
    'tracing_bbox_coverage',
    // Reading features
    'reading_mean_latency_normalized',
    'reading_latency_std_dev',
    'reading_accuracy',
    'reading_latency_variability',
    'reading_word_count',
    'reading_correct_ratio',
  ];
}

/**
 * Validate feature vector
 */
export function validateFeatures(features) {
  if (!Array.isArray(features)) {
    console.warn('Features must be an array');
    return false;
  }

  if (features.length !== 12) {
    console.warn(`Expected 12 features, got ${features.length}`);
    return false;
  }

  // Check all features are numbers between 0-1
  for (let i = 0; i < features.length; i++) {
    if (typeof features[i] !== 'number' || features[i] < 0 || features[i] > 1) {
      console.warn(
        `Feature ${i} (${getFeatureNames()[i]}) out of range: ${features[i]}`
      );
      // This is a warning, not a fatal error
    }
  }

  return true;
}
