"""Pydantic Schemas for VITTANAYA Insights & Intelligence Engines.

SIH26091 - Deterministic Financial Structuring, Scheme Matching & AI Advisor.
"""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class TraceabilityMetadata(BaseModel):
    """Metadata tracking input, calculation rules, and authoritative sources."""

    input: Dict[str, Any] = Field(..., description="Received input parameters")
    calculation_rule: str = Field(..., description="Deterministic rule, formula, or priority used")
    source_authority: str = Field(..., description="Official issuing authority")
    source_year: str = Field(..., description="Source publication or reference year")
    provenance_priority: Optional[str] = Field(None, description="Data provenance priority rank")
    official_source_url: Optional[str] = Field(None, description="Official reference URL")


# --- Project Cost Schemas ---


class ProjectCostRequest(BaseModel):
    """Request for Project Cost Lookup Engine."""

    business_activity: str = Field(..., json_schema_extra={"example": "Commercial Broiler Farming"})
    business_category: Optional[str] = Field(None, json_schema_extra={"example": "Poultry"})
    location: str = Field("Odisha", json_schema_extra={"example": "Sundargarh, Odisha"})
    scale: Optional[str] = Field(None, json_schema_extra={"example": "1000 birds"})
    business_name: Optional[str] = Field(None, json_schema_extra={"example": "Maa Tarini Agro Mills"})
    business_id: Optional[int] = Field(None, json_schema_extra={"example": 7})


class ProjectCostResponse(BaseModel):
    """Response from Project Cost Lookup Engine."""

    indicative_project_cost: float = Field(..., description="Midpoint indicative cost in INR")
    reference_cost_min_inr: float = Field(..., description="Minimum reference cost in INR")
    reference_cost_max_inr: float = Field(..., description="Maximum reference cost in INR")
    scale_or_specification: str = Field(..., description="Matched scale or specification")
    unit: Optional[str] = Field(None, description="Unit of measurement")
    cost_basis: str = Field(..., description="Basis of reference cost")
    source_authority: str = Field(..., description="Authority issuing cost reference")
    source_year: str = Field(..., description="Reference year/scope")
    provenance_priority: str = Field(
        ..., description="Priority rank (ODISHA_DISTRICT_PRIMARY, etc.)"
    )
    official_source_url: Optional[str] = Field(None, description="URL of official document")
    notes: Optional[str] = Field(None, description="Source caveats or operational notes")
    traceability: TraceabilityMetadata


# --- Financial Engine Schemas ---


class FinancialAnalysisRequest(BaseModel):
    """Request for Financial Structuring Engine."""

    available_margin_capital: float = Field(..., ge=0, json_schema_extra={"example": 50000.0})
    business_category: str = Field(..., json_schema_extra={"example": "Poultry"})
    specific_business: str = Field(..., json_schema_extra={"example": "Commercial Broiler Farming"})
    location: str = Field("Odisha", json_schema_extra={"example": "Sundargarh, Odisha"})
    scale: Optional[str] = Field(None, json_schema_extra={"example": "1000 birds"})
    business_id: Optional[int] = Field(None, json_schema_extra={"example": 7})
    business_name: Optional[str] = Field(None, json_schema_extra={"example": "Maa Tarini Agro Mills"})


class FinancialAnalysisResponse(BaseModel):
    """Response from Financial Structuring Engine."""

    indicative_project_cost: float = Field(..., description="Indicative project cost in INR")
    available_margin_capital: float = Field(..., description="Available margin capital in INR")
    financing_requirement: float = Field(
        ..., description="indicative_project_cost - available_margin_capital"
    )
    margin_pct: float = Field(..., description="Margin as % of total cost")
    debt_pct: float = Field(..., description="Financing requirement as % of total cost")
    has_margin_shortfall: bool = Field(
        ..., description="True if margin is below 10% standard minimum"
    )
    margin_shortfall_amount: float = Field(..., description="Amount to reach standard 10% margin")
    traceability: TraceabilityMetadata


# --- Scheme Engine Schemas ---


class SchemeMatchRequest(BaseModel):
    """Request for Scheme Match Engine."""

    indicative_project_cost: float = Field(..., gt=0, json_schema_extra={"example": 647000.0})
    available_margin_capital: float = Field(..., ge=0, json_schema_extra={"example": 65000.0})
    business_category: str = Field(..., json_schema_extra={"example": "Poultry"})
    specific_business: str = Field(..., json_schema_extra={"example": "Commercial Broiler Farming"})
    location: str = Field("Odisha", json_schema_extra={"example": "Sundargarh, Odisha"})
    social_category: str = Field(
        "General", json_schema_extra={"example": "General / SC / ST / OBC / Women"}
    )
    area_type: str = Field("Rural", json_schema_extra={"example": "Rural / Urban"})
    business_id: Optional[int] = Field(None, json_schema_extra={"example": 7})
    business_name: Optional[str] = Field(None, json_schema_extra={"example": "Maa Tarini Agro Mills"})


class MatchedScheme(BaseModel):
    """Individual matched or evaluated scheme details."""

    scheme_code: str = Field(..., json_schema_extra={"example": "PMEGP"})
    scheme_name: str = Field(
        ..., json_schema_extra={"example": "Prime Minister's Employment Generation Programme"}
    )
    eligible: bool = Field(..., description="True if project meets scheme parameters")
    is_eligible: bool = Field(default=True, description="True if project meets scheme parameters")
    eligibility_status: str = Field(
        default="Likely Eligible",
        description="Eligibility status: 'Likely Eligible', 'Ineligible', or 'Eligibility cannot be verified from available data.'",
    )
    max_eligible_cost: Optional[float] = Field(None, description="Maximum cost limit under scheme")
    estimated_subsidy_amount: float = Field(
        ..., description="Estimated subsidy / margin money in INR"
    )
    estimated_subsidy_pct: float = Field(..., description="Subsidy % applied")
    required_margin_capital: float = Field(
        ..., description="Minimum required margin capital in INR"
    )
    required_margin_pct: float = Field(..., description="Required margin %")
    eligible_loan_amount: float = Field(
        ..., description="Net bank loan amount after subsidy and margin"
    )
    interest_subsidy_pct: float = Field(0.0, description="Interest subvention % if applicable")
    collateral_required: bool = Field(False, description="Whether bank collateral is mandatory")
    match_percentage: float = Field(default=85.0, description="Deterministic match fit percentage 0-100")
    eligibility_reason: Optional[str] = Field(None, description="Clear summary reason of match or ineligibility")
    benefit: Optional[str] = Field(None, description="Summary of subsidy, loan or guarantee benefit")
    subsidy_loan_type: Optional[str] = Field(None, description="Type of subsidy or loan assistance")
    required_documents: List[str] = Field(default_factory=list, description="Required application documents")
    official_source: Optional[str] = Field(None, description="Official ministry/authority name")
    reasons: List[str] = Field(
        ..., description="Eligibility criteria details or disqualification grounds"
    )
    # Explicit Recommendation Criteria ("Why this scheme?")
    why_this_scheme: List[str] = Field(default_factory=list, description="Bullet reasons explaining why this scheme matched")
    matching_criteria: Dict[str, Any] = Field(default_factory=dict, description="Structured criteria breakdown (business_type, location, investment, stage)")
    business_type_match: Optional[str] = Field(None, description="Explanation of business type compatibility")
    location_match: Optional[str] = Field(None, description="Explanation of geography / rural-urban eligibility")
    investment_match: Optional[str] = Field(None, description="Explanation of project cost & margin feasibility")
    business_stage_match: Optional[str] = Field(None, description="Explanation of stage fit")
    data_verification_notice: Optional[str] = Field(None, description="Notice if any eligibility parameters could not be verified")
    source_authority: str = Field(...)
    source_year: str = Field(...)
    official_source_url: Optional[str] = Field(None)


class SchemeMatchResponse(BaseModel):
    """Response from Scheme Match Engine."""

    total_matched: int = Field(default=0, description="Total schemes evaluated")
    eligible_count: int = Field(default=0, description="Count of eligible schemes")
    ranked_schemes: List[MatchedScheme] = Field(default_factory=list, description="All schemes ranked by match percentage")
    eligible_schemes: List[MatchedScheme] = Field(default_factory=list, description="Eligible schemes ranked by fit")
    ineligible_schemes: List[MatchedScheme] = Field(default_factory=list, description="Ineligible or review required schemes")
    best_recommendation: Optional[MatchedScheme] = Field(None)
    explanation: Optional[str] = Field(None, description="Advisory synthesis or explanation of matching logic")
    traceability: TraceabilityMetadata


# --- Feasibility Engine Schemas ---


class FeasibilityRequest(BaseModel):
    """Request for Local Opportunity / Feasibility Engine."""

    business_category: str = Field(..., json_schema_extra={"example": "Poultry"})
    specific_business: str = Field(..., json_schema_extra={"example": "Commercial Broiler Farming"})
    location: str = Field("Odisha", json_schema_extra={"example": "Sundargarh, Odisha"})
    scale: Optional[str] = Field(None, json_schema_extra={"example": "1000 birds"})
    business_id: Optional[int] = Field(None, json_schema_extra={"example": 7})
    business_name: Optional[str] = Field(None, json_schema_extra={"example": "Maa Tarini Agro Mills"})


class SWOTAnalysis(BaseModel):
    """SWOT components for business feasibility."""

    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    opportunities: List[str] = Field(default_factory=list)
    threats: List[str] = Field(default_factory=list)


class FeasibilityResponse(BaseModel):
    """Response from Local Opportunity / Feasibility Engine."""

    market_reach: str = Field(..., description="Target market reach or 'Data insufficient'")
    opportunity: str = Field(
        ..., description="Identified market opportunity or 'Data insufficient'"
    )
    competitor_level: str = Field(
        ..., description="Competitor density level or 'Data insufficient'"
    )
    pricing: str = Field(..., description="Local pricing dynamics or 'Data insufficient'")
    threats: List[str] = Field(
        default_factory=list, description="Local threats or ['Data insufficient']"
    )
    SWOT: SWOTAnalysis = Field(..., description="Structured SWOT analysis")
    overall_opportunity_score: float = Field(
        ..., ge=0, le=100, description="Deterministic score 0-100"
    )
    is_data_sufficient: bool = Field(..., description="False if empirical data was missing")
    traceability: TraceabilityMetadata


# --- Risk Advisory Schemas ---


class RiskAnalysisRequest(BaseModel):
    """Request for Risk Advisory Engine."""

    business_category: str = Field(..., json_schema_extra={"example": "Poultry"})
    specific_business: str = Field(..., json_schema_extra={"example": "Commercial Broiler Farming"})
    indicative_project_cost: float = Field(..., gt=0, json_schema_extra={"example": 647000.0})
    available_margin_capital: float = Field(..., ge=0, json_schema_extra={"example": 65000.0})
    financing_requirement: float = Field(..., ge=0, json_schema_extra={"example": 582000.0})
    location: str = Field("Odisha", json_schema_extra={"example": "Sundargarh, Odisha"})
    seasonality_factor: Optional[str] = Field(None)
    business_id: Optional[int] = Field(None, json_schema_extra={"example": 7})
    business_name: Optional[str] = Field(None, json_schema_extra={"example": "Maa Tarini Agro Mills"})


class RiskFactorDetail(BaseModel):
    """Single risk factor details."""

    risk_name: str
    severity: str  # Low, Medium, High
    score: float
    description: str


class RiskAnalysisResponse(BaseModel):
    """Response from Risk Advisory Engine."""

    market_risk: str = Field(..., json_schema_extra={"example": "Low"})
    competition_risk: str = Field(..., json_schema_extra={"example": "Medium"})
    operational_risk: str = Field(..., json_schema_extra={"example": "Medium"})
    seasonality_risk: str = Field(..., json_schema_extra={"example": "High"})
    financial_risk: str = Field(..., json_schema_extra={"example": "High"})
    market_risk_score: float = Field(..., ge=0, le=100)
    competition_risk_score: float = Field(..., ge=0, le=100)
    operational_risk_score: float = Field(..., ge=0, le=100)
    seasonality_risk_score: float = Field(..., ge=0, le=100)
    financial_risk_score: float = Field(..., ge=0, le=100)
    overall_risk: str = Field(..., json_schema_extra={"example": "Medium"})
    overall_risk_score: float = Field(..., ge=0, le=100)
    top_risks: List[RiskFactorDetail] = Field(default_factory=list)
    reasons: List[str] = Field(default_factory=list)
    traceability: TraceabilityMetadata


# --- What-If Simulation Schemas ---


class SimulationRequest(BaseModel):
    """Request for What-If Simulation Engine."""

    baseline_project_cost: float = Field(..., gt=0, json_schema_extra={"example": 647000.0})
    baseline_available_margin: float = Field(..., ge=0, json_schema_extra={"example": 65000.0})
    baseline_sales_annual: float = Field(..., ge=0, json_schema_extra={"example": 800000.0})
    baseline_operating_cost_annual: float = Field(
        ..., ge=0, json_schema_extra={"example": 550000.0}
    )
    sales_change: float = Field(0.0, description="Percentage change in sales volume e.g. -10.0")
    cost_change: float = Field(0.0, description="Percentage change in operating cost e.g. 5.0")
    price_change: float = Field(0.0, description="Percentage change in selling price e.g. -5.0")
    financing_change: float = Field(0.0, description="Percentage change in financing e.g. 10.0")
    demand_change: float = Field(0.0, description="Percentage change in demand e.g. -15.0")


class SimulationScenarioResult(BaseModel):
    """Calculated scenario figures."""

    revenue: float = Field(..., description="Annual revenue in INR")
    operating_cost: float = Field(..., description="Annual operating cost in INR")
    financing_need: float = Field(..., description="Required loan / financing amount in INR")
    surplus: float = Field(..., description="Annual net operating surplus in INR")
    operating_margin_pct: float = Field(..., description="Operating margin %")
    risk: str = Field(..., description="Evaluated risk level (Low, Medium, High)")


class SimulationResponse(BaseModel):
    """Response from What-If Simulation Engine."""

    baseline: SimulationScenarioResult = Field(..., description="Original baseline scenario")
    simulated: SimulationScenarioResult = Field(..., description="Isolated simulated scenario")
    variance: Dict[str, float] = Field(..., description="Variance between simulated and baseline")
    isolated_scenario: bool = Field(True, description="Always true; baseline is never modified")
    traceability: TraceabilityMetadata


# --- AI Business Advisor Schemas ---


class AdvisorRequest(BaseModel):
    """Request for AI Business Advisor Engine."""

    opportunity: Optional[Dict[str, Any]] = None
    financial: Optional[Dict[str, Any]] = None
    schemes: Optional[Dict[str, Any]] = None
    risks: Optional[Dict[str, Any]] = None
    what_if: Optional[Dict[str, Any]] = None


class AdvisorResponse(BaseModel):
    """Response from AI Business Advisor Engine."""

    summary: str = Field(..., description="Plain-language summary of the structured results")
    why_this_result: List[str] = Field(..., description="Justification referencing exact metrics")
    recommended_next_steps: List[str] = Field(..., description="Actionable next steps")
    traceability: TraceabilityMetadata


# --- Unified Insights Endpoint Schemas ---


class UnifiedInsightsRequest(BaseModel):
    """Request for POST /api/insights/analyze."""

    available_margin_capital: float = Field(..., ge=0, json_schema_extra={"example": 65000.0})
    business_category: str = Field(..., json_schema_extra={"example": "Poultry"})
    specific_business: str = Field(..., json_schema_extra={"example": "Commercial Broiler Farming"})
    location: str = Field("Odisha", json_schema_extra={"example": "Sundargarh, Odisha"})
    scale: Optional[str] = Field(None, json_schema_extra={"example": "1000 birds"})
    social_category: str = Field(
        "General", json_schema_extra={"example": "General / SC / ST / OBC"}
    )
    area_type: str = Field("Rural", json_schema_extra={"example": "Rural / Urban"})
    baseline_sales_annual: Optional[float] = Field(None, json_schema_extra={"example": 800000.0})
    baseline_operating_cost_annual: Optional[float] = Field(
        None, json_schema_extra={"example": 550000.0}
    )
    simulation_inputs: Optional[Dict[str, float]] = Field(
        None,
        json_schema_extra={
            "example": {
                "sales_change": -10.0,
                "cost_change": 5.0,
                "price_change": 0.0,
                "financing_change": 0.0,
                "demand_change": 0.0,
            }
        },
    )
    business_id: Optional[int] = Field(None, json_schema_extra={"example": 7})
    business_activity: Optional[str] = Field(None, json_schema_extra={"example": "Dairy Cattle Milk Production & Chilling"})
    business_name: Optional[str] = Field(None, json_schema_extra={"example": "Maa Tarini Agro Mills"})


class UnifiedInsightsResponse(BaseModel):
    """Unified Response containing all 6 intelligence components."""

    opportunity: FeasibilityResponse
    financial: FinancialAnalysisResponse
    schemes: SchemeMatchResponse
    risks: RiskAnalysisResponse
    what_if: SimulationResponse
    advisor: AdvisorResponse
