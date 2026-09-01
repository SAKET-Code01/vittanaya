"""Pydantic validation schemas for Industry-Adaptive Business Intelligence API."""

from typing import Dict, List, Optional

from pydantic import BaseModel, Field

from backend.app.schemas.insights import TraceabilityMetadata


class IndustryFieldDefinition(BaseModel):
    """Input field specification for progressive UI intake."""

    key: str
    label: str
    unit: str
    type: str = "float"
    default: float


class IndustryTemplateResponse(BaseModel):
    """Industry configuration template metadata."""

    industry_code: str
    display_name: str
    description: str
    fields: List[IndustryFieldDefinition]


class IndustryKpiItem(BaseModel):
    """Single calculated industry KPI metric."""

    key: str
    label: str
    value: float
    formatted_value: str
    unit: str
    data_status: str = Field("ESTIMATE", description="ACTUAL, REFERENCE, ESTIMATE, UNAVAILABLE")
    benchmark_advice: Optional[str] = None


class IndustryRiskSignal(BaseModel):
    """Industry-specific risk signal alert."""

    risk_name: str
    severity: str = Field("LOW", description="LOW, MEDIUM, HIGH, CRITICAL")
    reason: str
    recommendation: str


class IndustryScenarioResult(BaseModel):
    """Industry-specific what-if scenario result."""

    scenario_name: str
    baseline_revenue_monthly: float
    simulated_revenue_monthly: float
    revenue_delta: float
    baseline_net_monthly: float
    simulated_net_monthly: float
    net_delta: float
    description: str


class IndustryAnalysisRequest(BaseModel):
    """Payload for POST /api/v1/industry/analyze endpoint."""

    business_id: Optional[int] = Field(None, description="Optional active business ID")
    industry_code: str = Field(..., description="MANUFACTURING, RETAIL, RESTAURANT, TRANSPORT, SERVICES, CREATOR")
    variables: Dict[str, float] = Field(default_factory=dict, description="Industry specific input key-value pairs")


class IndustryAnalysisResponse(BaseModel):
    """Authoritative response from Industry Intelligence Engine."""

    business_id: Optional[int] = None
    industry_code: str
    display_name: str
    normalized_monthly_revenue: float = Field(..., description="Calculated operating revenue inflow per month in INR")
    normalized_monthly_expense: float = Field(..., description="Calculated operating expense outflow per month in INR")
    kpis: List[IndustryKpiItem] = Field(default_factory=list)
    risk_signals: List[IndustryRiskSignal] = Field(default_factory=list)
    scenario_result: Optional[IndustryScenarioResult] = None
    data_status: str = Field("ESTIMATE", description="ACTUAL, REFERENCE, ESTIMATE, UNAVAILABLE")
    traceability: TraceabilityMetadata
