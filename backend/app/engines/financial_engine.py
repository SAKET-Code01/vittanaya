"""Financial Structuring Engine for VITTANAYA (SIH26091).

Calculates financing requirements, margin coverage, and leverage ratios deterministically:
financing_requirement = indicative_project_cost - available_margin_capital
"""

from typing import Optional

from sqlalchemy.orm import Session

from backend.app.engines.cost_engine import ProjectCostEngine
from backend.app.schemas.insights import FinancialAnalysisResponse, TraceabilityMetadata


class FinancialEngine:
    """Deterministic Financial Structuring & Gap Analysis Engine."""

    def __init__(self, db: Session):
        self.db = db
        self.cost_engine = ProjectCostEngine(db)

    def analyze_financial_gap(
        self,
        available_margin_capital: float,
        business_category: str,
        specific_business: str,
        location: str = "Odisha",
        scale: Optional[str] = None,
        business_id: Optional[int] = None,
    ) -> FinancialAnalysisResponse:
        """Calculate indicative project cost, financing requirement, and margin sufficiency."""
        # Retrieve indicative project cost
        cost_res = self.cost_engine.get_indicative_cost(
            business_activity=specific_business,
            business_category=business_category,
            location=location,
            scale=scale,
            business_id=business_id,
        )

        indicative_cost = cost_res.indicative_project_cost
        financing_requirement = indicative_cost - available_margin_capital

        margin_pct = (
            (available_margin_capital / indicative_cost) * 100.0 if indicative_cost > 0 else 0.0
        )
        debt_pct = (financing_requirement / indicative_cost) * 100.0 if indicative_cost > 0 else 0.0

        # Standard baseline margin benchmark (10%)
        standard_margin_required = 0.10 * indicative_cost
        has_shortfall = available_margin_capital < standard_margin_required
        shortfall_amount = max(0.0, standard_margin_required - available_margin_capital)

        traceability = TraceabilityMetadata(
            input={
                "available_margin_capital": available_margin_capital,
                "business_category": business_category,
                "specific_business": specific_business,
                "location": location,
                "scale": scale,
            },
            calculation_rule=(
                f"financing_requirement = indicative_project_cost ({indicative_cost:.2f}) "
                f"- available_margin_capital ({available_margin_capital:.2f}) = {financing_requirement:.2f} INR. "
                f"Margin % = {margin_pct:.2f}%, Debt % = {debt_pct:.2f}%."
            ),
            source_authority=cost_res.source_authority,
            source_year=cost_res.source_year,
            provenance_priority=cost_res.provenance_priority,
            official_source_url=cost_res.official_source_url,
        )

        return FinancialAnalysisResponse(
            indicative_project_cost=indicative_cost,
            available_margin_capital=available_margin_capital,
            financing_requirement=financing_requirement,
            margin_pct=round(margin_pct, 2),
            debt_pct=round(debt_pct, 2),
            has_margin_shortfall=has_shortfall,
            margin_shortfall_amount=round(shortfall_amount, 2),
            traceability=traceability,
        )
