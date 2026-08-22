"""Payable validation schemas."""

from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field


class PayableBase(BaseModel):
    vendor_name: str = Field(..., min_length=2, max_length=100)
    bill_number: Optional[str] = Field(None, max_length=50)
    amount: Decimal = Field(..., gt=Decimal("0.00"), description="Payable amount must be positive")
    due_date: date
    priority_tier: int = Field(default=1, ge=1, le=3)
    status: str = Field(default="unpaid", max_length=20)


class PayableCreate(PayableBase):
    business_id: int


class PayableResponse(PayableBase):
    id: int
    business_id: int
    created_at: datetime

    model_config = {"from_attributes": True}
