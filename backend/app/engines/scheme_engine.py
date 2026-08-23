"""Scheme Match Engine for VITTANAYA (SIH26091).

Matches government credit & subsidy schemes using explicit deterministic rules.
Stores source/year for every scheme rule and never invents eligibility.
"""

from typing import List

from sqlalchemy.orm import Session

from backend.app.models.insights import SchemeRule
from backend.app.schemas.insights import MatchedScheme, SchemeMatchResponse, TraceabilityMetadata

SPECIAL_CATEGORIES = {"SC", "ST", "OBC", "WOMEN", "EX-SERVICEMEN", "PH", "MINORITY"}


class SchemeEngine:
    """Deterministic Government Scheme Matching Engine."""

    def __init__(self, db: Session):
        self.db = db

    def match_schemes(
        self,
        indicative_project_cost: float,
        available_margin_capital: float,
        business_category: str,
        specific_business: str,
        location: str = "Odisha",
        social_category: str = "General",
        area_type: str = "Rural",
    ) -> SchemeMatchResponse:
        """Evaluate project against all structured scheme rules."""
        rules: List[SchemeRule] = self.db.query(SchemeRule).all()

        eligible_list: List[MatchedScheme] = []
        ineligible_list: List[MatchedScheme] = []

        is_special = social_category.strip().upper() in SPECIAL_CATEGORIES
        is_rural = area_type.strip().lower() == "rural"

        is_trading = any(
            t in business_category.lower() or t in specific_business.lower()
            for t in ["retail", "trading", "shop", "store", "dealer", "trader"]
        )

        for rule in rules:
            reasons = []
            is_eligible = True

            # 1. Project Cost Limit Check
            is_mfg = any(
                m in business_category.lower() or m in specific_business.lower()
                for m in [
                    "manufacturing",
                    "processing",
                    "production",
                    "making",
                    "fabrication",
                    "agri",
                    "poultry",
                    "dairy",
                    "fisheries",
                ]
            )
            max_cost = rule.max_project_cost_mfg if is_mfg else rule.max_project_cost_service

            if max_cost and indicative_project_cost > max_cost:
                is_eligible = False
                reasons.append(
                    f"Project cost ₹{indicative_project_cost:,.2f} exceeds scheme ceiling of ₹{max_cost:,.2f}."
                )

            # 2. Category & Trading Restriction Check
            if rule.trading_restricted and is_trading:
                is_eligible = False
                reasons.append(
                    "Scheme restricts trading/retail business activities under current guidelines."
                )

            if (
                rule.eligible_categories != "ALL"
                and rule.eligible_categories != "ALL_EXCEPT_TRADING"
            ):
                eligible_cats = [c.strip().lower() for c in rule.eligible_categories.split(",")]
                cat_matched = any(
                    c in business_category.lower() or c in specific_business.lower()
                    for c in eligible_cats
                )
                if not cat_matched:
                    is_eligible = False
                    reasons.append(
                        f"Business type does not match scheme eligible sectors ({rule.eligible_categories})."
                    )

            # 3. Margin Capital Requirement Calculation
            req_margin_pct = rule.min_margin_pct_special if is_special else rule.min_margin_pct_gen
            req_margin_amt = (req_margin_pct / 100.0) * indicative_project_cost

            if available_margin_capital < req_margin_amt:
                shortfall = req_margin_amt - available_margin_capital
                reasons.append(
                    f"Margin capital shortfall: Available ₹{available_margin_capital:,.2f} vs Required ₹{req_margin_amt:,.2f} ({req_margin_pct}%). Deficit: ₹{shortfall:,.2f}."
                )
                # Note: Margin shortfall does not strictly disqualify scheme if borrower can raise margin, but flagged in reasons

            # 4. Subsidy Estimation
            if is_rural:
                subsidy_pct = (
                    rule.max_subsidy_pct_rural_special
                    if is_special
                    else rule.max_subsidy_pct_rural_gen
                )
            else:
                subsidy_pct = (
                    rule.max_subsidy_pct_urban_special
                    if is_special
                    else rule.max_subsidy_pct_urban_gen
                )

            raw_subsidy = (subsidy_pct / 100.0) * indicative_project_cost
            if rule.max_subsidy_amount and rule.max_subsidy_amount > 0:
                estimated_subsidy = min(raw_subsidy, rule.max_subsidy_amount)
            else:
                estimated_subsidy = raw_subsidy

            # 5. Loan Amount Calculation
            eligible_loan = max(
                0.0, indicative_project_cost - available_margin_capital - estimated_subsidy
            )

            if is_eligible and not reasons:
                reasons.append(
                    f"Eligible for {subsidy_pct}% subsidy (₹{estimated_subsidy:,.2f}) with minimum {req_margin_pct}% own margin."
                )

            matched_scheme = MatchedScheme(
                scheme_code=rule.scheme_code,
                scheme_name=rule.scheme_name,
                eligible=is_eligible,
                max_eligible_cost=max_cost,
                estimated_subsidy_amount=round(estimated_subsidy, 2),
                estimated_subsidy_pct=round(subsidy_pct, 2),
                required_margin_capital=round(req_margin_amt, 2),
                required_margin_pct=round(req_margin_pct, 2),
                eligible_loan_amount=round(eligible_loan, 2),
                interest_subsidy_pct=rule.interest_subsidy_pct,
                collateral_required=rule.collateral_required,
                reasons=reasons,
                source_authority=rule.source_authority,
                source_year=rule.source_year,
                official_source_url=rule.official_source_url,
            )

            if is_eligible:
                eligible_list.append(matched_scheme)
            else:
                ineligible_list.append(matched_scheme)

        # Pick best recommendation (sort eligible schemes by estimated subsidy descending, then loan amount)
        eligible_list.sort(
            key=lambda s: (s.estimated_subsidy_amount, s.interest_subsidy_pct), reverse=True
        )
        best_rec = eligible_list[0] if eligible_list else None

        traceability = TraceabilityMetadata(
            input={
                "indicative_project_cost": indicative_project_cost,
                "available_margin_capital": available_margin_capital,
                "business_category": business_category,
                "specific_business": specific_business,
                "location": location,
                "social_category": social_category,
                "area_type": area_type,
            },
            calculation_rule=(
                f"Evaluated {len(rules)} structured scheme rules. "
                f"Social Category={social_category} (Special={is_special}), Area={area_type} (Rural={is_rural})."
            ),
            source_authority=best_rec.source_authority
            if best_rec
            else "Official Scheme Guidelines Repository",
            source_year=best_rec.source_year if best_rec else "2023-2024",
            official_source_url=best_rec.official_source_url if best_rec else None,
        )

        return SchemeMatchResponse(
            eligible_schemes=eligible_list,
            ineligible_schemes=ineligible_list,
            best_recommendation=best_rec,
            traceability=traceability,
        )
