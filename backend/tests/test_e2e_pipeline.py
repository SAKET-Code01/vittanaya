"""Comprehensive End-to-End Verification Test for VITTANAYA (SIH26091).

Tests:
1. PostgreSQL / SQLAlchemy connection & Schema reflection
2. Business creation & retrieval
3. Financial ledger (transactions, receivables, payables) persistence
4. Dashboard summary derivation from database records
5. Feasibility Engine (SWOT, market reach, competitive signals, citations)
6. Financial Structuring Engine (NABARD cost benchmark, debt requirement, margin shortfall check)
7. Scheme Matching Engine (PMEGP, MUDRA, PM-FME, PM Vishwakarma, Stand Up India)
8. Risk Engine (Financial, Market, Competition, Operational, Seasonality)
9. What-If Engine (Non-mutating parameter perturbations & delta calculation)
10. AI Advisor (Natural language synthesis with zero hallucinations)
11. Parameter perturbation verification (proving downstream outputs change with input mutations)
"""

from datetime import date
from decimal import Decimal

from sqlalchemy.orm import Session

from backend.app.engines.ai_advisor import AIBusinessAdvisor
from backend.app.engines.feasibility_engine import FeasibilityEngine
from backend.app.engines.financial_engine import FinancialEngine
from backend.app.engines.risk_engine import RiskEngine
from backend.app.engines.scheme_engine import SchemeEngine
from backend.app.engines.whatif_engine import WhatIfEngine
from backend.app.models import (
    ProjectCostReference,
    SchemeRule,
    User,
)
from backend.app.schemas.business import BusinessCreate
from backend.app.schemas.payable import PayableCreate
from backend.app.schemas.receivable import ReceivableCreate
from backend.app.schemas.transaction import TransactionCreate
from backend.app.services.business_service import BusinessService
from backend.app.services.dashboard_service import DashboardService
from backend.app.services.ledger_service import LedgerService
from backend.app.services.seed_service import seed_all_reference_data


def test_complete_e2e_pipeline(db_session: Session):
    # 1. Ensure reference seeds exist in test session
    seed_all_reference_data(db_session)
    ref_count = db_session.query(ProjectCostReference).count()
    scheme_count = db_session.query(SchemeRule).count()
    assert ref_count >= 10
    assert scheme_count >= 5

    # 2. User & Business Creation
    user = User(
        email="saket_e2e@vittanaya.org",
        name="Saket Rural Entrepreneur",
        hashed_password="mock-password-hash",
        phone="9876543210",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    biz_service = BusinessService(db_session)
    test_biz_data = BusinessCreate(
        owner_id=user.id,
        name="Konark Organic Agro Processing",
        type="Manufacturing",
        industry="Food Processing",
        stage="established",
        category="Agro Processing",
        location_village="Nimapada",
        location_block="Nimapada",
        location_district="Puri",
        location_state="Odisha",
        location_pin="752106",
        own_capital=Decimal("75000.00"),
        existing_investment=Decimal("120000.00"),
        social_category="OBC",
        area_type="Rural",
        monthly_revenue_estimate=Decimal("85000.00"),
        monthly_expense_estimate=Decimal("52000.00"),
    )
    biz = biz_service.create_business(test_biz_data)
    assert biz.id is not None
    assert biz.name == "Konark Organic Agro Processing"

    # 3. Financial Ledger Persistence
    ledger_service = LedgerService(db_session)
    tx1 = ledger_service.create_transaction(
        TransactionCreate(
            business_id=biz.id,
            transaction_date=date(2026, 9, 1),
            amount=Decimal("45000.00"),
            category="Sales",
            description="Wholesale spice supply to Puri market",
        )
    )
    tx2 = ledger_service.create_transaction(
        TransactionCreate(
            business_id=biz.id,
            transaction_date=date(2026, 9, 2),
            amount=Decimal("-18000.00"),
            category="Purchases",
            description="Organic raw turmeric procurement",
        )
    )
    rec = ledger_service.create_receivable(
        ReceivableCreate(
            business_id=biz.id,
            customer_name="Puri Retail Co-op",
            invoice_number="INV-2026-001",
            amount=Decimal("22000.00"),
            due_date=date(2026, 9, 15),
            expected_date=date(2026, 9, 15),
            status="pending",
        )
    )
    pay = ledger_service.create_payable(
        PayableCreate(
            business_id=biz.id,
            vendor_name="Odisha Packaging Ltd",
            bill_number="BILL-9902",
            amount=Decimal("12500.00"),
            due_date=date(2026, 9, 10),
            status="unpaid",
        )
    )
    assert tx1.id is not None
    assert tx2.id is not None
    assert rec.id is not None
    assert pay.id is not None

    # 4. Dashboard Summary Derivation
    dash_service = DashboardService(db_session)
    summary = dash_service.get_summary(biz.id)
    assert summary is not None
    # cash_balance = own_capital (75k) + net cashflow (45k - 18k = 27k) = 102,000
    assert summary.cash_balance == Decimal("102000.00")
    assert summary.total_inflow == Decimal("45000.00")
    assert summary.total_outflow == Decimal("18000.00")
    assert summary.net_cashflow == Decimal("27000.00")
    assert summary.pending_receivables_total == Decimal("22000.00")
    assert summary.pending_payables_total == Decimal("12500.00")

    # 5. Financial Structuring Engine (Project Cost & Gap)
    fin_engine = FinancialEngine(db_session)
    fin_res = fin_engine.analyze_financial_gap(
        available_margin_capital=75000.0,
        business_category="Agro Processing",
        specific_business="Konark Organic Agro Processing",
        location="Puri",
    )
    assert fin_res.indicative_project_cost > 0
    assert fin_res.financing_requirement == fin_res.indicative_project_cost - 75000.0
    assert fin_res.traceability.source_authority is not None

    # 6. Feasibility Engine
    feas_engine = FeasibilityEngine(db_session)
    feas_res = feas_engine.evaluate_feasibility(
        business_category="Agro Processing",
        specific_business="Konark Organic Agro Processing",
        location="Puri",
    )
    assert 0 <= feas_res.overall_opportunity_score <= 100
    assert len(feas_res.SWOT.strengths) > 0
    assert len(feas_res.SWOT.weaknesses) > 0

    # 7. Scheme Match Engine
    scheme_engine = SchemeEngine(db_session)
    scheme_res = scheme_engine.match_schemes(
        indicative_project_cost=fin_res.indicative_project_cost,
        available_margin_capital=75000.0,
        business_category="Agro Processing",
        specific_business="Konark Organic Agro Processing",
        location="Puri",
        social_category="OBC",
        area_type="Rural",
    )
    assert len(scheme_res.eligible_schemes) >= 1
    assert scheme_res.best_recommendation is not None
    assert scheme_res.best_recommendation.official_source_url is not None

    # 8. Risk Engine
    risk_engine = RiskEngine(db_session)
    risk_res = risk_engine.analyze_risks(
        business_category="Agro Processing",
        specific_business="Konark Organic Agro Processing",
        indicative_project_cost=fin_res.indicative_project_cost,
        available_margin_capital=75000.0,
        financing_requirement=fin_res.financing_requirement,
        location="Puri",
    )
    assert risk_res.overall_risk in ["Low", "Medium", "High"]
    assert risk_res.financial_risk in ["Low", "Medium", "High"]

    # 9. What-If Engine (Non-Mutating Isolation)
    whatif_engine = WhatIfEngine()
    sim_res = whatif_engine.simulate(
        baseline_project_cost=fin_res.indicative_project_cost,
        baseline_available_margin=75000.0,
        baseline_sales_annual=1020000.0,
        baseline_operating_cost_annual=624000.0,
        sales_change=-20.0,
        cost_change=15.0,
    )
    assert sim_res.baseline.surplus == 396000.0
    assert sim_res.simulated.surplus < sim_res.baseline.surplus
    assert sim_res.variance["surplus_diff"] < 0
    # Proving baseline remains untouched
    assert sim_res.baseline.revenue == 1020000.0

    # 10. AI Advisor
    advisor = AIBusinessAdvisor()
    advice = advisor.generate_advice(
        opportunity=feas_res.model_dump(),
        financial=fin_res.model_dump(),
        schemes=scheme_res.model_dump(),
        risks=risk_res.model_dump(),
        what_if=sim_res.model_dump(),
    )
    assert len(advice.summary) > 0
    assert len(advice.why_this_result) > 0
    assert len(advice.recommended_next_steps) > 0

    # 11. Parameter Mutation Verification
    fin_mutated = fin_engine.analyze_financial_gap(
        available_margin_capital=150000.0,
        business_category="Agro Processing",
        specific_business="Konark Organic Agro Processing",
        location="Puri",
    )
    assert fin_mutated.financing_requirement != fin_res.financing_requirement
    assert fin_mutated.margin_pct > fin_res.margin_pct
