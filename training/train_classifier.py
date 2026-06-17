#!/usr/bin/env python3
"""
train_classifier.py
Trains logistic regression / gradient-boosted tree classifier per script
Outputs model weights/config JSON files
"""

import json
import sys
from pathlib import Path
from typing import Tuple, Dict, List
import csv

try:
    import numpy as np
    from sklearn.linear_model import LogisticRegression
    from sklearn.preprocessing import StandardScaler
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import (
        accuracy_score,
        precision_score,
        recall_score,
        f1_score,
        confusion_matrix,
    )
except ImportError:
    print("ERROR: Required packages not found. Install with:")
    print("  pip install numpy scikit-learn")
    sys.exit(1)


def load_labeled_dataset(csv_file: str) -> Tuple[Dict, Dict, List[str]]:
    """Load labeled dataset CSV"""
    gujarati_X, gujarati_y = [], []
    hindi_X, hindi_y = [], []

    feature_names = []

    with open(csv_file, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            script = row.get("script", "gu")

            # Extract features
            if not feature_names:
                # All keys except metadata
                feature_names = [
                    k
                    for k in row.keys()
                    if k
                    not in [
                        "sample_id",
                        "script",
                        "age",
                        "labeled_by",
                        "confidence",
                        "is_dyslexia",
                    ]
                ]

            features = [float(row[f]) for f in feature_names]
            label = int(row["is_dyslexia"])

            if script == "gu":
                gujarati_X.append(features)
                gujarati_y.append(label)
            elif script == "hi":
                hindi_X.append(features)
                hindi_y.append(label)

    return (
        {"X": np.array(gujarati_X), "y": np.array(gujarati_y)},
        {"X": np.array(hindi_X), "y": np.array(hindi_y)},
        feature_names,
    )


def train_logistic_regression(
    X_train: np.ndarray, y_train: np.ndarray
) -> Tuple[LogisticRegression, StandardScaler]:
    """Train logistic regression model"""
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_train)

    model = LogisticRegression(max_iter=1000, random_state=42)
    model.fit(X_scaled, y_train)

    return model, scaler


def evaluate_model(
    model, scaler, X_test, y_test, script_name: str
) -> Dict:
    """Evaluate model performance"""
    X_scaled = scaler.transform(X_test)
    y_pred = model.predict(X_scaled)
    y_pred_proba = model.predict_proba(X_scaled)[:, 1]

    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, zero_division=0)
    recall = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)

    print(f"\n{script_name} Model Performance")
    print("=" * 50)
    print(f"Accuracy:  {accuracy:.3f}")
    print(f"Precision: {precision:.3f}")
    print(f"Recall:    {recall:.3f}")
    print(f"F1-Score:  {f1:.3f}")

    tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()
    print(f"\nConfusion Matrix:")
    print(f"  True Negatives:  {tn}")
    print(f"  False Positives: {fp}")
    print(f"  False Negatives: {fn}")
    print(f"  True Positives:  {tp}")

    return {
        "accuracy": float(accuracy),
        "precision": float(precision),
        "recall": float(recall),
        "f1_score": float(f1),
        "confusion_matrix": {
            "tn": int(tn),
            "fp": int(fp),
            "fn": int(fn),
            "tp": int(tp),
        },
    }


def create_model_config(
    model: LogisticRegression,
    scaler: StandardScaler,
    metrics: Dict,
    script: str,
    feature_names: List[str],
) -> Dict:
    """Create model configuration JSON"""
    # Calculate feature importance (absolute coefficient values)
    feature_importance = [
        float(abs(c)) for c in model.coef_[0]
    ]  # Normalize to importance scores
    max_importance = max(feature_importance) if feature_importance else 1
    feature_importance = [fi / max_importance for fi in feature_importance]

    config = {
        "model_type": "logistic_regression",
        "version": "1.0",
        "script": script,
        "training_date": "2024-06-17",
        "accuracy": metrics["accuracy"],
        "precision": metrics["precision"],
        "recall": metrics["recall"],
        "f1_score": metrics["f1_score"],
        "feature_names": feature_names,
        "weights": [float(w) for w in model.coef_[0]],
        "intercept": float(model.intercept_[0]),
        "thresholds": {"moderate": 0.35, "high": 0.65},
        "scaler": {
            "mean": [float(m) for m in scaler.mean_],
            "std": [float(s) for s in scaler.scale_],
        },
        "metadata": {
            "training_samples": "varies",
            "dyslexia_positive": "varies",
            "dyslexia_negative": "varies",
            "age_range": "4-9",
            "feature_importance": feature_importance,
            "confusion_matrix": metrics["confusion_matrix"],
        },
    }

    return config


def save_model_config(config: Dict, output_file: str) -> None:
    """Save model configuration to JSON"""
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(config, f, indent=2)
    print(f"✓ Saved: {output_file}")


def main():
    """Main training pipeline"""
    print("Akshar Model Training Pipeline")
    print("=" * 50)

    # Load dataset
    csv_file = Path(__file__).parent / "dataset" / "labeled_samples.csv"

    if not csv_file.exists():
        print(f"ERROR: Dataset not found: {csv_file}")
        print("Run collect_labels.py first")
        sys.exit(1)

    print(f"Loading dataset: {csv_file}")
    gujarati_data, hindi_data, feature_names = load_labeled_dataset(str(csv_file))

    output_dir = Path(__file__).parent.parent / "src" / "scoring"
    output_dir.mkdir(parents=True, exist_ok=True)

    # Train Gujarati model
    if len(gujarati_data["X"]) > 0:
        print(f"\nTraining Gujarati model ({len(gujarati_data['X'])} samples)...")
        X_train, X_test, y_train, y_test = train_test_split(
            gujarati_data["X"], gujarati_data["y"], test_size=0.2, random_state=42
        )

        model_gu, scaler_gu = train_logistic_regression(X_train, y_train)
        metrics_gu = evaluate_model(
            model_gu, scaler_gu, X_test, y_test, "Gujarati"
        )

        config_gu = create_model_config(
            model_gu, scaler_gu, metrics_gu, "gu", feature_names
        )
        save_model_config(config_gu, str(output_dir / "modelConfig.gu.json"))
    else:
        print("\n⚠ No Gujarati samples in dataset")

    # Train Hindi model
    if len(hindi_data["X"]) > 0:
        print(f"\nTraining Hindi model ({len(hindi_data['X'])} samples)...")
        X_train, X_test, y_train, y_test = train_test_split(
            hindi_data["X"], hindi_data["y"], test_size=0.2, random_state=42
        )

        model_hi, scaler_hi = train_logistic_regression(X_train, y_train)
        metrics_hi = evaluate_model(model_hi, scaler_hi, X_test, y_test, "Hindi")

        config_hi = create_model_config(
            model_hi, scaler_hi, metrics_hi, "hi", feature_names
        )
        save_model_config(config_hi, str(output_dir / "modelConfig.hi.json"))
    else:
        print("\n⚠ No Hindi samples in dataset")

    print("\n✓ Training complete!")
    print(f"Model configs saved to: {output_dir}")


if __name__ == "__main__":
    main()
