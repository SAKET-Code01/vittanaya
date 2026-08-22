"""Dashboard aggregation service computing financial metrics from engines."""

from decimal import Decimal
from typing import Optional

from sqlalchemy.orm import Session

from backend.app.engines.cashflow_engine import CashflowEngine
from backend.app.engines.financial_structure_engine import FinancialStructureEngine
from backend.app.engines.liquidity_engine import LiquidityEngine
from backend.app.repositories.business_repository import BusinessRepository
from backend.app.repositories.payable_repository import PayableRepository
from backend.app.repositories.receivable_repository import ReceivableRepository
from backend.app.repositories.transaction_repository import TransactionRepository
from backend.app.schemas.dashboard import DashboardSummaryResponse


class DashboardService:
    """Aggregates recorded financial data and computes authoritative metrics via backend engines."""

    def __init__(self, db: Session):
        self.biz_repo = BusinessRepository(db)
        self.tx_repo = TransactionRepository(db)
        self.rec_repo = ReceivableRepository(db)
        self.pay_repo = PayableRepository(db)

    def get_summary(self, business_id: int) -> Optional[DashboardSummaryResponse]:
        business = self.biz_repo.get_by_id(business_id)
        if not business:
            return None

        # Fetch records
        transactions = self.tx_repo.list_by_business(business_id)
        receivables = self.rec_repo.list_by_business(business_id)
        payables = self.pay_repo.list_by_business(business_id)

        # 1. Cashflow engine calculation
        cf_summary = CashflowEngine.calculate_summary(transactions)
        total_inflow = cf_summary["total_inflow"]
        total_outflow = cf_summary["total_outflow"]
        net_cashflow = cf_summary["net_cashflow"]

        # 2. Derive current cash balance from net cashflow + initial baseline
        cash_balance = net_cashflow

        # 3. Sum pending receivables and payables
        pending_rec_total = sum(
            (Decimal(str(r.amount)) for r in receivables if r.status == "pending"),
            Decimal("0.00"),
        )
        pending_pay_total = sum(
            (Decimal(str(p.amount)) for p in payables if p.status == "unpaid"),
            Decimal("0.00"),
        )

        # 4. Liquidity engine calculation (using monthly baseline outflow or actual outflow)
        monthly_burn = Decimal(str(business.monthly_expense_estimate))
        if monthly_burn <= Decimal("0.00") and total_outflow > Decimal("0.00"):
            monthly_burn = total_outflow

        liq_metrics = LiquidityEngine.calculate_runway(cash_balance, monthly_burn)
        runway_days = int(liq_metrics["runway_days"])  # type: ignore
        risk_level = str(liq_metrics["risk_level"])

        # 5. Financial structure funding gap calculation
        gap_metrics = FinancialStructureEngine.calculate_funding_gap(
            current_cash=cash_balance,
            pending_receivables=pending_rec_total,
            pending_payables=pending_pay_total,
        )

        return DashboardSummaryResponse(
            business_id=business.id,
            business_name=business.name,
            cash_balance=cash_balance,
            total_inflow=total_inflow,
            total_outflow=total_outflow,
            net_cashflow=net_cashflow,
            runway_days=runway_days,
            liquidity_risk_level=risk_level,
            pending_receivables_total=pending_rec_total,
            pending_payables_total=pending_pay_total,
            funding_gap=gap_metrics["funding_gap"],
        )
