"""Repository for Receivable entity persistence operations."""

from typing import Sequence

from sqlalchemy.orm import Session

from backend.app.models.receivable import Receivable
from backend.app.schemas.receivable import ReceivableCreate


class ReceivableRepository:
    """Data access operations for receivables."""

    def __init__(self, db: Session):
        self.db = db

    def list_by_business(self, business_id: int) -> Sequence[Receivable]:
        return (
            self.db.query(Receivable)
            .filter(Receivable.business_id == business_id)
            .order_by(Receivable.due_date.asc())
            .all()
        )

    def create(self, data: ReceivableCreate) -> Receivable:
        rec = Receivable(
            business_id=data.business_id,
            customer_name=data.customer_name,
            invoice_number=data.invoice_number,
            amount=data.amount,
            due_date=data.due_date,
            expected_date=data.expected_date,
            status=data.status,
            reliability_score=data.reliability_score,
        )
        self.db.add(rec)
        self.db.commit()
        self.db.refresh(rec)
        return rec
