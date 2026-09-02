"""AHP Weights API Endpoint for VITTANAYA (SIH26091).

GET /api/v1/ahp/weights
    Returns the complete AHP calculation audit trail:
    - Expert dataset provenance
    - 10 aggregated pairwise geometric means
    - 5x5 reciprocal matrix
    - 5 row geometric means
    - Normalized criterion weights
    - Dashboard allocation points (out of 100)
    - Consistency metrics (lambda_max, CI, CR)

This endpoint is the SINGLE SOURCE OF TRUTH for criterion weights.
The frontend reads dashboard_points from this response.
No hardcoded weight values should exist in the UI.
"""

from fastapi import APIRouter

from backend.app.schemas.ahp import (
    AHPResultSchema,
    FeasibilityCalculationRequest,
    FeasibilityScoreCalculationResponse,
)
from backend.app.services.ahp_service import (
    AHPResult,
    calculate_feasibility_score,
    get_ahp_result,
)

router = APIRouter(tags=["AHP Methodology"])


def _ahp_result_to_schema(result: AHPResult) -> AHPResultSchema:
    """Convert AHPResult dataclass to Pydantic schema."""
    from backend.app.schemas.ahp import CriterionAHPDetailSchema

    criteria_detail_schemas = [
        CriterionAHPDetailSchema(
            key=d.key,
            label=d.label,
            pairwise_comparisons=d.pairwise_comparisons,
            row_geometric_mean=d.row_geometric_mean,
            normalized_weight=d.normalized_weight,
            weight_pct=d.weight_pct,
            dashboard_points=d.dashboard_points,
        )
        for d in result.criteria_detail
    ]

    return AHPResultSchema(
        criteria_order=result.criteria_order,
        expert_dataset=result.expert_dataset,
        expert_count=result.expert_count,
        comparison_count=result.comparison_count,
        aggregation_method=result.aggregation_method,
        aggregated_pairwise=result.aggregated_pairwise,
        matrix=result.matrix,
        row_geometric_means=result.row_geometric_means,
        normalized_weights=result.normalized_weights,
        dashboard_points=result.dashboard_points,
        criteria_detail=criteria_detail_schemas,
        lambda_max=result.lambda_max,
        n=result.n,
        ri=result.ri,
        ci=result.ci,
        cr=result.cr,
        is_consistent=result.is_consistent,
        source_status=result.source_status,
        source_disclaimer=result.source_disclaimer,
        dataset_a_status=result.dataset_a_status,
        dataset_a_visible_gm=result.dataset_a_visible_gm,
        dataset_a_missing=result.dataset_a_missing,
    )


@router.get(
    "/ahp/weights",
    response_model=AHPResultSchema,
    summary="AHP Feasibility Criterion Weights",
    description=(
        "Returns the complete AHP calculation audit trail derived from Dataset B "
        "(illustrative expert-comparison dataset from the AHP methodology guide). "
        "dashboard_points is the authoritative source for feasibility weight allocation. "
        "CR < 0.10 confirms the comparison matrix is consistent."
    ),
)
def get_ahp_weights() -> AHPResultSchema:
    """Return AHP criterion weights and full methodology audit trail."""
    result = get_ahp_result()
    return _ahp_result_to_schema(result)


@router.post(
    "/ahp/calculate-feasibility",
    response_model=FeasibilityScoreCalculationResponse,
    summary="Calculate AHP-Weighted Feasibility Score",
    description=(
        "Calculates the final feasibility score and criterion contributions from 5 raw scores (0-100 scale). "
        "Formula: contribution = (raw_score / 100) * dashboard_points; final_score = sum(contributions)."
    ),
)
def calculate_weighted_feasibility(
    payload: FeasibilityCalculationRequest,
) -> FeasibilityScoreCalculationResponse:
    """Compute deterministic weighted feasibility score using dynamic AHP weights."""
    trace = calculate_feasibility_score(
        raw_scores=payload.raw_scores,
        raw_score_sources=payload.raw_score_sources,
    )
    return FeasibilityScoreCalculationResponse(**trace)
