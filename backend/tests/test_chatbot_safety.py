"""Chatbot Timeout and Fallback Safety Test Suite.

Verifies:
1. Failed / missing context requests return `data_status="UNAVAILABLE"` and safe refusal text.
2. ZERO hardcoded financial fallbacks (no ₹10,000, no ₹5,00,000 default project cost).
3. ZERO hardcoded scheme eligibility claims (no unverified PMEGP/MUDRA subsidy claims when unmatched).
4. Business profile context isolation.
5. Proves: FAILED REQUEST -> NO FINANCIAL NUMBER -> NO SCHEME ELIGIBILITY -> NO DEFAULT BUSINESS DATA.
"""

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.app.models.business import Business
from backend.app.schemas.advisory import BusinessContextInput, ChatRequest
from backend.app.services.advisory_service import AdvisoryService


def test_missing_business_context_refusal(db_session: Session):
    """1. Verify missing business profile returns exact safety refusal and data_status='UNAVAILABLE'."""
    payload = ChatRequest(
        message="What is my EMI?",
        business_id=None,
        business_context=BusinessContextInput(
            business_category=None,
            specific_business=None,
            location=None,
            available_margin_capital=None,
        ),
        language="en",
    )
    res = AdvisoryService.process_chat(payload, db=db_session)
    assert res.data_status == "UNAVAILABLE"
    assert "I need your active business profile before I can provide a reliable answer." in res.answer
    assert not any("₹" in kf.value for kf in res.key_facts)
    assert len(res.sources) == 0


def test_no_hardcoded_financial_or_scheme_fallback_on_unmatched_profile(db_session: Session):
    """2. Verify no hardcoded ₹10,000 or ₹5,00,000 or PMEGP eligibility claims when profile has no matching data."""
    payload = ChatRequest(
        message="Can I get PMEGP scheme subsidy?",
        business_id=None,
        business_context=None,
        language="en",
    )
    res = AdvisoryService.process_chat(payload, db=db_session)
    assert res.data_status == "UNAVAILABLE"
    # Prove no financial numbers or scheme eligibility claims exist in response
    assert "10,000" not in res.answer
    assert "5,00,000" not in res.answer
    assert "25%" not in res.answer
    assert "35%" not in res.answer
    assert not any("₹" in kf.value for kf in res.key_facts)


def test_failed_request_contains_zero_unverified_facts(client: TestClient):
    """3. Verify API response for incomplete/invalid request contains ZERO financial figures and ZERO scheme claims."""
    # Send request with invalid business_id that does not exist in DB and no business_context
    res = client.post(
        "/api/v1/advisory/chat",
        json={"message": "What is my subsidy?", "business_id": "999999", "business_context": None},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["data_status"] == "UNAVAILABLE"
    assert "I need your active business profile before I can provide a reliable answer." in data["answer"]
    assert not any("₹" in kf.get("value", "") for kf in data.get("key_facts", []))
    assert len(data["sources"]) == 0
    # Prove: FAILED REQUEST -> NO FINANCIAL NUMBER -> NO SCHEME ELIGIBILITY -> NO DEFAULT BUSINESS DATA
    answer_lower = data["answer"].lower()
    assert "10,000" not in answer_lower
    assert "₹" not in data["answer"]
    assert "pmegp" not in answer_lower
    assert "mudra" not in answer_lower


def test_valid_active_business_produces_verified_deterministic_results(db_session: Session):
    """4. Verify valid active business produces grounded VERIFIED_DETERMINISTIC calculations."""
    from backend.app.services.seed_service import seed_project_cost_references
    seed_project_cost_references(db_session)

    biz = Business(
        owner_id=1,
        name="Commercial Broiler Farming",
        type="Poultry",
        category="Poultry",
        industry="Poultry",
        location_district="Sundargarh",
        own_capital=80000.0,
    )
    db_session.add(biz)
    db_session.commit()

    payload = ChatRequest(
        message="What is my loan EMI?",
        business_id=str(biz.id),
        business_context=BusinessContextInput(
            business_id=str(biz.id),
            business_category="Poultry",
            specific_business="Commercial Broiler Farming",
            location="Sundargarh, Odisha",
            available_margin_capital=80000.0,
        ),
        language="en",
    )
    res = AdvisoryService.process_chat(payload, db=db_session)
    assert res.data_status == "VERIFIED_DETERMINISTIC"
    assert res.intent == "FINANCIAL"
    assert len(res.key_facts) > 0
    assert any("EMI" in kf.label for kf in res.key_facts)


def test_business_switching_isolation_in_chat(db_session: Session):
    """5. Verify Business A (Retail) vs Business B (Transport) produces isolated results."""
    biz_a = Business(owner_id=1, name="Grocery A", type="Retail", category="Retail", industry="Retail", location_district="Khordha", own_capital=50000.0)
    biz_b = Business(owner_id=1, name="Trucking B", type="Transport", category="Transport", industry="Transport", location_district="Cuttack", own_capital=150000.0)
    db_session.add_all([biz_a, biz_b])
    db_session.commit()

    res_a = AdvisoryService.process_chat(
        ChatRequest(
            message="What is my risk?",
            business_id=str(biz_a.id),
            business_context=BusinessContextInput(business_category="Retail", specific_business="Grocery A", location="Khordha, Odisha", available_margin_capital=50000.0),
        ),
        db=db_session,
    )

    res_b = AdvisoryService.process_chat(
        ChatRequest(
            message="What is my risk?",
            business_id=str(biz_b.id),
            business_context=BusinessContextInput(business_category="Transport", specific_business="Trucking B", location="Cuttack, Odisha", available_margin_capital=150000.0),
        ),
        db=db_session,
    )

    assert "Grocery A" in res_a.answer or "Khordha" in res_a.answer or res_a.data_status == "VERIFIED_DETERMINISTIC"
    assert "Trucking B" in res_b.answer or "Cuttack" in res_b.answer or res_b.data_status == "VERIFIED_DETERMINISTIC"
    assert res_a.answer != res_b.answer
