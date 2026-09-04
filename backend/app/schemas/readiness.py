"""Pydantic schemas for Business Readiness Engine & Requirement Tracking.

SIH26091 - Deterministic Execution Preparedness & Compliance Architecture.
"""

from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field

from backend.app.schemas.insights import TraceabilityMetadata


class BusinessRequirementSchema(BaseModel):
    """Business readiness requirement, license, statutory clearance, or document item."""

    model_config = ConfigDict(from_attributes=True)

    id: Optional[int] = None
    business_id: int = 1
    requirement_id: str = Field(..., description="Unique code e.g. req_capital, req_udyam, req_fssai")
    name: str = Field(..., description="Human-readable requirement title")
    category: str = Field(
        ...,
        description="Category: Capital, Registration, Permission, License, Document, Infrastructure, Operations",
    )
    required: bool = True
    status: str = Field(
        "pending",
        description="Status: pending, in_progress, submitted, verified, completed, not_applicable",
    )
    reason: str = Field(..., description="Why this requirement applies to this business")
    source: str = Field(..., description="Statutory or regulatory authority source")
    linked_action_task_id: Optional[int] = None
    document_type: Optional[str] = None
    submission_status: Optional[str] = "pending"
    verification_status: Optional[str] = "unverified"
    notes: Optional[str] = None
    updated_at: Optional[datetime] = None


class RequirementUpdateSchema(BaseModel):
    """Payload for updating a business requirement or document status."""

    status: Optional[str] = Field(
        None,
        description="New status: pending, in_progress, submitted, verified, completed, not_applicable",
    )
    submission_status: Optional[str] = None
    verification_status: Optional[str] = None
    notes: Optional[str] = None


class CategoryReadinessSchema(BaseModel):
    """Readiness metrics for a specific operational or statutory category."""

    category: str
    total_required: int
    completed: int
    in_progress: int
    pending: int
    score_pct: float


class BusinessReadinessResponse(BaseModel):
    """Authoritative Business Readiness Evaluation computed deterministically."""

    business_id: int
    business_name: str
    business_category: str
    business_stage: str
    readiness_score: float = Field(..., description="Calculated readiness percentage (0.0 to 100.0)")
    readiness_label: str = Field(..., description="Human-friendly readiness badge e.g. '75% Prepared'")
    status_label: str = Field(..., description="Early Stage, In Progress, Launch Ready, etc.")
    total_requirements: int
    completed_requirements: int
    in_progress_requirements: int
    pending_requirements: int
    category_breakdown: Dict[str, CategoryReadinessSchema]
    pending_critical_requirements: List[str] = Field(default_factory=list)
    completed_requirements_list: List[str] = Field(default_factory=list)
    requirements: List[BusinessRequirementSchema] = Field(default_factory=list)
    action_plan_progress_pct: float = 0.0
    summary: str
    traceability: TraceabilityMetadata
