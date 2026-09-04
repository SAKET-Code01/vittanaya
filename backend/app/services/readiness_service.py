"""Business Readiness Service for VITTANAYA (SIH26091).

Computes authoritative, non-hardcoded business execution readiness from live
requirements and statutory verification records. Provides bidirectional sync with Action Plan tasks.
"""

from typing import Dict, Optional

from sqlalchemy.orm import Session

from backend.app.models.action_plan import ActionPlanTask
from backend.app.models.business import Business
from backend.app.models.business_requirement import BusinessRequirement
from backend.app.schemas.insights import TraceabilityMetadata
from backend.app.schemas.readiness import (
    BusinessReadinessResponse,
    BusinessRequirementSchema,
    CategoryReadinessSchema,
)
from backend.app.services.requirement_resolver_service import RequirementResolverService


class ReadinessService:
    """Centralized service for evaluating and updating business execution readiness."""

    def __init__(self, db: Session):
        self.db = db
        self.resolver = RequirementResolverService(db)

    def evaluate_readiness(self, business_id: int) -> Optional[BusinessReadinessResponse]:
        """Compute live business readiness score from actual requirements and completion states."""
        business = self.db.query(Business).filter(Business.id == business_id).first()
        if not business:
            return None

        # 1. Resolve requirements (ensuring business-specific tailoring)
        all_reqs = self.resolver.resolve_requirements(business)

        # 2. Filter applicable requirements
        applicable = [r for r in all_reqs if r.required and r.status != "not_applicable"]
        if not applicable:
            applicable = all_reqs

        completed = [r for r in applicable if r.status in ["completed", "verified"]]
        in_progress = [r for r in applicable if r.status in ["in_progress", "submitted"]]
        pending = [r for r in applicable if r.status == "pending"]

        total_count = len(applicable)
        completed_count = len(completed)
        in_progress_count = len(in_progress)
        pending_count = len(pending)

        # 3. Deterministic calculation: completed = 100%, in_progress = 50%
        if total_count > 0:
            score = round(((completed_count * 1.0 + in_progress_count * 0.5) / total_count) * 100.0, 1)
        else:
            score = 0.0

        # Bound strictly [0.0, 100.0]
        score = max(0.0, min(100.0, score))

        # 4. Determine status label
        if score >= 85.0:
            status_label = "Launch Ready"
        elif score >= 65.0:
            status_label = "High Readiness"
        elif score >= 40.0:
            status_label = "In Progress"
        else:
            status_label = "Early Stage"

        readiness_label = f"{score:.0f}% Prepared"

        # 5. Category-wise breakdown
        categories = ["Capital", "Registration", "Permission", "License", "Document", "Infrastructure", "Operations"]
        breakdown: Dict[str, CategoryReadinessSchema] = {}
        for cat in categories:
            cat_reqs = [r for r in applicable if r.category == cat]
            if not cat_reqs:
                # Check from all_reqs
                cat_reqs = [r for r in all_reqs if r.category == cat]
            c_comp = sum(1 for r in cat_reqs if r.status in ["completed", "verified"])
            c_prog = sum(1 for r in cat_reqs if r.status in ["in_progress", "submitted"])
            c_pend = sum(1 for r in cat_reqs if r.status == "pending")
            c_tot = len(cat_reqs)
            c_score = round(((c_comp * 1.0 + c_prog * 0.5) / c_tot * 100.0), 1) if c_tot > 0 else 100.0
            breakdown[cat] = CategoryReadinessSchema(
                category=cat,
                total_required=c_tot,
                completed=c_comp,
                in_progress=c_prog,
                pending=c_pend,
                score_pct=c_score,
            )

        # 6. Action Plan Progress
        action_tasks = self.db.query(ActionPlanTask).filter(ActionPlanTask.business_id == business_id).all()
        completed_tasks = sum(1 for t in action_tasks if t.status == "completed")
        total_tasks = len(action_tasks)
        action_plan_pct = round((completed_tasks / total_tasks * 100.0), 1) if total_tasks > 0 else 0.0

        # Critical pending requirements preview
        critical_pending = [r.name for r in pending[:4]]
        completed_list = [r.name for r in completed]

        summary = (
            f"Business readiness for {business.name} is {score:.1f}% ({status_label}). "
            f"{completed_count} of {total_count} required execution gates verified, "
            f"with {pending_count} pending statutory, capital, or infrastructure clearance items."
        )

        traceability = TraceabilityMetadata(
            input={
                "business_id": business_id,
                "business_category": business.category or business.type,
                "business_stage": business.stage,
                "total_applicable_requirements": total_count,
                "completed_count": completed_count,
                "in_progress_count": in_progress_count,
                "pending_count": pending_count,
            },
            calculation_rule=(
                "Readiness Score = ((Completed [1.0] + In_Progress [0.5]) / Total Applicable Requirements) * 100%. "
                "Non-applicable statutory gates excluded from denominator."
            ),
            source_authority="VITTANAYA Business Readiness Engine (SIH26091)",
            source_year="2026",
            provenance_priority="DETERMINISTIC_CALCULATION",
            official_source_url=None,
        )

        return BusinessReadinessResponse(
            business_id=business.id,
            business_name=business.name,
            business_category=business.category or business.type or "General",
            business_stage=business.stage or "established",
            readiness_score=score,
            readiness_label=readiness_label,
            status_label=status_label,
            total_requirements=total_count,
            completed_requirements=completed_count,
            in_progress_requirements=in_progress_count,
            pending_requirements=pending_count,
            category_breakdown=breakdown,
            pending_critical_requirements=critical_pending,
            completed_requirements_list=completed_list,
            requirements=[BusinessRequirementSchema.model_validate(r) for r in all_reqs],
            action_plan_progress_pct=action_plan_pct,
            summary=summary,
            traceability=traceability,
        )

    def update_requirement_status(
        self,
        business_id: int,
        requirement_id: str,
        new_status: str,
        submission_status: Optional[str] = None,
        verification_status: Optional[str] = None,
        notes: Optional[str] = None,
    ) -> Optional[BusinessRequirement]:
        """Update status of a requirement and synchronize with any linked Action Plan tasks."""
        req = (
            self.db.query(BusinessRequirement)
            .filter(
                BusinessRequirement.business_id == business_id,
                BusinessRequirement.requirement_id == requirement_id,
            )
            .first()
        )
        if not req:
            return None

        req.status = new_status
        if submission_status is not None:
            req.submission_status = submission_status
        if verification_status is not None:
            req.verification_status = verification_status
        if notes is not None:
            req.notes = notes

        # Synchronize linked ActionPlanTask if exists
        task = (
            self.db.query(ActionPlanTask)
            .filter(
                ActionPlanTask.business_id == business_id,
                ActionPlanTask.linked_requirement_id == requirement_id,
            )
            .first()
        )
        if task:
            if new_status in ["completed", "verified"]:
                task.status = "completed"
            elif new_status in ["in_progress", "submitted"]:
                task.status = "in_progress"
            elif new_status == "pending":
                task.status = "pending"

        self.db.commit()
        self.db.refresh(req)
        return req

    def sync_from_action_task(self, task_id: int, new_status: str) -> Optional[BusinessRequirement]:
        """When an Action Plan task status changes, synchronize linked requirement and recalculate readiness."""
        task = self.db.query(ActionPlanTask).filter(ActionPlanTask.id == task_id).first()
        if not task or not task.linked_requirement_id:
            return None

        req = (
            self.db.query(BusinessRequirement)
            .filter(
                BusinessRequirement.business_id == task.business_id,
                BusinessRequirement.requirement_id == task.linked_requirement_id,
            )
            .first()
        )
        if not req:
            return None

        if new_status == "completed":
            req.status = "completed"
            req.verification_status = "verified"
            req.submission_status = "verified"
        elif new_status == "in_progress":
            req.status = "in_progress"
            req.submission_status = "submitted"
        elif new_status == "pending":
            req.status = "pending"
            req.verification_status = "unverified"

        self.db.commit()
        self.db.refresh(req)
        return req
