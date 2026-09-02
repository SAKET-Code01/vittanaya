"""Pydantic schemas for AHP Feasibility Weight API endpoint."""

from typing import Any, Dict, List

from pydantic import BaseModel, Field


class CriterionAHPDetailSchema(BaseModel):
    """Serialisable per-criterion AHP calculation trace."""

    key: str
    label: str
    pairwise_comparisons: Dict[str, float] = Field(
        description="Pairwise comparison values vs other criteria (GM-aggregated)"
    )
    row_geometric_mean: float
    normalized_weight: float = Field(description="Weight as 0.0-1.0 (sum = 1)")
    weight_pct: float = Field(description="normalized_weight * 100")
    dashboard_points: int = Field(description="Integer allocation out of 100")


class AHPResultSchema(BaseModel):
    """
    Complete AHP audit trail returned by GET /api/v1/ahp/weights.

    This is the single source of truth for all feasibility criterion weights.
    The UI MUST read dashboard_points from this response; it MUST NOT use
    hardcoded 30/25/15/15/15 as calculation inputs.
    """

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
    criteria_detail: List[CriterionAHPDetailSchema]
    lambda_max: float
    n: int
    ri: float
    ci: float
    cr: float
    is_consistent: bool
    source_status: str = Field(
        description="'illustrative_dataset' until replaced by verified field survey"
    )
    source_disclaimer: str
    dataset_a_status: str
    dataset_a_visible_gm: Dict[str, float]
    dataset_a_missing: List[str] = Field(
        description="Pairwise keys absent from Dataset A screenshot (NOT invented)"
    )
