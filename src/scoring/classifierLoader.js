/**
 * classifierLoader.js
 * Dynamically loads trained ML model weights and configuration at runtime
 * Falls back to heuristic scoring if model unavailable
 */

let modelCache = {};

/**
 * Load model configuration for a given script
 * @param {string} script - 'gu' (Gujarati) or 'hi' (Hindi)
 * @returns {Promise<object>} model config with weights and metadata
 */
export async function loadModel(script) {
  // Return cached model if already loaded
  if (modelCache[script]) {
    return modelCache[script];
  }

  try {
    // Load model config JSON at runtime
    const configPath = `/modelConfig.${script}.json`;
    const response = await fetch(configPath);

    if (!response.ok) {
      console.warn(
        `Model config not found for ${script}. Using heuristic fallback.`
      );
      return null;
    }

    const config = await response.json();

    // Validate model structure
    if (!config.weights || !config.model_type) {
      console.warn(`Invalid model config for ${script}. Falling back to heuristic.`);
      return null;
    }

    // Cache the model
    modelCache[script] = config;
    console.log(`Model loaded for ${script}: ${config.model_type}`);

    return config;
  } catch (error) {
    console.warn(`Error loading model for ${script}:`, error);
    return null;
  }
}

/**
 * Clear model cache (for testing or resetting)
 */
export function clearModelCache() {
  modelCache = {};
}

/**
 * Predict risk using loaded model
 * @param {string} script - 'gu' or 'hi'
 * @param {array} features - extracted features from raw data
 * @returns {Promise<object>} prediction { risk_level, risk_score, confidence }
 */
export async function predictWithModel(script, features) {
  const model = await loadModel(script);

  if (!model) {
    return null; // Signal to use heuristic fallback
  }

  try {
    // Simple linear/logistic regression prediction
    if (model.model_type === 'logistic_regression') {
      return predictLogisticRegression(model, features);
    }

    // Gradient boosted tree prediction
    if (model.model_type === 'xgboost' || model.model_type === 'gradient_boost') {
      return predictGradientBoostedTree(model, features);
    }

    console.warn(`Unknown model type: ${model.model_type}`);
    return null;
  } catch (error) {
    console.warn(`Error predicting with model:`, error);
    return null;
  }
}

/**
 * Logistic regression prediction
 */
function predictLogisticRegression(model, features) {
  const { weights, intercept, thresholds } = model;

  // Compute linear combination
  let score = intercept || 0;
  for (let i = 0; i < Math.min(weights.length, features.length); i++) {
    score += weights[i] * features[i];
  }

  // Apply sigmoid
  const probability = 1 / (1 + Math.exp(-score));

  // Classify based on thresholds
  let riskLevel = 'LOW';
  if (probability > thresholds.high) {
    riskLevel = 'HIGH';
  } else if (probability > thresholds.moderate) {
    riskLevel = 'MODERATE';
  }

  return {
    risk_level: riskLevel,
    risk_score: probability,
    confidence: 0.8,
    model_type: 'logistic_regression',
  };
}

/**
 * Gradient boosted tree prediction (simplified tree traversal)
 */
function predictGradientBoostedTree(model, features) {
  const { trees, thresholds, learning_rate, initial_score } = model;

  let score = initial_score || 0.5;

  // Traverse each tree
  if (trees && Array.isArray(trees)) {
    for (const tree of trees) {
      const treeScore = traverseTree(tree, features);
      score += learning_rate * treeScore;
    }
  }

  // Clamp to [0, 1]
  score = Math.max(0, Math.min(1, score));

  // Classify
  let riskLevel = 'LOW';
  if (score > thresholds.high) {
    riskLevel = 'HIGH';
  } else if (score > thresholds.moderate) {
    riskLevel = 'MODERATE';
  }

  return {
    risk_level: riskLevel,
    risk_score: score,
    confidence: 0.85,
    model_type: 'gradient_boosted_tree',
  };
}

/**
 * Simple tree traversal
 */
function traverseTree(node, features) {
  if (!node) return 0;

  // Leaf node
  if (node.value !== undefined) {
    return node.value;
  }

  // Internal node
  const featureIndex = node.feature;
  const threshold = node.threshold;
  const featureValue = features[featureIndex] || 0;

  if (featureValue <= threshold) {
    return traverseTree(node.left, features);
  } else {
    return traverseTree(node.right, features);
  }
}

/**
 * Get model metadata
 */
export async function getModelMetadata(script) {
  const model = await loadModel(script);
  if (!model) return null;

  return {
    model_type: model.model_type,
    version: model.version || '1.0',
    training_date: model.training_date,
    accuracy: model.accuracy,
    f1_score: model.f1_score,
    feature_names: model.feature_names || [],
  };
}
