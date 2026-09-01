"""Pydantic Schemas for Action Plan & Bankable DPR Document Endpoints."""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field


class TaskItemSchema(BaseModel):
    """Action Plan Task Schema."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    business_id: int = 1
    phase: str
    title: str
    description: Optional[str] = None
    status: str = "pending"
    target_days: int = 7
    is_mandatory: bool = True
    authority_name: Optional[str] = None


class TaskUpdateSchema(BaseModel):
    """Schema for updating task status."""

    status: str = Field(..., description="Status ('pending', 'in_progress', 'completed')")


class ActionPlanResponse(BaseModel):
    """Action Plan Roadmap Response."""

    business_id: int
    total_tasks: int
    completed_tasks: int
    completion_pct: float
    tasks: List[TaskItemSchema]


class DPRExportRequest(BaseModel):
    """Request for compiling Detailed Project Report (DPR)."""

    business_id: int = 1
    business_name: Optional[str] = "Rural Micro-Enterprise"
    business_category: Optional[str] = "Retail & Processing"
    location: Optional[str] = "Odisha"
    indicative_project_cost: float = 200000.0
    own_margin_capital: float = 50000.0
    eligible_loan_amount: float = 150000.0
    estimated_subsidy_amount: float = 0.0
    scheme_name: Optional[str] = "PMEGP / MUDRA"


class DPRExportResponse(BaseModel):
    """Response containing compiled DPR document."""

    dpr_id: int
    document_name: str
    generated_at: str
    project_cost: float
    own_margin: float
    eligible_loan: float
    subsidy_amount: float
    summary: str
    dpr_content: Dict[str, Any]
