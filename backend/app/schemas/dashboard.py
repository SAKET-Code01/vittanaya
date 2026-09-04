from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, Field


class DashboardSummaryResponse(BaseModel):
    """Calculated financial and operational summary DTO generated directly from authoritative backend engines."""

    business_id: int
    business_name: str
    cash_balance: Decimal
    total_inflow: Decimal
    total_outflow: Decimal
    net_cashflow: Decimal
    runway_days: int
    liquidity_risk_level: str  # 'LOW', 'MEDIUM', 'CRITICAL'
    pending_receivables_total: Decimal
    pending_payables_total: Decimal
    funding_gap: Optional[Decimal] = Decimal("0.00")

    # Dynamic Business Readiness (SIH26091)
    readiness_score: float = Field(default=0.0, description="Calculated readiness %")
    readiness_label: str = Field(default="0% Prepared", description="Readiness badge string")
    readiness_status: str = Field(default="Early Stage", description="Early Stage, In Progress, Launch Ready")
    completed_requirements: int = 0
    total_requirements: int = 0
    pending_critical_requirements: List[str] = Field(default_factory=list)

    # Workforce & Payroll Metrics (SIH26091)
    total_employees: int = 0
    full_time_employees: int = 0
    contractual_employees: int = 0
    payroll_amount: Decimal = Decimal("0.00")
    payroll_due_date: Optional[str] = None

    # Established Business Health & Operations (SIH26091)
    health_score: int = Field(default=75, description="Authoritative Business Health Index (0-100)")
    health_status: str = Field(default="STABLE & GROWING", description="Health rating label")
    monthly_revenue: Decimal = Field(default=Decimal("0.00"), description="Authoritative monthly revenue")
    monthly_expenses: Decimal = Field(default=Decimal("0.00"), description="Authoritative monthly expenses")
    operating_profit: Decimal = Field(default=Decimal("0.00"), description="Operating profit")
    ebitda_margin: float = Field(default=0.0, description="EBITDA / Operating margin %")
    working_capital: Decimal = Field(default=Decimal("0.00"), description="Net working capital")
    working_capital_ratio: float = Field(default=1.0, description="Working capital coverage ratio")
    runway_months: float = Field(default=0.0, description="Cash runway in months")
    growth_readiness: float = Field(default=0.0, description="Growth readiness percentage")
    operational_readiness: float = Field(default=0.0, description="Operational readiness percentage")
    operational_priorities: List[dict] = Field(
        default_factory=list,
        description="Traceable rule-derived operational priorities for the action center",
    )
    data_provenance: Optional[dict] = Field(
        default_factory=lambda: {
            "source_type": "CALCULATED",
            "source_name": "Deterministic Financial & Liquidity Engines",
            "confidence": "HIGH",
            "explanation": "Calculated from recorded transactions, ledger dues, and baseline capital.",
        }
    )

