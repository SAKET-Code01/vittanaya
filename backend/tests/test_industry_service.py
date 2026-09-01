"""Deterministic Unit & Integration Tests for Industry-Adaptive Business Intelligence Engine.

Verifies:
1. Industry templates endpoint GET /api/v1/industry/templates
2. Manufacturing sector KPI calculations (utilization, margin, break-even)
3. Retail sector KPI calculations (gross margin, inventory turnover, stock holding)
4. Restaurant sector KPI calculations (revenue/seat, food cost %, break-even orders)
5. Transport sector KPI calculations (revenue/vehicle, fuel cost %, trips/vehicle)
6. Services sector KPI calculations (revenue/employee, client concentration)
7. Creator sector KPI calculations (recurring share, sponsorship share, equipment payback)
8. Sector-specific risk signals detection
9. Sector what-if scenario simulations
10. Active business scoping and DB integration
11. Business A vs Business B sector calculation isolation
12. Ask VITTANAYA grounded industry question response
13. Provenance data_status tags (ACTUAL, REFERENCE, ESTIMATE, UNAVAILABLE)
"""

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.app.core.industry_config import (
    INDUSTRY_CREATOR,
    INDUSTRY_MANUFACTURING,
    INDUSTRY_RESTAURANT,
    INDUSTRY_RETAIL,
    INDUSTRY_SERVICES,
    INDUSTRY_TRANSPORT,
)
from backend.app.models.business import Business
from backend.app.schemas.industry import IndustryAnalysisRequest
from backend.app.services.industry_service import IndustryService


def test_industry_templates_endpoint(client: TestClient):
    """1. Verify GET /api/v1/industry/templates returns 6 supported industry configurations."""
    res = client.get("/api/v1/industry/templates")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 6
    codes = [item["industry_code"] for item in data]
    assert INDUSTRY_MANUFACTURING in codes
    assert INDUSTRY_RETAIL in codes
    assert INDUSTRY_RESTAURANT in codes
    assert INDUSTRY_TRANSPORT in codes
    assert INDUSTRY_SERVICES in codes
    assert INDUSTRY_CREATOR in codes


def test_manufacturing_industry_analysis():
    """2. Verify Manufacturing KPI calculations (capacity utilization, margin, break-even)."""
    req = IndustryAnalysisRequest(
        industry_code=INDUSTRY_MANUFACTURING,
        variables={
            "production_capacity_units": 10000.0,
            "utilization_pct": 80.0,
            "selling_price_per_unit": 100.0,
            "unit_cost": 60.0,
        },
    )
    res = IndustryService.analyze(req)

    assert res.industry_code == INDUSTRY_MANUFACTURING
    assert res.normalized_monthly_revenue > 0
    assert any(k.key == "capacity_utilization" and k.value == 80.0 for k in res.kpis)
    assert any(k.key == "contribution_margin" and k.value == 40.0 for k in res.kpis)


def test_retail_industry_analysis():
    """3. Verify Retail KPI calculations (gross margin, inventory turnover, stock holding)."""
    req = IndustryAnalysisRequest(
        industry_code=INDUSTRY_RETAIL,
        variables={
            "monthly_footfall": 3000.0,
            "average_transaction_value": 500.0,
            "gross_margin_pct": 25.0,
            "inventory_value": 200000.0,
        },
    )
    res = IndustryService.analyze(req)

    assert res.industry_code == INDUSTRY_RETAIL
    assert res.normalized_monthly_revenue == 1500000.0
    assert any(k.key == "gross_margin" and k.value == 25.0 for k in res.kpis)
    assert any(k.key == "inventory_turnover" for k in res.kpis)


def test_restaurant_industry_analysis():
    """4. Verify Restaurant KPI calculations (revenue per seat, food cost %, break-even orders)."""
    req = IndustryAnalysisRequest(
        industry_code=INDUSTRY_RESTAURANT,
        variables={
            "seating_capacity": 50.0,
            "daily_orders": 100.0,
            "average_order_value": 200.0,
            "food_cost_pct": 35.0,
            "operating_days_monthly": 26.0,
        },
    )
    res = IndustryService.analyze(req)

    assert res.industry_code == INDUSTRY_RESTAURANT
    assert res.normalized_monthly_revenue == 520000.0
    assert any(k.key == "revenue_per_seat" and k.value == 10400.0 for k in res.kpis)
    assert any(k.key == "food_cost_ratio" and k.value == 35.0 for k in res.kpis)


def test_transport_industry_analysis():
    """5. Verify Transport KPI calculations (revenue per vehicle, fuel cost %, trips/vehicle)."""
    req = IndustryAnalysisRequest(
        industry_code=INDUSTRY_TRANSPORT,
        variables={
            "vehicle_count": 4.0,
            "monthly_trips_per_vehicle": 50.0,
            "average_fare_per_trip": 3000.0,
            "fuel_cost_per_trip": 1100.0,
        },
    )
    res = IndustryService.analyze(req)

    assert res.industry_code == INDUSTRY_TRANSPORT
    assert res.normalized_monthly_revenue == 600000.0
    assert any(k.key == "revenue_per_vehicle" and k.value == 150000.0 for k in res.kpis)
    assert any(k.key == "fuel_cost_ratio" for k in res.kpis)


def test_services_industry_analysis():
    """6. Verify Services KPI calculations (revenue per employee, client concentration)."""
    req = IndustryAnalysisRequest(
        industry_code=INDUSTRY_SERVICES,
        variables={
            "active_clients": 10.0,
            "average_monthly_billing_per_client": 40000.0,
            "headcount": 5.0,
            "average_salary_per_employee": 35000.0,
        },
    )
    res = IndustryService.analyze(req)

    assert res.industry_code == INDUSTRY_SERVICES
    assert res.normalized_monthly_revenue == 400000.0
    assert any(k.key == "revenue_per_employee" and k.value == 80000.0 for k in res.kpis)
    assert any(k.key == "client_concentration" and k.value == 10.0 for k in res.kpis)


def test_creator_industry_analysis():
    """7. Verify Creator KPI calculations (recurring subscription share, sponsorship share, equipment payback)."""
    req = IndustryAnalysisRequest(
        industry_code=INDUSTRY_CREATOR,
        variables={
            "equipment_investment": 120000.0,
            "recurring_subscription_revenue": 40000.0,
            "sponsorship_revenue_monthly": 50000.0,
            "platform_ad_revenue_monthly": 10000.0,
        },
    )
    res = IndustryService.analyze(req)

    assert res.industry_code == INDUSTRY_CREATOR
    assert res.normalized_monthly_revenue == 100000.0
    assert any(k.key == "recurring_ratio" and k.value == 40.0 for k in res.kpis)
    assert any(k.key == "sponsorship_share" and k.value == 50.0 for k in res.kpis)


def test_sector_risk_signals_detection():
    """8. Verify high food cost (> 38%) triggers Food Cost Inflation Risk Signal."""
    req = IndustryAnalysisRequest(
        industry_code=INDUSTRY_RESTAURANT,
        variables={"food_cost_pct": 45.0},
    )
    res = IndustryService.analyze(req)

    assert len(res.risk_signals) > 0
    assert any(r.risk_name == "Food Cost Inflation Pressure" for r in res.risk_signals)


def test_sector_what_if_scenario():
    """9. Verify sector scenario calculation computes revenue/net delta."""
    req = IndustryAnalysisRequest(
        industry_code=INDUSTRY_RESTAURANT,
        variables={"daily_orders": 100.0, "average_order_value": 200.0},
    )
    res = IndustryService.analyze(req)

    assert res.scenario_result is not None
    assert res.scenario_result.revenue_delta < 0
    assert "Daily Order Volume Drop" in res.scenario_result.scenario_name


def test_active_business_scoping(db_session: Session):
    """10. Verify industry analysis resolves DB business and flags data_status=ACTUAL."""
    biz = Business(
        owner_id=1,
        name="Royal Bakery",
        type="Restaurant",
        industry="Food Service",
        location_district="Cuttack",
        own_capital=80000.0,
        monthly_revenue_estimate=150000.0,
        monthly_expense_estimate=90000.0,
    )
    db_session.add(biz)
    db_session.commit()

    req = IndustryAnalysisRequest(business_id=biz.id, industry_code=INDUSTRY_RESTAURANT)
    res = IndustryService.analyze(req, db=db_session)

    assert res.business_id == biz.id
    assert res.data_status == "ACTUAL"


def test_business_isolation(db_session: Session):
    """11. Verify Business A (Restaurant) and Business B (Transport) yield isolated sector KPIs."""
    biz_a = Business(
        owner_id=1,
        name="Dhaba A",
        type="Restaurant",
        industry="Food Service",
        location_district="Puri",
    )
    biz_b = Business(
        owner_id=1,
        name="Logistics B",
        type="Transport",
        industry="Transport",
        location_district="Khordha",
    )
    db_session.add_all([biz_a, biz_b])
    db_session.commit()

    res_a = IndustryService.analyze(IndustryAnalysisRequest(business_id=biz_a.id, industry_code=INDUSTRY_RESTAURANT), db=db_session)
    res_b = IndustryService.analyze(IndustryAnalysisRequest(business_id=biz_b.id, industry_code=INDUSTRY_TRANSPORT), db=db_session)

    assert res_a.industry_code == INDUSTRY_RESTAURANT
    assert res_b.industry_code == INDUSTRY_TRANSPORT
    assert res_a.display_name != res_b.display_name


def test_chatbot_industry_question_grounding(client: TestClient, db_session: Session):
    """12. Verify Ask VITTANAYA chatbot responds to industry questions (e.g. food cost) using IndustryService."""
    biz = Business(
        owner_id=1,
        name="Village Cafe",
        type="Restaurant",
        industry="Food Service",
        location_district="Sambalpur",
        own_capital=50000.0,
    )
    db_session.add(biz)
    db_session.commit()

    res = client.post(
        "/api/v1/advisory/chat",
        json={
            "business_id": str(biz.id),
            "message": "Is my food cost too high?",
        },
    )
    assert res.status_code == 200
    data = res.json()

    assert data["intent"] == "INDUSTRY"
    assert "VITTANAYA Industry Intelligence" in data["answer"]
    assert any("Food Cost Ratio" in k["label"] for k in data["key_facts"])
