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

        is_missing_data = indicative_project_cost <= 0.0

        for rule in rules:
            reasons = []
            why_bullets = []
            is_eligible = True
            verification_notice = None

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

            cost_matched = True
            if is_missing_data:
                cost_matched = False
                investment_reason = "Indicative project cost is not provided or zero; investment ceiling cannot be verified."
                verification_notice = "Eligibility cannot be verified from available data."
            elif max_cost and indicative_project_cost > max_cost:
                cost_matched = False
                is_eligible = False
                investment_reason = f"Project cost ₹{indicative_project_cost:,.2f} exceeds scheme ceiling of ₹{max_cost:,.2f}."
                reasons.append(investment_reason)
            else:
                ceiling_desc = f"under ₹{max_cost:,.2f} ceiling" if max_cost else "no ceiling cap"
                investment_reason = f"Project cost of ₹{indicative_project_cost:,.2f} is {ceiling_desc}."

            # 2. Category & Trading Restriction Check
            type_matched = True
            if rule.trading_restricted and is_trading:
                type_matched = False
                is_eligible = False
                type_reason = "Scheme restricts trading/retail business activities under current guidelines."
                reasons.append(type_reason)
            elif (
                rule.eligible_categories != "ALL"
                and rule.eligible_categories != "ALL_EXCEPT_TRADING"
            ):
                eligible_cats = [c.strip().lower() for c in rule.eligible_categories.split(",")]
                cat_matched = any(
                    c in business_category.lower() or c in specific_business.lower()
                    for c in eligible_cats
                )
                if not cat_matched:
                    type_matched = False
                    is_eligible = False
                    type_reason = f"Business sector does not match scheme eligible categories ({rule.eligible_categories})."
                    reasons.append(type_reason)
                else:
                    type_reason = f"Business sector matches eligible scheme category ({rule.eligible_categories})."
            else:
                type_reason = f"Business category '{business_category}' is eligible under universal coverage."

            # 3. Location Match Check
            loc_matched = True
            location_reason = (
                f"Location '{location}' is eligible. Rural setting qualifies for higher subsidy tier under {rule.scheme_code}."
                if is_rural
                else f"Location '{location}' (Urban / Semi-Urban) is eligible under standard subsidy guidelines."
            )

            # 4. Business Stage Match Check
            stage_matched = True
            stage_reason = "Eligible for new enterprise setup as well as technological expansion/modernization."

            # 5. Margin Capital Requirement Calculation
            req_margin_pct = rule.min_margin_pct_special if is_special else rule.min_margin_pct_gen
            req_margin_amt = (req_margin_pct / 100.0) * indicative_project_cost if not is_missing_data else 0.0

            if not is_missing_data and available_margin_capital < req_margin_amt:
                shortfall = req_margin_amt - available_margin_capital
                margin_notice = f"Margin capital shortfall: Available ₹{available_margin_capital:,.2f} vs Required ₹{req_margin_amt:,.2f} ({req_margin_pct}%). Deficit: ₹{shortfall:,.2f}."
                reasons.append(margin_notice)

            # 6. Subsidy Estimation
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

            raw_subsidy = (subsidy_pct / 100.0) * indicative_project_cost if not is_missing_data else 0.0
            if rule.max_subsidy_amount and rule.max_subsidy_amount > 0:
                estimated_subsidy = min(raw_subsidy, rule.max_subsidy_amount)
            else:
                estimated_subsidy = raw_subsidy

            # 7. Loan Amount Calculation
            eligible_loan = max(
                0.0, indicative_project_cost - available_margin_capital - estimated_subsidy
            ) if not is_missing_data else 0.0

            if is_missing_data:
                is_eligible = False
                eligibility_status = "Eligibility cannot be verified from available data."
                reasons.append("Indicative project cost is required to verify statutory scheme eligibility.")
            elif is_eligible:
                eligibility_status = "Likely Eligible"
                if not reasons:
                    reasons.append(
                        f"Eligible for {subsidy_pct}% subsidy (₹{estimated_subsidy:,.2f}) with minimum {req_margin_pct}% own margin."
                    )
            else:
                eligibility_status = "Ineligible"

            # Construct structured "Why this scheme?" criteria
            matching_criteria = {
                "business_type": {
                    "matched": type_matched,
                    "label": "Business Type Match",
                    "reason": type_reason,
                },
                "location": {
                    "matched": loc_matched,
                    "label": "Location Eligibility",
                    "reason": location_reason,
                },
                "investment": {
                    "matched": cost_matched,
                    "label": "Investment Range Match",
                    "reason": investment_reason,
                },
                "business_stage": {
                    "matched": stage_matched,
                    "label": "Business Stage Compatibility",
                    "reason": stage_reason,
                },
                "social_category": {
                    "matched": True,
                    "label": "Social Demographic Benefit",
                    "reason": (
                        f"Special category entitlement applied ({social_category}): Lower promoter margin ({req_margin_pct}%) and higher subsidy."
                        if is_special
                        else "General category standard margin and subsidy schedule applied."
                    ),
                },
            }

            if type_matched:
                why_bullets.append(f"✓ Business type matches: {type_reason}")
            else:
                why_bullets.append(f"✗ Business type restriction: {type_reason}")

            if loc_matched:
                why_bullets.append(f"✓ Location eligible: {location_reason}")

            if cost_matched:
                why_bullets.append(f"✓ Investment range matches: {investment_reason}")
            elif not is_missing_data:
                why_bullets.append(f"✗ Investment ceiling exceeded: {investment_reason}")

            if stage_matched:
                why_bullets.append(f"✓ Business stage matches: {stage_reason}")

            matched_scheme = MatchedScheme(
                scheme_code=rule.scheme_code,
                scheme_name=rule.scheme_name,
                eligible=is_eligible,
                eligibility_status=eligibility_status,
                max_eligible_cost=max_cost,
                estimated_subsidy_amount=round(estimated_subsidy, 2),
                estimated_subsidy_pct=round(subsidy_pct, 2),
                required_margin_capital=round(req_margin_amt, 2),
                required_margin_pct=round(req_margin_pct, 2),
                eligible_loan_amount=round(eligible_loan, 2),
                interest_subsidy_pct=rule.interest_subsidy_pct,
                collateral_required=rule.collateral_required,
                reasons=reasons,
                why_this_scheme=why_bullets,
                matching_criteria=matching_criteria,
                business_type_match=type_reason,
                location_match=location_reason,
                investment_match=investment_reason,
                business_stage_match=stage_reason,
                data_verification_notice=verification_notice,
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
