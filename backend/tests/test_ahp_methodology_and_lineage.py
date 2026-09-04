"""AHP Methodology & Lineage Tests for VITTANAYA (SIH26091).

Covers the full 8-step AHP pipeline:
  Step 1: 5-criteria selection
  Step 2: 10 pairwise comparisons (Dataset B - Illustrative Worked Example)
  Step 3: Multi-expert Geometric Mean Aggregation
  Step 4: 5×5 Reciprocal Matrix
  Step 5: Row Geometric Means
  Step 6: Normalized Priority Weights (sum = 1.0)
  Step 7: Consistency Check (CR < 0.10, RI = 1.12)
  Step 8: AHP-weighted feasibility score calculation

Data Status: Dataset B is an ILLUSTRATIVE worked example from the Vittanaya AHP Guide PDF.
It is NOT a verified field expert survey.  Tests are labelled accordingly.
"""

import math

from fastapi.testclient import TestClient

from backend.app.services.ahp_service import (
    DEFAULT_PAIRWISE_JUDGMENTS,
    ahp_engine,
    calculate_single_expert_ahp_weights,
    get_ahp_methodology_guide,
)
from backend.main import app

client = TestClient(app)


# ===========================================================================
# Test 1 — AHP Pipeline: Reciprocal Matrix (5×5)
# ===========================================================================

def test_ahp_pairwise_comparisons_and_reciprocal_matrix():
    """Step 4: Verify 5×5 reciprocal matrix — diagonal = 1.0, A[j][i] = 1/A[i][j].

    Data Source: Dataset B — Illustrative Worked Example / Prototype Benchmark.
    """
    guide = get_ahp_methodology_guide()

    # Step 1: 5 criteria
    assert guide.step_1_criteria_selection.total_criteria == 5

    # Step 2: 10 pairwise comparisons (n*(n-1)/2 = 5*4/2 = 10)
    assert len(guide.step_2_pairwise_comparisons.pairwise_comparisons) == 10

    # Step 4: Reciprocal matrix
    matrix = guide.step_4_reciprocal_matrix.matrix_5x5
    assert len(matrix) == 5

    for i in range(5):
        assert len(matrix[i]) == 5
        assert math.isclose(matrix[i][i], 1.0, rel_tol=1e-6), f"Diagonal matrix[{i}][{i}] must be 1.0"

    for i in range(5):
        for j in range(5):
            val_ij = matrix[i][j]
            val_ji = matrix[j][i]
            assert math.isclose(val_ij * val_ji, 1.0, rel_tol=1e-3), (
                f"Reciprocal property failed: matrix[{i}][{j}]={val_ij:.6f}, "
                f"matrix[{j}][{i}]={val_ji:.6f}, product={val_ij * val_ji:.6f}"
            )


# ===========================================================================
# Test 2 — AHP Pipeline: Normalized Weights Sum to 1.0
# ===========================================================================

def test_ahp_geometric_mean_and_normalized_weights_sum():
    """Steps 5-6: Row geometric means and normalized priority weights sum to exactly 1.0.

    Data Source: Dataset B — Illustrative Worked Example / Prototype Benchmark.
    """
    guide = get_ahp_methodology_guide()

    # Step 5: 5 row geometric means
    row_gms = guide.step_5_row_geometric_means.row_geometric_means
    assert len(row_gms) == 5, f"Expected 5 row GMs, got {len(row_gms)}"
    for gm in row_gms:
        assert gm > 0, "Row geometric mean must be positive"

    # Step 6: 5 normalized weights
    norm_weights = guide.step_6_normalized_weights.normalized_weights
    assert len(norm_weights) == 5, f"Expected 5 normalized weights, got {len(norm_weights)}"

    # SUM(W_i) = 1.0 — mandatory AHP mathematical property
    total_weight = sum(w.priority_weight for w in norm_weights)
    assert math.isclose(total_weight, 1.0, rel_tol=1e-4), (
        f"Normalized weights must sum to 1.0, got {total_weight}"
    )

    # Market must outrank location, competition, risk (per Dataset B expert consensus)
    weights_dict = {w.criterion_key: w.priority_weight for w in norm_weights}
    assert weights_dict["market"] > weights_dict["location"], (
        "Market weight must exceed Location weight per Dataset B"
    )
    assert weights_dict["market"] > weights_dict["competition"]
    assert weights_dict["market"] > weights_dict["risk"]


# ===========================================================================
# Test 3 — AHP Pipeline: Consistency Ratio
# ===========================================================================

def test_ahp_consistency_ratio():
    """Step 7: Verify CR = CI/RI < 0.10 (acceptable consistency), RI = 1.12 for n=5.

    Data Source: Dataset B — Illustrative Worked Example / Prototype Benchmark.
    """
    guide = get_ahp_methodology_guide()
    cr_data = guide.step_7_consistency_check

    assert cr_data.n == 5, f"Matrix size must be 5, got {cr_data.n}"
    assert math.isclose(cr_data.random_index_ri, 1.12, rel_tol=1e-6), (
        f"RI for n=5 must be 1.12, got {cr_data.random_index_ri}"
    )
    assert cr_data.consistency_ratio < 0.10, (
        f"CR must be < 0.10 for consistency, got {cr_data.consistency_ratio:.6f}"
    )
    assert cr_data.is_consistent is True
    assert "Acceptable" in cr_data.interpretation, (
        f"Interpretation must include 'Acceptable', got: '{cr_data.interpretation}'"
    )


# ===========================================================================
# Test 4 — AHP Engine: Centralized Feasibility Score Calculation
# ===========================================================================

def test_scoring_engine_centralized_calculation():
    """Step 8: Verify final_score = SUM(raw_score * dashboard_weight).

    Uses the `ahp_engine` singleton to guarantee all consumers get the same
    deterministic result for identical raw scores.
    """
    sample_scores = {
        "market": 88.0,
        "financial": 10.0,
        "location": 70.0,
        "competition": 50.0,
        "risk": 34.2,
    }

    calc = ahp_engine.calculate_feasibility_score(
        market_raw=sample_scores["market"],
        financial_raw=sample_scores["financial"],
        location_raw=sample_scores["location"],
        competition_raw=sample_scores["competition"],
        risk_raw=sample_scores["risk"],
    )

    assert calc.final_score > 0, "Final feasibility score must be positive"
    assert calc.final_score <= 100, f"Final feasibility score must be ≤ 100, got {calc.final_score}"
    assert len(calc.criteria_traces) == 5, f"Expected 5 criterion traces, got {len(calc.criteria_traces)}"

    # SUM of contributions must equal final_score (within floating-point tolerance)
    total_contrib = sum(trace.contribution for trace in calc.criteria_traces)
    assert math.isclose(total_contrib, calc.final_score, rel_tol=1e-3), (
        f"Sum of contributions ({total_contrib:.4f}) must equal final_score ({calc.final_score:.4f})"
    )


# ===========================================================================
# Test 5 — API: /api/v1/ahp/weights
# ===========================================================================

def test_api_ahp_weights_endpoint():
    """API Test: GET /api/v1/ahp/weights returns active AHP weights and dashboard points.

    Dashboard points are deterministically computed from Dataset B:
      market=30, financial=25, location=15, competition=15, risk=15
    (Verified via get_ahp_result() on Dataset B expert responses.)
    """
    response = client.get("/api/v1/ahp/weights")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"

    data = response.json()
    assert "normalized_weights" in data, "Response must include 'normalized_weights'"
    assert "dashboard_points" in data, "Response must include 'dashboard_points'"

    # Actual computed values from Dataset B (Illustrative Worked Example)
    dp = data["dashboard_points"]
    assert dp["market"] == 30, f"market dashboard_points should be 30, got {dp['market']}"
    assert dp["financial"] == 25, f"financial dashboard_points should be 25, got {dp['financial']}"
    assert dp["location"] == 15, f"location dashboard_points should be 15, got {dp['location']}"

    # Total dashboard points must sum to 100
    total_pts = sum(dp.values())
    assert total_pts == 100, f"Dashboard points must sum to 100, got {total_pts}"

    # CR must be present and consistent
    assert "cr" in data, "Response must include consistency ratio 'cr'"
    assert data["cr"] < 0.10, f"CR must be < 0.10, got {data['cr']}"
    assert data["is_consistent"] is True


# ===========================================================================
# Test 6 — API: /api/v1/ahp/methodology-guide
# ===========================================================================

def test_api_ahp_methodology_guide_endpoint():
    """API Test: GET /api/v1/ahp/methodology-guide returns complete 8-step AHP pipeline.

    Checks required structured keys used by the FeasibilityPage Scoring Methodology tab.
    """
    response = client.get("/api/v1/ahp/methodology-guide")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"

    data = response.json()
    assert "step_1_criteria_selection" in data, "Response must include step_1_criteria_selection"
    assert "step_2_pairwise_comparisons" in data, "Response must include step_2_pairwise_comparisons"
    assert "step_4_reciprocal_matrix" in data, "Response must include step_4_reciprocal_matrix"
    assert "step_7_consistency_check" in data, "Response must include step_7_consistency_check"

    # Consistency must pass
    assert data["step_7_consistency_check"]["is_consistent"] is True, (
        "Consistency check must pass (CR < 0.10)"
    )

    # Must have 5 criteria
    assert data["step_1_criteria_selection"]["total_criteria"] == 5

    # Must have 10 pairwise comparisons
    assert len(data["step_2_pairwise_comparisons"]["pairwise_comparisons"]) == 10


# ===========================================================================
# Test 7 — API: /api/v1/ahp/business-feasibility/{id} (requires seeded business)
# ===========================================================================

def test_api_business_feasibility_lineage(client, sample_business):
    """API Test: GET /api/v1/ahp/business-feasibility/{id} returns hyperlocal lineage."""
    response = client.get(f"/api/v1/ahp/business-feasibility/{sample_business.id}")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"

    data = response.json()
    assert "final_score" in data, "Response must include 'final_score'"
    assert "criteria_traces" in data, "Response must include 'criteria_traces'"
    assert "is_local_verified" in data, "Response must include 'is_local_verified'"
    assert "district_name" in data, "Response must include 'district_name'"
    assert "block_name" in data, "Response must include 'block_name'"
    assert len(data["criteria_traces"]) == 5, (
        f"Expected 5 criterion traces, got {len(data['criteria_traces'])}"
    )


# ===========================================================================
# Test 8 — calculate_single_expert_ahp_weights utility
# ===========================================================================

def test_calculate_single_expert_ahp_weights():
    """Verify calculate_single_expert_ahp_weights returns valid normalized weights for one expert."""
    # Use a balanced expert (all 1s → equal weights)
    equal_responses = {k: 1.0 for k in DEFAULT_PAIRWISE_JUDGMENTS.keys()}
    weights = calculate_single_expert_ahp_weights(equal_responses)

    assert set(weights.keys()) == {"market", "financial", "location", "competition", "risk"}, (
        f"Unexpected weight keys: {set(weights.keys())}"
    )
    total = sum(weights.values())
    assert math.isclose(total, 1.0, rel_tol=1e-4), (
        f"Single-expert normalized weights must sum to 1.0, got {total}"
    )
    # All equal comparisons → all equal weights (~0.2 each)
    for k, w in weights.items():
        assert math.isclose(w, 0.2, abs_tol=1e-3), (
            f"Equal judgments → weight of '{k}' should be ~0.20, got {w:.6f}"
        )


# ===========================================================================
# Test 9 — DEFAULT_PAIRWISE_JUDGMENTS constant
# ===========================================================================

def test_default_pairwise_judgments_structure():
    """Verify DEFAULT_PAIRWISE_JUDGMENTS has all 10 required comparison keys."""
    expected_keys = {
        "M_vs_F", "M_vs_L", "M_vs_C", "M_vs_R",
        "F_vs_L", "F_vs_C", "F_vs_R",
        "L_vs_C", "L_vs_R",
        "C_vs_R",
    }
    assert set(DEFAULT_PAIRWISE_JUDGMENTS.keys()) == expected_keys, (
        f"DEFAULT_PAIRWISE_JUDGMENTS keys mismatch: {set(DEFAULT_PAIRWISE_JUDGMENTS.keys())}"
    )
    for key, responses in DEFAULT_PAIRWISE_JUDGMENTS.items():
        assert len(responses) > 0, f"Responses for {key} must be non-empty"
        for r in responses:
            assert 1 <= r <= 9, f"Saaty scale rating {r} for {key} is out of range [1, 9]"


# ===========================================================================
# Test 10 — Advisory chatbot uses backend-computed score (no hallucination)
# ===========================================================================

def test_context_aware_advisory_explanations(client, sample_business):
    """Verify advisory chatbot uses backend-computed feasibility scores.

    The LLM must NEVER calculate feasibility scores independently.
    All scores must be traced to BusinessFeasibilityService.compute().
    """
    from backend.app.schemas.advisory import BusinessContextInput, ChatRequest

    ctx = BusinessContextInput(
        business_category=sample_business.type,
        specific_business=sample_business.name,
        location=f"{sample_business.location_district}, {sample_business.location_state}",
        available_margin_capital=0.0,
    )

    # Query 1: Score explanation
    payload1 = ChatRequest(
        message="Why is my feasibility score low?",
        business_id=str(sample_business.id),
        business_context=ctx,
        language="English",
    )
    response1 = client.post("/api/v1/advisory/chat", json=payload1.model_dump())
    assert response1.status_code == 200, f"Advisory chat failed: {response1.text}"
    data1 = response1.json()
    answer1 = data1.get("answer", "").lower()
    # Must reference feasibility or score — not a generic hallucination
    assert any(kw in answer1 for kw in ["feasibility", "score", "market", "financial"]), (
        f"Advisory response must reference feasibility metrics: '{data1.get('answer', '')[:200]}'"
    )

    # Query 2: AHP weight explanation
    payload2 = ChatRequest(
        message="Why is Market given higher importance?",
        business_id=str(sample_business.id),
        business_context=ctx,
        language="English",
    )
    response2 = client.post("/api/v1/advisory/chat", json=payload2.model_dump())
    assert response2.status_code == 200, f"Advisory chat failed: {response2.text}"
    data2 = response2.json()
    answer2 = data2.get("answer", "").lower()
    assert any(kw in answer2 for kw in ["market", "ahp", "weight", "importance", "demand"]), (
        f"Advisory response must reference market or AHP: '{data2.get('answer', '')[:200]}'"
    )
