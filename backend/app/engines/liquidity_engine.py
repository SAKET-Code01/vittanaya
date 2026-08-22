"""Liquidity risk assessment and runway calculation engine."""

from decimal import Decimal


class LiquidityEngine:
    """Calculates operational runway days and categorical risk thresholds."""

    @staticmethod
    def calculate_runway(cash_balance: Decimal, monthly_outflow: Decimal) -> dict[str, object]:
        """Calculate runway days and risk level.

        Thresholds:
        - CRITICAL: < 15 days or negative balance
        - MEDIUM: 15 to 44 days
        - LOW: >= 45 days
        """
        if cash_balance <= Decimal("0.00"):
            return {
                "runway_days": 0,
                "risk_level": "CRITICAL",
                "daily_burn": Decimal("0.00"),
            }

        if monthly_outflow <= Decimal("0.00"):
            # If no outflow is recorded, assign safe maximum runway
            return {
                "runway_days": 365,
                "risk_level": "LOW",
                "daily_burn": Decimal("0.00"),
            }

        daily_burn = monthly_outflow / Decimal("30.0")
        if daily_burn == 0:
            runway_days = 365
        else:
            runway_days = int(cash_balance / daily_burn)

        if runway_days < 15:
            risk_level = "CRITICAL"
        elif runway_days < 45:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        return {
            "runway_days": runway_days,
            "risk_level": risk_level,
            "daily_burn": daily_burn,
        }
