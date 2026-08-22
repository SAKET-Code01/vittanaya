"""Deterministic cashflow calculation engine using precise Decimal arithmetic."""

from decimal import Decimal
from typing import Sequence

from backend.app.models.transaction import Transaction


class CashflowEngine:
    """Computes basic cashflow metrics from recorded transactions."""

    @staticmethod
    def calculate_summary(transactions: Sequence[Transaction]) -> dict[str, Decimal]:
        """Aggregate total inflow, total outflow, and net cashflow from a list of transactions."""
        total_inflow = Decimal("0.00")
        total_outflow = Decimal("0.00")

        for tx in transactions:
            amt = Decimal(str(tx.amount))
            if amt > 0:
                total_inflow += amt
            else:
                total_outflow += abs(amt)

        net_cashflow = total_inflow - total_outflow

        return {
            "total_inflow": total_inflow,
            "total_outflow": total_outflow,
            "net_cashflow": net_cashflow,
        }
