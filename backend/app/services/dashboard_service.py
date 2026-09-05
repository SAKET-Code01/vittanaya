"""Dashboard aggregation service computing financial metrics from engines."""

from decimal import Decimal
from typing import Optional

from sqlalchemy.orm import Session

from backend.app.engines.cashflow_engine import CashflowEngine
from backend.app.engines.financial_structure_engine import FinancialStructureEngine
from backend.app.engines.liquidity_engine import LiquidityEngine
from backend.app.repositories.business_repository import BusinessRepository
from backend.app.repositories.payable_repository import PayableRepository
from backend.app.repositories.receivable_repository import ReceivableRepository
from backend.app.repositories.transaction_repository import TransactionRepository
from backend.app.schemas.dashboard import DashboardSummaryResponse
from backend.app.services.readiness_service import ReadinessService


class DashboardService:
    """Aggregates recorded financial data and computes authoritative metrics via backend engines."""

    def __init__(self, db: Session):
        self.db = db
        self.biz_repo = BusinessRepository(db)
        self.tx_repo = TransactionRepository(db)
        self.rec_repo = ReceivableRepository(db)
        self.pay_repo = PayableRepository(db)

    def get_summary(self, business_id: int) -> Optional[DashboardSummaryResponse]:
        business = self.biz_repo.get_by_id(business_id)
        if not business:
            return None

        # Fetch records
        transactions = self.tx_repo.list_by_business(business_id)
        receivables = self.rec_repo.list_by_business(business_id)
        payables = self.pay_repo.list_by_business(business_id)

        # 1. Cashflow engine calculation
        cf_summary = CashflowEngine.calculate_summary(transactions)
        total_inflow = cf_summary["total_inflow"]
        total_outflow = cf_summary["total_outflow"]
        net_cashflow = cf_summary["net_cashflow"]

        # 2. Derive current cash balance from own capital baseline + net cashflow
        initial_capital = Decimal(str(business.own_capital or "0.00"))
        cash_balance = initial_capital + net_cashflow

        # 3. Sum pending receivables and payables
        pending_rec_total = sum(
            (Decimal(str(r.amount)) for r in receivables if r.status == "pending"),
            Decimal("0.00"),
        )
        pending_pay_total = sum(
            (Decimal(str(p.amount)) for p in payables if p.status == "unpaid"),
            Decimal("0.00"),
        )

        # 4. Liquidity engine calculation (using monthly baseline outflow or actual outflow)
        monthly_burn = Decimal(str(business.monthly_expense_estimate or "0.00"))
        if monthly_burn <= Decimal("0.00") and total_outflow > Decimal("0.00"):
            monthly_burn = total_outflow

        liq_metrics = LiquidityEngine.calculate_runway(cash_balance, monthly_burn)
        runway_days = int(liq_metrics["runway_days"])  # type: ignore
        risk_level = str(liq_metrics["risk_level"])

        # 5. Financial structure funding gap calculation
        gap_metrics = FinancialStructureEngine.calculate_funding_gap(
            current_cash=cash_balance,
            pending_receivables=pending_rec_total,
            pending_payables=pending_pay_total,
        )

        # 6. Authoritative Monthly Revenue & Operating Expenses
        monthly_rev = Decimal(str(business.monthly_revenue_estimate or "0.00"))
        if total_inflow > Decimal("0.00"):
            monthly_rev = max(monthly_rev, total_inflow)

        monthly_exp = Decimal(str(business.monthly_expense_estimate or "0.00"))
        if total_outflow > Decimal("0.00"):
            monthly_exp = max(monthly_exp, total_outflow)

        operating_profit = max(Decimal("0.00"), monthly_rev - monthly_exp)
        ebitda_margin = (
            float(round((operating_profit / monthly_rev) * 100, 1))
            if monthly_rev > Decimal("0.00")
            else 0.0
        )

        # 7. Working Capital and Coverage Ratio
        working_cap = (cash_balance + pending_rec_total) - pending_pay_total
        if pending_pay_total > Decimal("0.00"):
            working_cap_ratio = float(
                round((cash_balance + pending_rec_total) / pending_pay_total, 2)
            )
        elif monthly_exp > Decimal("0.00"):
            working_cap_ratio = float(
                round((cash_balance + pending_rec_total) / (monthly_exp / Decimal("3.0")), 2)
            )
        else:
            working_cap_ratio = 1.5

        runway_months = round(runway_days / 30.0, 1)

        # 8. Deterministic Business Health Index (0 - 100)
        if runway_days >= 90:
            r_pts = 30
        elif runway_days >= 60:
            r_pts = 25
        elif runway_days >= 45:
            r_pts = 20
        elif runway_days >= 30:
            r_pts = 15
        elif runway_days >= 15:
            r_pts = 10
        else:
            r_pts = 0

        if ebitda_margin >= 25.0:
            m_pts = 25
        elif ebitda_margin >= 15.0:
            m_pts = 20
        elif ebitda_margin >= 5.0:
            m_pts = 15
        elif ebitda_margin > 0.0:
            m_pts = 10
        else:
            m_pts = 0

        if working_cap_ratio >= 1.5:
            wc_pts = 25
        elif working_cap_ratio >= 1.2:
            wc_pts = 20
        elif working_cap_ratio >= 1.0:
            wc_pts = 15
        elif working_cap_ratio >= 0.8:
            wc_pts = 10
        else:
            wc_pts = 5

        funding_gap_val = gap_metrics["funding_gap"]
        if funding_gap_val <= Decimal("0.00"):
            gap_pts = 20
        else:
            gap_ratio = float(funding_gap_val / max(cash_balance, Decimal("1.00")))
            gap_pts = max(0, 20 - int(gap_ratio * 20))

        health_score = max(0, min(100, int(r_pts + m_pts + wc_pts + gap_pts)))
        if health_score >= 75:
            health_status = "HEALTHY & OPTIMIZED"
        elif health_score >= 55:
            health_status = "STABLE & GROWING"
        elif health_score >= 40:
            health_status = "MONITOR / VULNERABLE"
        else:
            health_status = "CRITICAL CASH STRESS"

        # 9. Dynamic Readiness Integration
        readiness_service = ReadinessService(self.db)
        readiness_res = readiness_service.evaluate_readiness(business_id)
        if readiness_res:
            r_score = readiness_res.readiness_score
            r_label = readiness_res.readiness_label
            r_status = readiness_res.status_label
            completed_reqs = readiness_res.completed_requirements
            total_reqs = readiness_res.total_requirements
            crit_reqs = readiness_res.pending_critical_requirements
        else:
            r_score = 0.0
            r_label = "0% Prepared"
            r_status = "Early Stage"
            completed_reqs = 0
            total_reqs = 0
            crit_reqs = []

        # 10. Traceable Rule-Based Operational Priorities (Phase 11)
        priorities = []

        # Priority A: Receivables / Cash buffer check
        if pending_rec_total > Decimal("0.00") or runway_days < 45:
            urgency = "URGENT" if runway_days < 30 else "ACTION_REQUIRED"
            priorities.append({
                "step_num": f"0{len(priorities)+1}",
                "priority_label": f"Priority {len(priorities)+1} • Cash & Receivables",
                "urgency": urgency,
                "title": "Accelerate Customer Collections & Invoicing",
                "description": (
                    f"Outstanding customer dues stand at ₹{pending_rec_total:,.0f} with a {runway_days}-day cash runway. "
                    "Expedite collections to preserve liquid working capital buffer."
                    if pending_rec_total > Decimal("0.00")
                    else f"Cash runway is constrained at {runway_days} days. Tighten expenditure commitments."
                ),
                "cta_label": "Manage Receivables →",
                "route": "financial-plan",
                "trigger_reason": f"Runway {runway_days}d < 45d or pending receivables ₹{pending_rec_total:,.0f} > 0",
            })

        # Priority B: Working Capital / Scheme Gap
        if funding_gap_val > Decimal("0.00") or working_cap_ratio < 1.3:
            urgency = "URGENT" if working_cap_ratio < 1.0 else "RECOMMENDED"
            priorities.append({
                "step_num": f"0{len(priorities)+1}",
                "priority_label": f"Priority {len(priorities)+1} • Working Capital Credit",
                "urgency": urgency,
                "title": "Institutional Working Capital Credit Facility",
                "description": (
                    f"Working capital coverage is {working_cap_ratio:.2f}x with an identified funding gap of ₹{funding_gap_val:,.0f}. "
                    "Explore collateral-free credit under CGTMSE or Mudra schemes."
                ),
                "cta_label": "Explore Credit Schemes →",
                "route": "scheme",
                "trigger_reason": f"Working capital ratio {working_cap_ratio:.2f}x < 1.3x or funding gap ₹{funding_gap_val:,.0f} > 0",
            })

        # Priority C: Statutory & Compliance / Critical Road Map
        if crit_reqs or r_score < 75.0:
            crit_count = len(crit_reqs)
            priorities.append({
                "step_num": f"0{len(priorities)+1}",
                "priority_label": f"Priority {len(priorities)+1} • Statutory Compliance",
                "urgency": "ACTION_REQUIRED" if crit_count > 0 else "RECOMMENDED",
                "title": "Clear Statutory & Operational Road Map Gates",
                "description": (
                    f"{crit_count} critical statutory gate(s) pending verification. Overall business readiness is {r_label}."
                    if crit_count > 0
                    else f"Execution readiness is at {r_score:.0f}%. Complete remaining roadmap milestones to ensure full banking compliance."
                ),
                "cta_label": "Action Plan Roadmap →",
                "route": "action-plan",
                "trigger_reason": f"Pending critical gates: {crit_count}, readiness score: {r_score:.0f}%",
            })

        # Fallback if fewer than 3 priorities (for highly optimized healthy businesses)
        while len(priorities) < 3:
            priorities.append({
                "step_num": f"0{len(priorities)+1}",
                "priority_label": f"Priority {len(priorities)+1} • Operational Scaling",
                "urgency": "STABLE",
                "title": "Workforce & Production Capacity Optimization",
                "description": f"Operating margin is healthy at {ebitda_margin}%. Maintain operational cadence and review monthly employee payroll commitments.",
                "cta_label": "Review Operations →",
                "route": "action-plan",
                "trigger_reason": f"Operating margin {ebitda_margin}% is stable; no critical liquidity threats detected",
            })

        return DashboardSummaryResponse(
            business_id=business.id,
            business_name=business.name,
            cash_balance=cash_balance,
            total_inflow=total_inflow,
            total_outflow=total_outflow,
            net_cashflow=net_cashflow,
            runway_days=runway_days,
            liquidity_risk_level=risk_level,
            pending_receivables_total=pending_rec_total,
            pending_payables_total=pending_pay_total,
            funding_gap=funding_gap_val,
            readiness_score=r_score,
            readiness_label=r_label,
            readiness_status=r_status,
            completed_requirements=completed_reqs,
            total_requirements=total_reqs,
            pending_critical_requirements=crit_reqs,
            total_employees=business.total_employees,
            full_time_employees=business.full_time_employees or 0,
            contractual_employees=business.contractual_employees or 0,
            payroll_amount=business.payroll_amount or Decimal("0.00"),
            payroll_due_date=business.payroll_due_date,
            health_score=health_score,
            health_status=health_status,
            monthly_revenue=monthly_rev,
            monthly_expenses=monthly_exp,
            operating_profit=operating_profit,
            ebitda_margin=ebitda_margin,
            working_capital=working_cap,
            working_capital_ratio=working_cap_ratio,
            runway_months=runway_months,
            growth_readiness=r_score,
            operational_readiness=r_score,
            operational_priorities=priorities[:3],
            data_provenance={
                "source_type": "CALCULATED",
                "source_name": "Authoritative Deterministic Financial & Liquidity Engines",
                "confidence": "HIGH",
                "explanation": (
                    f"Health Index ({health_score}/100) calculated from cash runway ({runway_days}d), "
                    f"operating margin ({ebitda_margin}%), and working capital ratio ({working_cap_ratio}x)."
                ),
            },
        )
