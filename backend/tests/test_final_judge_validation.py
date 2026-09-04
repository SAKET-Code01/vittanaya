"""Final Validation & Judge Readiness Test Suite for VITTANAYA (SIH26091).

Comprehensive verification of:
  - Phase 1: Real AHP Data Status (Illustrative Prototype Benchmark / PENDING)
  - Phase 2: AHP Audit Trail (GET /api/v1/ahp/audit)
  - Phase 3: Dynamic Business Scenario Tests (Proving scores are NOT static placeholders)
  - Phase 4: Single Source of Truth across APIs and Engines
  - Phase 5: Formula Traceability (Raw * Weight = Contribution, Sum = Final Score)
  - Phase 6: Exact AHP Terminology (Expert GM, Row GM, Normalized Priority Weight)
  - Phase 7: Hyperlocal Data Validation & Leakage Prevention
  - Phase 8: AI Grounding & Strict Honesty
  - Phase 9: AI Provider Abstraction (Gemini default, Ollama optional)
  - Phase 10: Robust Edge Case Handling (Zero cost, Zero capital, missing data)
"""

import math
from datetime import datetime

from fastapi.testclient import TestClient

from backend.app.core.database import SessionLocal
from backend.app.engines.ai_advisor import GroqProvider, OllamaProvider, get_llm_provider
from backend.app.models.business import Business
from backend.app.services.ahp_service import (
    get_ahp_methodology_guide,
    get_ahp_result,
)
from backend.app.services.business_feasibility_service import (
    BusinessFeasibilityService,
)
from backend.main import app

client = TestClient(app)


# ==============================================================================
# PHASE 1 & 2: AHP DATA STATUS & AUDIT TRAIL
# ==============================================================================

def test_phase1_ahp_real_data_status():
    """Verify AHP dataset status is honestly marked as Illustrative Prototype Benchmark."""
    ahp = get_ahp_result()
    assert ahp.source_status == "Illustrative Prototype Benchmark"
    assert "Illustrative Prototype Benchmark" in ahp.source_disclaimer
    assert "PENDING" in ahp.source_disclaimer or "pending" in ahp.source_disclaimer.lower()


def test_phase2_ahp_audit_trail_endpoint():
    """Verify GET /api/v1/ahp/audit exposes complete end-to-end mathematical chain."""
    resp = client.get("/api/v1/ahp/audit")
    assert resp.status_code == 200
    data = resp.json()

    # 1. Dataset Status
    assert data["ahp_dataset_status"] == "Illustrative Prototype Benchmark"
    assert data["real_expert_validation_status"] == "PENDING"
    assert data["expert_count"] == 5
    assert data["completed_comparison_count"] == 10
    assert data["expected_comparison_count"] == 10

    # 2. Expert Responses
    assert len(data["expert_labels"]) == 5
    assert len(data["expert_responses"]) == 10
    for key, vals in data["expert_responses"].items():
        assert len(vals) == 5
        assert all(v > 0 for v in vals)

    # 3. 10 Aggregated Geometric Means ("Expert Geometric Mean")
    assert len(data["expert_geometric_means"]) == 10
    for pair, gm in data["expert_geometric_means"].items():
        assert gm > 0

    # 4. 5x5 Reciprocal Matrix
    mat = data["reciprocal_matrix"]
    assert len(mat) == 5
    for i in range(5):
        assert len(mat[i]) == 5
        assert math.isclose(mat[i][i], 1.0, rel_tol=1e-5)
        for j in range(5):
            assert math.isclose(mat[i][j] * mat[j][i], 1.0, rel_tol=1e-4)

    # 5. Row Geometric Means & Normalized Priority Weights
    row_gm = data["row_geometric_means"]
    norm_w = data["normalized_ahp_priority_weights"]
    dp = data["dashboard_point_allocation"]
    assert len(row_gm) == 5
    assert len(norm_w) == 5
    assert math.isclose(sum(norm_w.values()), 1.0, rel_tol=1e-4)
    assert sum(dp.values()) == 100

    # 6. Consistency Metrics
    assert data["lambda_max"] > 5.0
    assert data["ci"] >= 0.0
    assert data["ri"] == 1.12
    assert data["cr"] < 0.10
    assert data["consistency_status"] == "CONSISTENT"
    assert data["is_consistent"] is True

    # 7. Auditable Chain & Timestamp
    assert "Expert response" in data["auditable_pipeline_chain"]
    assert "Expert Geometric Mean" in data["auditable_pipeline_chain"]
    assert "Row Geometric Mean" in data["auditable_pipeline_chain"]
    assert "Normalized Priority Weight" in data["auditable_pipeline_chain"]
    datetime.fromisoformat(data["computation_timestamp"])


# ==============================================================================
# PHASE 3: DYNAMIC BUSINESS SCENARIO TESTS (No Static Placeholder Scores)
# ==============================================================================

def test_phase3_scenario_a_increase_own_capital():
    """Scenario A: Increasing own capital directly increases financial raw score and final score."""
    db = SessionLocal()
    try:
        bfs = BusinessFeasibilityService(db)

        # Baseline: ₹100,000 own capital on ₹1,000,000 project (10% equity)
        res_low = bfs.compute_from_context(
            business_category="Agro-Processing",
            specific_business="Rice Milling & Processing",
            location="Sundargarh, Odisha",
            own_capital=100000.0,
            project_cost=1000000.0,
        )

        # Higher equity: ₹400,000 own capital on ₹1,000,000 project (40% equity)
        res_high = bfs.compute_from_context(
            business_category="Agro-Processing",
            specific_business="Rice Milling & Processing",
            location="Sundargarh, Odisha",
            own_capital=400000.0,
            project_cost=1000000.0,
        )

        assert res_high.raw_scores["financial"] > res_low.raw_scores["financial"]
        assert res_high.final_score > res_low.final_score
        assert res_high.criteria_traces[1]["contribution"] > res_low.criteria_traces[1]["contribution"]
    finally:
        db.close()


def test_phase3_scenario_b_change_project_cost():
    """Scenario B: Doubling project cost with fixed equity reduces margin and reduces score."""
    db = SessionLocal()
    try:
        bfs = BusinessFeasibilityService(db)

        res_cost_10l = bfs.compute_from_context(
            business_category="Manufacturing & Engineering",
            specific_business="Fabrication & Welding Workshop",
            location="Sundargarh, Odisha",
            own_capital=200000.0,
            project_cost=1000000.0,
        )

        res_cost_25l = bfs.compute_from_context(
            business_category="Manufacturing & Engineering",
            specific_business="Fabrication & Welding Workshop",
            location="Sundargarh, Odisha",
            own_capital=200000.0,
            project_cost=2500000.0,
        )

        assert res_cost_10l.raw_scores["financial"] > res_cost_25l.raw_scores["financial"]
        assert res_cost_10l.final_score > res_cost_25l.final_score
    finally:
        db.close()


def test_phase3_scenario_d_change_location_district():
    """Scenario D: Verified district (Sundargarh) vs unverified/benchmark district changes location score & provenance."""
    db = SessionLocal()
    try:
        bfs = BusinessFeasibilityService(db)

        # District with verified local market data (Sundargarh has poultry empirical data)
        res_sundargarh = bfs.compute_from_context(
            business_category="Poultry",
            specific_business="Poultry Farming / Broiler Production",
            location="Sundargarh, Odisha",
            own_capital=150000.0,
            project_cost=1000000.0,
        )

        # District without verified empirical market survey (fallback to generic benchmark)
        res_other = bfs.compute_from_context(
            business_category="Poultry",
            specific_business="Poultry Farming / Broiler Production",
            location="Malkangiri, Odisha",
            own_capital=150000.0,
            project_cost=1000000.0,
        )

        assert res_sundargarh.is_local_verified is True
        assert res_other.is_local_verified is False
        assert res_sundargarh.raw_scores["location"] == 100.0
        assert res_other.raw_scores["location"] < 100.0
        assert res_sundargarh.final_score != res_other.final_score
    finally:
        db.close()


def test_phase3_scenario_e_change_business_type():
    """Scenario E: Changing business type loads distinct sector benchmarks."""
    db = SessionLocal()
    try:
        bfs = BusinessFeasibilityService(db)

        res_dairy = bfs.compute_from_context(
            business_category="Livestock & Dairy",
            specific_business="Dairy Cattle Milk Production & Chilling",
            location="Sundargarh, Odisha",
            own_capital=150000.0,
            project_cost=1000000.0,
        )

        res_welding = bfs.compute_from_context(
            business_category="Manufacturing & Engineering",
            specific_business="Fabrication & Welding Workshop",
            location="Sundargarh, Odisha",
            own_capital=150000.0,
            project_cost=1000000.0,
        )

        assert res_dairy.market_reach != res_welding.market_reach
        assert res_dairy.business_category != res_welding.business_category
    finally:
        db.close()


# ==============================================================================
# PHASE 4 & 5: SINGLE SOURCE OF TRUTH & FORMULA TRACEABILITY
# ==============================================================================

def test_phase4_and_5_single_source_of_truth_and_traceability():
    """Verify exact equality between BusinessFeasibilityService and GET /ahp/business-feasibility/{id}."""
    db = SessionLocal()
    try:
        # Fetch or create a test business
        biz = db.query(Business).first()
        if not biz:
            biz = Business(
                name="Test Dairy Agro",
                industry="Livestock & Dairy",
                category="Livestock & Dairy",
                location="Sundargarh, Odisha",
                location_district="Sundargarh",
                location_state="Odisha",
                own_capital=200000.0,
                project_cost=1000000.0,
                monthly_revenue=75000.0,
                monthly_expense=45000.0,
            )
            db.add(biz)
            db.commit()
            db.refresh(biz)

        bfs = BusinessFeasibilityService(db)
        direct_res = bfs.compute(biz.id)

        api_resp = client.get(f"/api/v1/ahp/business-feasibility/{biz.id}")
        assert api_resp.status_code == 200
        api_data = api_resp.json()

        # Phase 4 Exact Equality
        assert math.isclose(direct_res.final_score, api_data["final_score"], rel_tol=1e-5)
        assert direct_res.raw_scores == api_data["raw_scores"]
        assert direct_res.ahp_dashboard_points == api_data["ahp_dashboard_points"]

        # Phase 5 Formula Traceability
        assert len(api_data["criteria_traces"]) == 5
        sum_contributions = 0.0
        for t in api_data["criteria_traces"]:
            assert "criterion" in t
            assert "raw_score" in t
            assert "raw_score_formula" in t
            assert "raw_score_inputs" in t
            assert "ahp_weight" in t
            assert "maximum_points" in t
            assert "contribution" in t
            assert "data_source" in t
            assert "provenance" in t

            expected_contrib = (t["raw_score"] / 100.0) * t["maximum_points"]
            assert math.isclose(t["contribution"], expected_contrib, abs_tol=0.005)
            sum_contributions += t["contribution"]

        assert math.isclose(api_data["final_score"], sum_contributions, abs_tol=0.05)
    finally:
        db.close()


# ==============================================================================
# PHASE 6: EXACT AHP TERMINOLOGY
# ==============================================================================

def test_phase6_exact_ahp_terminology():
    """Verify exact terminology: Expert Geometric Mean, Row Geometric Mean, Normalized AHP Priority Weight."""
    guide = get_ahp_methodology_guide()
    step_titles = [s["title"] for s in guide.steps]
    step_desc = " ".join([s["description"] for s in guide.steps])

    assert any("Expert Pairwise Comparison" in t for t in step_titles)
    assert any("Geometric Mean Aggregation" in t for t in step_titles)
    assert any("Reciprocal" in t for t in step_titles)
    assert any("Row Geometric Mean" in t for t in step_titles)
    assert any("Normalized AHP Priority Weight" in t for t in step_titles)

    # Ensure "weighted mean" is not used to describe normalization
    assert "weighted mean" not in step_desc.lower()


# ==============================================================================
# PHASE 7: HYPERLOCAL PROVENANCE & ANTI-LEAKAGE
# ==============================================================================

def test_phase7_hyperlocal_provenance_and_anti_leakage():
    """Verify district data does not leak across boundaries and provenance flags are accurate."""
    db = SessionLocal()
    try:
        bfs = BusinessFeasibilityService(db)

        # 1. Sundargarh (Verified District for Poultry)
        res_sundargarh = bfs.compute_from_context(
            business_category="Poultry",
            specific_business="Poultry Farming / Broiler Production",
            location="Sundargarh, Odisha",
            own_capital=100000.0,
            project_cost=1000000.0,
        )
        assert res_sundargarh.is_local_verified is True
        assert "Verified" in res_sundargarh.local_market_context

        # 2. Bargarh (Different District)
        res_bargarh = bfs.compute_from_context(
            business_category="Poultry",
            specific_business="Poultry Farming / Broiler Production",
            location="Bargarh, Odisha",
            own_capital=100000.0,
            project_cost=1000000.0,
        )

        # Anti-leakage: Bargarh query must not claim Sundargarh specific local context
        assert "Sundargarh District (" not in res_bargarh.local_market_context
    finally:
        db.close()


# ==============================================================================
# PHASE 8: AI GROUNDING & HONESTY
# ==============================================================================

def test_phase8_ai_grounding_queries():
    """Verify AdvisoryService grounds AI responses in real numbers and honest AHP disclosures."""
    # 1. "Why is my feasibility score low?"
    resp_low = client.post(
        "/api/v1/advisory/chat",
        json={
            "message": "Why is my feasibility score low?",
            "business_context": {
                "business_category": "Livestock & Dairy",
                "specific_business": "Dairy Cattle Milk Production & Chilling",
                "location": "Sundargarh, Odisha",
                "available_margin_capital": 50000.0,
            },
        },
    )
    assert resp_low.status_code == 200
    data_low = resp_low.json()
    assert "Feasibility Score" in data_low["answer"] or "feasibility" in data_low["answer"].lower()
    assert len(data_low["key_facts"]) > 0

    # 2. "How is my score calculated?"
    resp_calc = client.post(
        "/api/v1/advisory/chat",
        json={
            "message": "How is my score calculated?",
            "business_context": {
                "business_category": "Livestock & Dairy",
                "specific_business": "Dairy Cattle Milk Production & Chilling",
                "location": "Sundargarh, Odisha",
                "available_margin_capital": 100000.0,
            },
        },
    )
    assert resp_calc.status_code == 200
    data_calc = resp_calc.json()
    assert "AHP" in data_calc["answer"] or "weighted" in data_calc["answer"].lower() or "Market" in data_calc["answer"]

    # 3. "Why does Market have this weight?"
    resp_mkt = client.post(
        "/api/v1/advisory/chat",
        json={
            "message": "Why is Market given higher importance?",
            "business_context": {
                "business_category": "Livestock & Dairy",
                "specific_business": "Dairy Cattle Milk Production & Chilling",
                "location": "Sundargarh, Odisha",
                "available_margin_capital": 100000.0,
            },
        },
    )
    assert resp_mkt.status_code == 200
    data_mkt = resp_mkt.json()
    assert "Market Catchment & Demand" in data_mkt["answer"]

    # 4. "How can I improve my financial score?"
    resp_imp = client.post(
        "/api/v1/advisory/chat",
        json={
            "message": "How can I improve my financial score?",
            "business_context": {
                "business_category": "Livestock & Dairy",
                "specific_business": "Dairy Cattle Milk Production & Chilling",
                "location": "Sundargarh, Odisha",
                "available_margin_capital": 100000.0,
            },
        },
    )
    assert resp_imp.status_code == 200
    data_imp = resp_imp.json()
    assert "Promoter Equity" in data_imp["answer"] or "equity" in data_imp["answer"].lower() or "margin" in data_imp["answer"].lower()

    # 5. "Is this based on real expert data?" (Honesty check!)
    resp_exp = client.post(
        "/api/v1/advisory/chat",
        json={
            "message": "Is this based on real expert data?",
            "business_context": {
                "business_category": "Livestock & Dairy",
                "specific_business": "Dairy Cattle Milk Production & Chilling",
                "location": "Sundargarh, Odisha",
                "available_margin_capital": 100000.0,
            },
        },
    )
    assert resp_exp.status_code == 200
    data_exp = resp_exp.json()
    assert "Illustrative Prototype Benchmark" in data_exp["answer"]
    assert "PENDING" in data_exp["answer"]


# ==============================================================================
# PHASE 9: AI PROVIDER ABSTRACTION
# ==============================================================================

def test_phase9_ai_provider_abstraction():
    """Verify Groq is the active default cloud provider and Ollama is disabled by default."""
    provider = get_llm_provider()
    assert isinstance(provider, GroqProvider)
    assert provider.provider_name == "Groq (openai/gpt-oss-120b)"
    assert provider.model == "openai/gpt-oss-120b"
    assert provider.endpoint == "https://api.groq.com/openai/v1/chat/completions"

    ollama = OllamaProvider()
    assert ollama.enabled is False
    assert ollama.generate("Test") is None


# ==============================================================================
# PHASE 10: EDGE CASES & STABILITY
# ==============================================================================

def test_phase10_edge_cases_handling():
    """Verify zero division, missing fields, and extreme values never cause NaN or crash."""
    db = SessionLocal()
    try:
        bfs = BusinessFeasibilityService(db)

        # 1. Project cost = 0, own capital = 0
        res_zero = bfs.compute_from_context(
            business_category="Services",
            specific_business="General Services",
            location="Rural Odisha",
            own_capital=0.0,
            project_cost=0.0,
        )
        assert not math.isnan(res_zero.final_score)
        assert not math.isinf(res_zero.final_score)
        assert 0 <= res_zero.final_score <= 100

        # 2. Extreme capital (> project cost)
        res_rich = bfs.compute_from_context(
            business_category="Services",
            specific_business="General Services",
            location="Rural Odisha",
            own_capital=5000000.0,
            project_cost=100000.0,
        )
        assert res_rich.raw_scores["financial"] <= 100.0
        assert not math.isnan(res_rich.final_score)

        # 3. Missing location & empty strings
        res_empty = bfs.compute_from_context(
            business_category="",
            specific_business="",
            location="",
            own_capital=0.0,
            project_cost=0.0,
        )
        assert not math.isnan(res_empty.final_score)
        assert res_empty.is_local_verified is False
    finally:
        db.close()
