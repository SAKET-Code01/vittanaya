"""Receivable validation schemas."""

from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class ReceivableBase(BaseModel):
    customer_name: str = Field(..., min_length=2, max_length=100)
    invoice_number: str = Field(..., min_length=1, max_length=50)
    amount: Decimal = Field(..., gt=Decimal("0.00"), description="Invoice amount must be positive")
    due_date: date
    expected_date: date
    status: str = Field(default="pending", max_length=20)
    reliability_score: float = Field(default=1.0, ge=0.0, le=1.0)


class ReceivableCreate(ReceivableBase):
    business_id: int


class ReceivableResponse(ReceivableBase):
    id: int
    business_id: int
    created_at: datetime

    model_config = {"from_attributes": True}
