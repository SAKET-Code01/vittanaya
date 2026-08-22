"""Financial ledger service managing transactions, receivables, and payables."""

from typing import Sequence

from sqlalchemy.orm import Session

from backend.app.models.expense import Expense
from backend.app.models.payable import Payable
from backend.app.models.receivable import Receivable
from backend.app.models.transaction import Transaction
from backend.app.repositories.expense_repository import ExpenseRepository
from backend.app.repositories.payable_repository import PayableRepository
from backend.app.repositories.receivable_repository import ReceivableRepository
from backend.app.repositories.transaction_repository import TransactionRepository
from backend.app.schemas.expense import ExpenseCreate
from backend.app.schemas.payable import PayableCreate
from backend.app.schemas.receivable import ReceivableCreate
from backend.app.schemas.transaction import TransactionCreate


class LedgerService:
    """Coordinates financial records creation and retrieval."""

    def __init__(self, db: Session):
        self.tx_repo = TransactionRepository(db)
        self.rec_repo = ReceivableRepository(db)
        self.pay_repo = PayableRepository(db)
        self.exp_repo = ExpenseRepository(db)

    def list_transactions(self, business_id: int, limit: int = 100) -> Sequence[Transaction]:
        return self.tx_repo.list_by_business(business_id, limit=limit)

    def create_transaction(self, data: TransactionCreate) -> Transaction:
        return self.tx_repo.create(data)

    def list_receivables(self, business_id: int) -> Sequence[Receivable]:
        return self.rec_repo.list_by_business(business_id)

    def create_receivable(self, data: ReceivableCreate) -> Receivable:
        return self.rec_repo.create(data)

    def list_payables(self, business_id: int) -> Sequence[Payable]:
        return self.pay_repo.list_by_business(business_id)

    def create_payable(self, data: PayableCreate) -> Payable:
        return self.pay_repo.create(data)

    def list_expenses(self, business_id: int) -> Sequence[Expense]:
        return self.exp_repo.list_by_business(business_id)

    def create_expense(self, data: ExpenseCreate) -> Expense:
        return self.exp_repo.create(data)
