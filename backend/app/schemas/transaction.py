"""Transaction validation schemas."""

from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field, field_validator


class TransactionBase(BaseModel):
    transaction_date: date
    amount: Decimal = Field(..., description="Positive for inflow, negative for outflow")
    category: str = Field(..., min_length=2, max_length=50)
    description: Optional[str] = None

    @field_validator("amount")
    @classmethod
    def amount_must_not_be_zero(cls, v: Decimal) -> Decimal:
        if v == Decimal("0.00") or v == 0:
            raise ValueError("Transaction amount cannot be exactly zero")
        return v


class TransactionCreate(TransactionBase):
    business_id: int


class TransactionResponse(TransactionBase):
    id: int
    business_id: int
    created_at: datetime

    model_config = {"from_attributes": True}
