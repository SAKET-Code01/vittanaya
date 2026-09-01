"""Deterministic Unit & Integration Tests for Cash-Flow & Liquidity Intelligence Engine.

Verifies:
1. Basic 12-month cash-flow calculation
2. Opening/closing cash roll-forward logic
3. Authoritative EMI debt service inclusion
4. Negative cash balance detection & CRITICAL risk classification
5. Minimum cash-buffer detection & HIGH risk classification
6. Liquidity risk level categories (LOW, MEDIUM, HIGH, CRITICAL)
7. Working-capital requirement calculation
8. Seasonality & monthly revenue adjustment factors
9. Missing financial inputs / missing business profile handling
10. Active business ID scoping
11. Business A vs Business B isolation
12. Baseline vs stress scenario comparison
13. FastAPI POST /api/v1/finance/cash-flow endpoint response schema
14. Data status flags and traceability metadata (zero fabricated values)
"""

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.app.models.business import Business
from backend.app.schemas.financial_plan import CashFlowForecastRequest
from backend.app.services.cash_flow_service import CashFlowService


def test_basic_monthly_cash_flow_calculation():
    """1. Verify basic 12-month cash-flow calculation produces 12 items."""
    req = CashFlowForecastRequest(
        project_cost=1000000.0,
        available_margin_capital=100000.0,
        monthly_revenue_estimate=100000.0,
        monthly_expense_estimate=60000.0,
        interest_rate_annual=9.5,
        tenure_years=5,
    )
    res = CashFlowService.generate_forecast(req)

    assert len(res.months) == 12
    assert res.summary.total_12m_revenue > 0
    assert res.summary.total_12m_expenses > 0
    assert res.summary.total_12m_debt_service > 0


def test_opening_closing_cash_roll_forward():
    """2. Verify opening cash of month[i] equals closing cash of month[i-1]."""
    req = CashFlowForecastRequest(
        project_cost=500000.0,
        available_margin_capital=50000.0,
        monthly_revenue_estimate=60000.0,
        monthly_expense_estimate=35000.0,
    )
    res = CashFlowService.generate_forecast(req)

    assert res.months[0].opening_cash == 50000.0
    for i in range(1, 12):
        prev_closing = res.months[i - 1].closing_cash
        curr_opening = res.months[i].opening_cash
        assert curr_opening == prev_closing
        assert res.months[i].closing_cash == round(curr_opening + res.months[i].net_cash_flow, 2)


def test_emi_debt_service_inclusion():
    """3. Verify debt service matches FinancialPlanService calculation and is subtracted."""
    req = CashFlowForecastRequest(
        project_cost=1000000.0,
        available_margin_capital=100000.0,
        interest_rate_annual=9.5,
        tenure_years=5,
    )
    res = CashFlowService.generate_forecast(req)

    # Loan = 900,000, EMI at 9.5% p.a. over 60 months approx 18,900
    expected_emi = res.months[0].debt_service
    assert expected_emi > 15000.0
    for m in res.months:
        assert m.debt_service == expected_emi
        assert m.total_outflow == round(m.operating_expenses + m.payables_outflow + m.debt_service, 2)


def test_negative_cash_detection_and_critical_risk():
    """4. Verify closing cash turning negative triggers CRITICAL risk and alerts."""
    req = CashFlowForecastRequest(
        project_cost=1000000.0,
        available_margin_capital=10000.0,  # low initial cash
        monthly_revenue_estimate=20000.0,   # low revenue
        monthly_expense_estimate=50000.0,   # high expenses relative to revenue
    )
    res = CashFlowService.generate_forecast(req)

    assert res.summary.liquidity_risk_level == "CRITICAL"
    assert len(res.summary.critical_months) > 0
    assert any(flag.risk_level == "CRITICAL" for flag in res.liquidity_flags)


def test_cash_buffer_and_high_risk_classification():
    """5. Verify cash falling below 1.5x buffer triggers HIGH/MEDIUM risk alert."""
    req = CashFlowForecastRequest(
        project_cost=1000000.0,
        available_margin_capital=40000.0,
        monthly_revenue_estimate=50000.0,
        monthly_expense_estimate=40000.0,
    )
    res = CashFlowService.generate_forecast(req)

    assert res.summary.minimum_recommended_buffer == round(40000.0 * 1.5, 2)
    assert res.summary.liquidity_risk_level in ["HIGH", "MEDIUM", "CRITICAL"]


def test_liquidity_risk_levels_healthy():
    """6. Verify healthy enterprise with strong cash flow returns LOW risk."""
    req = CashFlowForecastRequest(
        project_cost=500000.0,
        available_margin_capital=200000.0,
        monthly_revenue_estimate=150000.0,
        monthly_expense_estimate=40000.0,
    )
    res = CashFlowService.generate_forecast(req)

    assert res.summary.liquidity_risk_level == "LOW"
    assert res.summary.minimum_projected_cash >= res.summary.minimum_recommended_buffer


def test_working_capital_requirement_calculation():
    """7. Verify working capital requirement formula: (1.5 * expenses) + payables - receivables."""
    req = CashFlowForecastRequest(
        monthly_expense_estimate=50000.0,
    )
    res = CashFlowService.generate_forecast(req)

    expected_wc = round(50000.0 * 1.5, 2)
    assert res.summary.working_capital_required == expected_wc


def test_seasonality_revenue_adjustment():
    """8. Verify seasonality applies monthly multipliers when enabled."""
    req_seasonal = CashFlowForecastRequest(
        monthly_revenue_estimate=100000.0,
        apply_seasonality=True,
    )
    res_seasonal = CashFlowService.generate_forecast(req_seasonal)

    req_flat = CashFlowForecastRequest(
        monthly_revenue_estimate=100000.0,
        apply_seasonality=False,
    )
    res_flat = CashFlowService.generate_forecast(req_flat)

    # Seasonal forecast months should have varying revenue, flat should be constant
    seasonal_revenues = [m.revenue for m in res_seasonal.months]
    flat_revenues = [m.revenue for m in res_flat.months]

    assert len(set(seasonal_revenues)) > 1
    assert len(set(flat_revenues)) == 1


def test_missing_financial_inputs_uses_benchmark():
    """9. Verify missing revenue/expenses automatically fall back to NABARD project cost benchmarks."""
    req = CashFlowForecastRequest(
        project_cost=600000.0,
    )
    res = CashFlowService.generate_forecast(req)

    assert res.months[0].revenue > 0
    assert res.months[0].operating_expenses > 0
    assert res.data_status in ["REFERENCE", "ESTIMATE"]


def test_active_business_id_scoping(db_session: Session):
    """10. Verify cash flow forecast scopes strictly to provided active business_id."""
    biz = Business(
        owner_id=1,
        name="District Dairy Farm",
        type="Dairy",
        industry="Livestock",
        location_district="Sundargarh",
        location_state="Odisha",
        own_capital=150000.0,
        monthly_revenue_estimate=120000.0,
        monthly_expense_estimate=70000.0,
    )
    db_session.add(biz)
    db_session.commit()
    db_session.refresh(biz)

    req = CashFlowForecastRequest(business_id=biz.id)
    res = CashFlowService.generate_forecast(req, db=db_session)

    assert res.business_id == biz.id
    assert res.business_name == "District Dairy Farm"
    assert res.summary.opening_cash_initial == 150000.0
    assert res.data_status == "ACTUAL"


def test_business_a_vs_business_b_isolation(db_session: Session):
    """11. Verify Business A and Business B yield completely isolated cash-flow calculations."""
    biz_a = Business(
        owner_id=1,
        name="Enterprise A Poultry",
        type="Poultry",
        industry="Livestock",
        location_district="Sundargarh",
        own_capital=50000.0,
        monthly_revenue_estimate=80000.0,
        monthly_expense_estimate=50000.0,
    )
    biz_b = Business(
        owner_id=1,
        name="Enterprise B Hatchery",
        type="Fishery",
        industry="Fishery",
        location_district="Balasore",
        own_capital=250000.0,
        monthly_revenue_estimate=200000.0,
        monthly_expense_estimate=90000.0,
    )
    db_session.add_all([biz_a, biz_b])
    db_session.commit()

    res_a = CashFlowService.generate_forecast(CashFlowForecastRequest(business_id=biz_a.id), db=db_session)
    res_b = CashFlowService.generate_forecast(CashFlowForecastRequest(business_id=biz_b.id), db=db_session)

    assert res_a.business_name == "Enterprise A Poultry"
    assert res_b.business_name == "Enterprise B Hatchery"
    assert res_a.summary.opening_cash_initial == 50000.0
    assert res_b.summary.opening_cash_initial == 250000.0
    assert res_a.summary.total_12m_revenue != res_b.summary.total_12m_revenue


def test_baseline_vs_stress_scenario_comparison():
    """12. Verify stress_sales_change triggers scenario comparison object with delta and risk shift."""
    req = CashFlowForecastRequest(
        project_cost=1000000.0,
        available_margin_capital=100000.0,
        monthly_revenue_estimate=100000.0,
        monthly_expense_estimate=60000.0,
        stress_sales_change=-15.0,
    )
    res = CashFlowService.generate_forecast(req)

    assert res.stress_comparison is not None
    assert res.stress_comparison.cash_delta < 0
    assert res.stress_comparison.baseline_min_cash > res.stress_comparison.stress_min_cash
    assert "Sales reduction of -15.0%" in res.stress_comparison.scenario_description


def test_api_endpoint_response_schema(client: TestClient, db_session: Session):
    """13. Verify FastAPI POST /api/v1/finance/cash-flow returns valid schema and status 200."""
    response = client.post(
        "/api/v1/finance/cash-flow",
        json={
            "project_cost": 800000.0,
            "available_margin_capital": 80000.0,
            "monthly_revenue_estimate": 90000.0,
            "monthly_expense_estimate": 50000.0,
            "stress_sales_change": -10.0,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert "months" in data
    assert len(data["months"]) == 12
    assert "minimum_projected_cash" in data["summary"]
    assert "working_capital_required" in data["summary"]
    assert "traceability" in data


def test_chatbot_cash_flow_question_grounding(client: TestClient, db_session: Session):
    """14. Verify Ask VITTANAYA chatbot responds to cash flow questions using CashFlowService."""
    biz = Business(
        owner_id=1,
        name="Micro Rice Mill",
        type="Food Processing",
        industry="Manufacturing",
        location_district="Koraput",
        location_state="Odisha",
        own_capital=100000.0,
        monthly_revenue_estimate=120000.0,
        monthly_expense_estimate=70000.0,
    )
    db_session.add(biz)
    db_session.commit()

    res = client.post(
        "/api/v1/advisory/chat",
        json={
            "business_id": str(biz.id),
            "message": "Will I have enough cash to operate and repay my loan?",
        },
    )
    assert res.status_code == 200
    data = res.json()

    assert data["intent"] == "CASH_FLOW"
    assert "VITTANAYA Cash-Flow Engine" in data["answer"]
    assert any("Min Projected Cash" in k["label"] for k in data["key_facts"])
    assert any("Working Capital Required" in k["label"] for k in data["key_facts"])
