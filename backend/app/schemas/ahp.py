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


class CriterionCalculationTraceSchema(BaseModel):
    """Lineage and mathematical trace for each of the 5 criteria."""

    criterion: str
    label: str
    raw_score: float = Field(description="Raw criterion score on 0-100 scale")
    raw_score_formula: str = Field(default="", description="Formula used to derive raw score")
    raw_score_inputs: Dict[str, Any] = Field(default_factory=dict, description="Raw inputs used in derivation")
    ahp_weight: float = Field(default=0.0, description="Normalized AHP priority weight W_i (0-1 scale)")
    maximum_points: int = Field(description="AHP allocated maximum points for 100-pt presentation")
    contribution: float = Field(
        description="Calculated points: (raw_score / 100) * maximum_points"
    )
    weight_pct: float = Field(description="AHP normalized weight percentage")
    data_source: str = Field(description="Data origin / empirical basis for raw score")
    provenance: str = Field(default="", description="Detailed provenance classification")
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


class RawCriterionScoreSchema(BaseModel):
    """Per-criterion raw score with full data lineage."""

    criterion: str
    label: str
    raw_score: float = Field(description="Raw score on 0-100 scale")
    data_source: str = Field(description="Data origin and empirical basis")
    derivation_formula: str = Field(description="Exact formula used to derive this score")


class BusinessFeasibilityResponse(BaseModel):
    """
    Authoritative feasibility response for a persisted business.

    Returned by GET /api/v1/ahp/business-feasibility/{business_id}.
    This is the SINGLE SOURCE OF TRUTH for feasibility scores in VITTANAYA.
    All consumers (FeasibilityPage, Insights, Advisory chatbot) must use this result.

    Score derivation:
        Business data → 5 raw criterion scores (0-100 each)
        → AHP dashboard_points (Dataset B illustrative weights)
        → contribution = (raw / 100) × dashboard_points  per criterion
        → final_score = sum(contributions)
    """

    business_id: int
    business_name: str
    business_category: str
    specific_business: str
    location: str

    # Five raw criterion scores with full lineage
    raw_scores: Dict[str, float] = Field(description="Raw scores per criterion (0-100 scale)")
    raw_score_details: List[RawCriterionScoreSchema]

    # AHP methodology
    ahp_dashboard_points: Dict[str, int]
    ahp_normalized_weights: Dict[str, float]
    ahp_cr: float
    ahp_is_consistent: bool
    ahp_source_status: str = Field(
        description="'illustrative_dataset' until replaced by verified field survey"
    )
    ahp_source_disclaimer: str

    # Final score and per-criterion contributions
    criteria_traces: List[CriterionCalculationTraceSchema]
    final_score: float = Field(description="AHP-weighted final feasibility score (0-100)")
    score_formula: str = Field(
        default="final_feasibility_score = sum((raw_score / 100) * dashboard_points)"
    )

    # Contextual fields for display (NOT used in AHP calculation)
    business_project_cost: float = Field(
        default=0.0,
        description="Authoritative persisted project cost from business profile",
    )
    reference_project_cost: float = Field(
        default=0.0,
        description="Indicative reference project cost from sector benchmark",
    )
    market_benchmark_score: float = Field(
        description=(
            "Sector benchmark score from LocalMarketData.base_score — "
            "contextual market opportunity indicator, NOT the AHP final score"
        )
    )
    market_reach: str
    opportunity: str
    competitor_level: str

    # Hyperlocal Intelligence breakdown
    is_local_verified: bool = Field(
        default=False,
        description="True if exact district/block data is empirical from DB; False if state/sector benchmark fallback"
    )
    pincode: str = Field(default="", description="Business PIN code")
    village_or_town: str = Field(default="", description="Village or town name")
    block_name: str = Field(default="", description="Administrative Block")
    district_name: str = Field(default="", description="District")
    state_name: str = Field(default="Odisha", description="State")
    local_market_context: str = Field(default="", description="Local economic context summary")


class ExpertPairwiseEntrySchema(BaseModel):
    """Pairwise scores provided by an individual expert."""
    pair_key: str
    pair_label: str
    criterion_a: str
    criterion_b: str
    expert_scores: Dict[str, float]
    geometric_mean: float


class AHPSaatyScaleGuideSchema(BaseModel):
    """Saaty scale definition item."""
    intensity: int
    definition: str
    explanation: str


class AHPMethodologyGuideResponse(BaseModel):
    """Full 8-step methodology payload for UI education and panel review."""
    steps: List[Dict[str, str]]
    criteria: List[Dict[str, str]]
    saaty_scale: List[AHPSaatyScaleGuideSchema]
    expert_labels: List[str]
    pairwise_dataset: List[ExpertPairwiseEntrySchema]
    ahp_result: AHPResultSchema
    random_index_table: Dict[int, float]


class AHPAuditResponse(BaseModel):
    """Auditable AHP calculation chain and dataset provenance for evaluation judges."""

    ahp_dataset_status: str = Field(
        description="Dataset classification: 'Illustrative Prototype Benchmark' vs 'Real Field Expert Validation'"
    )
    real_expert_validation_status: str = Field(
        description="Real field expert survey status ('PENDING' or 'VERIFIED')"
    )
    expert_count: int = Field(description="Number of expert respondents in active dataset")
    completed_comparison_count: int = Field(description="Number of completed pairwise comparisons")
    expected_comparison_count: int = Field(description="Total comparisons required for n criteria: n*(n-1)/2")
    expert_labels: List[str] = Field(description="Expert stakeholder titles/roles")
    expert_responses: Dict[str, List[float]] = Field(description="Exact pairwise judgment matrix by comparison key")
    expert_geometric_means: Dict[str, float] = Field(
        description="Expert Geometric Mean for each of the 10 pairwise comparisons"
    )
    reciprocal_matrix: List[List[float]] = Field(
        description="5x5 reciprocal pairwise comparison matrix A where A[j][i] = 1/A[i][j]"
    )
    row_geometric_means: Dict[str, float] = Field(
        description="Row Geometric Mean: GM_i = (prod_{j=1}^5 A_ij)^(1/5)"
    )
    normalized_ahp_priority_weights: Dict[str, float] = Field(
        description="Normalized AHP Priority Weight: W_i = GM_i / sum(GM)"
    )
    dashboard_point_allocation: Dict[str, int] = Field(
        description="Dashboard points integer allocation summing to 100"
    )
    lambda_max: float = Field(description="Principal eigenvalue lambda_max")
    ci: float = Field(description="Consistency Index: (lambda_max - n) / (n - 1)")
    ri: float = Field(description="Random Consistency Index: 1.12 for n=5")
    cr: float = Field(description="Consistency Ratio: CI / RI")
    consistency_status: str = Field(description="Consistency evaluation ('CONSISTENT' if CR < 0.10)")
    is_consistent: bool = Field(description="Whether CR < 0.10")
    computation_timestamp: str = Field(description="ISO 8601 computation timestamp")
    auditable_pipeline_chain: str = Field(
        description="Full auditable trace: Expert response -> Expert Geometric Mean -> Aggregated Matrix -> Row Geometric Mean -> Normalized Priority Weight -> Final AHP Weight"
    )

