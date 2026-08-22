"""Test input validation for financial records."""

from decimal import Decimal

import pytest
from fastapi.testclient import TestClient

from backend.app.engines.financial_structure_engine import FinancialStructureEngine
from backend.app.engines.liquidity_engine import LiquidityEngine
from backend.app.models.business import Business
from backend.app.schemas.transaction import TransactionCreate


def test_transaction_zero_amount_rejected(sample_business: Business) -> None:
    """Ensure zero-value transactions are rejected by Pydantic validation."""
    with pytest.raises(ValueError, match="Transaction amount cannot be exactly zero"):
        TransactionCreate(
            business_id=sample_business.id,
            transaction_date="2026-08-22",  # type: ignore
            amount=Decimal("0.00"),
            category="sales",
        )


def test_receivable_negative_amount_rejected(client: TestClient, sample_business: Business) -> None:
    """Ensure negative amounts for receivables are rejected by API validation."""
    payload = {
        "business_id": sample_business.id,
        "customer_name": "Gramin Distributor",
        "invoice_number": "INV-001",
        "amount": -5000.00,
        "due_date": "2026-09-01",
        "expected_date": "2026-09-05",
    }
    response = client.post("/api/v1/finance/receivables", json=payload)
    assert response.status_code == 422


def test_engines_decimal_precision() -> None:
    """Verify precision calculations across cashflow, liquidity, and financial structure engines."""
    # Liquidity engine
    liq_res = LiquidityEngine.calculate_runway(Decimal("30000.00"), Decimal("30000.00"))
    assert liq_res["runway_days"] == 30
    assert liq_res["risk_level"] == "MEDIUM"

    critical_res = LiquidityEngine.calculate_runway(Decimal("5000.00"), Decimal("30000.00"))
    assert critical_res["runway_days"] == 5
    assert critical_res["risk_level"] == "CRITICAL"

    # Funding gap engine
    gap_res = FinancialStructureEngine.calculate_funding_gap(
        current_cash=Decimal("10000.00"),
        pending_receivables=Decimal("5000.00"),  # 90% = 4500 -> available 14500
        pending_payables=Decimal("20000.00"),
    )
    assert gap_res["funding_gap"] == Decimal("5500.00")
