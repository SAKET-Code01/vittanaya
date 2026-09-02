"""Business profile validation schemas."""

from datetime import datetime
from decimal import Decimal
from typing import Any, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


class BusinessBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    type: str = Field(default="Retail", max_length=50)
    industry: str = Field(default="General", max_length=50)
    stage: Optional[str] = Field(default="established", max_length=50)
    category: Optional[str] = Field(None, max_length=100)
    location_village: Optional[str] = Field(None, max_length=100)
    location_block: Optional[str] = Field(None, max_length=100)
    location_district: Optional[str] = Field(None, max_length=100)
    location_state: Optional[str] = Field(None, max_length=100)
    location_pin: Optional[str] = Field(None, max_length=10)
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = None
    description: Optional[str] = None
    own_capital: Optional[Decimal] = Field(default=Decimal("0.00"), ge=Decimal("0.00"))
    project_cost: Optional[Decimal] = Field(default=Decimal("0.00"), ge=Decimal("0.00"))
    existing_investment: Optional[Decimal] = Field(default=Decimal("0.00"), ge=Decimal("0.00"))
    social_category: Optional[str] = Field(None, max_length=50)
    area_type: Optional[str] = Field(None, max_length=50)
    selected_operations: Optional[str] = None
    status: Optional[str] = Field(default="active", max_length=50)
    monthly_revenue_estimate: Decimal = Field(default=Decimal("0.00"), ge=Decimal("0.00"))
    monthly_expense_estimate: Decimal = Field(default=Decimal("0.00"), ge=Decimal("0.00"))
    # Business Identity & Compliance
    owner_name: Optional[str] = Field(None, max_length=150)
    gstin: Optional[str] = Field(None, max_length=20)
    pan: Optional[str] = Field(None, max_length=10)
    udyam_registration: Optional[str] = Field(None, max_length=50)
    legal_structure: Optional[str] = Field(None, max_length=50)
    financial_year: Optional[str] = Field(None, max_length=30)
    tax_regime: Optional[str] = Field(None, max_length=30)
    business_since: Optional[str] = Field(None, max_length=10)
    registered_address: Optional[str] = None
    notes: Optional[str] = None

    @field_validator("email", mode="before")
    @classmethod
    def empty_email_to_none(cls, v: Any) -> Any:
        if isinstance(v, str) and not v.strip():
            return None
        return v


class BusinessCreate(BusinessBase):
    owner_id: Optional[int] = 1


class BusinessUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=150)
    type: Optional[str] = Field(None, max_length=50)
    industry: Optional[str] = Field(None, max_length=50)
    stage: Optional[str] = Field(None, max_length=50)
    category: Optional[str] = None
    location_village: Optional[str] = None
    location_block: Optional[str] = None
    location_district: Optional[str] = None
    location_state: Optional[str] = None
    location_pin: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    description: Optional[str] = None
    own_capital: Optional[Decimal] = Field(None, ge=Decimal("0.00"))
    project_cost: Optional[Decimal] = Field(None, ge=Decimal("0.00"))
    existing_investment: Optional[Decimal] = Field(None, ge=Decimal("0.00"))
    social_category: Optional[str] = None
    area_type: Optional[str] = None
    selected_operations: Optional[str] = None
    status: Optional[str] = None
    monthly_revenue_estimate: Optional[Decimal] = Field(None, ge=Decimal("0.00"))
    monthly_expense_estimate: Optional[Decimal] = Field(None, ge=Decimal("0.00"))
    # Business Identity & Compliance
    owner_name: Optional[str] = None
    gstin: Optional[str] = None
    pan: Optional[str] = None
    udyam_registration: Optional[str] = None
    legal_structure: Optional[str] = None
    financial_year: Optional[str] = None
    tax_regime: Optional[str] = None
    business_since: Optional[str] = None
    registered_address: Optional[str] = None
    notes: Optional[str] = None

    @field_validator("email", mode="before")
    @classmethod
    def empty_email_to_none(cls, v: Any) -> Any:
        if isinstance(v, str) and not v.strip():
            return None
        return v


class BusinessResponse(BusinessBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
