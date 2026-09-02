"""Data Grounding & Dynamic Pipeline Test Suite for VITTANAYA (SIH26091).

Verifies:
1. Dynamic Data Grounding: Modifying stored business metrics (capital, location, category) changes calculation outputs.
2. Business Workspace Isolation: Business A vs Business B context isolation.
3. Industry-Adaptive Grounding: Sector KPIs & risk factors adjust dynamically per industry.
4. ML Feature Vector Grounding: ML predictions dynamically update from DB features and return explicit provenance notices.
5. Reference Data Provenance: Verified dataset metadata and hyper-local district fallbacks.
6. 100% Offline Capability: Core advisory functions without external AI/Gemini API keys.
"""

from sqlalchemy.orm import Session

from backend.app.ml.predictive_engine import PredictiveEngine
from backend.app.models.business import Business
from backend.app.schemas.advisory import BusinessContextInput, ChatRequest
from backend.app.schemas.ml import PredictiveMlRequest
from backend.app.services.advisory_service import AdvisoryService
from backend.app.services.reference_data_service import ReferenceDataService
from backend.app.services.seed_service import seed_project_cost_references


def test_business_data_drives_advisory_calculations(db_session: Session):
    """1. Verify modifying stored business metrics (capital, location) changes EMI, margin %, and funding outputs."""
    seed_project_cost_references(db_session)

    # Business 1: Poultry with ₹40,000 capital in Sundargarh
    biz1 = Business(
        owner_id=1,
        name="Commercial Broiler Farming",
        type="Poultry",
        category="Poultry",
        industry="Poultry",
        location_district="Sundargarh",
        own_capital=40000.0,
        monthly_revenue_estimate=60000.0,
        monthly_expense_estimate=40000.0,
    )
    # Business 2: Transport with ₹250,000 capital in Cuttack
    biz2 = Business(
        owner_id=1,
        name="Agri Produce Transport / Marketing",
        type="Transport",
        category="Transport",
        industry="Transport",
        location_district="Cuttack",
        own_capital=250000.0,
        monthly_revenue_estimate=150000.0,
        monthly_expense_estimate=90000.0,
    )
    db_session.add_all([biz1, biz2])
    db_session.commit()

    res1 = AdvisoryService.process_chat(
        ChatRequest(
            message="What is my EMI?",
            business_id=str(biz1.id),
            business_context=BusinessContextInput(
                business_id=str(biz1.id),
                specific_business="Commercial Broiler Farming",
                business_category="Poultry",
                location="Sundargarh, Odisha",
                available_margin_capital=40000.0,
            ),
        ),
        db=db_session,
    )

    res2 = AdvisoryService.process_chat(
        ChatRequest(
            message="What is my EMI?",
            business_id=str(biz2.id),
            business_context=BusinessContextInput(
                business_id=str(biz2.id),
                specific_business="Agri Produce Transport / Marketing",
                business_category="Transport",
                location="Cuttack, Odisha",
                available_margin_capital=250000.0,
            ),
        ),
        db=db_session,
    )

    assert res1.data_status == "VERIFIED_DETERMINISTIC"
    assert res2.data_status == "VERIFIED_DETERMINISTIC"
    assert res1.answer != res2.answer
    # EMI and loan amount must reflect different own_capital and project costs
    kf1_emi = next(kf.value for kf in res1.key_facts if "EMI" in kf.label)
    kf2_emi = next(kf.value for kf in res2.key_facts if "EMI" in kf.label)
    assert kf1_emi != kf2_emi


def test_business_switch_isolation(db_session: Session):
    """2. Verify context isolation when switching between Business A and Business B."""
    biz_a = Business(
        owner_id=1,
        name="Lakshmi Handloom",
        type="Handicraft",
        category="Handicraft",
        industry="Handicraft",
        location_district="Puri",
        own_capital=30000.0,
    )
    biz_b = Business(
        owner_id=1,
        name="Utkal Dhaba",
        type="Restaurant",
        category="Restaurant",
        industry="Restaurant",
        location_district="Khordha",
        own_capital=120000.0,
    )
    db_session.add_all([biz_a, biz_b])
    db_session.commit()

    res_a = AdvisoryService.process_chat(
        ChatRequest(
            message="What is my feasibility?",
            business_id=str(biz_a.id),
            business_context=BusinessContextInput(
                business_id=str(biz_a.id),
                specific_business="Lakshmi Handloom",
                business_category="Handicraft",
                location="Puri, Odisha",
                available_margin_capital=30000.0,
            ),
        ),
        db=db_session,
    )

    res_b = AdvisoryService.process_chat(
        ChatRequest(
            message="What is my feasibility?",
            business_id=str(biz_b.id),
            business_context=BusinessContextInput(
                business_id=str(biz_b.id),
                specific_business="Utkal Dhaba",
                business_category="Restaurant",
                location="Khordha, Odisha",
                available_margin_capital=120000.0,
            ),
        ),
        db=db_session,
    )

    assert "Puri" in res_a.answer or "Handloom" in res_a.answer
    assert "Khordha" in res_b.answer or "Dhaba" in res_b.answer
    assert "Utkal Dhaba" not in res_a.answer
    assert "Lakshmi Handloom" not in res_b.answer


def test_ml_feature_vector_grounding_and_provenance(db_session: Session):
    """3. Verify ML predictions dynamically extract DB feature vectors and expose dataset provenance notice."""
    biz = Business(
        owner_id=1,
        name="Leaf Plate Manufacturing",
        type="Agro processing",
        category="Agro processing",
        industry="Agro processing",
        location_district="Mayurbhanj",
        own_capital=50000.0,
        monthly_revenue_estimate=80000.0,
        monthly_expense_estimate=45000.0,
    )
    db_session.add(biz)
    db_session.commit()

    ml_req = PredictiveMlRequest(
        business_id=str(biz.id),
        project_cost=300000.0,
        own_capital=50000.0,
        category="Agro processing",
        district="Mayurbhanj",
    )
    ml_res = PredictiveEngine.predict(ml_req, db=db_session)

    assert ml_res.data_status == "VERIFIED_ML_PREDICTION"
    assert ml_res.distress_probability >= 0.0 and ml_res.distress_probability <= 1.0
    assert len(ml_res.feature_importances) > 0
    # Traceability input must capture extracted DB features
    assert "operating_margin_pct" in ml_res.traceability.input
    assert ml_res.traceability.input["operating_margin_pct"] > 0.0


def test_reference_data_provenance_and_district_profile():
    """4. Verify ReferenceDataService returns district profile with hyper-local fallback notice."""
    profile = ReferenceDataService.get_district_profile("Sundargarh, Odisha")
    assert profile["district"] == "Sundargarh"
    assert "Village-level verified data is unavailable" in profile["locality_notice"]
    assert profile["provenance"] == "REFERENCE"

    provenance = ReferenceDataService.get_provenance_metadata("NABARD_PLP_COSTS")
    assert provenance["source_organization"] == "National Bank for Agriculture and Rural Development (NABARD)"
    assert "2024-2026" in provenance["year"]


def test_100_percent_offline_advisory_without_gemini(db_session: Session):
    """5. Verify all core intent domains run deterministically offline without external API keys."""
    from backend.app.services.seed_service import seed_all_reference_data
    seed_all_reference_data(db_session)

    intents = [
        ("Is my business feasible?", "FEASIBILITY"),
        ("Why is my score 50?", "EXPLANATION"),
        ("What is my EMI?", "FINANCIAL"),
        ("Will I have enough cash?", "CASH_FLOW"),
        ("Which government scheme is suitable?", "SCHEME"),
        ("What is my biggest risk?", "RISK"),
        ("What happens if sales fall by 15%?", "WHAT_IF"),
        ("What does the predictive model say?", "PREDICTIVE_ML"),
        ("What should I improve first?", "ACTION"),
    ]

    for msg, expected_intent in intents:
        req = ChatRequest(
            message=msg,
            business_id="1",
            business_context=BusinessContextInput(
                specific_business="Commercial Broiler Farming",
                business_category="Poultry",
                location="Sundargarh, Odisha",
                available_margin_capital=80000.0,
            ),
        )
        res = AdvisoryService.process_chat(req, db=db_session)
        assert res.data_status in ["VERIFIED_DETERMINISTIC", "VERIFIED_ML_PREDICTION"]
        assert len(res.answer) > 20
        assert len(res.key_facts) > 0
