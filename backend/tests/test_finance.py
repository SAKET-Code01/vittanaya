"""Test financial transactions, receivables, payables, and dashboard summary."""

from fastapi.testclient import TestClient

from backend.app.models.business import Business


def test_create_and_list_transactions(client: TestClient, sample_business: Business) -> None:
    """Verify creating transactions and querying transaction history."""
    # 1. Inflow transaction
    tx_inflow = {
        "business_id": sample_business.id,
        "transaction_date": "2026-08-20",
        "amount": 25000.00,
        "category": "sales",
        "description": "Weekly craft fair revenue",
    }
    res_in = client.post("/api/v1/finance/transactions", json=tx_inflow)
    assert res_in.status_code == 201
    assert float(res_in.json()["amount"]) == 25000.00

    # 2. Outflow transaction
    tx_outflow = {
        "business_id": sample_business.id,
        "transaction_date": "2026-08-21",
        "amount": -8000.00,
        "category": "raw_material",
        "description": "Clay and natural dye purchase",
    }
    res_out = client.post("/api/v1/finance/transactions", json=tx_outflow)
    assert res_out.status_code == 201

    # 3. List transactions
    res_list = client.get(f"/api/v1/finance/transactions?business_id={sample_business.id}")
    assert res_list.status_code == 200
    transactions = res_list.json()
    assert len(transactions) == 2


def test_dashboard_summary_calculation(client: TestClient, sample_business: Business) -> None:
    """Verify aggregated dashboard summary calculations from backend engines."""
    # Post inflow 50,000 and outflow 20,000 -> net cash = 30,000
    client.post(
        "/api/v1/finance/transactions",
        json={
            "business_id": sample_business.id,
            "transaction_date": "2026-08-15",
            "amount": 50000.00,
            "category": "sales",
        },
    )
    client.post(
        "/api/v1/finance/transactions",
        json={
            "business_id": sample_business.id,
            "transaction_date": "2026-08-18",
            "amount": -20000.00,
            "category": "payroll",
        },
    )

    # Post receivable 10,000
    client.post(
        "/api/v1/finance/receivables",
        json={
            "business_id": sample_business.id,
            "customer_name": "Odisha Handicrafts Corp",
            "invoice_number": "OHC-882",
            "amount": 10000.00,
            "due_date": "2026-09-01",
            "expected_date": "2026-09-05",
        },
    )

    # Post payable 15,000
    client.post(
        "/api/v1/finance/payables",
        json={
            "business_id": sample_business.id,
            "vendor_name": "Sundargram Clay Supplier",
            "amount": 15000.00,
            "due_date": "2026-08-30",
        },
    )

    # Fetch dashboard summary
    response = client.get(f"/api/v1/dashboard/summary?business_id={sample_business.id}")
    assert response.status_code == 200
    data = response.json()

    assert float(data["total_inflow"]) == 50000.00
    assert float(data["total_outflow"]) == 20000.00
    assert float(data["net_cashflow"]) == 30000.00
    assert float(data["cash_balance"]) == 30000.00
    assert float(data["pending_receivables_total"]) == 10000.00
    assert float(data["pending_payables_total"]) == 15000.00
    assert data["runway_days"] > 0
