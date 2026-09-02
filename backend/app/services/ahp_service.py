"""AHP Feasibility Weighting Service for VITTANAYA (SIH26091).

Implements a fully data-driven Analytic Hierarchy Process (AHP) pipeline for
deriving criterion weights used in the 5-factor Feasibility Assessment.

DATA PROVENANCE
---------------
Dataset A (Expert Survey Screenshot):
    Only 4 of 10 pairwise comparisons are visible in the survey screenshot.
    Six comparisons are missing.  Dataset A is stored for audit completeness only
    and is NOT used to derive final weights.
    Status: "partial_survey_missing_6_comparisons"

Dataset B (AHP Guide PDF - Illustrative Worked Example):
    Complete dataset: 5 experts x 10 pairwise comparisons.
    This is an ILLUSTRATIVE worked example provided with the AHP methodology guide.
    Status: "illustrative_dataset"

HONESTY REQUIREMENT
-------------------
The UI and API MUST communicate:
    "Current prototype AHP weights are derived from the supplied
     illustrative expert-comparison dataset."
NOT:
    "Government prescribed weights" / "Official expert survey result".

ARCHITECTURE
------------
DATA -> CALCULATION -> API -> UI.
No static fallback overrides the computed result.  Changing expert responses
in DATASET_B_EXPERT_RESPONSES automatically recomputes all downstream values.
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Any, Dict, List, Optional

# Random Consistency Index for n=5 (Saaty, 1980)
RANDOM_CONSISTENCY_INDEX: Dict[int, float] = {
    1: 0.00, 2: 0.00, 3: 0.58, 4: 0.90,
    5: 1.12, 6: 1.24, 7: 1.32, 8: 1.41,
    9: 1.45, 10: 1.49,
}

CRITERIA_ORDER = ["market", "financial", "location", "competition", "risk"]

CRITERIA_LABELS = {
    "market": "Market Catchment & Demand",
    "financial": "Financial Viability & Margin",
    "location": "Location & Mandi Connectivity",
    "competition": "Competition & Barrier to Entry",
    "risk": "Risk Resilience & Buffer",
}

# ---------------------------------------------------------------------------
# DATASET B - Complete illustrative dataset from AHP Guide PDF
# Source: Vittanaya_AHP_Feasibility_Weightage_Step_by_Step_Guide.pdf
# Status: Illustrative worked example - NOT a verified field expert survey
# Columns: CA | Market Expert | Banking/MSME Expert | Business Consultant | Entrepreneur
# ---------------------------------------------------------------------------
DATASET_B_EXPERT_RESPONSES: Dict[str, List[float]] = {
    "M_vs_F": [1, 1, 1, 1, 3],
    "M_vs_L": [1, 1, 1, 4, 8],
    "M_vs_C": [1, 1, 1, 4, 8],
    "M_vs_R": [1, 1, 1, 4, 8],
    "F_vs_L": [1, 1, 1, 2, 6],
    "F_vs_C": [1, 1, 1, 2, 6],
    "F_vs_R": [1, 1, 1, 2, 6],
    "L_vs_C": [1, 1, 1, 1, 1],
    "L_vs_R": [1, 1, 1, 1, 1],
    "C_vs_R": [1, 1, 1, 1, 1],
}

DATASET_B_EXPERT_LABELS = [
    "CA",
    "Market Expert",
    "Banking / MSME Expert",
    "Business Consultant",
    "Experienced Entrepreneur",
]

DATASET_B_SOURCE_STATUS = "illustrative_dataset"
DATASET_B_DISCLAIMER = (
    "Current prototype AHP weights are derived from the supplied illustrative "
    "expert-comparison dataset (Vittanaya AHP Guide PDF). "
    "This is NOT a verified field expert survey or government-prescribed weighting."
)

# ---------------------------------------------------------------------------
# DATASET A - Partial survey screenshot (only 4 of 10 comparisons visible)
# Columns: Banking Expert | CA | Business Consultant | Entrepreneur | Market Expert
# Missing 6 comparisons are explicitly None - NOT invented
# ---------------------------------------------------------------------------
DATASET_A_PARTIAL: Dict[str, Optional[List[float]]] = {
    "M_vs_F": [2, 1, 2, 1, 3],
    "M_vs_L": [3, 3, 2, 2, 3],
    "M_vs_C": [3, 2, 3, 2, 3],
    "M_vs_R": [3, 2, 2, 2, 3],
    "F_vs_L": None,
    "F_vs_C": None,
    "F_vs_R": None,
    "L_vs_C": None,
    "L_vs_R": None,
    "C_vs_R": None,
}

DATASET_A_SOURCE_STATUS = "partial_survey_missing_6_comparisons"
DATASET_A_DISCLAIMER = (
    "Dataset A (expert survey screenshot) contains only 4 of 10 pairwise comparisons. "
    "The remaining 6 comparisons are absent and have NOT been invented. "
    "Dataset A is stored for audit purposes only and is not used to derive final weights."
)


@dataclass
class CriterionAHPDetail:
    """Per-criterion AHP calculation trace."""
    key: str
    label: str
    pairwise_comparisons: Dict[str, float]
    row_geometric_mean: float
    normalized_weight: float
    weight_pct: float
    dashboard_points: int


@dataclass
class AHPResult:
    """Complete AHP calculation audit trail - single source of truth."""
    criteria_order: List[str]
    expert_dataset: str
    expert_count: int
    comparison_count: int
    aggregation_method: str
    aggregated_pairwise: Dict[str, float]
    matrix: List[List[float]]
    row_geometric_means: Dict[str, float]
    normalized_weights: Dict[str, float]
    dashboard_points: Dict[str, int]
    criteria_detail: List[CriterionAHPDetail]
    lambda_max: float
    n: int
    ri: float
    ci: float
    cr: float
    is_consistent: bool
    source_status: str
    source_disclaimer: str
    dataset_a_status: str
    dataset_a_visible_gm: Dict[str, float]
    dataset_a_missing: List[str]


class AHPService:
    """Computes AHP feasibility criterion weights from expert pairwise comparisons.

    Architecture: DATA -> CALCULATION -> API -> UI.
    Data-injectable: pass any valid 10-comparison response dictionary to evaluate.
    """

    N = 5
    RI = RANDOM_CONSISTENCY_INDEX[5]  # 1.12

    def __init__(
        self,
        expert_responses: Optional[Dict[str, List[float]]] = None,
        expert_labels: Optional[List[str]] = None,
        dataset_name: str = "dataset_b",
        source_status: str = DATASET_B_SOURCE_STATUS,
        source_disclaimer: str = DATASET_B_DISCLAIMER,
    ):
        self.expert_responses = (
            {k: list(v) for k, v in expert_responses.items()}
            if expert_responses is not None
            else {k: list(v) for k, v in DATASET_B_EXPERT_RESPONSES.items()}
        )
        self.expert_labels = (
            list(expert_labels)
            if expert_labels is not None
            else list(DATASET_B_EXPERT_LABELS)
        )
        self.dataset_name = dataset_name
        self.source_status = source_status
        self.source_disclaimer = source_disclaimer

    def _geometric_mean(self, values: List[float]) -> float:
        product = 1.0
        for v in values:
            product *= v
        return product ** (1.0 / len(values))

    def _compute_aggregated_pairwise(self) -> Dict[str, float]:
        result: Dict[str, float] = {}
        for key, responses in self.expert_responses.items():
            label = key.replace("_vs_", "/")
            result[label] = self._geometric_mean(responses)
        return result

    def _build_reciprocal_matrix(self, gm: Dict[str, float]) -> List[List[float]]:
        n = self.N
        mat = [[1.0] * n for _ in range(n)]
        upper_pairs = {
            (0, 1): gm["M/F"],
            (0, 2): gm["M/L"],
            (0, 3): gm["M/C"],
            (0, 4): gm["M/R"],
            (1, 2): gm["F/L"],
            (1, 3): gm["F/C"],
            (1, 4): gm["F/R"],
            (2, 3): gm["L/C"],
            (2, 4): gm["L/R"],
            (3, 4): gm["C/R"],
        }
        for (r, c), val in upper_pairs.items():
            mat[r][c] = val
            mat[c][r] = 1.0 / val
        return mat

    def _compute_row_geometric_means(self, matrix: List[List[float]]) -> List[float]:
        return [self._geometric_mean(row) for row in matrix]

    def _normalize_weights(self, row_gm: List[float]) -> List[float]:
        total = sum(row_gm)
        return [g / total for g in row_gm]

    def _compute_consistency(
        self, matrix: List[List[float]], weights: List[float]
    ) -> tuple[float, float, float]:
        n = self.N
        aw = [sum(matrix[i][j] * weights[j] for j in range(n)) for i in range(n)]
        ratios = [aw[i] / weights[i] for i in range(n)]
        lambda_max = sum(ratios) / n
        ci = (lambda_max - n) / (n - 1)
        cr = ci / self.RI
        return lambda_max, ci, cr

    def _dataset_a_partial_gm(self) -> tuple[Dict[str, float], List[str]]:
        visible_gm: Dict[str, float] = {}
        missing: List[str] = []
        for key, responses in DATASET_A_PARTIAL.items():
            label = key.replace("_vs_", "/")
            if responses is None:
                missing.append(label)
            else:
                visible_gm[label] = self._geometric_mean(responses)
        return visible_gm, missing

    def _build_pairwise_display(
        self, criterion_idx: int, matrix: List[List[float]]
    ) -> Dict[str, float]:
        labels = ["M", "F", "L", "C", "R"]
        result: Dict[str, float] = {}
        for j in range(self.N):
            if j == criterion_idx:
                continue
            r, c = min(criterion_idx, j), max(criterion_idx, j)
            key = f"{labels[r]}/{labels[c]}"
            result[key] = round(matrix[criterion_idx][j], 7)
        return result

    def compute(self) -> AHPResult:
        """Execute the full AHP pipeline and return an AHPResult."""
        # Step 1: Geometric means
        agg_pairwise = self._compute_aggregated_pairwise()

        # Step 2: Reciprocal matrix
        matrix = self._build_reciprocal_matrix(agg_pairwise)

        # Step 3: Row geometric means
        row_gm_values = self._compute_row_geometric_means(matrix)

        # Step 4: Normalized weights
        norm_weights = self._normalize_weights(row_gm_values)

        # Step 5: Dashboard allocation (proportional rounding, sum = 100)
        raw_points = [w * 100 for w in norm_weights]
        floors = [math.floor(p) for p in raw_points]
        remainders = sorted(
            [(raw_points[i] - floors[i], i) for i in range(self.N)],
            key=lambda x: -x[0],
        )
        deficit = 100 - sum(floors)
        dashboard_raw = floors[:]
        for k in range(deficit):
            dashboard_raw[remainders[k][1]] += 1

        # Step 6: Consistency check
        lambda_max, ci, cr = self._compute_consistency(matrix, norm_weights)

        # Build per-criterion detail objects
        criteria_detail: List[CriterionAHPDetail] = []
        for i, key in enumerate(CRITERIA_ORDER):
            detail = CriterionAHPDetail(
                key=key,
                label=CRITERIA_LABELS[key],
                pairwise_comparisons=self._build_pairwise_display(i, matrix),
                row_geometric_mean=row_gm_values[i],
                normalized_weight=norm_weights[i],
                weight_pct=norm_weights[i] * 100,
                dashboard_points=dashboard_raw[i],
            )
            criteria_detail.append(detail)

        # Dataset A partial audit
        dataset_a_gm, dataset_a_missing = self._dataset_a_partial_gm()

        return AHPResult(
            criteria_order=CRITERIA_ORDER,
            expert_dataset=self.dataset_name,
            expert_count=len(self.expert_labels),
            comparison_count=len(self.expert_responses),
            aggregation_method="geometric_mean",
            aggregated_pairwise={k: round(v, 10) for k, v in agg_pairwise.items()},
            matrix=[[round(v, 10) for v in row] for row in matrix],
            row_geometric_means={CRITERIA_ORDER[i]: round(row_gm_values[i], 10) for i in range(self.N)},
            normalized_weights={CRITERIA_ORDER[i]: round(norm_weights[i], 10) for i in range(self.N)},
            dashboard_points={CRITERIA_ORDER[i]: dashboard_raw[i] for i in range(self.N)},
            criteria_detail=criteria_detail,
            lambda_max=lambda_max,
            n=self.N,
            ri=self.RI,
            ci=ci,
            cr=cr,
            is_consistent=cr < 0.10,
            source_status=self.source_status,
            source_disclaimer=self.source_disclaimer,
            dataset_a_status=DATASET_A_SOURCE_STATUS,
            dataset_a_visible_gm={k: round(v, 10) for k, v in dataset_a_gm.items()},
            dataset_a_missing=dataset_a_missing,
        )


def get_ahp_result(expert_responses: Optional[Dict[str, List[float]]] = None) -> AHPResult:
    """Compute and return AHP result dynamically on each request (no permanent global caching)."""
    return AHPService(expert_responses=expert_responses).compute()


def calculate_feasibility_score(
    raw_scores: Dict[str, float],
    raw_score_sources: Optional[Dict[str, str]] = None,
    ahp_result: Optional[AHPResult] = None,
) -> Dict[str, Any]:
    """Calculate weighted feasibility score from 5 raw criterion scores (0-100 scale).

    Formula for each criterion:
        contribution = (raw_score / 100) * dashboard_points

    Final Feasibility Score:
        final_feasibility_score = sum(all 5 contributions)
    """
    ahp = ahp_result or get_ahp_result()
    dp = ahp.dashboard_points
    nw = ahp.normalized_weights

    sources = raw_score_sources or {}
    default_sources = {
        "market": "Catchment demand, household density, and mandi offtake",
        "financial": "Financial structuring engine health score & equity coverage",
        "location": "District logistics, transport corridor, and Gram Panchayat access",
        "competition": "Catchment competitor density & entry barriers",
        "risk": "Cash runway, liquidity buffer, and debt coverage",
    }

    criteria_traces = []
    total_contribution = 0.0

    for key in CRITERIA_ORDER:
        raw = float(raw_scores.get(key, 0.0))
        max_pts = dp[key]
        weight_pct = nw[key] * 100.0
        contrib = (raw / 100.0) * max_pts
        total_contribution += contrib
        source = sources.get(key, default_sources.get(key, "Verified business parameter"))

        criteria_traces.append({
            "criterion": key,
            "label": CRITERIA_LABELS[key],
            "raw_score": round(raw, 2),
            "maximum_points": max_pts,
            "weight_pct": round(weight_pct, 4),
            "contribution": round(contrib, 4),
            "data_source": source,
            "calculation_trace": f"({raw:.2f} / 100) * {max_pts} = {contrib:.3f}",
        })

    final_score = round(total_contribution, 2)

    return {
        "final_score": final_score,
        "score_formula": "final_feasibility_score = sum((raw_score / 100) * dashboard_points)",
        "ahp_source_status": ahp.source_status,
        "ahp_cr": ahp.cr,
        "is_consistent": ahp.is_consistent,
        "criteria": criteria_traces,
    }

