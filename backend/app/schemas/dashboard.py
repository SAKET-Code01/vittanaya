"""Dashboard summary and aggregated response schemas."""

from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class DashboardSummaryResponse(BaseModel):
    """Calculated financial summary DTO generated directly from ledger records."""

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
