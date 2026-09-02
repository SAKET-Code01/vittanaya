"""Pydantic schemas for AHP Feasibility Weight API endpoint."""

from typing import Dict, List

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


class CriterionCalculationTraceSchema(BaseModel):
    """Lineage and mathematical trace for each of the 5 criteria."""

    criterion: str
    label: str
    raw_score: float = Field(description="Raw criterion score on 0-100 scale")
    maximum_points: int = Field(description="AHP allocated maximum points for 100-pt presentation")
    contribution: float = Field(
        description="Calculated points: (raw_score / 100) * maximum_points"
    )
    weight_pct: float = Field(description="AHP normalized weight percentage")
    data_source: str = Field(description="Data origin / empirical basis for raw score")
    calculation_trace: str = Field(description="Formula trace e.g. '(93.33 / 100) * 30 = 28.000'")


class FeasibilityCalculationRequest(BaseModel):
    """Request payload for calculating weighted feasibility score from 5 raw criterion scores."""

    raw_scores: Dict[str, float] = Field(
        ...,
        description="Map of criterion keys ('market', 'financial', 'location', 'competition', 'risk') to 0-100 scores",
        json_schema_extra={
            "example": {
                "market": 93.33,
                "financial": 76.0,
                "location": 100.0,
                "competition": 53.33,
                "risk": 53.33,
            }
        },
    )
    raw_score_sources: Dict[str, str] = Field(
        default_factory=dict,
        description="Optional custom data source description for each criterion",
    )


class FeasibilityScoreCalculationResponse(BaseModel):
    """Complete feasibility score calculation response with full AHP trace."""

    final_score: float = Field(description="Final aggregated score (sum of contributions)")
    score_formula: str = Field(
        default="final_feasibility_score = sum((raw_score / 100) * dashboard_points)"
    )
    ahp_source_status: str
    ahp_cr: float
    is_consistent: bool
    criteria: List[CriterionCalculationTraceSchema]
