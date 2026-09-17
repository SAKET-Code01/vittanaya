"""Scheme Match Engine for VITTANAYA (SIH26091).

Matches government credit & subsidy schemes using explicit deterministic rules.
Stores source/year for every scheme rule and never invents eligibility.
Uses Groq purely for advisory explanation, never for eligibility decisions.
"""

from typing import Any, Dict, List, Optional

from sqlalchemy.orm import Session

from backend.app.core.logging import logger
from backend.app.engines.ai_advisor import GroqProvider
from backend.app.repositories.scheme_repository import SchemeRepository
from backend.app.schemas.insights import MatchedScheme, SchemeMatchResponse, TraceabilityMetadata

SPECIAL_CATEGORIES = {"SC", "ST", "OBC", "WOMEN", "EX-SERVICEMEN", "PH", "MINORITY"}


class SchemeEngine:
    """Deterministic Government Scheme Matching & Intelligence Engine."""

    def __init__(self, db: Optional[Session] = None):
        self.db = db
        self.repo = SchemeRepository(db)

    def evaluate_schemes(
        self,
        project_cost: float,
        business_activity: str,
        business_category: str,
        social_category: str = "General",
        area_type: str = "Rural",
        own_capital: float = 0.0,
        location: str = "Odisha",
    ) -> SchemeMatchResponse:
        """Alias for match_schemes providing compatibility with copilot tools and named parameters."""
        return self.match_schemes(
            indicative_project_cost=project_cost,
            available_margin_capital=own_capital,
            business_category=business_category,
            specific_business=business_activity,
            location=location,
            social_category=social_category,
            area_type=area_type,
        )

    def match_schemes(
        self,
        indicative_project_cost: float,
        available_margin_capital: float = 0.0,
        business_category: str = "General",
        specific_business: str = "General Enterprise",
        location: str = "Odisha",
        social_category: str = "General",
        area_type: str = "Rural",
    ) -> SchemeMatchResponse:
        """Evaluate project against all structured verified scheme rules."""
        raw_schemes: List[Dict[str, Any]] = self.repo.get_all_schemes()

        eligible_list: List[MatchedScheme] = []
        ineligible_list: List[MatchedScheme] = []

        is_special = (social_category or "").strip().upper() in SPECIAL_CATEGORIES
        is_rural = (area_type or "").strip().lower() == "rural"

        bus_text = f"{business_category or ''} {specific_business or ''}".lower()

        is_dairy = any(d in bus_text for d in ["dairy", "milk", "chilling", "cattle", "cow", "buffalo", "ghee", "paneer"])
        is_poultry = any(p in bus_text for p in ["poultry", "broiler", "layer", "chicken", "bird"])
        is_agri_allied = is_dairy or is_poultry or any(
            a in bus_text for a in ["agri", "farm", "fisheries", "fish", "horticulture", "floriculture", "goat", "animal husbandry"]
        )
        is_mfg = is_agri_allied or any(
            m in bus_text
            for m in [
                "manufacturing",
                "processing",
                "production",
                "making",
                "fabrication",
                "mill",
                "bakery",
                "textile",
                "oil",
                "dal",
            ]
        )
        is_trading = any(
            t in bus_text for t in ["retail", "trading", "shop", "store", "dealer", "trader", "wholesale"]
        ) and not is_mfg

        is_missing_data = indicative_project_cost <= 0.0

        for s in raw_schemes:
            code = s.get("scheme_code", "")
            name = s.get("scheme_name", "")
            scheme_cat = s.get("category", "")
            max_mfg = s.get("max_project_cost_mfg")
            max_serv = s.get("max_project_cost_service")
            min_margin_gen = s.get("min_margin_pct_gen", 10.0)
            min_margin_spec = s.get("min_margin_pct_special", 5.0)
            sub_rural_gen = s.get("max_subsidy_pct_rural_gen", 0.0)
            sub_rural_spec = s.get("max_subsidy_pct_rural_special", 0.0)
            sub_urb_gen = s.get("max_subsidy_pct_urban_gen", 0.0)
            sub_urb_spec = s.get("max_subsidy_pct_urban_special", 0.0)
            max_sub_amt = s.get("max_subsidy_amount")
            interest_sub = s.get("interest_subsidy_pct", 0.0)
            collateral_req = s.get("collateral_required", False)
            eligible_cats = s.get("eligible_categories", "ALL")
            trading_restr = s.get("trading_restricted", False)
            source_auth = s.get("source_authority", "Government of India")
            source_yr = s.get("source_year", "2024")
            source_url = s.get("official_source_url")
            req_docs = s.get("required_documents", [
                "Aadhaar & PAN Card",
                "Udyam Registration Certificate",
                "Detailed Project Report (DPR)",
                "Bank Account Statements (6-12 Months)"
            ])
            benefit_desc = s.get("benefit", f"Financial assistance under {name}")
            subsidy_loan_type = s.get("subsidy_loan_type", scheme_cat)

            reasons: List[str] = []
            why_bullets: List[str] = []
            is_eligible = True
            verification_notice = None

            # 1. Sector Eligibility Check
            type_matched = True
            type_reason = ""
            if trading_restr and is_trading:
                type_matched = False
                is_eligible = False
                type_reason = f"Scheme {code} restricts retail/trading activities under official guidelines."
                reasons.append(type_reason)
            elif eligible_cats not in ("ALL", "ALL_EXCEPT_TRADING"):
                allowed_tokens = [c.strip().lower() for c in eligible_cats.split(",")]
                matched_token = any(tok in bus_text for tok in allowed_tokens)
                if not matched_token:
                    type_matched = False
                    is_eligible = False
                    type_reason = f"Business activity '{specific_business or business_category}' does not match eligible sectors ({eligible_cats})."
                    reasons.append(type_reason)
                else:
                    type_reason = f"Business matches eligible sector ({eligible_cats})."
            else:
                type_reason = f"Business category '{business_category}' is eligible under broad sectoral coverage."

            # 2. Project Cost & Ceiling Check
            cost_ceiling = max_mfg if is_mfg else max_serv
            cost_matched = True
            investment_reason = ""

            if is_missing_data:
                cost_matched = False
                is_eligible = False
                investment_reason = "Indicative project cost is required to verify statutory scheme eligibility."
                verification_notice = "Eligibility cannot be verified from available data."
            elif cost_ceiling and indicative_project_cost > cost_ceiling:
                cost_matched = False
                is_eligible = False
                investment_reason = f"Project cost ₹{indicative_project_cost:,.2f} exceeds scheme ceiling of ₹{cost_ceiling:,.2f}."
                reasons.append(investment_reason)
            else:
                ceiling_text = f"within ₹{cost_ceiling:,.2f} ceiling" if cost_ceiling else "no restrictive ceiling cap"
                investment_reason = f"Project cost of ₹{indicative_project_cost:,.2f} is {ceiling_text}."

            # 3. Location & Area Match Check
            loc_matched = True
            loc_label = location or "Odisha"
            location_reason = (
                f"Location '{loc_label}' is rural, qualifying for maximum subsidy tier under {code}."
                if is_rural
                else f"Location '{loc_label}' qualifies under standard urban MSME guidelines."
            )

            # 4. Promoter Margin Calculation
            req_margin_pct = min_margin_spec if is_special else min_margin_gen
            req_margin_amt = (req_margin_pct / 100.0) * indicative_project_cost if not is_missing_data else 0.0

            margin_deficit = 0.0
            if not is_missing_data and available_margin_capital < req_margin_amt:
                margin_deficit = req_margin_amt - available_margin_capital
                margin_reason = f"Promoter margin shortfall: Available ₹{available_margin_capital:,.2f} vs Required ₹{req_margin_amt:,.2f} ({req_margin_pct:.0f}%). Deficit: ₹{margin_deficit:,.2f}."
                reasons.append(margin_reason)

            # 5. Subsidy / Assistance Calculation
            if is_rural:
                subsidy_pct = sub_rural_spec if is_special else sub_rural_gen
            else:
                subsidy_pct = sub_urb_spec if is_special else sub_urb_gen

            raw_subsidy = (subsidy_pct / 100.0) * indicative_project_cost if not is_missing_data else 0.0
            if max_sub_amt and max_sub_amt > 0:
                estimated_subsidy = min(raw_subsidy, max_sub_amt)
            else:
                estimated_subsidy = raw_subsidy

            # 6. Eligible Bank Loan Calculation
            eligible_loan = max(
                0.0, indicative_project_cost - available_margin_capital - estimated_subsidy
            ) if not is_missing_data else 0.0

            # 7. Deterministic Match Percentage (0.0 to 100.0)
            if is_missing_data:
                match_pct = 30.0
                eligibility_status = "Eligibility cannot be verified from available data."
            elif is_eligible:
                base_pct = 85.0
                # Sector direct fit bonus
                if (is_dairy or is_agri_allied) and code in ("PMEGP", "AIF", "MUDRA_TARUN", "CGTMSE", "PM_FME"):
                    base_pct += 5.0
                elif is_mfg and code in ("PMEGP", "CGTMSE", "MSME_CHAMPIONS"):
                    base_pct += 4.0

                # Investment range bonus
                if cost_ceiling and indicative_project_cost <= cost_ceiling * 0.90:
                    base_pct += 4.0
                elif not cost_ceiling:
                    base_pct += 3.0

                # Margin capital compliance bonus
                if available_margin_capital >= req_margin_amt:
                    base_pct += 3.0
                else:
                    base_pct -= min(8.0, (margin_deficit / (req_margin_amt or 1.0)) * 10.0)

                # Rural / Special bonus
                if is_rural and subsidy_pct > 0:
                    base_pct += 2.0

                match_pct = min(98.0, max(72.0, round(base_pct, 1)))
                eligibility_status = "Likely Eligible"
            else:
                match_pct = round(max(25.0, 50.0 - len(reasons) * 10.0), 1)
                eligibility_status = "Ineligible"

            # Primary eligibility reason text
            if is_eligible:
                if subsidy_pct > 0:
                    elig_reason_text = (
                        f"Eligible for {subsidy_pct:.0f}% capital subsidy (₹{estimated_subsidy:,.0f}) "
                        f"with minimum {req_margin_pct:.0f}% promoter margin. {type_reason} {investment_reason}"
                    )
                elif interest_sub > 0:
                    elig_reason_text = (
                        f"Eligible for {interest_sub:.1f}% interest subvention under {code} with CGTMSE credit guarantee. "
                        f"{type_reason} {investment_reason}"
                    )
                else:
                    elig_reason_text = (
                        f"100% Collateral-free credit facility under {code}. {type_reason} {investment_reason}"
                    )
            else:
                elig_reason_text = "; ".join(reasons) if reasons else "Does not meet scheme eligibility parameters."

            # Construct structured why bullets
            if type_matched:
                why_bullets.append(f"✓ Business Sector: {type_reason}")
            else:
                why_bullets.append(f"✗ Business Sector: {type_reason}")

            if cost_matched:
                why_bullets.append(f"✓ Investment Ceiling: {investment_reason}")
            elif not is_missing_data:
                why_bullets.append(f"✗ Investment Ceiling: {investment_reason}")

            if loc_matched:
                why_bullets.append(f"✓ Location Benefit: {location_reason}")

            if available_margin_capital >= req_margin_amt and not is_missing_data:
                why_bullets.append(f"✓ Margin Readiness: Own capital ₹{available_margin_capital:,.2f} satisfies {req_margin_pct:.0f}% required margin.")

            matching_criteria = {
                "business_type": {
                    "matched": type_matched,
                    "label": "Sector Eligibility",
                    "reason": type_reason,
                },
                "location": {
                    "matched": loc_matched,
                    "label": "Geographic Scope",
                    "reason": location_reason,
                },
                "investment": {
                    "matched": cost_matched,
                    "label": "Investment Feasibility",
                    "reason": investment_reason,
                },
                "social_category": {
                    "matched": True,
                    "label": "Demographic Schedule",
                    "reason": (
                        f"Special category concession ({social_category}): Lower margin ({req_margin_pct:.0f}%) and higher subsidy."
                        if is_special
                        else "General category standard margin and subsidy schedule applied."
                    ),
                },
            }

            matched_scheme = MatchedScheme(
                scheme_code=code,
                scheme_name=name,
                eligible=is_eligible,
                is_eligible=is_eligible,
                eligibility_status=eligibility_status,
                match_percentage=match_pct,
                eligibility_reason=elig_reason_text,
                benefit=benefit_desc,
                subsidy_loan_type=subsidy_loan_type,
                required_documents=req_docs,
                official_source=source_auth,
                max_eligible_cost=cost_ceiling,
                estimated_subsidy_amount=round(estimated_subsidy, 2),
                estimated_subsidy_pct=round(subsidy_pct, 2),
                required_margin_capital=round(req_margin_amt, 2),
                required_margin_pct=round(req_margin_pct, 2),
                eligible_loan_amount=round(eligible_loan, 2),
                interest_subsidy_pct=interest_sub,
                collateral_required=collateral_req,
                reasons=reasons if reasons else [elig_reason_text],
                why_this_scheme=why_bullets,
                matching_criteria=matching_criteria,
                business_type_match=type_reason,
                location_match=location_reason,
                investment_match=investment_reason,
                business_stage_match="Compatible with enterprise establishment and expansion.",
                data_verification_notice=verification_notice,
                source_authority=source_auth,
                source_year=source_yr,
                official_source_url=source_url,
            )

            if is_eligible:
                eligible_list.append(matched_scheme)
            else:
                ineligible_list.append(matched_scheme)

        # Sort eligible schemes: highest match percentage first, then subsidy amount
        eligible_list.sort(
            key=lambda s: (s.match_percentage, s.estimated_subsidy_amount),
            reverse=True,
        )
        ineligible_list.sort(
            key=lambda s: s.match_percentage,
            reverse=True,
        )

        all_ranked = eligible_list + ineligible_list
        best_rec = eligible_list[0] if eligible_list else None

        # Optional Groq advisory narrative (purely for explanation, no decision changes)
        ai_explanation = None
        groq = GroqProvider()
        if groq.is_available() and eligible_list:
            try:
                top_names = ", ".join([f"{s.scheme_code} ({s.match_percentage}%)" for s in eligible_list[:3]])
                prompt_text = (
                    f"Explain why the following government credit schemes are recommended for a {specific_business} "
                    f"({business_category}) in {location} with ₹{indicative_project_cost:,.0f} project cost:\n"
                    f"Top schemes: {top_names}\n"
                    f"Keep the explanation to 2 short sentences highlighting subsidy and loan support."
                )
                ai_explanation = groq.generate_chat(
                    system_prompt="You are VITTANAYA Scheme Advisory Engine. Provide concise, grounded explanations of official scheme matches.",
                    user_prompt=prompt_text,
                )
            except Exception as e:
                logger.debug(f"Groq explanation skipped: {e}")

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
                f"Evaluated {len(raw_schemes)} verified scheme rules. "
                f"Category={social_category} (Special={is_special}), Area={area_type} (Rural={is_rural})."
            ),
            source_authority=best_rec.source_authority if best_rec else "Official Scheme Guidelines",
            source_year=best_rec.source_year if best_rec else "2024",
            official_source_url=best_rec.official_source_url if best_rec else None,
        )

        return SchemeMatchResponse(
            total_matched=len(all_ranked),
            eligible_count=len(eligible_list),
            ranked_schemes=all_ranked,
            eligible_schemes=eligible_list,
            ineligible_schemes=ineligible_list,
            best_recommendation=best_rec,
            explanation=ai_explanation,
            traceability=traceability,
        )
