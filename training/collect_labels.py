#!/usr/bin/env python3
"""
collect_labels.py
Merges exported JSON samples with specialist/teacher labels
Creates labeled dataset CSV for model training
"""

import json
import csv
import os
import sys
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Tuple

# Sample labeled data structure
# In production, this would be populated through a web UI or external system
SAMPLE_LABELED_DATA = [
    {
        "sample_id": "gu_20240101_001",
        "script": "gu",
        "child_age": 5,
        "tracing_duration": 5234,
        "tracing_reattempts": 2,
        "tracing_confidence": 0.72,
        "reading_mean_latency": 1200,
        "reading_accuracy": 0.875,
        "is_dyslexia": False,
        "labeled_by": "specialist_001",
        "confidence": 0.95,
        "notes": "Normal development",
    },
    {
        "sample_id": "gu_20240102_001",
        "script": "gu",
        "child_age": 6,
        "tracing_duration": 8900,
        "tracing_reattempts": 5,
        "tracing_confidence": 0.45,
        "reading_mean_latency": 2100,
        "reading_accuracy": 0.625,
        "is_dyslexia": True,
        "labeled_by": "specialist_001",
        "confidence": 0.92,
        "notes": "Significant difficulty with letter formation",
    },
    {
        "sample_id": "hi_20240103_001",
        "script": "hi",
        "child_age": 5,
        "tracing_duration": 4800,
        "tracing_reattempts": 1,
        "tracing_confidence": 0.85,
        "reading_mean_latency": 950,
        "reading_accuracy": 0.95,
        "is_dyslexia": False,
        "labeled_by": "teacher_001",
        "confidence": 0.98,
        "notes": "Advanced reader",
    },
]


def load_json_exports(export_dir: str) -> List[Dict]:
    """Load all exported JSON samples from directory"""
    samples = []
    export_path = Path(export_dir)

    if not export_path.exists():
        print(f"Export directory not found: {export_dir}")
        return samples

    for json_file in export_path.glob("*.json"):
        try:
            with open(json_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                samples.append(data)
                print(f"Loaded: {json_file.name}")
        except Exception as e:
            print(f"Error loading {json_file}: {e}")

    return samples


def match_labels_to_samples(
    json_samples: List[Dict], labeled_data: List[Dict]
) -> List[Dict]:
    """Match labels to exported JSON samples"""
    labeled_samples = []

    for label_entry in labeled_data:
        sample_id = label_entry.get("sample_id")
        matching_json = next(
            (s for s in json_samples if s.get("sample_id") == sample_id), None
        )

        if matching_json:
            # Merge JSON data with labels
            merged = {**matching_json, **label_entry}
            labeled_samples.append(merged)
            print(f"Labeled: {sample_id}")
        else:
            print(f"No JSON sample found for label: {sample_id}")

    return labeled_samples


def extract_features_from_labeled_data(sample: Dict) -> Tuple[str, List[float], int]:
    """
    Extract feature vector from labeled sample
    Returns: (script, features, label)
    Features match featureExtractor.js output
    """
    script = sample.get("script", "gu")

    # Tracing features (6)
    tracing_duration = sample.get("tracing_duration", 0) / 10000  # Normalize
    tracing_reattempts = min(sample.get("tracing_reattempts", 0) / 5, 1)
    tracing_smoothness = sample.get("tracing_confidence", 0)
    tracing_consistency = sample.get("tracing_confidence", 0)
    tracing_direction = sample.get("tracing_direction_changes", 0.3)
    tracing_coverage = sample.get("tracing_bbox_coverage", 0.6)

    # Reading features (6)
    reading_latency = min(sample.get("reading_mean_latency", 0) / 2000, 1)
    reading_std_dev = sample.get("reading_latency_std_dev", 0.2)
    reading_accuracy = sample.get("reading_accuracy", 0.5)
    reading_variability = sample.get("reading_latency_variability", 0.3)
    reading_word_count = min(sample.get("reading_word_count", 5) / 10, 1)
    reading_correct_ratio = sample.get("reading_accuracy", 0.5)

    features = [
        tracing_duration,
        tracing_reattempts,
        tracing_smoothness,
        tracing_consistency,
        tracing_direction,
        tracing_coverage,
        reading_latency,
        reading_std_dev,
        reading_accuracy,
        reading_variability,
        reading_word_count,
        reading_correct_ratio,
    ]

    # Label: 1 if dyslexia, 0 otherwise
    label = 1 if sample.get("is_dyslexia", False) else 0

    return script, features, label


def create_dataset_csv(labeled_samples: List[Dict], output_file: str) -> None:
    """Create CSV file suitable for ML training"""
    if not labeled_samples:
        print("No labeled samples to write")
        return

    feature_names = [
        "tracing_normalized_duration",
        "tracing_reattempt_count",
        "tracing_stroke_smoothness",
        "tracing_pen_consistency",
        "tracing_direction_changes",
        "tracing_bbox_coverage",
        "reading_mean_latency_normalized",
        "reading_latency_std_dev",
        "reading_accuracy",
        "reading_latency_variability",
        "reading_word_count",
        "reading_correct_ratio",
    ]

    fieldnames = (
        ["sample_id", "script", "age", "labeled_by", "confidence"]
        + feature_names
        + ["is_dyslexia"]
    )

    with open(output_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()

        for sample in labeled_samples:
            script, features, label = extract_features_from_labeled_data(sample)

            row = {
                "sample_id": sample.get("sample_id", "unknown"),
                "script": script,
                "age": sample.get("child_age", 5),
                "labeled_by": sample.get("labeled_by", "unknown"),
                "confidence": sample.get("confidence", 0.9),
                "is_dyslexia": label,
            }

            # Add features
            for i, feature_name in enumerate(feature_names):
                row[feature_name] = features[i]

            writer.writerow(row)
            print(f"Wrote: {sample.get('sample_id')}")

    print(f"\nDataset CSV created: {output_file}")


def print_dataset_summary(labeled_samples: List[Dict]) -> None:
    """Print summary statistics"""
    if not labeled_samples:
        print("No labeled samples")
        return

    total = len(labeled_samples)
    dyslexia_count = sum(1 for s in labeled_samples if s.get("is_dyslexia", False))
    normal_count = total - dyslexia_count

    scripts = {}
    for sample in labeled_samples:
        script = sample.get("script", "unknown")
        if script not in scripts:
            scripts[script] = {"total": 0, "dyslexia": 0}
        scripts[script]["total"] += 1
        if sample.get("is_dyslexia", False):
            scripts[script]["dyslexia"] += 1

    print("\n" + "=" * 50)
    print("DATASET SUMMARY")
    print("=" * 50)
    print(f"Total samples: {total}")
    print(f"  - Dyslexia positive: {dyslexia_count} ({dyslexia_count/total*100:.1f}%)")
    print(f"  - Normal: {normal_count} ({normal_count/total*100:.1f}%)")
    print("\nBreakdown by script:")
    for script, counts in scripts.items():
        script_name = "Gujarati" if script == "gu" else "Hindi" if script == "hi" else script
        print(
            f"  {script_name}: {counts['total']} samples "
            f"(dyslexia: {counts['dyslexia']}, normal: {counts['total'] - counts['dyslexia']})"
        )


def main():
    """Main entry point"""
    print("Akshar Dataset Collection Tool")
    print("=" * 50)

    # Paths
    script_dir = Path(__file__).parent
    export_dir = script_dir / "exports"  # Optional: load from exported JSONs
    output_dir = script_dir / "dataset"
    output_file = output_dir / "labeled_samples.csv"

    # Create output directory
    output_dir.mkdir(exist_ok=True)

    # Load JSON exports (if available)
    json_samples = load_json_exports(str(export_dir))
    print(f"Loaded {len(json_samples)} JSON exports")

    # Use sample labeled data (in production, this comes from external source)
    print(f"Using {len(SAMPLE_LABELED_DATA)} sample labeled records")

    # Merge
    labeled_samples = SAMPLE_LABELED_DATA  # In production: match_labels_to_samples(json_samples, labels_from_ui)

    # Create CSV
    create_dataset_csv(labeled_samples, str(output_file))

    # Print summary
    print_dataset_summary(labeled_samples)

    print("\n✓ Dataset collection complete!")


if __name__ == "__main__":
    main()
