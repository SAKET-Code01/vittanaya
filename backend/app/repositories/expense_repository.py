"""Repository for Expense entity persistence operations."""

from typing import Sequence

from sqlalchemy.orm import Session

from backend.app.models.expense import Expense
from backend.app.schemas.expense import ExpenseCreate


class ExpenseRepository:
    """Data access operations for expenses."""

    def __init__(self, db: Session):
        self.db = db

    def list_by_business(self, business_id: int) -> Sequence[Expense]:
        return self.db.query(Expense).filter(Expense.business_id == business_id).all()

    def create(self, data: ExpenseCreate) -> Expense:
        expense = Expense(
            business_id=data.business_id,
            category=data.category,
            amount=data.amount,
            frequency=data.frequency,
            description=data.description,
            due_date=data.due_date,
            is_recurring=data.is_recurring,
        )
        self.db.add(expense)
        self.db.commit()
        self.db.refresh(expense)
        return expense
