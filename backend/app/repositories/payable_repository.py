"""Repository for Payable entity persistence operations."""

from typing import Sequence

from sqlalchemy.orm import Session

from backend.app.models.payable import Payable
from backend.app.schemas.payable import PayableCreate


class PayableRepository:
    """Data access operations for payables."""

    def __init__(self, db: Session):
        self.db = db

    def list_by_business(self, business_id: int) -> Sequence[Payable]:
        return (
            self.db.query(Payable)
            .filter(Payable.business_id == business_id)
            .order_by(Payable.due_date.asc())
            .all()
        )

    def create(self, data: PayableCreate) -> Payable:
        payable = Payable(
            business_id=data.business_id,
            vendor_name=data.vendor_name,
            bill_number=data.bill_number,
            amount=data.amount,
            due_date=data.due_date,
            priority_tier=data.priority_tier,
            status=data.status,
        )
        self.db.add(payable)
        self.db.commit()
        self.db.refresh(payable)
        return payable
