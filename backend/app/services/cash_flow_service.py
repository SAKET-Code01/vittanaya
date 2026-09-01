"""Authoritative Cash-Flow & Liquidity Intelligence Service for VITTANAYA (SIH26091).

Computes deterministic 12-month cash-flow roll-forward, monthly revenue/expense forecasts,
loan debt service (EMI) integration, working-capital requirements, minimum recommended cash buffer,
and liquidity risk classification with zero hallucination.
"""

from datetime import datetime
from typing import List, Optional, Tuple

from sqlalchemy.orm import Session

from backend.app.engines.cost_engine import ProjectCostEngine
from backend.app.models.payable import Payable
from backend.app.models.receivable import Receivable
from backend.app.repositories.business_repository import BusinessRepository
from backend.app.schemas.financial_plan import (
    CashFlowForecastRequest,
    CashFlowForecastResponse,
    CashFlowSummary,
    FundingStructureRequest,
    LiquidityRiskFlag,
    MonthlyCashFlowItem,
    ScenarioComparison,
)
from backend.app.schemas.insights import TraceabilityMetadata
from backend.app.services.financial_plan_service import FinancialPlanService

# Explicit Constants for Liquidity Risk & Buffer Rules
MINIMUM_BUFFER_MONTHS_COVERAGE = 1.5  # Recommended operating cash coverage (45 days)
SEASONALITY_MODIFIERS = {
    1: 1.05,   # Jan (Harvest peak)
    2: 1.02,   # Feb
    3: 1.00,   # Mar
    4: 0.95,   # Apr (Pre-monsoon dip)
    5: 0.90,   # May (Summer slowdown)
    6: 0.85,   # Jun (Monsoon onset)
    7: 0.90,   # Jul
    8: 0.95,   # Aug
    9: 1.05,   # Sep (Post-monsoon recovery)
    10: 1.15,  # Oct (Festival demand surge)
    11: 1.10,  # Nov (Diwali / Wedding peak)
    12: 1.08,  # Dec (Year-end market demand)
}


class CashFlowService:
    """Deterministic Cash-Flow & Liquidity Intelligence Engine."""

    @staticmethod
    def generate_forecast(
        payload: CashFlowForecastRequest,
        db: Optional[Session] = None,
    ) -> CashFlowForecastResponse:
        """Generate authoritative 12-month deterministic cash-flow forecast and liquidity risk assessment."""
        # 1. Resolve Active Business Context & Baseline Financial Data
        biz_id = payload.business_id
        biz_name = "Micro-Enterprise"
        bus_category = "General"
        location = "Odisha"
        opening_cash_initial = max(0.0, float(payload.available_margin_capital or 0.0))
        monthly_rev = max(0.0, float(payload.monthly_revenue_estimate or 0.0))
        monthly_exp = max(0.0, float(payload.monthly_expense_estimate or 0.0))
        data_status = "ESTIMATE"

        if biz_id and db:
            try:
                repo = BusinessRepository(db)
                biz = repo.get_by_id(int(biz_id))
                if biz:
                    biz_name = biz.name
                    bus_category = biz.type or biz.industry or "General"
                    dist = biz.location_district or "Odisha"
                    st = biz.location_state or "Odisha"
                    location = f"{dist}, {st}" if dist != st else dist
                    if opening_cash_initial == 0.0:
                        opening_cash_initial = float(biz.own_capital or 0.0)
                    if monthly_rev == 0.0:
                        monthly_rev = float(biz.monthly_revenue_estimate or 0.0)
                    if monthly_exp == 0.0:
                        monthly_exp = float(biz.monthly_expense_estimate or 0.0)
                    data_status = "ACTUAL" if (biz.monthly_revenue_estimate or biz.monthly_expense_estimate) else "ESTIMATE"
            except (ValueError, TypeError):
                pass

        # 2. Benchmark Lookup if revenue/expense missing
        proj_cost = float(payload.project_cost or 0.0)
        if proj_cost == 0.0 and db:
            try:
                cost_res = ProjectCostEngine(db).get_indicative_cost(
                    business_activity=biz_name,
                    business_category=bus_category,
                    location=location,
                )
                proj_cost = float(cost_res.indicative_project_cost)
            except Exception:
                proj_cost = 500000.0
        elif proj_cost == 0.0:
            proj_cost = 500000.0

        if monthly_rev == 0.0:
            monthly_rev = round((proj_cost * 1.20) / 12.0, 2)
            if data_status != "ACTUAL":
                data_status = "REFERENCE"
        if monthly_exp == 0.0:
            monthly_exp = round((proj_cost * 0.75) / 12.0, 2)
            if data_status != "ACTUAL":
                data_status = "REFERENCE"

        # 3. Calculate Authoritative Loan Debt Service (EMI) from FinancialPlanService
        margin_pct = (opening_cash_initial / proj_cost * 100.0) if proj_cost > 0 else 10.0
        margin_pct = max(5.0, min(100.0, margin_pct))
        funding_req = FundingStructureRequest(
            project_cost=proj_cost,
            margin_pct=margin_pct,
            interest_rate_annual=payload.interest_rate_annual,
            tenure_years=payload.tenure_years,
        )
        funding_res = FinancialPlanService.calculate_funding_structure(funding_req)
        monthly_emi = float(funding_res.monthly_emi)

        # 4. Fetch DB Receivables & Payables Totals if DB Session Available
        receivables_by_month, payables_by_month, receivables_total, payables_total = (
            CashFlowService._get_db_obligations(biz_id, db)
        )

        # 5. Build 12-Month Forecast Roll-Forward Loop
        start_year = datetime.now().year
        start_month = datetime.now().month

        months_data, flags, min_cash, critical_months_list = CashFlowService._build_12m_roll_forward(
            start_year=start_year,
            start_month=start_month,
            opening_cash_initial=opening_cash_initial,
            monthly_rev=monthly_rev,
            monthly_exp=monthly_exp,
            monthly_emi=monthly_emi,
            stress_sales_change=payload.stress_sales_change,
            apply_seasonality=payload.apply_seasonality,
            receivables_by_month=receivables_by_month,
            payables_by_month=payables_by_month,
            data_status=data_status,
        )

        # 6. Calculate Working Capital & Cash Buffer Requirements
        min_recommended_buffer = round(monthly_exp * MINIMUM_BUFFER_MONTHS_COVERAGE, 2)
        months_coverage = round(min_cash / monthly_exp, 1) if monthly_exp > 0 else 12.0

        # Working Capital Required = (1.5 months operating expenses + payables - receivables)
        working_capital_req = round(
            max(0.0, (monthly_exp * MINIMUM_BUFFER_MONTHS_COVERAGE) + payables_total - receivables_total), 2
        )

        # Determine Overall Liquidity Risk Level
        if any(m.closing_cash < 0 for m in months_data):
            overall_risk = "CRITICAL"
        elif min_cash < min_recommended_buffer and (months_coverage < 1.0 or min_cash < monthly_emi):
            overall_risk = "HIGH"
        elif min_cash < min_recommended_buffer:
            overall_risk = "MEDIUM"
        else:
            overall_risk = "LOW"

        # 7. Stress Scenario Comparison if Stress Requested
        stress_comparison: Optional[ScenarioComparison] = None
        if payload.stress_sales_change != 0.0:
            baseline_months, _, base_min_cash, _ = CashFlowService._build_12m_roll_forward(
                start_year=start_year,
                start_month=start_month,
                opening_cash_initial=opening_cash_initial,
                monthly_rev=monthly_rev,
                monthly_exp=monthly_exp,
                monthly_emi=monthly_emi,
                stress_sales_change=0.0,
                apply_seasonality=payload.apply_seasonality,
                receivables_by_month=receivables_by_month,
                payables_by_month=payables_by_month,
                data_status=data_status,
            )
            base_risk = "CRITICAL" if any(m.closing_cash < 0 for m in baseline_months) else ("MEDIUM" if base_min_cash < min_recommended_buffer else "LOW")
            stress_comparison = ScenarioComparison(
                baseline_min_cash=base_min_cash,
                stress_min_cash=min_cash,
                cash_delta=round(min_cash - base_min_cash, 2),
                baseline_risk=base_risk,
                stress_risk=overall_risk,
                scenario_description=f"Sales reduction of {payload.stress_sales_change:+.1f}% under revenue shock scenario.",
            )

        total_rev = round(sum(m.revenue for m in months_data), 2)
        total_exp = round(sum(m.operating_expenses for m in months_data), 2)
        total_emi = round(sum(m.debt_service for m in months_data), 2)

        summary = CashFlowSummary(
            opening_cash_initial=opening_cash_initial,
            total_12m_revenue=total_rev,
            total_12m_expenses=total_exp,
            total_12m_debt_service=total_emi,
            minimum_projected_cash=min_cash,
            minimum_recommended_buffer=min_recommended_buffer,
            working_capital_required=working_capital_req,
            months_of_coverage=months_coverage,
            liquidity_risk_level=overall_risk,
            critical_months=critical_months_list,
        )

        traceability = TraceabilityMetadata(
            input={
                "business_id": biz_id,
                "project_cost": proj_cost,
                "opening_cash_initial": opening_cash_initial,
                "monthly_revenue_estimate": monthly_rev,
                "monthly_expense_estimate": monthly_exp,
                "interest_rate_annual": payload.interest_rate_annual,
                "tenure_years": payload.tenure_years,
                "stress_sales_change": payload.stress_sales_change,
            },
            calculation_rule=(
                "Deterministic 12-month cash-flow roll-forward: closing_cash = opening_cash + (revenue + receivables) "
                "- (expenses + payables + EMI). Buffer target = 1.5x monthly expenses."
            ),
            source_authority="VITTANAYA Cash-Flow & Liquidity Intelligence Engine",
            source_year="2026",
            provenance_priority="DETERMINISTIC_GROUNDED",
            official_source_url=None,
        )

        return CashFlowForecastResponse(
            business_id=biz_id,
            business_name=biz_name,
            location=location,
            summary=summary,
            months=months_data,
            liquidity_flags=flags,
            stress_comparison=stress_comparison,
            data_status=data_status,
            traceability=traceability,
        )

    @staticmethod
    def _get_db_obligations(
        biz_id: Optional[int], db: Optional[Session]
    ) -> Tuple[dict[str, float], dict[str, float], float, float]:
        """Fetch pending receivables and payables grouped by YYYY-MM month string."""
        rec_by_month: dict[str, float] = {}
        pay_by_month: dict[str, float] = {}
        rec_total = 0.0
        pay_total = 0.0

        if not biz_id or not db:
            return rec_by_month, pay_by_month, rec_total, pay_total

        try:
            receivables = db.query(Receivable).filter(
                Receivable.business_id == biz_id, Receivable.status == "pending"
            ).all()
            for r in receivables:
                amt = float(r.amount) * float(r.reliability_score or 1.0)
                m_str = r.due_date.strftime("%Y-%m") if r.due_date else ""
                if m_str:
                    rec_by_month[m_str] = rec_by_month.get(m_str, 0.0) + amt
                rec_total += amt

            payables = db.query(Payable).filter(
                Payable.business_id == biz_id, Payable.status == "unpaid"
            ).all()
            for p in payables:
                amt = float(p.amount)
                m_str = p.due_date.strftime("%Y-%m") if p.due_date else ""
                if m_str:
                    pay_by_month[m_str] = pay_by_month.get(m_str, 0.0) + amt
                pay_total += amt
        except Exception:
            pass

        return rec_by_month, pay_by_month, rec_total, pay_total

    @staticmethod
    def _build_12m_roll_forward(
        start_year: int,
        start_month: int,
        opening_cash_initial: float,
        monthly_rev: float,
        monthly_exp: float,
        monthly_emi: float,
        stress_sales_change: float,
        apply_seasonality: bool,
        receivables_by_month: dict[str, float],
        payables_by_month: dict[str, float],
        data_status: str,
    ) -> Tuple[List[MonthlyCashFlowItem], List[LiquidityRiskFlag], float, List[str]]:
        """Compute monthly roll-forward loop for 12 months."""
        months_data: List[MonthlyCashFlowItem] = []
        flags: List[LiquidityRiskFlag] = []
        critical_months: List[str] = []
        current_opening = opening_cash_initial
        min_cash = float("inf")
        min_buffer = round(monthly_exp * MINIMUM_BUFFER_MONTHS_COVERAGE, 2)

        for i in range(12):
            m_idx = ((start_month - 1 + i) % 12) + 1
            yr = start_year + ((start_month - 1 + i) // 12)
            m_label = f"{yr:04d}-{m_idx:02d}"

            # Apply seasonality modifier & stress sales change
            season_mod = SEASONALITY_MODIFIERS.get(m_idx, 1.0) if apply_seasonality else 1.0
            sales_multiplier = max(0.0, (1.0 + (stress_sales_change / 100.0)) * season_mod)

            rev = round(monthly_rev * sales_multiplier, 2)
            rec_in = round(receivables_by_month.get(m_label, 0.0), 2)
            tot_in = round(rev + rec_in, 2)

            exp = round(monthly_exp, 2)
            pay_out = round(payables_by_month.get(m_label, 0.0), 2)
            emi = round(monthly_emi, 2)
            tot_out = round(exp + pay_out + emi, 2)

            net_cf = round(tot_in - tot_out, 2)
            closing = round(current_opening + net_cf, 2)
            min_cash = min(min_cash, closing)

            # Monthly Risk Level Classification
            if closing < 0:
                m_risk = "CRITICAL"
                critical_months.append(m_label)
                flags.append(
                    LiquidityRiskFlag(
                        affected_month=m_label,
                        risk_level="CRITICAL",
                        reason=f"Closing cash balance turns negative (₹{closing:,.0f}) in {m_label}.",
                        recommended_action="Inject emergency margin capital or defer non-essential vendor payables.",
                    )
                )
            elif closing < min_buffer:
                m_risk = "HIGH" if (emi > 0 and closing < emi) else "MEDIUM"
                critical_months.append(m_label)
                flags.append(
                    LiquidityRiskFlag(
                        affected_month=m_label,
                        risk_level=m_risk,
                        reason=f"Closing cash (₹{closing:,.0f}) drops below 1.5-month buffer target (₹{min_buffer:,.0f}).",
                        recommended_action="Accelerate receivable collections and maintain tight inventory control.",
                    )
                )
            else:
                m_risk = "LOW"

            months_data.append(
                MonthlyCashFlowItem(
                    month=m_label,
                    month_index=i + 1,
                    opening_cash=round(current_opening, 2),
                    revenue=rev,
                    receivables_inflow=rec_in,
                    total_inflow=tot_in,
                    operating_expenses=exp,
                    payables_outflow=pay_out,
                    debt_service=emi,
                    total_outflow=tot_out,
                    net_cash_flow=net_cf,
                    closing_cash=closing,
                    risk_level=m_risk,
                    data_status=data_status,
                )
            )

            current_opening = closing

        if min_cash == float("inf"):
            min_cash = 0.0

        return months_data, flags, round(min_cash, 2), critical_months
