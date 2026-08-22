"""Financial structuring and funding gap analysis engine for rural micro-enterprises."""

from decimal import Decimal
from typing import Optional


class FinancialStructureEngine:
    """Calculates working capital requirements and funding gaps for micro-enterprises."""

    @staticmethod
    def calculate_funding_gap(
        current_cash: Decimal,
        pending_receivables: Decimal,
        pending_payables: Decimal,
        target_buffer: Optional[Decimal] = None,
    ) -> dict[str, Decimal]:
        """Compute the net liquidity gap required to stabilize operations.

        Net Available Liquidity = Current Cash + (Pending Receivables * 0.90 reliability discount)
        Net Immediate Obligations = Pending Payables + (Target Buffer or 0)
        Funding Gap = max(0, Net Immediate Obligations - Net Available Liquidity)
        """
        target = target_buffer if target_buffer is not None else Decimal("0.00")
        discounted_receivables = pending_receivables * Decimal("0.90")
        available_liquidity = current_cash + discounted_receivables
        obligations = pending_payables + target

        gap = obligations - available_liquidity
        funding_gap = gap if gap > Decimal("0.00") else Decimal("0.00")

        return {
            "available_liquidity": available_liquidity,
            "immediate_obligations": obligations,
            "funding_gap": funding_gap,
        }
