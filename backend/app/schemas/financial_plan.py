"""Pydantic validation schemas for Financial Plan & Amortization Schedule API."""

from typing import List, Optional

from pydantic import BaseModel, Field

from backend.app.schemas.insights import TraceabilityMetadata


class ScheduleRow(BaseModel):
    """Monthly or yearly loan amortization schedule row."""

    period: int = Field(..., description="Period number (year or month)")
    period_type: str = Field("year", description="'year' or 'month'")
    opening_balance: float = Field(..., description="Opening principal balance in INR")
    emi_payment: float = Field(..., description="Total payment in period in INR")
    principal_payment: float = Field(..., description="Principal repaid in period in INR")
    interest_payment: float = Field(..., description="Interest paid in period in INR")
    closing_balance: float = Field(..., description="Closing principal balance in INR")


class FundingStructureRequest(BaseModel):
    """Payload for POST /api/v1/finance/funding-structure endpoint."""

    project_cost: float = Field(..., gt=0, json_schema_extra={"example": 1000000.0})
    margin_pct: float = Field(10.0, ge=0.0, le=100.0, json_schema_extra={"example": 10.0})
    interest_rate_annual: float = Field(8.5, ge=0.0, le=50.0, json_schema_extra={"example": 8.5})
    tenure_years: int = Field(7, ge=1, le=30, json_schema_extra={"example": 7})
    business_category: Optional[str] = Field(None, json_schema_extra={"example": "Poultry"})
    specific_business: Optional[str] = Field(None, json_schema_extra={"example": "Commercial Broiler Farming"})
    location: Optional[str] = Field("Odisha", json_schema_extra={"example": "Sundargarh, Odisha"})


class FundingStructureResponse(BaseModel):
    """Authoritative response for financial plan funding structure & amortization schedule."""

    indicative_project_cost: float = Field(..., description="Total project cost in INR")
    own_margin_capital: float = Field(..., description="Promoter margin capital in INR")
    margin_pct: float = Field(..., description="Margin percentage applied")
    loan_amount: float = Field(..., description="Net bank loan amount (project_cost - margin)")
    interest_rate_annual: float = Field(..., description="Annual interest rate percentage")
    tenure_years: int = Field(..., description="Loan tenure in years")
    monthly_emi: float = Field(..., description="Monthly EMI repayment in INR")
    total_payment: float = Field(..., description="Total sum of payments over tenure in INR")
    total_interest: float = Field(..., description="Total interest paid over tenure in INR")
    yearly_schedule: List[ScheduleRow] = Field(default_factory=list, description="Yearly aggregated schedule")
    monthly_schedule: List[ScheduleRow] = Field(default_factory=list, description="Monthly detailed schedule")
    traceability: TraceabilityMetadata
