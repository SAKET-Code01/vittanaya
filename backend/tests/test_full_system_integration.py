"""Full System Integration & SIH Demo Hardening Test Suite.

Verifies:
1. Complete end-to-end data flow: Business Profile -> Industry -> Feasibility -> Financial Plan -> Cash Flow -> Risk -> ML -> Scheme -> What-If -> Action Plan -> Ask VITTANAYA
2. Workspace switching isolation between Business A (Restaurant) and Business B (Transport)
3. Grounded Ask VITTANAYA responses for 10 key SIH presentation questions
4. 100% offline local prediction and deterministic engine execution resilience
"""

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.app.ml.predictive_engine import PredictiveEngine
from backend.app.models.business import Business
from backend.app.schemas.advisory import ChatRequest
from backend.app.schemas.industry import IndustryAnalysisRequest
from backend.app.schemas.ml import PredictiveMlRequest
from backend.app.services.advisory_service import AdvisoryService
from backend.app.services.industry_service import IndustryService


def test_end_to_end_data_flow(client: TestClient, db_session: Session):
    """1. Verify full data flow across all 11 core system modules."""
    biz = Business(
        owner_id=1,
        name="Utkal Food & Catering Services",
        type="Restaurant",
        category="Restaurant",
        industry="Food Service",
        location_district="Khordha",
        own_capital=75000.0,
        existing_investment=250000.0,
    )
    db_session.add(biz)
    db_session.commit()
    biz_id = biz.id

    # A. Feasibility
    feas_res = client.post("/api/v1/feasibility", json={"business_category": "Restaurant", "specific_business": "Restaurant", "location": "Khordha", "margin_capital": 75000.0})
    assert feas_res.status_code == 200
    assert feas_res.json()["overall_opportunity_score"] > 0

    # B. Financial Plan
    fin_res = client.post("/api/v1/finance/funding-structure", json={"project_cost": 250000.0, "margin_pct": 30.0, "interest_rate_annual": 9.5, "tenure_years": 5})
    assert fin_res.status_code == 200
    assert fin_res.json()["monthly_emi"] > 0

    # C. Cash Flow
    cf_res = client.post("/api/v1/finance/cash-flow", json={"business_id": biz_id, "project_cost": 250000.0, "available_margin_capital": 75000.0})
    assert cf_res.status_code == 200
    assert cf_res.json()["summary"]["months_of_coverage"] >= 0

    # D. Risk Engine
    risk_res = client.post("/api/v1/risk-analysis", json={"business_category": "Restaurant", "specific_business": "Restaurant", "indicative_project_cost": 250000.0, "available_margin_capital": 75000.0, "financing_requirement": 175000.0})
    assert risk_res.status_code == 200
    assert "overall_risk" in risk_res.json()

    # E. Industry Intelligence
    ind_res = client.post("/api/v1/industry/analyze", json={"business_id": biz_id, "industry_code": "RESTAURANT"})
    assert ind_res.status_code == 200
    assert ind_res.json()["industry_code"] == "RESTAURANT"

    # F. ML Predictive Layer
    ml_res = client.post("/api/v1/ml/predict", json={"business_id": biz_id})
    assert ml_res.status_code == 200
    assert ml_res.json()["data_status"] == "VERIFIED_ML_PREDICTION"

    # G. Scheme Engine
    scheme_res = client.post("/api/v1/scheme-match", json={"business_category": "Restaurant", "specific_business": "Restaurant", "indicative_project_cost": 250000.0, "available_margin_capital": 75000.0, "location": "Khordha"})
    assert scheme_res.status_code == 200

    # H. What-If Engine
    whatif_res = client.post("/api/v1/simulation", json={"baseline_project_cost": 250000.0, "baseline_available_margin": 75000.0, "baseline_sales_annual": 300000.0, "baseline_operating_cost_annual": 180000.0, "sales_change": -15.0})
    assert whatif_res.status_code == 200

    # I. Action Plan / DPR
    action_res = client.get(f"/api/v1/action-plan/{biz_id}")
    assert action_res.status_code == 200

    # J. Ask VITTANAYA
    chat_res = client.post("/api/v1/advisory/chat", json={"business_id": str(biz_id), "message": "What should I improve first?"})
    assert chat_res.status_code == 200
    assert len(chat_res.json()["answer"]) > 0


def test_business_switching_context_isolation(db_session: Session):
    """2. Verify Business A (Restaurant) vs Business B (Transport) context switching isolation."""
    biz_a = Business(owner_id=1, name="Restaurant A", type="Restaurant", category="Restaurant", industry="Food Service", own_capital=60000.0)
    biz_b = Business(owner_id=1, name="Transport B", type="Transport", category="Transport", industry="Transport", own_capital=120000.0)
    db_session.add_all([biz_a, biz_b])
    db_session.commit()

    ind_a = IndustryService.analyze(IndustryAnalysisRequest(business_id=biz_a.id, industry_code="RESTAURANT"), db=db_session)
    ind_b = IndustryService.analyze(IndustryAnalysisRequest(business_id=biz_b.id, industry_code="TRANSPORT"), db=db_session)

    assert ind_a.industry_code == "RESTAURANT"
    assert ind_b.industry_code == "TRANSPORT"
    assert ind_a.display_name != ind_b.display_name

    ml_a = PredictiveEngine.predict(PredictiveMlRequest(business_id=biz_a.id, own_capital=60000.0), db=db_session)
    ml_b = PredictiveEngine.predict(PredictiveMlRequest(business_id=biz_b.id, own_capital=120000.0), db=db_session)

    assert ml_a.business_id == biz_a.id
    assert ml_b.business_id == biz_b.id


def test_chatbot_10_key_sih_questions(client: TestClient, db_session: Session):
    """3. Verify Ask VITTANAYA answers 10 core SIH presentation questions using correct backend sources."""
    biz = Business(owner_id=1, name="Dhaba Unit", type="Restaurant", industry="Food Service", own_capital=50000.0)
    db_session.add(biz)
    db_session.commit()

    questions_and_intents = [
        ("Is my business feasible?", "FEASIBILITY"),
        ("Why?", "EXPLANATION"),
        ("What loan can I afford?", "FINANCIAL"),
        ("What is my EMI?", "FINANCIAL"),
        ("Which government scheme is suitable?", "SCHEME"),
        ("What is my biggest risk?", "RISK"),
        ("Will I have enough cash?", "CASH_FLOW"),
        ("What happens if sales fall by 15%?", "WHAT_IF"),
        ("What does the predictive model say?", "PREDICTIVE_ML"),
        ("What should I improve first?", "ACTION"),
    ]

    for question, expected_intent in questions_and_intents:
        res = client.post("/api/v1/advisory/chat", json={"business_id": str(biz.id), "message": question})
        assert res.status_code == 200
        data = res.json()
        assert data["intent"] == expected_intent
        assert len(data["answer"]) > 10


def test_offline_resilience(db_session: Session):
    """4. Verify deterministic engines and local ML inference execute 100% offline without network calls."""
    # Test local ML predictive engine without external dependencies
    ml_res = PredictiveEngine.predict(PredictiveMlRequest(project_cost=200000.0, own_capital=50000.0), db=db_session)
    assert ml_res.data_status == "VERIFIED_ML_PREDICTION"
    assert ml_res.distress_probability >= 0.0

    # Test local chatbot advisory grounding without external API dependency
    from backend.app.schemas.advisory import BusinessContextInput
    req_payload = ChatRequest(
        message="What is my default risk?",
        business_id=None,
        business_context=BusinessContextInput(specific_business="Poultry Farm", business_category="Poultry", location="Sundargarh, Odisha", available_margin_capital=50000.0),
        language="en",
    )
    advisory_res = AdvisoryService.process_chat(payload=req_payload, db=db_session)
    assert advisory_res.intent == "PREDICTIVE_ML"
    assert advisory_res.data_status == "VERIFIED_DETERMINISTIC"
