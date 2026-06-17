# Akshar Training Pipeline (Phase 2)

This folder contains scripts for training ML-based dyslexia classifiers per script (Gujarati/Hindi).

## Architecture

```
Phase 1: Heuristic Scoring
├── Tracing task captures strokes
├── Reading task captures latency/accuracy
└── Heuristic rules compute risk (Low/Moderate/High)

Phase 2: ML-Based Scoring
├── Export assessments as dataset samples
├── Collect specialist/teacher labels
├── Train classifier per script
├── Deploy model weights to src/scoring/modelConfig.*.json
└── Scoring engine checks models, falls back to heuristic
```

## Files

- **collect_labels.py** - Merge exported JSON assessments with specialist labels
- **train_classifier.py** - Train logistic regression model per script
- **evaluate.py** - Compute precision/recall vs. specialist-confirmed cases
- **dataset/labeled_samples.csv** - Labeled training data (200+ samples)

## Quick Start

### 1. Install Dependencies

```bash
pip install numpy scikit-learn pandas
```

### 2. Collect Labeled Data

Export assessments from the web UI, then run:

```bash
python collect_labels.py
```

This merges exported JSONs with specialist labels and creates `labeled_samples.csv`.

### 3. Train Models

```bash
python train_classifier.py
```

Trains separate logistic regression models for:
- Gujarati: modelConfig.gu.json
- Hindi: modelConfig.hi.json

Models are saved to `../src/scoring/` and deployed with the app.

### 4. Evaluate

```bash
python evaluate.py
```

Generates evaluation metrics:
- Accuracy, Precision, Recall, F1-Score
- ROC-AUC
- Confusion matrix
- Recommendations

## Training Data Format

`labeled_samples.csv` requires:

```
sample_id, script, age, labeled_by, confidence, 
tracing_normalized_duration, tracing_reattempt_count, ..., 
reading_mean_latency_normalized, ..., 
is_dyslexia
```

Features must be normalized to [0, 1] range.

## Model Configuration

Models are stored as JSON with:
- Weights & intercept
- Probability thresholds (moderate: 0.35, high: 0.65)
- Feature names & importance
- Accuracy/precision/recall

Example (`modelConfig.gu.json`):
```json
{
  "model_type": "logistic_regression",
  "weights": [-0.45, 0.38, ...],
  "intercept": -0.15,
  "thresholds": {
    "moderate": 0.35,
    "high": 0.65
  }
}
```

## Workflow

1. **Phase 1**: Users complete tracing + reading tasks
2. **Export**: Results exported as JSON samples
3. **Labeling**: Specialist/teacher labels samples (UI coming in Phase 3)
4. **Training**: `train_classifier.py` creates models
5. **Deployment**: Models copied to `src/scoring/`
6. **Scoring**: `classifierLoader.js` loads models at runtime
7. **Fallback**: If model unavailable, use heuristic scoring

## Feature Extraction

Features extracted by `featureExtractor.js`:

**Tracing (6 features):**
- Normalized duration
- Re-attempt count
- Stroke smoothness
- Pen consistency
- Direction changes
- Bounding box coverage

**Reading (6 features):**
- Mean latency (normalized)
- Latency std dev
- Accuracy ratio
- Latency variability
- Word count
- Correct ratio

Total: 12-feature vector → ML model → Risk prediction

## Model Performance Targets

- Accuracy: >85%
- Precision: >85% (minimize false positives)
- Recall: >80% (catch dyslexic cases)
- F1-Score: >82%

## Future Improvements

- Gradient boosted trees (XGBoost)
- Deep learning with CNN for stroke patterns
- Multilingual dataset pooling (Gujarati + Hindi)
- Age-specific classifiers
- Interactive labeling UI in Phase 3
