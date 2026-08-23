"""Project Cost Engine for VITTANAYA (SIH26091).

Lookup indicative project costs from official Odisha-first library enforcing
strict provenance hierarchy:
1. ODISHA_DISTRICT_PRIMARY (NABARD district PLP unit costs)
2. ODISHA_OBSERVED_PRIMARY (Observed Odisha PMEGP project claims)
3. INDIA_OFFICIAL_FALLBACK (KVIC / PMEGP national model profiles)

Never invent project costs.
"""

from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from backend.app.models.insights import ProjectCostReference
from backend.app.schemas.insights import ProjectCostResponse, TraceabilityMetadata

PRIORITY_ORDER = [
    "ODISHA_DISTRICT_PRIMARY",
    "ODISHA_OBSERVED_PRIMARY",
    "INDIA_OFFICIAL_FALLBACK",
]


class ProjectCostEngine:
    """Deterministic Odisha-first Project Cost Engine."""

    def __init__(self, db: Session):
        self.db = db

    def get_indicative_cost(
        self,
        business_activity: str,
        business_category: Optional[str] = None,
        location: str = "Odisha",
        scale: Optional[str] = None,
    ) -> ProjectCostResponse:
        """Lookup project cost from official reference database using strict priority rules."""
        query = self.db.query(ProjectCostReference)

        # Step 1: Search exact activity match
        exact_matches = query.filter(
            ProjectCostReference.business_activity.ilike(business_activity.strip())
        ).all()

        match = self._pick_best_match(exact_matches, scale)

        # Step 2: Partial activity match
        if not match:
            partial_matches = query.filter(
                ProjectCostReference.business_activity.ilike(f"%{business_activity.strip()}%")
            ).all()
            match = self._pick_best_match(partial_matches, scale)

        # Step 3: Category match fallback if category provided
        if not match and business_category:
            category_matches = query.filter(
                ProjectCostReference.category.ilike(f"%{business_category.strip()}%")
            ).all()
            match = self._pick_best_match(category_matches, scale)

        # If still no match, raise error (Never invent costs)
        if not match:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    f"Data insufficient: No verified reference cost found for business activity '{business_activity}'. "
                    "VITTANAYA strictly prohibits inventing project cost figures."
                ),
            )

        min_cost = match.reference_cost_min_inr
        max_cost = match.reference_cost_max_inr
        indicative_cost = (min_cost + max_cost) / 2.0

        traceability = TraceabilityMetadata(
            input={
                "business_activity": business_activity,
                "business_category": business_category,
                "location": location,
                "scale": scale,
            },
            calculation_rule=(
                f"Midpoint calculation: ({min_cost:.2f} + {max_cost:.2f}) / 2 = {indicative_cost:.2f} INR "
                f"based on {match.provenance_priority} priority match."
            ),
            source_authority=match.source_authority,
            source_year=match.source_year,
            provenance_priority=match.provenance_priority,
            official_source_url=match.official_source_url,
        )

        return ProjectCostResponse(
            indicative_project_cost=indicative_cost,
            reference_cost_min_inr=min_cost,
            reference_cost_max_inr=max_cost,
            scale_or_specification=match.scale_or_specification,
            unit=match.unit,
            cost_basis=match.cost_basis,
            source_authority=match.source_authority,
            source_year=match.source_year,
            provenance_priority=match.provenance_priority,
            official_source_url=match.official_source_url,
            notes=match.notes,
            traceability=traceability,
        )

    def _pick_best_match(
        self, matches: list[ProjectCostReference], scale: Optional[str]
    ) -> Optional[ProjectCostReference]:
        """Pick best record sorting by provenance priority and scale match."""
        if not matches:
            return None

        # Helper priority index
        def priority_rank(rec: ProjectCostReference) -> int:
            p = rec.provenance_priority.strip()
            if p in PRIORITY_ORDER:
                return PRIORITY_ORDER.index(p)
            return 99

        # Group by priority rank
        sorted_matches = sorted(matches, key=priority_rank)

        # If scale specified, try matching scale within highest priority group available
        if scale:
            scale_lower = scale.strip().lower()
            for rec in sorted_matches:
                if scale_lower in rec.scale_or_specification.lower():
                    return rec

        # Fall back to top priority match
        return sorted_matches[0]
