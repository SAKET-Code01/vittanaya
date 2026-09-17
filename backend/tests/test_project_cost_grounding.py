"""Authoritative Regression Tests for Project Cost Data-Grounding (SIH26091).

Verifies strict source-priority hierarchy:
1. USER-ENTERED PLANNED PROJECT COST
2. AUTHORITATIVE CALCULATED PROJECT COST
3. CATEGORY/SECTOR BENCHMARK (NABARD)

Cases:
- CASE 1: User enters own capital ₹500, no planned project cost
  -> Project cost uses benchmark, labeled 'Estimated Project Cost', source 'NABARD benchmark'
- CASE 2: User enters planned project cost ₹8,00,000, own capital ₹500
  -> Project cost = ₹8,00,000, source = USER_PROVIDED, benchmark does NOT overwrite it
- CASE 3: User changes planned project cost (₹8L -> ₹12L)
  -> Loan requirement, EMI, financial metrics, and final feasibility change dynamically
- CASE 4: Dashboard and Financial Plan show the exact same resolved project cost
"""

import pytest
from sqlalchemy.orm import Session

from backend.app.engines.cost_engine import ProjectCostEngine
from backend.app.models.business import Business
from backend.app.schemas.financial_plan import FundingStructureRequest
from backend.app.services.business_feasibility_service import BusinessFeasibilityService
from backend.app.services.dashboard_service import DashboardService
from backend.app.services.financial_plan_service import FinancialPlanService
from backend.app.services.seed_service import seed_all_reference_data


@pytest.fixture(autouse=True)
def setup_data(db_session: Session):
    """Seed reference database with NABARD benchmarks and market data."""
    seed_all_reference_data(db_session)


def test_case_1_own_capital_500_no_planned_project_cost(db_session: Session):
    """CASE 1: User enters own capital ₹500, no planned project cost.

    Expected:
    - Project cost uses benchmark (e.g. Dairy benchmark = ₹11,78,000)
    - Source type: BENCHMARK_ESTIMATE
    - Label: 'Estimated Project Cost'
    - Source name contains 'NABARD benchmark'
    - Maximum Supportable Project Size is derived from own capital leverage (₹5,000 for ₹500 @ 10%)
    """
    biz = Business(
        owner_id=1,
        name="Maa Tarini Dairy Unit",
        type="dairy",
        category="Dairy",
        industry="Dairy Farming",
        location_district="Sundargarh",
        location_state="Odisha",
        own_capital=500.0,
        project_cost=0.0,  # User did not enter planned project cost
    )
    db_session.add(biz)
    db_session.commit()
    db_session.refresh(biz)

    # 1. Cost Engine Resolution
    engine = ProjectCostEngine(db_session)
    resolved = engine.resolve_project_cost(business_id=biz.id)
    assert resolved.project_cost == 1178000.0
    assert resolved.source_type == "BENCHMARK_ESTIMATE"
    assert "NABARD" in resolved.source_name
    assert resolved.label == "Estimated Project Cost"
    assert resolved.is_user_provided is False
    # Max supportable project size is ₹5,000 (₹500 / 10%), NOT overwriting project cost
    assert resolved.max_supportable_project_size == 5000.0

    # 2. Feasibility Service Resolution
    feas_svc = BusinessFeasibilityService(db_session)
    feas_res = feas_svc.compute(biz.id)
    assert feas_res.resolved_project_cost == 1178000.0
    assert feas_res.project_cost_source_type == "BENCHMARK_ESTIMATE"
    assert "NABARD" in feas_res.project_cost_source_name
    assert feas_res.project_cost_label == "Estimated Project Cost"
    assert feas_res.max_supportable_project_size == 5000.0

    # 3. Financial Plan Service Resolution
    fin_req = FundingStructureRequest(
        business_id=biz.id,
        own_capital=500.0,
        business_category="Dairy",
        specific_business="Dairy Farming",
        location="Sundargarh, Odisha",
    )
    fin_res = FinancialPlanService.calculate_funding_structure(fin_req, db=db_session)
    assert fin_res.project_cost == 1178000.0
    assert fin_res.source_type == "BENCHMARK_ESTIMATE"
    assert "NABARD" in fin_res.source_name
    assert fin_res.project_cost_label == "Estimated Project Cost"
    assert fin_res.own_margin_capital == 500.0
    assert fin_res.loan_amount == 1177500.0


def test_case_2_user_enters_planned_project_cost_8_lakh(db_session: Session):
    """CASE 2: User enters planned project cost ₹8,00,000, own capital ₹500.

    Expected:
    - project cost = ₹8,00,000
    - source = USER_PROVIDED
    - label = 'Planned Project Cost'
    - benchmark must NOT overwrite it
    """
    biz = Business(
        owner_id=1,
        name="Maa Tarini Dairy Unit",
        type="dairy",
        category="Dairy",
        industry="Dairy Farming",
        location_district="Sundargarh",
        location_state="Odisha",
        own_capital=500.0,
        project_cost=800000.0,  # User explicitly entered planned cost
    )
    db_session.add(biz)
    db_session.commit()
    db_session.refresh(biz)

    # 1. Cost Engine Resolution
    engine = ProjectCostEngine(db_session)
    resolved = engine.resolve_project_cost(business_id=biz.id)
    assert resolved.project_cost == 800000.0
    assert resolved.source_type == "USER_PROVIDED"
    assert resolved.source_name == "User Input"
    assert resolved.label == "Planned Project Cost"
    assert resolved.is_user_provided is True
    # Benchmark reference exists separately for comparison without overwriting
    assert resolved.benchmark_cost == 1178000.0
    assert resolved.max_supportable_project_size == 5000.0

    # 2. Feasibility Service Resolution
    feas_svc = BusinessFeasibilityService(db_session)
    feas_res = feas_svc.compute(biz.id)
    assert feas_res.resolved_project_cost == 800000.0
    assert feas_res.project_cost_source_type == "USER_PROVIDED"
    assert feas_res.project_cost_label == "Planned Project Cost"

    # 3. Financial Plan Service Resolution
    fin_req = FundingStructureRequest(
        business_id=biz.id,
        project_cost=800000.0,
        own_capital=500.0,
        business_category="Dairy",
        specific_business="Dairy Farming",
        location="Sundargarh, Odisha",
    )
    fin_res = FinancialPlanService.calculate_funding_structure(fin_req, db=db_session)
    assert fin_res.project_cost == 800000.0
    assert fin_res.source_type == "USER_PROVIDED"
    assert fin_res.source_name == "User Input"
    assert fin_res.project_cost_label == "Planned Project Cost"
    assert fin_res.loan_amount == 799500.0  # 8,00,000 - 500


def test_case_3_user_changes_planned_project_cost_recalculates_everything(db_session: Session):
    """CASE 3: User changes planned project cost (₹8 lakh -> ₹12 lakh).

    Expected:
    - loan requirement changes
    - EMI changes
    - financial metrics change
    - financial feasibility score changes
    - final feasibility score changes
    """
    biz = Business(
        owner_id=1,
        name="Odisha Agro Feed Processing",
        type="agro",
        category="Agro-Processing",
        industry="Agro-Processing",
        location_district="Puri",
        location_state="Odisha",
        own_capital=200000.0,  # ₹2 Lakh own capital
        project_cost=800000.0,  # Initial ₹8 Lakh
    )
    db_session.add(biz)
    db_session.commit()
    db_session.refresh(biz)

    # Initial computation at ₹8 Lakh
    fin_req_8l = FundingStructureRequest(
        business_id=biz.id,
        project_cost=800000.0,
        own_capital=200000.0,
        margin_pct=25.0,
    )
    fin_res_8l = FinancialPlanService.calculate_funding_structure(fin_req_8l, db=db_session)
    feas_svc = BusinessFeasibilityService(db_session)
    feas_8l = feas_svc.compute(biz.id)

    assert fin_res_8l.loan_amount == 600000.0  # ₹8L - ₹2L
    emi_8l = fin_res_8l.monthly_emi
    fin_score_8l = feas_8l.raw_scores["financial"]
    final_score_8l = feas_8l.final_score

    # User updates planned project cost to ₹12 Lakh
    biz.project_cost = 1200000.0
    db_session.commit()
    db_session.refresh(biz)

    fin_req_12l = FundingStructureRequest(
        business_id=biz.id,
        project_cost=1200000.0,
        own_capital=200000.0,
        margin_pct=16.67,
    )
    fin_res_12l = FinancialPlanService.calculate_funding_structure(fin_req_12l, db=db_session)
    feas_12l = feas_svc.compute(biz.id)

    assert fin_res_12l.loan_amount == 1000000.0  # ₹12L - ₹2L
    emi_12l = fin_res_12l.monthly_emi
    fin_score_12l = feas_12l.raw_scores["financial"]
    final_score_12l = feas_12l.final_score

    # Assert dynamic changes:
    assert fin_res_12l.loan_amount > fin_res_8l.loan_amount
    assert emi_12l > emi_8l
    assert fin_score_12l < fin_score_8l  # Lower equity margin ratio (16.67% vs 25%)
    assert final_score_12l != final_score_8l  # Overall feasibility reflects financial impact


def test_case_4_dashboard_and_financial_plan_reconciliation(db_session: Session):
    """CASE 4: Dashboard and Financial Plan must show the same resolved project cost."""
    biz = Business(
        owner_id=1,
        name="Kalinga Handloom Weaving",
        type="textile",
        category="Handloom",
        industry="Handloom Weaving",
        location_district="Sambalpur",
        location_state="Odisha",
        own_capital=50000.0,
        project_cost=350000.0,  # User provided ₹3.5 Lakh
    )
    db_session.add(biz)
    db_session.commit()
    db_session.refresh(biz)

    # 1. Dashboard summary
    dash_svc = DashboardService(db_session)
    dash_res = dash_svc.get_summary(biz.id)
    assert dash_res is not None
    assert dash_res.project_cost == 350000.0
    assert dash_res.project_cost_source_type == "USER_PROVIDED"
    assert dash_res.project_cost_label == "Planned Project Cost"
    assert dash_res.max_supportable_project_size == 500000.0  # ₹50,000 / 0.10

    # 2. Financial Plan summary
    fin_req = FundingStructureRequest(
        business_id=biz.id,
        project_cost=350000.0,
        own_capital=50000.0,
    )
    fin_res = FinancialPlanService.calculate_funding_structure(fin_req, db=db_session)
    assert fin_res.project_cost == dash_res.project_cost
    assert fin_res.source_type == dash_res.project_cost_source_type
    assert fin_res.project_cost_label == dash_res.project_cost_label
    assert fin_res.max_supportable_project_size == dash_res.max_supportable_project_size
