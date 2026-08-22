"""Repository for Transaction entity persistence operations."""

from typing import Optional, Sequence

from sqlalchemy.orm import Session

from backend.app.models.transaction import Transaction
from backend.app.schemas.transaction import TransactionCreate


class TransactionRepository:
    """Data access operations for transactions."""

    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, transaction_id: int) -> Optional[Transaction]:
        return self.db.query(Transaction).filter(Transaction.id == transaction_id).first()

    def list_by_business(self, business_id: int, limit: int = 100) -> Sequence[Transaction]:
        return (
            self.db.query(Transaction)
            .filter(Transaction.business_id == business_id)
            .order_by(Transaction.transaction_date.desc())
            .limit(limit)
            .all()
        )

    def create(self, data: TransactionCreate) -> Transaction:
        tx = Transaction(
            business_id=data.business_id,
            transaction_date=data.transaction_date,
            amount=data.amount,
            category=data.category,
            description=data.description,
        )
        self.db.add(tx)
        self.db.commit()
        self.db.refresh(tx)
        return tx
