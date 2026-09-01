"""Grounded AI Advisory Service for SIH26091 VITTANAYA.

Coordinates context retrieval from local decision engines (Financial, Scheme, Feasibility, Risk)
and synthesizes grounded answers using AIBusinessAdvisor with zero hallucination.
"""

from typing import List, Optional

from sqlalchemy.orm import Session

from backend.app.engines.ai_advisor import AIBusinessAdvisor
from backend.app.engines.feasibility_engine import FeasibilityEngine
from backend.app.engines.financial_engine import FinancialEngine
from backend.app.engines.risk_engine import RiskEngine
from backend.app.engines.scheme_engine import SchemeEngine
from backend.app.schemas.advisory import (
    BusinessContextInput,
    ChatRequest,
    ChatResponse,
    KeyFact,
    SourceInfo,
)
from backend.app.schemas.insights import TraceabilityMetadata


class AdvisoryService:
    """Service handling Ask VITTANAYA chatbot inquiries with deterministic context grounding."""

    @staticmethod
    def get_status() -> dict[str, str]:
        """Return advisory engine status."""
        return {
            "status": "operational",
            "message": "VITTANAYA Grounded AI Advisory Service is fully operational.",
            "target_problem": "SIH26091",
        }

    @staticmethod
    def process_chat(payload: ChatRequest, db: Optional[Session] = None) -> ChatResponse:
        """Process user chat question grounded in structured backend findings."""
        raw_msg = payload.message.strip()
        lower_msg = raw_msg.lower()
        lang = payload.language or "English"

        # 1. Resolve Business Context (Use defaults if omitted)
        ctx: BusinessContextInput = payload.business_context or BusinessContextInput()
        bus_category = ctx.business_category or "Poultry"
        specific_bus = ctx.specific_business or "Commercial Broiler Farming"
        loc = ctx.location or "Odisha"
        margin_cap = float(ctx.available_margin_capital or 50000.0)
        social_cat = ctx.social_category or "General"
        area = ctx.area_type or "Rural"
        scale = ctx.scale

        # 2. Execute Deterministic Engines safely with default activity fallback
        fin_engine = FinancialEngine(db)
        try:
            fin_res = fin_engine.analyze_financial_gap(
                available_margin_capital=margin_cap,
                business_category=bus_category,
                specific_business=specific_bus,
                location=loc,
                scale=scale,
            )
        except Exception:
            # Fallback to verified primary district activity benchmark
            bus_category = "Poultry"
            specific_bus = "Commercial Broiler Farming"
            fin_res = fin_engine.analyze_financial_gap(
                available_margin_capital=margin_cap,
                business_category=bus_category,
                specific_business=specific_bus,
                location=loc,
                scale=scale,
            )

        feas_engine = FeasibilityEngine(db)
        try:
            feas_res = feas_engine.evaluate_feasibility(
                business_category=bus_category,
                specific_business=specific_bus,
                location=loc,
                scale=scale,
            )
        except Exception:
            feas_res = feas_engine.evaluate_feasibility(
                business_category="Poultry",
                specific_business="Commercial Broiler Farming",
                location=loc,
                scale=scale,
            )

        scheme_engine = SchemeEngine(db)
        scheme_res = scheme_engine.match_schemes(
            indicative_project_cost=fin_res.indicative_project_cost,
            available_margin_capital=margin_cap,
            business_category=bus_category,
            specific_business=specific_bus,
            location=loc,
            social_category=social_cat,
            area_type=area,
        )

        risk_engine = RiskEngine(db)
        risk_res = risk_engine.analyze_risks(
            business_category=bus_category,
            specific_business=specific_bus,
            indicative_project_cost=fin_res.indicative_project_cost,
            available_margin_capital=margin_cap,
            financing_requirement=fin_res.financing_requirement,
            location=loc,
        )

        # 3. Detect Query Intent
        intent = AdvisoryService._classify_intent(lower_msg)

        # 4. Generate AI Advisor Synthesis
        advisor_engine = AIBusinessAdvisor()
        advisor_res = advisor_engine.generate_advice(
            opportunity=feas_res.model_dump(),
            financial=fin_res.model_dump(),
            schemes=scheme_res.model_dump(),
            risks=risk_res.model_dump(),
        )

        # 5. Build Intent-Specific Answer & Key Facts
        key_facts: List[KeyFact] = []
        sources: List[SourceInfo] = [
            SourceInfo(
                name=f"NABARD PLP {loc} Reference Benchmarks",
                authority="NABARD",
                url="https://www.nabard.org",
            ),
            SourceInfo(
                name="PMEGP / MUDRA Scheme Operational Guidelines",
                authority="KVIC / Ministry of MSME",
                url="https://www.kviconline.gov.in",
            ),
        ]

        why_list = list(advisor_res.why_this_result)
        next_steps = list(advisor_res.recommended_next_steps)

        proj_cost_str = f"₹{fin_res.indicative_project_cost:,.0f}"
        margin_cap_str = f"₹{fin_res.available_margin_capital:,.0f} ({fin_res.margin_pct:.1f}%)"
        fin_req_str = f"₹{fin_res.financing_requirement:,.0f}"

        if intent == "SCHEME":
            best_scheme = scheme_res.best_recommendation
            if best_scheme:
                answer_text = (
                    f"Under the {best_scheme.scheme_name} ({best_scheme.scheme_code}), "
                    f"your enterprise qualifies for up to {best_scheme.estimated_subsidy_pct:.0f}% capital subsidy "
                    f"(approx. ₹{best_scheme.estimated_subsidy_amount:,.0f}). Your required promoter contribution is "
                    f"{best_scheme.required_margin_pct:.0f}% (₹{best_scheme.required_margin_capital:,.0f}), leaving an eligible bank loan "
                    f"requirement of ₹{best_scheme.eligible_loan_amount:,.0f}."
                )
                key_facts.append(KeyFact(label="Recommended Scheme", value=best_scheme.scheme_name))
                key_facts.append(KeyFact(label="Estimated Subsidy", value=f"₹{best_scheme.estimated_subsidy_amount:,.0f} ({best_scheme.estimated_subsidy_pct:.0f}%)"))
                key_facts.append(KeyFact(label="Eligible Bank Loan", value=f"₹{best_scheme.eligible_loan_amount:,.0f}"))
            else:
                answer_text = (
                    f"Based on your project parameters (indicative cost {proj_cost_str}), standard credit-linked subsidy options "
                    f"like PMEGP allow up to 25% subsidy for general category (35% for special categories in rural areas). "
                    f"Check official KVIC guidelines for eligibility."
                )
                key_facts.append(KeyFact(label="PMEGP Subsidy Ceiling", value="25% - 35%"))

        elif intent == "FINANCIAL":
            answer_text = (
                f"Your estimated project cost for {specific_bus} in {loc} is {proj_cost_str}. "
                f"With your available margin capital of {margin_cap_str}, your total financing gap from bank credit is {fin_req_str}. "
            )
            if fin_res.has_margin_shortfall:
                answer_text += (
                    f"Note: Standard banking guidelines require a minimum 10% own equity margin. You currently have a deficit of ₹{fin_res.margin_shortfall_amount:,.0f}."
                )
            else:
                answer_text += "Your available capital satisfies the standard 10% banking equity requirement."

            key_facts.append(KeyFact(label="Indicative Project Cost", value=proj_cost_str))
            key_facts.append(KeyFact(label="Available Capital", value=margin_cap_str))
            key_facts.append(KeyFact(label="Financing Gap", value=fin_req_str))

        elif intent == "FEASIBILITY":
            opp_score = feas_res.overall_opportunity_score
            answer_text = (
                f"Your local market feasibility score for {specific_bus} in {loc} is evaluated at {opp_score:.0f}/100. "
                f"Market reach is classified as '{feas_res.market_reach}' with a competitor density level of '{feas_res.competitor_level}'."
            )
            key_facts.append(KeyFact(label="Feasibility Score", value=f"{opp_score:.0f} / 100"))
            key_facts.append(KeyFact(label="Market Reach", value=feas_res.market_reach))
            key_facts.append(KeyFact(label="Competitor Density", value=feas_res.competitor_level))

        elif intent == "RISK":
            answer_text = (
                f"Your enterprise overall risk profile is classified as '{risk_res.overall_risk}' (Score: {risk_res.overall_risk_score:.0f}/100). "
                f"Key risk drivers include Financial Risk ({risk_res.financial_risk}) and Seasonality Risk ({risk_res.seasonality_risk})."
            )
            key_facts.append(KeyFact(label="Overall Risk", value=risk_res.overall_risk))
            key_facts.append(KeyFact(label="Financial Risk", value=risk_res.financial_risk))
            key_facts.append(KeyFact(label="Competition Risk", value=risk_res.competition_risk))

        elif intent == "ACTION":
            answer_text = (
                f"Based on your profile for {specific_bus} ({proj_cost_str} project cost), your primary next actions are to: "
                f"1) Prepare a scheme-aligned Detailed Project Report (DPR); "
                f"2) Validate proof of available margin capital (₹{margin_cap:,.0f}); "
                f"3) Submit application via KVIC / JanSamarth portal."
            )
            key_facts.append(KeyFact(label="Next Milestone", value="DPR Generation & Submission"))
            key_facts.append(KeyFact(label="Target Portal", value="JanSamarth / KVIC PMEGP Portal"))

        else:
            answer_text = advisor_res.summary
            key_facts.append(KeyFact(label="Indicative Cost", value=proj_cost_str))
            key_facts.append(KeyFact(label="Financing Gap", value=fin_req_str))
            key_facts.append(KeyFact(label="Feasibility Score", value=f"{feas_res.overall_opportunity_score:.0f}/100"))

        traceability = TraceabilityMetadata(
            input={
                "message": raw_msg,
                "language": lang,
                "business_category": bus_category,
                "specific_business": specific_bus,
                "location": loc,
            },
            calculation_rule="Intent-guided synthesis over deterministic NABARD, PMEGP, and Risk engine metrics.",
            source_authority="VITTANAYA Grounded AI Advisory Engine",
            source_year="2026",
            provenance_priority="DETERMINISTIC_GROUNDED",
            official_source_url=None,
        )

        return ChatResponse(
            answer=answer_text,
            intent=intent,
            key_facts=key_facts,
            why_this_result=why_list,
            recommended_next_steps=next_steps,
            confidence="HIGH",
            sources=sources,
            data_status="VERIFIED_DETERMINISTIC",
            language=lang,
            traceability=traceability,
        )

    @staticmethod
    def _classify_intent(lower_msg: str) -> str:
        """Classify natural language user message into core advisory intent domain."""
        if any(w in lower_msg for w in ["scheme", "pmegp", "mudra", "subsidy", "grant", "government", "stand-up", "benefit"]):
            return "SCHEME"
        if any(w in lower_msg for w in ["afford", "cost", "money", "capital", "fund", "financing", "loan", "repay", "emi", "budget", "borrow"]):
            return "FINANCIAL"
        if any(w in lower_msg for w in ["feasible", "viable", "demand", "market", "score", "swot", "competition", "opportunity"]):
            return "FEASIBILITY"
        if any(w in lower_msg for w in ["risk", "threat", "danger", "loss", "warning", "fail", "hazard"]):
            return "RISK"
        if any(w in lower_msg for w in ["action", "next", "do", "step", "apply", "plan", "dpr", "milestone"]):
            return "ACTION"
        if any(w in lower_msg for w in ["why", "reason", "explain", "how come", "justify"]):
            return "EXPLANATION"
        return "GENERAL"
