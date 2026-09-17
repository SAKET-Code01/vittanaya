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

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.schemas.ahp import (
    AHPAuditResponse,
    AHPResultSchema,
    BusinessFeasibilityResponse,
    CriterionCalculationTraceSchema,
    FeasibilityCalculationRequest,
    FeasibilityScoreCalculationResponse,
    RawCriterionScoreSchema,
)
from backend.app.services.ahp_service import (
    AHPResult,
    calculate_feasibility_score,
    get_ahp_result,
)
from backend.app.services.business_feasibility_service import BusinessFeasibilityService

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


@router.get(
    "/ahp/business-feasibility/{business_id}",
    response_model=BusinessFeasibilityResponse,
    summary="Authoritative AHP Feasibility Score for a Persisted Business",
    description=(
        "Single source of truth for the AHP-weighted feasibility score of a specific business. "
        "Derives all 5 raw criterion scores from real business data (DB lookup), applies "
        "AHP dashboard_points, and returns the final weighted score with full lineage. "
        "All consumers (FeasibilityPage, Insights, Advisory chatbot) must use this endpoint."
    ),
)
def get_business_feasibility(
    business_id: int,
    db: Session = Depends(get_db),
) -> BusinessFeasibilityResponse:
    """Compute and return authoritative feasibility result for a persisted business."""
    try:
        svc = BusinessFeasibilityService(db)
        result = svc.compute(business_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    raw_score_details = [
        RawCriterionScoreSchema(
            criterion=d.criterion,
            label=d.label,
            raw_score=d.raw_score,
            data_source=d.data_source,
            derivation_formula=d.derivation_formula,
        )
        for d in result.raw_score_details
    ]

    criteria_traces = [
        CriterionCalculationTraceSchema(
            criterion=t["criterion"],
            label=t["label"],
            raw_score=t["raw_score"],
            raw_score_formula=t.get("raw_score_formula", f"({t['raw_score']:.2f} / 100) * {t['maximum_points']}"),
            raw_score_inputs=t.get("raw_score_inputs", {"raw_score": t["raw_score"], "max_points": t["maximum_points"]}),
            ahp_weight=t.get("ahp_weight", round(t["weight_pct"] / 100.0, 6)),
            maximum_points=t["maximum_points"],
            contribution=t["contribution"],
            weight_pct=t["weight_pct"],
            data_source=t["data_source"],
            provenance="Verified Local District Data" if (result.is_local_verified and t["criterion"] in ["market", "location"]) else "State/Sector Benchmark Estimate [Fallback]",
            calculation_trace=t["calculation_trace"],
        )
        for t in result.criteria_traces
    ]

    return BusinessFeasibilityResponse(
        business_id=result.business_id,
        business_name=result.business_name,
        business_category=result.business_category,
        specific_business=result.specific_business,
        location=result.location,
        raw_scores=result.raw_scores,
        raw_score_details=raw_score_details,
        ahp_dashboard_points=result.ahp_dashboard_points,
        ahp_normalized_weights=result.ahp_normalized_weights,
        ahp_cr=result.ahp_cr,
        ahp_is_consistent=result.ahp_is_consistent,
        ahp_source_status=result.ahp_source_status,
        ahp_source_disclaimer=result.ahp_source_disclaimer,
        criteria_traces=criteria_traces,
        final_score=result.final_score,
        score_formula=result.score_formula,
        business_project_cost=result.business_project_cost,
        reference_project_cost=result.reference_project_cost,
        resolved_project_cost=result.resolved_project_cost,
        project_cost_source_type=result.project_cost_source_type,
        project_cost_source_name=result.project_cost_source_name,
        project_cost_label=result.project_cost_label,
        max_supportable_project_size=result.max_supportable_project_size,
        market_benchmark_score=result.market_benchmark_score,
        market_reach=result.market_reach,
        opportunity=result.opportunity,
        competitor_level=result.competitor_level,
        is_local_verified=result.is_local_verified,
        pincode=result.pincode,
        village_or_town=result.village_or_town,
        block_name=result.block_name,
        district_name=result.district_name,
        state_name=result.state_name,
        local_market_context=result.local_market_context,
    )


@router.get(
    "/ahp/audit",
    response_model=AHPAuditResponse,
    summary="Complete AHP Calculation Audit Trail",
    description=(
        "Exposes the complete end-to-end mathematical chain: "
        "Expert response -> Expert Geometric Mean -> Aggregated Matrix -> "
        "Row Geometric Mean -> Normalized Priority Weight -> Final AHP Weight."
    ),
)
def get_ahp_audit(db: Session = Depends(get_db)) -> AHPAuditResponse:
    """Return transparent auditable AHP pipeline chain and dataset provenance for evaluation judges."""
    from backend.app.services.ahp_service import get_ahp_audit_trail

    trail = get_ahp_audit_trail(db=db)
    return AHPAuditResponse(**trail)


@router.get(
    "/ahp/methodology-guide",
    summary="AHP 8-Step Scoring Methodology Guide",
    description="Returns step-by-step mathematical explanations, Saaty scale definitions, and multi-expert dataset for judges and users.",
)
def get_methodology_guide():
    """Return interactive 8-step methodology walkthrough."""
    from backend.app.services.ahp_service import get_ahp_methodology_guide
    guide = get_ahp_methodology_guide()
    return guide.to_dict()

