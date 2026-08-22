"""Expense validation schemas."""

from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field


class ExpenseBase(BaseModel):
    category: str = Field(..., min_length=2, max_length=50)
    amount: Decimal = Field(..., gt=Decimal("0.00"), description="Expense amount must be positive")
    frequency: str = Field(default="monthly", max_length=20)
    description: Optional[str] = None
    due_date: Optional[date] = None
    is_recurring: bool = True


class ExpenseCreate(ExpenseBase):
    business_id: int


class ExpenseResponse(ExpenseBase):
    id: int
    business_id: int
    created_at: datetime

    model_config = {"from_attributes": True}
