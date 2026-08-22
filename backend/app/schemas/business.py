"""Business profile validation schemas."""

from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class BusinessBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    type: str = Field(..., min_length=2, max_length=50)
    industry: str = Field(..., min_length=2, max_length=50)
    location_village: Optional[str] = Field(None, max_length=100)
    location_district: Optional[str] = Field(None, max_length=100)
    location_state: Optional[str] = Field(None, max_length=100)
    location_pin: Optional[str] = Field(None, max_length=10)
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = None
    description: Optional[str] = None
    monthly_revenue_estimate: Decimal = Field(default=Decimal("0.00"), ge=Decimal("0.00"))
    monthly_expense_estimate: Decimal = Field(default=Decimal("0.00"), ge=Decimal("0.00"))


class BusinessCreate(BusinessBase):
    owner_id: int


class BusinessUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=150)
    type: Optional[str] = Field(None, min_length=2, max_length=50)
    industry: Optional[str] = Field(None, min_length=2, max_length=50)
    location_village: Optional[str] = None
    location_district: Optional[str] = None
    location_state: Optional[str] = None
    location_pin: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    description: Optional[str] = None
    monthly_revenue_estimate: Optional[Decimal] = Field(None, ge=Decimal("0.00"))
    monthly_expense_estimate: Optional[Decimal] = Field(None, ge=Decimal("0.00"))


class BusinessResponse(BusinessBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
