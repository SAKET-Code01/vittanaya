"""Business Goal validation schemas."""

from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field


class GoalBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=150)
    target_amount: Decimal = Field(
        ..., gt=Decimal("0.00"), description="Target amount must be positive"
    )
    current_amount: Decimal = Field(default=Decimal("0.00"), ge=Decimal("0.00"))
    deadline: Optional[date] = None
    priority: str = Field(default="medium", max_length=20)
    status: str = Field(default="in_progress", max_length=20)


class GoalCreate(GoalBase):
    business_id: int


class GoalResponse(GoalBase):
    id: int
    business_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
