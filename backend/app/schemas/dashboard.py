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

