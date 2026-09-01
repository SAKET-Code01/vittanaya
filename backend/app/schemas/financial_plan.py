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


# --- Cash-Flow & Liquidity Intelligence Schemas ---


class MonthlyCashFlowItem(BaseModel):
    """Single month cash flow item in the 12-month forecast."""

    month: str = Field(..., json_schema_extra={"example": "2026-09"})
    month_index: int = Field(..., ge=1, le=12, description="1-indexed month number")
    opening_cash: float = Field(..., description="Opening cash balance in INR")
    revenue: float = Field(..., description="Operating revenue inflow in INR")
    receivables_inflow: float = Field(0.0, description="Collected receivables inflow in INR")
    total_inflow: float = Field(..., description="Total cash inflow in INR")
    operating_expenses: float = Field(..., description="Operating expenses outflow in INR")
    payables_outflow: float = Field(0.0, description="Vendor payables outflow in INR")
    debt_service: float = Field(..., description="Loan EMI debt service in INR")
    total_outflow: float = Field(..., description="Total cash outflow in INR")
    net_cash_flow: float = Field(..., description="Net monthly cash flow in INR")
    closing_cash: float = Field(..., description="Closing cash balance in INR")
    risk_level: str = Field("LOW", description="Monthly liquidity risk level: LOW, MEDIUM, HIGH, CRITICAL")
    data_status: str = Field("ESTIMATE", description="Data integrity status: ACTUAL, REFERENCE, ESTIMATE, UNAVAILABLE")


class LiquidityRiskFlag(BaseModel):
    """Specific liquidity risk alert."""

    affected_month: str = Field(..., json_schema_extra={"example": "2026-12"})
    risk_level: str = Field(..., json_schema_extra={"example": "HIGH"})
    reason: str = Field(..., description="Explanation of risk driver")
    recommended_action: str = Field(..., description="Advisory action to mitigate risk")


class CashFlowSummary(BaseModel):
    """Aggregate 12-month liquidity summary."""

    opening_cash_initial: float = Field(..., description="Starting cash balance in INR")
    total_12m_revenue: float = Field(..., description="Total 12-month revenue in INR")
    total_12m_expenses: float = Field(..., description="Total 12-month operating expenses in INR")
    total_12m_debt_service: float = Field(..., description="Total 12-month EMI payments in INR")
    minimum_projected_cash: float = Field(..., description="Lowest closing cash balance across 12 months")
    minimum_recommended_buffer: float = Field(..., description="1.5x monthly operating expense coverage in INR")
    working_capital_required: float = Field(..., description="Estimated working capital required in INR")
    months_of_coverage: float = Field(..., description="Months of operating coverage supported by minimum cash")
    liquidity_risk_level: str = Field("LOW", description="Overall liquidity risk: LOW, MEDIUM, HIGH, CRITICAL")
    critical_months: List[str] = Field(default_factory=list, description="List of month labels with liquidity alerts")


class ScenarioComparison(BaseModel):
    """Stress scenario vs baseline comparison."""

    baseline_min_cash: float = Field(...)
    stress_min_cash: float = Field(...)
    cash_delta: float = Field(...)
    baseline_risk: str = Field(...)
    stress_risk: str = Field(...)
    scenario_description: str = Field(...)


class CashFlowForecastRequest(BaseModel):
    """Payload for POST /api/v1/finance/cash-flow endpoint."""

    business_id: Optional[int] = Field(None, description="Optional active business ID")
    project_cost: Optional[float] = Field(None, ge=0.0, description="Optional project cost override")
    available_margin_capital: Optional[float] = Field(None, ge=0.0, description="Optional own margin capital")
    monthly_revenue_estimate: Optional[float] = Field(None, ge=0.0, description="Optional monthly revenue estimate")
    monthly_expense_estimate: Optional[float] = Field(None, ge=0.0, description="Optional monthly expense estimate")
    interest_rate_annual: float = Field(9.5, ge=0.0, le=50.0, description="Annual loan interest rate %")
    tenure_years: int = Field(5, ge=1, le=30, description="Loan tenure in years")
    stress_sales_change: float = Field(0.0, description="Optional stress sales change % e.g. -15.0")
    apply_seasonality: bool = Field(True, description="Whether to apply district/category seasonality factors")


class CashFlowForecastResponse(BaseModel):
    """Authoritative response from Cash-Flow & Liquidity Intelligence Engine."""

    business_id: Optional[int] = Field(None)
    business_name: str = Field("Micro-Enterprise")
    location: str = Field("Odisha")
    summary: CashFlowSummary
    months: List[MonthlyCashFlowItem] = Field(default_factory=list)
    liquidity_flags: List[LiquidityRiskFlag] = Field(default_factory=list)
    stress_comparison: Optional[ScenarioComparison] = Field(None)
    data_status: str = Field("VERIFIED_DETERMINISTIC", description="ACTUAL, REFERENCE, ESTIMATE, UNAVAILABLE")
    traceability: TraceabilityMetadata
