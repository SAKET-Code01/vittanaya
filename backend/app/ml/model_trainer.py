"""Deterministic Model Trainer & Serializer for VITTANAYA (SIH26091).

Trains lightweight Scikit-Learn models (RandomForestClassifier for distress risk
and RandomForestRegressor for 12-month revenue growth) on synthetic empirical benchmark datasets
representing rural micro-enterprises in India (NABARD / MoSJE profiles).
"""

import os
from typing import Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor

FEATURE_NAMES = [
    "operating_margin_pct",
    "dscr_ratio",
    "cash_buffer_months",
    "working_capital_ratio",
    "capacity_utilization_pct",
    "catchment_score",
    "seasonality_risk_idx",
]

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
DISTRESS_MODEL_PATH = os.path.join(MODEL_DIR, "distress_classifier.joblib")
GROWTH_MODEL_PATH = os.path.join(MODEL_DIR, "growth_regressor.joblib")


def generate_benchmark_dataset(num_samples: int = 600, random_seed: int = 42) -> pd.DataFrame:
    """Generate reproducible empirical rural enterprise benchmark training dataset."""
    rng = np.random.RandomState(random_seed)

    margin = rng.uniform(-10.0, 45.0, num_samples)
    dscr = rng.uniform(0.5, 3.2, num_samples)
    buffer = rng.uniform(0.0, 5.5, num_samples)
    wc_ratio = rng.uniform(0.05, 0.45, num_samples)
    utilization = rng.uniform(30.0, 95.0, num_samples)
    catchment = rng.uniform(40.0, 95.0, num_samples)
    seasonality = rng.uniform(1.0, 5.0, num_samples)

    # Compute ground truth distress probability score
    distress_score = (
        (20.0 - margin) * 0.04
        + (1.5 - dscr) * 0.85
        + (1.5 - buffer) * 0.65
        + (0.25 - wc_ratio) * 2.5
        + (70.0 - utilization) * 0.02
        + (seasonality - 2.0) * 0.20
    )

    # Sigmoid mapping to binary default / distress classification
    distress_prob = 1.0 / (1.0 + np.exp(-distress_score))
    distress_target = (distress_prob > 0.50).astype(int)

    # Ground truth annual revenue growth rate %
    growth_rate = (
        margin * 0.25
        + (dscr - 1.0) * 4.5
        + (catchment - 50.0) * 0.15
        + (utilization - 50.0) * 0.10
        - seasonality * 1.2
        + rng.normal(0, 2.0, num_samples)
    )

    df = pd.DataFrame(
        {
            "operating_margin_pct": margin,
            "dscr_ratio": dscr,
            "cash_buffer_months": buffer,
            "working_capital_ratio": wc_ratio,
            "capacity_utilization_pct": utilization,
            "catchment_score": catchment,
            "seasonality_risk_idx": seasonality,
            "distress_target": distress_target,
            "growth_rate_target": growth_rate,
        }
    )
    return df


def train_and_save_models() -> Tuple[RandomForestClassifier, RandomForestRegressor]:
    """Train RandomForest models and serialize to disk."""
    df = generate_benchmark_dataset()

    X = df[FEATURE_NAMES]
    y_distress = df["distress_target"]
    y_growth = df["growth_rate_target"]

    clf = RandomForestClassifier(n_estimators=60, max_depth=5, random_state=42)
    clf.fit(X.values, y_distress)

    reg = RandomForestRegressor(n_estimators=60, max_depth=5, random_state=42)
    reg.fit(X.values, y_growth)

    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(clf, DISTRESS_MODEL_PATH)
    joblib.dump(reg, GROWTH_MODEL_PATH)

    return clf, reg


def load_or_train_models() -> Tuple[RandomForestClassifier, RandomForestRegressor]:
    """Load serialized models or train them on demand if missing."""
    if os.path.exists(DISTRESS_MODEL_PATH) and os.path.exists(GROWTH_MODEL_PATH):
        try:
            clf = joblib.load(DISTRESS_MODEL_PATH)
            reg = joblib.load(GROWTH_MODEL_PATH)
            return clf, reg
        except Exception:
            pass
    return train_and_save_models()
