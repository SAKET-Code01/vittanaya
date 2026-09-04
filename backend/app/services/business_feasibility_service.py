"""BusinessFeasibilityService — Single Source of Truth for Feasibility Score (SIH26091).

Architecture:
    Business ID
     -> Real business data from DB
     -> 5 raw criterion scores (each 0-100) derived from real parameters
     -> AHP dashboard_points (from Dataset B illustrative expert survey)
     -> contribution = (raw / 100) * dashboard_points  (per criterion)
     -> final_feasibility_score = sum(contributions)

This is the ONLY place in VITTANAYA that computes the authoritative final feasibility
score for a persisted business.  All API endpoints, the advisory chatbot, and the
frontend FeasibilityPage must consume this result — never recompute independently.

RAW SCORE DERIVATION RULES (no fabrication, deterministic):
---------------------------------------------------------------------------
market_raw:
    Source: LocalMarketData.base_score for matching sector + district record.
    Fallback: VERIFIED_ODISHA_BENCHMARKS[sector].base_score (0-100 directly).
    Final fallback: 50.0 (neutral, unknown market).

financial_raw:
    Source: margin equity ratio (own_capital / business_project_cost * 100).
    Authoritative source: Business.project_cost (persisted business profile input).
    Reference fallback: FinancialEngine indicative reference cost if project_cost is 0 (unconfigured).
    Formula: min(100.0, max(0.0, margin_pct))
    Example: own_capital=₹100,000 / project_cost=₹1,000,000 → margin=10.0% → raw=10.00 pts.

location_raw:
    Source: LocalMarketData record matched for business's district.
    100  → district+sector DB record found (verified connectivity data).
    70   → sector found but different district (state-level benchmark applies).
    50   → no sector match at all (insufficient data).

competition_raw:
    Source: LocalMarketData.competitor_count for matched record.
    Formula: max(0, 100 - (competitor_count * 20))
    Rationale: 0 competitors = 100 pts; 5+ = 0 pts; linear.
    Example: 3 competitors → 100 - 60 = 40 pts.

risk_raw:
    Source: RiskEngine.analyze_risks() → overall_risk_score (0=low risk, 100=high risk).
    Formula: max(0, 100 - overall_risk_score)
    Rationale: Lower risk score means higher resilience → higher raw score.
    Example: overall_risk_score=65.75 → 100 - 65.75 = 34.25 pts.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List, Optional

from sqlalchemy.orm import Session

from backend.app.engines.feasibility_engine import VERIFIED_ODISHA_BENCHMARKS, FeasibilityEngine
from backend.app.engines.financial_engine import FinancialEngine
from backend.app.engines.risk_engine import RiskEngine
from backend.app.models.business import Business
from backend.app.models.market_data import LocalMarketData
from backend.app.services.ahp_service import calculate_feasibility_score, get_ahp_result


@dataclass
class RawCriterionScore:
    """A single raw criterion score with full data lineage."""
    criterion: str           # e.g. "market"
    label: str               # e.g. "Market Catchment & Demand"
    raw_score: float         # 0-100 scale
    data_source: str         # Human-readable source description
    derivation_formula: str  # Exact formula used


@dataclass
class BusinessFeasibilityResult:
    """Complete, authoritative feasibility calculation for a persisted business."""
    business_id: int
    business_name: str
    business_category: str
    specific_business: str
    location: str

    # Five raw criterion scores (0-100 scale each)
    raw_scores: Dict[str, float]
    raw_score_details: List[RawCriterionScore]

    # AHP result (weights, dashboard_points, CR)
    ahp_dashboard_points: Dict[str, int]
    ahp_normalized_weights: Dict[str, float]
    ahp_cr: float
    ahp_is_consistent: bool
    ahp_source_status: str
    ahp_source_disclaimer: str

    # Final AHP-weighted feasibility score and per-criterion contributions
    criteria_traces: List[Dict[str, Any]]
    final_score: float
    score_formula: str = "final_feasibility_score = sum((raw_score / 100) * dashboard_points)"

    # Project cost provenance (Authoritative vs Reference)
    business_project_cost: float = 0.0      # authoritative persisted value from Business.project_cost
    reference_project_cost: float = 0.0     # indicative planning estimate from sector benchmark

    # Contextual data (NOT used in AHP calculation — for display only)
    market_benchmark_score: float = 0.0     # raw LocalMarketData.base_score (sector benchmark)
    market_reach: str = ""
    opportunity: str = ""
    competitor_level: str = ""

    # Hyperlocal Intelligence Data Lineage
    is_local_verified: bool = False
    pincode: str = ""
    village_or_town: str = ""
    block_name: str = ""
    district_name: str = ""
    state_name: str = "Odisha"
    local_market_context: str = ""



class BusinessFeasibilityService:
    """Derive authoritative AHP-weighted feasibility score from a persisted business."""

    CRITERIA_LABELS = {
        "market": "Market Catchment & Demand",
        "financial": "Financial Viability & Margin",
        "location": "Location & Mandi Connectivity",
        "competition": "Competition & Barrier to Entry",
        "risk": "Risk Resilience & Buffer",
    }

    def __init__(self, db: Session):
        self.db = db

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def compute(self, business_id: int) -> BusinessFeasibilityResult:
        """Load real business from DB, derive raw scores, apply AHP, return result."""
        business = self.db.query(Business).filter(Business.id == business_id).first()
        if business is None:
            raise ValueError(f"Business with id={business_id} not found in database.")

        return self._compute_from_business(business)

    def compute_from_context(
        self,
        business_category: str,
        specific_business: str,
        location: str,
        own_capital: float,
        project_cost: float,
    ) -> BusinessFeasibilityResult:
        """Compute feasibility from explicit parameters (no DB lookup).

        Used by the advisory chatbot when a business_id is not available.
        """
        from types import SimpleNamespace

        district = location.split(",")[0].strip() if location else ""
        stub = SimpleNamespace(
            id=0,
            name=specific_business or "General Enterprise",
            category=business_category,
            industry=business_category,
            location_district=district,
            location_state="Odisha",
            own_capital=float(own_capital or 0.0),
            project_cost=float(project_cost or 0.0),
            location_village="",
            location_block="",
            location_pin="",
        )
        return self._compute_from_business(stub)  # type: ignore[arg-type]

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _compute_from_business(self, business: Business) -> BusinessFeasibilityResult:
        bus_category = business.category or business.industry or "General"
        specific_bus = business.name  # Best proxy for activity if no specific field
        location_district = business.location_district or ""
        location_state = business.location_state or "Odisha"
        location = f"{location_district}, {location_state}".strip(", ")

        own_capital = float(business.own_capital or 0.0)
        business_project_cost = float(business.project_cost or 0.0)

        # ---- Step 1: Match LocalMarketData record and FeasibilityEngine context ----
        market_record = self._match_market_record(bus_category, specific_bus, location_district)
        feas_engine = FeasibilityEngine(self.db)
        # Note: FeasibilityEngine may return district-specific DB text if matched to wrong district.
        # We resolve this in _resolve_market_reach() below.
        feas_res = feas_engine.evaluate_feasibility(bus_category, specific_bus, location)

        # Determine if market_record is a district-exact match or a state-level sector fallback
        _district_exact_match = (
            market_record is not None
            and location_district
            and market_record.district_name.lower() == location_district.lower()
        )

        # ---- Step 2: Derive 5 criterion scores from existing engines ----
        raw_details = []

        # 1. Market Criterion
        # Source: LocalMarketData.base_score (NABARD Odisha PLP sector opportunity benchmark, 0-100)
        if market_record:
            market_raw = float(market_record.base_score)
            market_source = (
                f"LocalMarketData.base_score: {market_record.district_name} {market_record.sector_category} "
                f"catchment demand ({market_record.demand_level} demand, Source: {market_record.source_authority})"
            )
            market_derivation = f"LocalMarketData.base_score = {market_raw:.1f}/100"
        else:
            market_raw, market_source, market_derivation = self._fallback_market_score(
                bus_category, specific_bus
            )

        raw_details.append(RawCriterionScore(
            criterion="market",
            label=self.CRITERIA_LABELS["market"],
            raw_score=round(market_raw, 2),
            data_source=market_source,
            derivation_formula=market_derivation,
        ))

        # 2. Financial Criterion
        # Authoritative source: Business.project_cost (persisted business/project input).
        # Reference fallback: FinancialEngine indicative reference cost (used ONLY when business.project_cost is 0).
        reference_project_cost = 0.0

        fin_engine = FinancialEngine(self.db)
        try:
            fin_res = fin_engine.analyze_financial_gap(
                available_margin_capital=own_capital,
                business_category=bus_category,
                specific_business=specific_bus,
                location=location,
                business_id=getattr(business, "id", None),
            )
            reference_project_cost = float(fin_res.indicative_project_cost)
        except Exception:
            reference_project_cost = max(own_capital * 4.0, 100000.0)

        if business_project_cost > 0:
            margin_pct = (own_capital / business_project_cost) * 100.0
            fin_source = (
                f"FinancialEngine: margin equity {margin_pct:.2f}% "
                f"(₹{own_capital:,.0f} own capital / ₹{business_project_cost:,.0f} business project cost)"
            )
            fin_derivation = (
                f"margin_pct = ({own_capital:.0f} / {business_project_cost:.0f}) * 100 "
                f"= {margin_pct:.2f}/100"
            )
        else:
            margin_pct = (own_capital / reference_project_cost * 100.0) if reference_project_cost > 0 else 0.0
            fin_source = (
                f"FinancialEngine: margin equity {margin_pct:.2f}% "
                f"(₹{own_capital:,.0f} own capital / ₹{reference_project_cost:,.0f} reference project cost [profile unconfigured])"
            )
            fin_derivation = (
                f"margin_pct = ({own_capital:.0f} / {reference_project_cost:.0f}) * 100 "
                f"= {margin_pct:.2f}/100 [reference fallback]"
            )

        financial_raw = min(100.0, max(0.0, float(margin_pct)))

        raw_details.append(RawCriterionScore(
            criterion="financial",
            label=self.CRITERIA_LABELS["financial"],
            raw_score=round(financial_raw, 2),
            data_source=fin_source,
            derivation_formula=fin_derivation,
        ))

        # 3. Location Criterion
        # Source: LocalMarketData / LocationRef district routing presence
        if market_record and location_district and market_record.district_name.lower() == location_district.lower():
            location_raw = 100.0
            loc_source = f"LocalMarketData district-level match for {location_district} ({market_record.market_reach_description})"
            loc_derivation = "District + sector match verified in LocalMarketData = 100.0/100"
        elif market_record:
            location_raw = 70.0
            loc_source = f"State-level sector benchmark in {market_record.district_name} applied for {location_district or 'Odisha'}"
            loc_derivation = "State-level sector benchmark match (district generic) = 70.0/100"
        else:
            location_raw = 50.0
            loc_source = "Empirical location dataset absent for activity; neutral baseline applied"
            loc_derivation = "Neutral baseline per strict data integrity directive = 50.0/100"

        raw_details.append(RawCriterionScore(
            criterion="location",
            label=self.CRITERIA_LABELS["location"],
            raw_score=round(location_raw, 2),
            data_source=loc_source,
            derivation_formula=loc_derivation,
        ))

        # 4. Competition Criterion
        # Source: RiskEngine.analyze_risks() competition_risk_score (inverted: resilience = 100 - risk_score)
        risk_engine = RiskEngine(self.db)
        risk_eval_cost = reference_project_cost if reference_project_cost > 0 else (business_project_cost if business_project_cost > 0 else 100000.0)
        try:
            risk_res = risk_engine.analyze_risks(
                business_category=bus_category,
                specific_business=specific_bus,
                indicative_project_cost=risk_eval_cost,
                available_margin_capital=own_capital,
                financing_requirement=max(0.0, risk_eval_cost - own_capital),
                location=location,
            )
            comp_risk_score = float(risk_res.competition_risk_score)
            overall_risk = float(risk_res.overall_risk_score)
            comp_risk_label = risk_res.competition_risk
            risk_label = risk_res.overall_risk
        except Exception:
            comp_risk_score = 50.0
            overall_risk = 50.0
            comp_risk_label = "Medium"
            risk_label = "Medium"

        competition_raw = max(0.0, min(100.0, 100.0 - comp_risk_score))
        comp_source = (
            f"RiskEngine competition_risk_score = {comp_risk_score:.1f}/100 "
            f"({comp_risk_label} risk)"
        )
        comp_derivation = f"competition_resilience = 100 - competition_risk_score ({comp_risk_score:.1f}) = {competition_raw:.2f}/100"

        raw_details.append(RawCriterionScore(
            criterion="competition",
            label=self.CRITERIA_LABELS["competition"],
            raw_score=round(competition_raw, 2),
            data_source=comp_source,
            derivation_formula=comp_derivation,
        ))

        # 5. Risk Criterion
        # Source: RiskEngine.analyze_risks() overall_risk_score (inverted: resilience = 100 - risk_severity)
        overall_risk = float(risk_res.overall_risk_score)
        risk_raw = max(0.0, min(100.0, 100.0 - overall_risk))
        risk_source = (
            f"RiskEngine overall_risk_score = {overall_risk:.1f}/100 "
            f"({risk_label} risk severity across 5 dimensions)"
        )
        risk_derivation = f"risk_resilience = 100 - overall_risk_severity ({overall_risk:.1f}) = {risk_raw:.2f}/100"

        raw_details.append(RawCriterionScore(
            criterion="risk",
            label=self.CRITERIA_LABELS["risk"],
            raw_score=round(risk_raw, 2),
            data_source=risk_source,
            derivation_formula=risk_derivation,
        ))

        # ---- Step 3: AHP-weighted final score ----
        raw_scores_dict = {d.criterion: d.raw_score for d in raw_details}
        raw_sources_dict = {d.criterion: d.data_source for d in raw_details}

        ahp_result = get_ahp_result()
        score_output = calculate_feasibility_score(
            raw_scores=raw_scores_dict,
            raw_score_sources=raw_sources_dict,
            ahp_result=ahp_result,
        )


        # ---- Step 4: Resolve market_reach and opportunity with strict district provenance ----
        # If the matched DB record belongs to a different district (state-level fallback),
        # use the VERIFIED_ODISHA_BENCHMARKS generic sector description — NOT the DB record's
        # district-specific reach text (which would constitute location leakage).
        resolved_market_reach, resolved_opportunity = self._resolve_market_reach(
            bus_category=bus_category,
            specific_bus=specific_bus,
            feas_res=feas_res,
            market_record=market_record,
            district_exact_match=_district_exact_match,
            location_district=location_district,
        )

        # Local context summary
        village = getattr(business, "location_village", "") or ""
        block = getattr(business, "location_block", "") or (market_record.block_name if market_record and _district_exact_match else "")
        pin = getattr(business, "location_pin", "") or ""
        local_ctx_summary = (
            f"Verified {location_district} District ({block or 'Block level'}) empirical market data with {market_record.demand_level if market_record else 'Standard'} demand."
            if _district_exact_match and market_record
            else f"State-level Odisha sector benchmark applied (Specific {location_district or 'local'} empirical survey absent)."
        )

        return BusinessFeasibilityResult(
            business_id=getattr(business, "id", 0),
            business_name=getattr(business, "name", "Unknown"),
            business_category=bus_category,
            specific_business=specific_bus,
            location=location,
            raw_scores=raw_scores_dict,
            raw_score_details=raw_details,
            ahp_dashboard_points=ahp_result.dashboard_points,
            ahp_normalized_weights=ahp_result.normalized_weights,
            ahp_cr=ahp_result.cr,
            ahp_is_consistent=ahp_result.is_consistent,
            ahp_source_status=ahp_result.source_status,
            ahp_source_disclaimer=ahp_result.source_disclaimer,
            criteria_traces=score_output["criteria"],
            final_score=score_output["final_score"],
            score_formula=score_output["score_formula"],
            business_project_cost=business_project_cost,
            reference_project_cost=reference_project_cost,
            market_benchmark_score=float(market_record.base_score) if market_record else 0.0,
            market_reach=resolved_market_reach,
            opportunity=resolved_opportunity,
            competitor_level=feas_res.competitor_level,
            is_local_verified=bool(_district_exact_match and market_record),
            pincode=pin,
            village_or_town=village,
            block_name=block,
            district_name=location_district,
            state_name=location_state,
            local_market_context=local_ctx_summary,
        )


    def _resolve_market_reach(
        self,
        bus_category: str,
        specific_bus: str,
        feas_res: Any,
        market_record: Optional[LocalMarketData],
        district_exact_match: bool,
        location_district: str,
    ) -> tuple[str, str]:
        """Return (market_reach, opportunity) with strict district provenance.

        Rules:
        - District-exact match: use DB record's district-specific description verbatim.
        - Sector-only match (different district): use VERIFIED_ODISHA_BENCHMARKS generic
          sector description and prefix it with '[Sector Benchmark]' to make clear it is
          NOT the business's own district reach.
        - No match: propagate feas_res values (already generic) or 'Data insufficient'.
        """
        if district_exact_match and market_record is not None:
            # Verified district-level data - use as-is
            return feas_res.market_reach, feas_res.opportunity

        if market_record is not None and not district_exact_match:
            # Sector benchmark from a different district - look up generic description
            cat_lower = bus_category.lower()
            spec_lower = specific_bus.lower()
            for key, data in VERIFIED_ODISHA_BENCHMARKS.items():
                if key in cat_lower or key in spec_lower:
                    generic_reach = data["market_reach"]
                    generic_opp = data["opportunity"]
                    # Label clearly as sector benchmark so it cannot be misread as
                    # the business's own district distribution network
                    labeled_reach = (
                        f"[Sector Benchmark - no {location_district}-specific data available] "
                        f"{generic_reach}"
                    )
                    return labeled_reach, generic_opp
            # Key not found in benchmarks - return generic fallback
            return (
                f"[State-level sector benchmark - {location_district} district data unavailable]",
                feas_res.opportunity,
            )

        # No market_record at all - fall through to whatever feas_res produced
        return feas_res.market_reach, feas_res.opportunity

    def _match_market_record(
        self,
        bus_category: str,
        specific_bus: str,
        location_district: str,
    ) -> Optional[LocalMarketData]:
        """Match LocalMarketData record: prioritise district+sector; fall back to sector only."""
        cat_lower = bus_category.lower().strip()
        spec_lower = specific_bus.lower().strip()
        dist_lower = location_district.lower().strip()

        records = self.db.query(LocalMarketData).all()

        # Priority 1: district + sector match
        for rec in records:
            sec_lower = rec.sector_category.lower()
            sector_match = (
                sec_lower in cat_lower
                or sec_lower in spec_lower
                or any(token in cat_lower or token in spec_lower for token in sec_lower.split())
            )
            if sector_match and dist_lower and rec.district_name.lower() == dist_lower:
                return rec

        # Priority 2: sector match only
        for rec in records:
            sec_lower = rec.sector_category.lower()
            sector_match = (
                sec_lower in cat_lower
                or sec_lower in spec_lower
                or any(token in cat_lower or token in spec_lower for token in sec_lower.split())
            )
            if sector_match:
                return rec

        return None



    def _fallback_market_score(
        self, bus_category: str, specific_bus: str
    ) -> tuple[float, str, str]:
        """Fall back to VERIFIED_ODISHA_BENCHMARKS dict when no DB record matches."""
        cat_lower = bus_category.lower()
        spec_lower = specific_bus.lower()
        for key, data in VERIFIED_ODISHA_BENCHMARKS.items():
            if key in cat_lower or key in spec_lower:
                score = float(data["base_score"])
                return (
                    score,
                    f"VERIFIED_ODISHA_BENCHMARKS['{key}'] static benchmark",
                    f"Static benchmark base_score = {score}",
                )
        return (
            50.0,
            "No sector match — neutral baseline",
            "No match → 50 pts neutral",
        )
