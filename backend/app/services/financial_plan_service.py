"""Authoritative Financial Plan & Loan Amortization Service for VITTANAYA (SIH26091).

Implements reducing-balance loan amortization, zero-interest handling, bounds validation,
and yearly/monthly repayment schedule generation with guaranteed zero ending balance.
"""

from typing import List, Optional, Tuple

from sqlalchemy.orm import Session

from backend.app.engines.cost_engine import ProjectCostEngine
from backend.app.schemas.financial_plan import (
    FundingStructureRequest,
    FundingStructureResponse,
    ScheduleRow,
)
from backend.app.schemas.insights import TraceabilityMetadata


class FinancialPlanService:
    """Authoritative Financial Structuring & Amortization Engine."""

    @staticmethod
    def calculate_funding_structure(
        payload: FundingStructureRequest,
        db: Optional[Session] = None,
    ) -> FundingStructureResponse:
        """Calculate loan amount, EMI, totals, and complete reducing-balance amortization schedules."""
        # 1. Authoritative Project Cost Resolution with Provenance Hierarchy
        resolved_cost = None
        if db:
            cost_engine = ProjectCostEngine(db)
            resolved_cost = cost_engine.resolve_project_cost(
                business_id=payload.business_id,
                explicit_project_cost=payload.project_cost,
                explicit_own_capital=payload.own_capital,
                business_activity=payload.specific_business,
                business_category=payload.business_category,
                location=payload.location or "Odisha",
                source_type=payload.source_type,
            )

        if resolved_cost is not None:
            project_cost = resolved_cost.project_cost
            source_type = resolved_cost.source_type
            source_name = resolved_cost.source_name
            project_cost_label = resolved_cost.label
            benchmark_cost = resolved_cost.benchmark_cost
            max_supportable_project_size = resolved_cost.max_supportable_project_size
            own_capital_val = resolved_cost.own_capital
        else:
            # Fallback when DB session is not passed (e.g. standalone math/unit tests)
            project_cost = max(0.0, float(payload.project_cost or 0.0))
            if payload.source_type == "BENCHMARK_ESTIMATE" or (payload.project_cost is None and payload.business_id is None):
                source_type = "BENCHMARK_ESTIMATE"
                source_name = "NABARD benchmark"
                project_cost_label = "Estimated Project Cost"
            elif payload.source_type == "CALCULATED":
                source_type = "CALCULATED"
                source_name = "Financial Engine"
                project_cost_label = "Calculated Project Cost"
            else:
                source_type = "USER_PROVIDED"
                source_name = "User Input"
                project_cost_label = "Planned Project Cost"

            benchmark_cost = project_cost
            own_capital_val = float(payload.own_capital) if payload.own_capital is not None else 0.0
            max_supportable_project_size = (
                min(5000000.0, round(own_capital_val / 0.10, 2)) if own_capital_val > 0 else 0.0
            )

        # 2. Margin & Loan Amount Calculation
        margin_pct = max(0.0, min(100.0, float(payload.margin_pct)))
        required_margin_capital = round((project_cost * margin_pct) / 100.0, 2)

        if payload.own_capital is not None:
            own_margin_capital = min(project_cost, max(0.0, float(payload.own_capital)))
            margin_pct = round((own_margin_capital / project_cost * 100.0), 2) if project_cost > 0 else margin_pct
        elif own_capital_val > 0:
            own_margin_capital = min(project_cost, own_capital_val)
            margin_pct = round((own_margin_capital / project_cost * 100.0), 2) if project_cost > 0 else margin_pct
        else:
            own_margin_capital = round((project_cost * margin_pct) / 100.0, 2)
            own_margin_capital = min(project_cost, own_margin_capital)

        margin_shortfall = max(0.0, round(required_margin_capital - own_margin_capital, 2))
        loan_amount = max(0.0, round(project_cost - own_margin_capital, 2))

        interest_rate_annual = max(0.0, float(payload.interest_rate_annual))
        tenure_years = max(1, int(payload.tenure_years))
        n_months = tenure_years * 12

        monthly_rate = interest_rate_annual / 12.0 / 100.0

        # 3. Calculate Monthly EMI
        monthly_emi = FinancialPlanService.calculate_emi(loan_amount, monthly_rate, n_months)

        # 4. Generate Monthly & Yearly Amortization Schedules
        monthly_schedule, yearly_schedule, total_payment, total_interest = (
            FinancialPlanService.generate_schedules(
                loan_amount=loan_amount,
                monthly_rate=monthly_rate,
                monthly_emi=monthly_emi,
                n_months=n_months,
                tenure_years=tenure_years,
            )
        )

        traceability = TraceabilityMetadata(
            input={
                "project_cost": project_cost,
                "margin_pct": margin_pct,
                "interest_rate_annual": interest_rate_annual,
                "tenure_years": tenure_years,
                "source_type": source_type,
                "source_name": source_name,
            },
            calculation_rule=(
                f"Reducing balance amortization: loan = max(0, {project_cost:.2f} - {own_margin_capital:.2f}) = {loan_amount:.2f} INR. "
                f"Monthly EMI = {monthly_emi:.2f} INR over {n_months} months at {interest_rate_annual:.2f}% p.a. "
                f"Project Cost Source: {source_name} ({source_type})."
            ),
            source_authority=f"{source_name} & VITTANAYA Decision Engine",
            source_year="2026",
            provenance_priority="ODISHA_DISTRICT_PRIMARY" if source_type == "BENCHMARK_ESTIMATE" else "AUTHORITATIVE_FINANCIAL_ENGINE",
            official_source_url=None,
        )

        return FundingStructureResponse(
            indicative_project_cost=project_cost,
            project_cost=project_cost,
            source_type=source_type,
            source_name=source_name,
            project_cost_label=project_cost_label,
            benchmark_cost=benchmark_cost,
            max_supportable_project_size=max_supportable_project_size,
            own_margin_capital=own_margin_capital,
            required_margin_capital=required_margin_capital,
            margin_shortfall=margin_shortfall,
            margin_pct=margin_pct,
            loan_amount=loan_amount,
            interest_rate_annual=interest_rate_annual,
            tenure_years=tenure_years,
            monthly_emi=monthly_emi,
            total_payment=total_payment,
            total_interest=total_interest,
            yearly_schedule=yearly_schedule,
            monthly_schedule=monthly_schedule,
            traceability=traceability,
        )

    @staticmethod
    def calculate_emi(loan_amount: float, monthly_rate: float, n_months: int) -> float:
        """Calculate monthly EMI supporting reducing-balance formula and 0% interest handling."""
        if loan_amount <= 0.0 or n_months <= 0:
            return 0.0
        if monthly_rate < 0.0:
            monthly_rate = 0.0
        if monthly_rate == 0.0:
            return round(loan_amount / float(n_months), 2)

        factor = (1.0 + monthly_rate) ** n_months
        denom = factor - 1.0
        if denom == 0.0:
            return round(loan_amount / float(n_months), 2)

        emi = (loan_amount * monthly_rate * factor) / denom
        return round(emi, 2)

    @staticmethod
    def generate_schedules(
        loan_amount: float,
        monthly_rate: float,
        monthly_emi: float,
        n_months: int,
        tenure_years: int,
    ) -> Tuple[List[ScheduleRow], List[ScheduleRow], float, float]:
        """Generate detailed monthly & aggregated yearly schedule rows ensuring closing balance == 0.0."""
        monthly_rows: List[ScheduleRow] = []
        if loan_amount <= 0.0 or n_months <= 0:
            return [], [], 0.0, 0.0

        balance = loan_amount
        for m in range(1, n_months + 1):
            opening = round(balance, 2)
            interest = round(opening * monthly_rate, 2) if monthly_rate > 0 else 0.0

            if m == n_months:
                # Final period exact payoff adjustment
                principal = opening
                emi = round(principal + interest, 2)
                closing = 0.0
            else:
                principal = min(opening, round(monthly_emi - interest, 2))
                if principal < 0:
                    principal = 0.0
                emi = round(principal + interest, 2)
                closing = max(0.0, round(opening - principal, 2))

            monthly_rows.append(
                ScheduleRow(
                    period=m,
                    period_type="month",
                    opening_balance=opening,
                    emi_payment=emi,
                    principal_payment=principal,
                    interest_payment=interest,
                    closing_balance=closing,
                )
            )
            balance = closing

        # Yearly aggregation
        yearly_rows: List[ScheduleRow] = []
        for y in range(1, tenure_years + 1):
            start_idx = (y - 1) * 12
            end_idx = min(y * 12, len(monthly_rows))
            if start_idx >= len(monthly_rows):
                break
            year_months = monthly_rows[start_idx:end_idx]

            y_opening = year_months[0].opening_balance
            y_emi = round(sum(row.emi_payment for row in year_months), 2)
            y_principal = round(sum(row.principal_payment for row in year_months), 2)
            y_interest = round(sum(row.interest_payment for row in year_months), 2)
            y_closing = year_months[-1].closing_balance

            yearly_rows.append(
                ScheduleRow(
                    period=y,
                    period_type="year",
                    opening_balance=y_opening,
                    emi_payment=y_emi,
                    principal_payment=y_principal,
                    interest_payment=y_interest,
                    closing_balance=y_closing,
                )
            )

        total_payment = round(sum(row.emi_payment for row in monthly_rows), 2)
        total_interest = round(sum(row.interest_payment for row in monthly_rows), 2)

        return monthly_rows, yearly_rows, total_payment, total_interest
