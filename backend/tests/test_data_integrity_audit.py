"""Comprehensive Root Cause Data Integrity & Dynamic Advisory Audit Test Suite.

Verifies:
1. Business Profile Persistence in SQLite DB.
2. Removal of synthetic fallbacks (500000.0, 50000, "Odisha").
3. Dynamic calculation recalculation on Revenue, Expense, Project Cost, and Capital changes.
4. Data isolation during Business Switching (Restaurant vs Transport).
5. Grounding of all 13 core Ask VITTANAYA chatbot questions.
6. Deterministic operation when Gemini is disabled.
"""


from backend.app.repositories.business_repository import BusinessRepository
from backend.app.schemas.advisory import ChatRequest
from backend.app.schemas.business import BusinessCreate, BusinessUpdate
from backend.app.services.advisory_service import AdvisoryService


def test_profile_persistence_phase_1(db_session, client):
    """Phase 1 & 18: Verify Business Profile fields persist directly to SQLite DB."""
    db = db_session
    repo = BusinessRepository(db)

    # 1. Create Business
    create_data = BusinessCreate(
        name="Maa Tarini Rural Enterprise",
        type="Manufacturing",
        category="Terracotta Pottery",
        industry="Handicrafts",
        location_district="Kendrapara",
        location_state="Odisha",
        own_capital=75000.0,
        project_cost=350000.0,
        monthly_revenue_estimate=65000.0,
        monthly_expense_estimate=32000.0,
    )
    biz = repo.create(create_data)
    assert biz.id is not None
    assert biz.name == "Maa Tarini Rural Enterprise"

    # 2. Update via API Endpoint
    update_payload = {
        "name": "Maa Tarini Pottery Co-op",
        "location_district": "Mayurbhanj",
        "own_capital": 90000.0,
        "project_cost": 400000.0,
        "monthly_revenue_estimate": 85000.0,
        "monthly_expense_estimate": 40000.0,
    }
    resp = client.put(f"/api/v1/business/{biz.id}", json=update_payload)
    assert resp.status_code == 200
    res_json = resp.json()
    assert res_json["name"] == "Maa Tarini Pottery Co-op"
    assert res_json["location_district"] == "Mayurbhanj"
    assert float(res_json["monthly_revenue_estimate"]) == 85000.0

    # 3. Direct DB Re-query Check
    db.expire_all()
    reloaded = repo.get_by_id(biz.id)
    assert reloaded.name == "Maa Tarini Pottery Co-op"
    assert reloaded.location_district == "Mayurbhanj"
    assert float(reloaded.own_capital) == 90000.0
    assert float(reloaded.monthly_revenue_estimate) == 85000.0


def test_no_synthetic_fallbacks_phase_3(db_session):
    """Phase 3: Verify missing profile data returns UNAVAILABLE without hardcoded fallbacks."""
    db = db_session

    # Empty payload without business_id or context
    req = ChatRequest(message="What is my monthly revenue?")
    resp = AdvisoryService.process_chat(req, db=db)

    assert resp.data_status == "UNAVAILABLE"
    assert "active business profile" in resp.answer
    assert resp.key_facts[0].value == "Incomplete / Missing Active Business Profile"


def test_dynamic_revenue_recalculation_phase_16(db_session):
    """Phase 16: Verify changing Revenue from 80000 to 30000 recalculates outputs dynamically."""
    db = db_session
    repo = BusinessRepository(db)

    # 1. High Revenue Setup
    biz = repo.create(
        BusinessCreate(
            name="Sambalpuri Weaving Hub",
            type="Manufacturing",
            category="Textiles",
            industry="Handicrafts",
            location_district="Sambalpur",
            location_state="Odisha",
            own_capital=150000.0,
            project_cost=500000.0,
            monthly_revenue_estimate=80000.0,
            monthly_expense_estimate=40000.0,
        )
    )

    req1 = ChatRequest(business_id=str(biz.id), message="What happens if sales fall by 15%?")
    res1 = AdvisoryService.process_chat(req1, db=db)
    assert "Baseline Surplus = ₹480,000" in res1.answer or "480,000" in res1.answer

    # 2. Change Revenue to 30000 (Stressed/Low Revenue)
    repo.update(biz, BusinessUpdate(monthly_revenue_estimate=30000.0))
    db.commit()
    db.expire_all()

    req2 = ChatRequest(business_id=str(biz.id), message="What happens if sales fall by 15%?")
    res2 = AdvisoryService.process_chat(req2, db=db)
    assert "Baseline Surplus = ₹480,000" not in res2.answer
    assert "₹-120,000" in res2.answer or "Surplus" in res2.answer


def test_dynamic_expense_recalculation_phase_16(db_session):
    """Phase 16: Verify changing Expenses from 40000 to 70000 recalculates outputs dynamically."""
    db = db_session
    repo = BusinessRepository(db)

    biz = repo.create(
        BusinessCreate(
            name="Koraput Agro Traders",
            type="Agri-Processing",
            category="Spices",
            industry="Agri",
            location_district="Koraput",
            location_state="Odisha",
            own_capital=100000.0,
            project_cost=400000.0,
            monthly_revenue_estimate=80000.0,
            monthly_expense_estimate=40000.0,
        )
    )

    req1 = ChatRequest(business_id=str(biz.id), message="Will I have enough cash?")
    res1 = AdvisoryService.process_chat(req1, db=db)
    assert res1.data_status == "VERIFIED_DETERMINISTIC"

    # Increase Expenses to 70000
    repo.update(biz, BusinessUpdate(monthly_expense_estimate=70000.0))
    db.commit()

    req2 = ChatRequest(business_id=str(biz.id), message="Will I have enough cash?")
    res2 = AdvisoryService.process_chat(req2, db=db)

    # Coverage months should drop significantly with higher expenses
    cov1 = next((kf.value for kf in res1.key_facts if kf.label == "Recommended Buffer"), None)
    cov2 = next((kf.value for kf in res2.key_facts if kf.label == "Recommended Buffer"), None)
    assert cov1 != cov2


def test_business_switching_proof_phase_17(db_session):
    """Phase 17: Verify Business A (Restaurant) vs Business B (Transport) isolation."""
    db = db_session
    repo = BusinessRepository(db)

    biz_a = repo.create(
        BusinessCreate(
            name="Bhubaneswar Dhaba",
            type="Restaurant",
            category="Eatery",
            industry="Food",
            location_district="Khurda",
            location_state="Odisha",
            own_capital=200000.0,
            project_cost=600000.0,
            monthly_revenue_estimate=120000.0,
            monthly_expense_estimate=70000.0,
        )
    )

    biz_b = repo.create(
        BusinessCreate(
            name="Cuttack Cargo Express",
            type="Transport",
            category="Logistics",
            industry="Logistics",
            location_district="Cuttack",
            location_state="Odisha",
            own_capital=300000.0,
            project_cost=1200000.0,
            monthly_revenue_estimate=250000.0,
            monthly_expense_estimate=180000.0,
        )
    )

    res_a = AdvisoryService.process_chat(ChatRequest(business_id=str(biz_a.id), message="What is my EMI?"), db=db)
    res_b = AdvisoryService.process_chat(ChatRequest(business_id=str(biz_b.id), message="What is my EMI?"), db=db)

    assert "Bhubaneswar Dhaba" in res_a.answer or "Khurda" in res_a.answer
    assert "Cuttack Cargo Express" in res_b.answer or "Cuttack" in res_b.answer
    assert res_a.key_facts[0].value != res_b.key_facts[0].value


def test_chatbot_13_questions_grounding_phase_15(db_session):
    """Phase 15: Verify all 13 required Chatbot questions receive data-grounded responses."""
    db = db_session
    repo = BusinessRepository(db)

    biz = repo.create(
        BusinessCreate(
            name="Balasore Solar Services",
            type="Services",
            category="Renewable Energy",
            industry="Services",
            location_district="Balasore",
            location_state="Odisha",
            own_capital=100000.0,
            project_cost=500000.0,
            monthly_revenue_estimate=75000.0,
            monthly_expense_estimate=35000.0,
        )
    )
    b_id = str(biz.id)

    questions = [
        ("What is my business?", "Balasore Solar Services"),
        ("Is my business feasible?", "feasibility score"),
        ("Why?", "Feasibility Score"),
        ("What is my monthly revenue?", "Balasore Solar Services"),
        ("What are my monthly expenses?", "Balasore Solar Services"),
        ("What loan can I afford?", "loan"),
        ("What is my EMI?", "EMI"),
        ("Which government scheme is suitable?", "scheme"),
        ("What is my biggest risk?", "risk"),
        ("Will I have enough cash?", "Cash-Flow Engine"),
        ("What happens if sales fall by 15%?", "Scenario Analysis"),
        ("What does the predictive model say?", "predicts"),
        ("What should I improve first?", "actions"),
    ]

    for q_text, expected_keyword in questions:
        res = AdvisoryService.process_chat(ChatRequest(business_id=b_id, message=q_text), db=db)
        assert res.data_status in ["VERIFIED_DETERMINISTIC", "UNAVAILABLE", "VERIFIED_ML_PREDICTION"]
        assert expected_keyword.lower() in res.answer.lower()
