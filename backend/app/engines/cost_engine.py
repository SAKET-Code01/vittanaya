"""Project Cost Engine for VITTANAYA (SIH26091).

Lookup indicative project costs from official Odisha-first library enforcing
strict provenance hierarchy:
1. ODISHA_DISTRICT_PRIMARY (NABARD district PLP unit costs)
2. ODISHA_OBSERVED_PRIMARY (Observed Odisha PMEGP project claims)
3. INDIA_OFFICIAL_FALLBACK (KVIC / PMEGP national model profiles)

Never invent project costs.
"""

import re
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from backend.app.models.business import Business
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
        business_name: Optional[str] = None,
        business_id: Optional[int] = None,
    ) -> ProjectCostResponse:
        """Lookup project cost from official reference database using strict priority rules."""
        query = self.db.query(ProjectCostReference)

        # Step 0: Disambiguate trade name vs business activity
        db_biz = None
        if business_id:
            db_biz = self.db.query(Business).filter(Business.id == business_id).first()
        elif business_activity:
            db_biz = self.db.query(Business).filter(Business.name.ilike(business_activity.strip())).first()

        if db_biz:
            if not business_category or business_category.lower() in ("general", "retail"):
                business_category = db_biz.category or db_biz.type or business_category
            if (
                not business_activity
                or business_activity.strip().lower() == db_biz.name.strip().lower()
                or business_activity.strip().lower() in ("general enterprise", "enterprise", "retail")
            ):
                business_activity = db_biz.industry or db_biz.category or business_activity

        clean_activity = business_activity.strip()
        all_refs = query.all()
        match = None

        # Step 1: Search exact activity match
        exact_matches = query.filter(
            ProjectCostReference.business_activity.ilike(clean_activity)
        ).all()
        match = self._pick_best_match(exact_matches, scale)

        # Step 2: Partial activity match (bidirectional substring)
        if not match:
            partial_matches = query.filter(
                ProjectCostReference.business_activity.ilike(f"%{clean_activity}%")
            ).all()
            match = self._pick_best_match(partial_matches, scale)

        if not match:
            reverse_matches = [
                ref for ref in all_refs
                if len(ref.business_activity) >= 4 and ref.business_activity.lower() in clean_activity.lower()
            ]
            match = self._pick_best_match(reverse_matches, scale)

        # Step 3: Meaningful token matching on activity
        if not match:
            stop_words = {
                "mills", "unit", "agro", "enterprise", "enterprises", "pvt", "ltd",
                "production", "works", "services", "center", "centre", "trading", "retail",
            }
            tokens = [
                t.lower()
                for t in re.findall(r"[a-zA-Z]{4,}", clean_activity)
                if t.lower() not in stop_words
            ]
            for t in tokens:
                token_matches = [
                    ref for ref in all_refs
                    if t in ref.business_activity.lower() or t in (ref.category or "").lower()
                ]
                match = self._pick_best_match(token_matches, scale)
                if match:
                    break

        # Step 4: Category match fallback (including delimited tokens)
        if not match and business_category:
            category_matches = query.filter(
                ProjectCostReference.category.ilike(f"%{business_category.strip()}%")
            ).all()
            match = self._pick_best_match(category_matches, scale)

            if not match:
                cat_tokens = [
                    t.lower()
                    for t in re.findall(r"[a-zA-Z]{4,}", business_category)
                    if t.lower() not in stop_words
                ]
                for ct in cat_tokens:
                    cat_token_matches = [
                        ref for ref in all_refs
                        if ct in (ref.category or "").lower() or ct in ref.business_activity.lower()
                    ]
                    match = self._pick_best_match(cat_token_matches, scale)
                    if match:
                        break

        # Step 5: User-saved baseline project cost if business has an authoritative saved baseline
        if not match and db_biz and db_biz.project_cost and float(db_biz.project_cost) > 0:
            saved_cost = float(db_biz.project_cost)
            traceability = TraceabilityMetadata(
                input={
                    "business_activity": business_activity,
                    "business_category": business_category,
                    "location": location,
                    "scale": scale,
                    "business_id": db_biz.id,
                },
                calculation_rule=(
                    f"Saved baseline project cost retrieved directly from verified database profile for '{db_biz.name}' (ID {db_biz.id})."
                ),
                source_authority="User Enterprise Profile Baseline",
                source_year=str(db_biz.financial_year or "2026"),
                provenance_priority="USER_PROFILE_BASELINE",
                official_source_url=None,
            )
            return ProjectCostResponse(
                indicative_project_cost=saved_cost,
                reference_cost_min_inr=saved_cost,
                reference_cost_max_inr=saved_cost,
                scale_or_specification=f"{db_biz.stage.capitalize() if db_biz.stage else 'Micro'} Unit",
                unit="Unit",
                cost_basis="Saved verified enterprise baseline project cost",
                source_authority="User Enterprise Profile Baseline",
                source_year=str(db_biz.financial_year or "2026"),
                provenance_priority="USER_PROFILE_BASELINE",
                official_source_url=None,
                notes="Grounded on saved business profile",
                traceability=traceability,
            )

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
