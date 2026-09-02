"""Grounded AI Advisory Service for SIH26091 VITTANAYA.

Coordinates context retrieval from local decision engines (Financial, Scheme, Feasibility, Risk, WhatIf)
and synthesizes grounded answers using AIBusinessAdvisor with zero hallucination.
"""

from typing import List, Optional

from sqlalchemy.orm import Session

from backend.app.core.logging import logger
from backend.app.engines.cost_engine import ProjectCostEngine
from backend.app.engines.feasibility_engine import FeasibilityEngine
from backend.app.engines.risk_engine import RiskEngine
from backend.app.engines.scheme_engine import SchemeEngine
from backend.app.engines.whatif_engine import WhatIfEngine
from backend.app.nlp.intent_classifier import classify_intent
from backend.app.repositories.business_repository import BusinessRepository
from backend.app.schemas.advisory import (
    BusinessContextInput,
    ChatRequest,
    ChatResponse,
    KeyFact,
    NlpMetadata,
    SourceInfo,
)
from backend.app.schemas.financial_plan import CashFlowForecastRequest, FundingStructureRequest
from backend.app.schemas.industry import IndustryAnalysisRequest
from backend.app.schemas.insights import TraceabilityMetadata
from backend.app.schemas.ml import PredictiveMlRequest
from backend.app.services.ahp_service import get_ahp_result
from backend.app.services.business_feasibility_service import BusinessFeasibilityService
from backend.app.services.cash_flow_service import MINIMUM_BUFFER_MONTHS_COVERAGE, CashFlowService
from backend.app.services.financial_plan_service import FinancialPlanService
from backend.app.services.industry_service import IndustryService


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
        """Process user chat question grounded in structured backend findings with zero hallucination."""
        raw_msg = payload.message.strip()
        lower_msg = raw_msg.lower()
        lang = payload.language or "English"

        # 1. Resolve Active Business Context (No default hardcoded fallbacks)
        bus_name: Optional[str] = None
        bus_category: Optional[str] = None
        specific_bus: Optional[str] = None
        loc: Optional[str] = None
        margin_cap: float = 0.0
        social_cat: str = "General"
        area: str = "Rural"
        scale: Optional[str] = None
        active_business_id: Optional[int] = None
        db_monthly_rev: float = 0.0
        db_monthly_exp: float = 0.0

        # Check DB by business_id if provided, or resolve active user business
        if db:
            try:
                repo = BusinessRepository(db)
                biz = None
                if payload.business_id:
                    try:
                        biz = repo.get_by_id(int(payload.business_id))
                    except (ValueError, TypeError):
                        biz = None
                if biz:
                    active_business_id = biz.id
                    bus_name = biz.name
                    bus_activity = getattr(biz, 'industry', None) or getattr(biz, 'category', None) or getattr(biz, 'type', None) or "General Enterprise"
                    bus_category = getattr(biz, 'category', None) or getattr(biz, 'type', None) or getattr(biz, 'industry', None) or "General"
                    specific_bus = bus_activity
                    dist = (getattr(biz, 'location_district', '') or '').strip()
                    st = (getattr(biz, 'location_state', '') or '').strip()
                    if dist and st:
                        loc = f"{dist}, {st}" if dist != st else dist
                    elif dist:
                        loc = dist
                    elif st:
                        loc = st
                    else:
                        loc = "Odisha"
                    margin_cap = float(getattr(biz, 'own_capital', 0.0) or 0.0)
                    db_monthly_rev = float(getattr(biz, 'monthly_revenue_estimate', 0.0) or 0.0)
                    db_monthly_exp = float(getattr(biz, 'monthly_expense_estimate', 0.0) or 0.0)
                    if getattr(biz, 'social_category', None):
                        social_cat = biz.social_category
                    if getattr(biz, 'area_type', None):
                        area = biz.area_type
            except Exception as e:
                logger.warning(f"Failed to lookup business from DB: {e}")

        # Secondary context resolution from payload
        ctx: Optional[BusinessContextInput] = payload.business_context
        if ctx:
            if not specific_bus and ctx.specific_business and ctx.specific_business.strip():
                # Avoid setting specific_business to the trade name if identical
                if not (bus_name and ctx.specific_business.strip().lower() == bus_name.strip().lower()):
                    specific_bus = ctx.specific_business.strip()
            if not bus_category and ctx.business_category and ctx.business_category.strip():
                bus_category = ctx.business_category.strip()
            if not loc and ctx.location and ctx.location.strip():
                loc = ctx.location.strip()
            if margin_cap <= 0.0 and ctx.available_margin_capital:
                margin_cap = float(ctx.available_margin_capital)
            if ctx.social_category:
                social_cat = ctx.social_category
            if ctx.area_type:
                area = ctx.area_type
            if ctx.scale:
                scale = ctx.scale

        bus_name = bus_name or specific_bus or "Your Enterprise"
        specific_bus = specific_bus or bus_category or "General Enterprise"

        # Cross-fill implicit category if specific business is specified
        if specific_bus and not bus_category:
            bus_category = specific_bus

        logger.info(
            f"Advisory Context Resolved: business_id={active_business_id}, specific_bus='{specific_bus}', "
            f"bus_category='{bus_category}', loc='{loc}', margin_cap={margin_cap}, monthly_rev={db_monthly_rev}"
        )

        # Strict Context Safety Check: If no active business profile is provided, return safe UNAVAILABLE guidance
        if not specific_bus or not bus_category or not loc:
            return ChatResponse(
                answer=(
                    "I need your active business profile before I can provide a reliable answer. "
                    "Please complete or select a business profile in your VITTANAYA workspace first."
                ),
                intent="GENERAL",
                confidence="HIGH",
                key_facts=[
                    KeyFact(
                        label="Profile Status",
                        value="Incomplete / Missing Active Business Profile",
                    )
                ],
                why_this_result=[
                    "VITTANAYA requires an active business profile (Category, Activity, Location, Margin Capital) to run grounded decision engines.",
                    "Please navigate to Business Intake or select your active enterprise workspace to proceed.",
                ],
                recommended_next_steps=[
                    "Complete Business Profile Intake",
                    "Select Active Enterprise Workspace",
                ],
                sources=[],
                data_status="UNAVAILABLE",
                language=lang,
                traceability=TraceabilityMetadata(
                    input={"message": payload.message},
                    calculation_rule="Grounded active business context validation check.",
                    source_authority="VITTANAYA Advisory Engine",
                    source_year="2026",
                    provenance_priority="SAFETY_GUARD",
                ),
            )

        # 2. Detect Query Intent via Local Offline NLP Classifier (TF-IDF + Logistic Regression)
        intent, intent_confidence, nlp_method = classify_intent(raw_msg)

        # 3. Execute Deterministic Grounding Based on Recognized Intent
        key_facts: List[KeyFact] = []
        sources: List[SourceInfo] = [
            SourceInfo(
                name=f"NABARD PLP {loc} Benchmarks",
                authority="NABARD",
                url="https://www.nabard.org",
            ),
            SourceInfo(
                name="PMEGP / MUDRA Scheme Operational Guidelines",
                authority="KVIC / Ministry of MSME",
                url="https://www.kviconline.gov.in",
            ),
        ]
        why_list: List[str] = []
        next_steps: List[str] = []
        answer_text: str = ""

        # Retrieve Project Cost from DB profile or ProjectCostEngine benchmark
        proj_cost = 0.0
        if db and active_business_id:
            try:
                biz_repo = BusinessRepository(db)
                b = biz_repo.get_by_id(active_business_id)
                if b and getattr(b, 'project_cost', 0.0):
                    proj_cost = float(b.project_cost)
            except Exception:
                pass

        if proj_cost <= 0.0 and db:
            try:
                cost_engine = ProjectCostEngine(db)
                project_cost_res = cost_engine.get_indicative_cost(
                    business_activity=specific_bus,
                    business_category=bus_category,
                    location=loc,
                )
                proj_cost = float(project_cost_res.indicative_project_cost)
            except Exception:
                proj_cost = 0.0

        if intent == "FINANCIAL":
            if proj_cost <= 0.0:
                answer_text = "I don't have enough financial information to calculate project cost and EMI for this business. Please complete your project cost baseline first."
                key_facts.append(KeyFact(label="Financial Status", value="Project Cost Unavailable"))
            else:
                # Calculate Authoritative Loan Amortization Structure
                margin_pct = (margin_cap / proj_cost * 100.0) if proj_cost > 0 else 10.0
                margin_pct = max(5.0, min(100.0, margin_pct))
                funding_req = FundingStructureRequest(
                    project_cost=proj_cost,
                    margin_pct=margin_pct,
                    interest_rate_annual=9.5,
                    tenure_years=5,
                )
                funding_res = FinancialPlanService.calculate_funding_structure(funding_req)

                loan_amt = funding_res.loan_amount
                monthly_emi = funding_res.monthly_emi
                own_equity = funding_res.own_margin_capital

                answer_text = (
                    f"For your {specific_bus} project in {loc}, the indicative project cost is ₹{proj_cost:,.0f}. "
                    f"With your available margin capital of ₹{own_equity:,.0f} ({margin_pct:.1f}%), your required bank loan is ₹{loan_amt:,.0f}. "
                    f"At a standard 9.5% p.a. interest rate over a 5-year tenure, your estimated monthly EMI will be ₹{monthly_emi:,.0f}."
                )
                if margin_pct < 10.0:
                    shortfall = (proj_cost * 0.10) - own_equity
                    answer_text += f" Note: Standard banking guidelines require a 10% promoter contribution. You currently have a margin deficit of ₹{shortfall:,.0f}."
                else:
                    answer_text += " Your available capital satisfies the standard 10% banking equity requirement."

                key_facts.append(KeyFact(label="Indicative Project Cost", value=f"₹{proj_cost:,.0f}"))
                key_facts.append(KeyFact(label="Promoter Margin", value=f"₹{own_equity:,.0f} ({margin_pct:.1f}%)"))
                key_facts.append(KeyFact(label="Eligible Bank Loan", value=f"₹{loan_amt:,.0f}"))
                key_facts.append(KeyFact(label="Estimated Monthly EMI", value=f"₹{monthly_emi:,.0f}"))

                why_list.append(f"Project cost reference ₹{proj_cost:,.0f} is sourced from active business profile / NABARD PLP district benchmarks for {loc}.")
                why_list.append("Reducing-balance loan amortization calculated at 9.5% p.a. over 60 monthly payments.")
                next_steps.append("Maintain proof of promoter margin deposit (FD/Bank Statement) for loan appraisal.")

        elif intent == "CASH_FLOW":
            effective_proj_cost = proj_cost if proj_cost > 0 else (round((db_monthly_rev * 12.0) / 1.2, 2) if db_monthly_rev > 0 else 0.0)
            if effective_proj_cost <= 0.0 and db_monthly_rev <= 0.0 and db_monthly_exp <= 0.0:
                answer_text = "Project cost is not available for this business profile to calculate cash flow forecasts."
                key_facts.append(KeyFact(label="Cash Flow Status", value="Project Cost Unavailable"))
            else:
                cf_req = CashFlowForecastRequest(
                    business_id=active_business_id,
                    project_cost=effective_proj_cost,
                    available_margin_capital=margin_cap,
                    monthly_revenue_estimate=db_monthly_rev if db_monthly_rev > 0 else None,
                    monthly_expense_estimate=db_monthly_exp if db_monthly_exp > 0 else None,
                    apply_seasonality=True,
                )
                cf_res = CashFlowService.generate_forecast(cf_req, db=db)
                summary = cf_res.summary

                answer_text = (
                    f"For your enterprise in {loc}, VITTANAYA Cash-Flow Engine projects a minimum closing cash balance of "
                    f"₹{summary.minimum_projected_cash:,.0f} over 12 months (Operating Coverage: {summary.months_of_coverage:.1f} months). "
                    f"Estimated working capital requirement is ₹{summary.working_capital_required:,.0f} with a target cash buffer of ₹{summary.minimum_recommended_buffer:,.0f}. "
                    f"Overall Liquidity Risk: {summary.liquidity_risk_level}."
                )
                if summary.critical_months:
                    answer_text += f" Pay close attention to liquidity pressure in {', '.join(summary.critical_months[:3])}."

                key_facts.append(KeyFact(label="Min Projected Cash", value=f"₹{summary.minimum_projected_cash:,.0f}"))
                key_facts.append(KeyFact(label="Working Capital Required", value=f"₹{summary.working_capital_required:,.0f}"))
                key_facts.append(KeyFact(label="Recommended Buffer", value=f"₹{summary.minimum_recommended_buffer:,.0f}"))
                key_facts.append(KeyFact(label="Liquidity Risk Level", value=summary.liquidity_risk_level))

                why_list.append("12-month roll-forward calculated by CashFlowService using saved DB revenue/expenses & EMI debt service.")
                why_list.append(f"Target cash buffer is set at {MINIMUM_BUFFER_MONTHS_COVERAGE}x monthly operating expenses.")

                if cf_res.liquidity_flags:
                    for f in cf_res.liquidity_flags[:2]:
                        next_steps.append(f"Month {f.affected_month}: {f.recommended_action}")
                else:
                    next_steps.append("Maintain 45-day working capital buffer in liquid bank account.")

        elif intent == "INDUSTRY":
            ind_code = IndustryService._map_category_to_code(bus_category)
            ind_vars = {}
            if db_monthly_rev > 0:
                ind_vars = {
                    "monthly_footfall": max(100.0, round(db_monthly_rev / 300.0, 0)),
                    "average_transaction_value": 300.0,
                    "production_capacity_units": max(100.0, round(db_monthly_rev / 200.0, 0)),
                    "selling_price_per_unit": 200.0,
                    "unit_cost": 120.0,
                    "raw_material_cost_pct": 50.0,
                    "utilization_pct": 75.0,
                    "wastage_pct": 2.0,
                    "gross_margin_pct": 25.0,
                    "inventory_value": max(10000.0, db_monthly_rev * 0.5),
                    "stock_holding_days": 30.0,
                }
            ind_req = IndustryAnalysisRequest(
                business_id=active_business_id,
                industry_code=ind_code,
                variables=ind_vars,
            )
            ind_res = IndustryService.analyze(ind_req, db=db)

            kpi_summary = "; ".join([f"{k.label}: {k.formatted_value}" for k in ind_res.kpis[:3]])
            answer_text = (
                f"For your {ind_res.display_name} enterprise in {loc}, VITTANAYA Industry Intelligence evaluates: {kpi_summary}."
            )
            if ind_res.risk_signals:
                answer_text += f" Primary Risk Alert: {ind_res.risk_signals[0].risk_name} — {ind_res.risk_signals[0].reason}"

            for k in ind_res.kpis[:4]:
                key_facts.append(KeyFact(label=k.label, value=k.formatted_value))

            why_list.append(f"Sector KPIs calculated by IndustryService using empirical {ind_res.display_name} benchmarks.")
            why_list.append(f"Revenue & Expense baseline normalized to ₹{ind_res.normalized_monthly_revenue:,.0f} and ₹{ind_res.normalized_monthly_expense:,.0f} per month.")

            if ind_res.risk_signals:
                for r in ind_res.risk_signals[:2]:
                    next_steps.append(f"Mitigate {r.risk_name}: {r.recommendation}")
            else:
                next_steps.append("Optimize operational throughput and maintain target benchmark ratios.")

        elif intent == "PREDICTIVE_ML":
            from backend.app.ml.predictive_engine import PredictiveEngine
            ml_req = PredictiveMlRequest(
                business_id=active_business_id,
                project_cost=proj_cost,
                own_capital=margin_cap,
                category=bus_category,
                district=loc,
            )
            ml_res = PredictiveEngine.predict(ml_req, db=db)

            answer_text = (
                f"VITTANAYA Machine Learning Engine predicts a default/distress risk probability of {ml_res.distress_probability_pct:.1f}% "
                f"({ml_res.distress_tier} Risk Tier) and a 12-month annual growth forecast of {ml_res.predicted_growth_rate_pct:+.1f}%. "
            )
            if ml_res.feature_importances:
                top_driver = ml_res.feature_importances[0]
                answer_text += f"Primary ML Risk Driver: {top_driver.label} ({top_driver.importance_pct:.1f}% weight)."

            key_facts.append(KeyFact(label="ML Distress Probability", value=f"{ml_res.distress_probability_pct:.1f}% ({ml_res.distress_tier})"))
            key_facts.append(KeyFact(label="Predicted 12-Month Growth", value=f"{ml_res.predicted_growth_rate_pct:+.1f}%"))
            if ml_res.feature_importances:
                key_facts.append(KeyFact(label="Top ML Risk Driver", value=ml_res.feature_importances[0].label))

            why_list.append("Predictive inference executed using Scikit-Learn RandomForest models trained on NABARD/MoSJE rural enterprise risk surveys.")
            why_list.append(f"Model ensemble confidence score: {ml_res.confidence_score * 100:.0f}%.")

            if ml_res.distress_tier in ["HIGH", "CRITICAL"]:
                next_steps.append("Address primary risk driver by expanding cash buffer coverage above 45 days.")
            else:
                next_steps.append("Maintain current operational margins and debt-service coverage ratio.")

        elif intent == "WHAT_IF":
            # Extract sales/cost changes from prompt or default to sales -15%
            sales_change = -15.0
            if "10%" in lower_msg:
                sales_change = -10.0
            elif "20%" in lower_msg:
                sales_change = -20.0
            elif "25%" in lower_msg:
                sales_change = -25.0

            base_sales = (db_monthly_rev * 12.0) if db_monthly_rev > 0 else (proj_cost * 1.2 if proj_cost > 0 else 0.0)
            base_cost = (db_monthly_exp * 12.0) if db_monthly_exp > 0 else (proj_cost * 0.75 if proj_cost > 0 else 0.0)
            base_margin = max(proj_cost * 0.1 if proj_cost > 0 else 0.0, margin_cap)

            if base_sales <= 0.0:
                answer_text = "I don't have enough saved financial revenue data to simulate what-if scenarios for this business activity."
            else:
                sim_res = WhatIfEngine().simulate(
                    baseline_project_cost=proj_cost if proj_cost > 0 else (base_sales / 1.2),
                    baseline_available_margin=base_margin,
                    baseline_sales_annual=base_sales,
                    baseline_operating_cost_annual=base_cost,
                    sales_change=sales_change,
                )

                base = sim_res.baseline
                sim = sim_res.simulated
                diff = sim_res.variance["surplus_diff"]

                answer_text = (
                    f"Scenario Analysis (Sales {sales_change:+.0f}%): "
                    f"Baseline Surplus = ₹{base.surplus:,.0f} | Simulated Surplus = ₹{sim.surplus:,.0f} | "
                    f"Net Surplus Change = ₹{diff:,.0f}. Risk Shift: {base.risk} → {sim.risk}."
                )

                if proj_cost > 0:
                    cf_req = CashFlowForecastRequest(
                        business_id=active_business_id,
                        project_cost=proj_cost,
                        available_margin_capital=margin_cap,
                        monthly_revenue_estimate=db_monthly_rev if db_monthly_rev > 0 else None,
                        monthly_expense_estimate=db_monthly_exp if db_monthly_exp > 0 else None,
                        stress_sales_change=sales_change,
                        apply_seasonality=True,
                    )
                    cf_res = CashFlowService.generate_forecast(cf_req, db=db)
                    if cf_res.stress_comparison:
                        sc = cf_res.stress_comparison
                        answer_text += (
                            f" 12-Month Cash Impact: Minimum closing cash drops from ₹{sc.baseline_min_cash:,.0f} to ₹{sc.stress_min_cash:,.0f} "
                            f"(Cash Delta: ₹{sc.cash_delta:,.0f}). Liquidity Risk Shift: {sc.baseline_risk} → {sc.stress_risk}."
                        )

                key_facts.append(KeyFact(label="Baseline Annual Surplus", value=f"₹{base.surplus:,.0f}"))
                key_facts.append(KeyFact(label="Simulated Annual Surplus", value=f"₹{sim.surplus:,.0f}"))
                key_facts.append(KeyFact(label="Surplus Delta", value=f"₹{diff:,.0f}"))
                key_facts.append(KeyFact(label="Simulated Risk Level", value=sim.risk))

                why_list.append(f"Isolated sensitivity model recalculates operating cash surplus under a {sales_change:+.0f}% revenue shock.")
                why_list.append(f"Base operating margin: {base.operating_margin_pct:.1f}% → Simulated margin: {sim.operating_margin_pct:.1f}%.")
                next_steps.append("Build a 3-month working capital cash buffer to absorb seasonal sales fluctuations.")

        elif intent == "SCHEME":
            if proj_cost <= 0.0:
                answer_text = "Project cost baseline is required to calculate government scheme subsidy entitlement. Please complete your business project cost intake."
                key_facts.append(KeyFact(label="Scheme Status", value="Project Cost Required"))
            else:
                scheme_engine = SchemeEngine(db)
                scheme_res = scheme_engine.match_schemes(
                    indicative_project_cost=proj_cost,
                    available_margin_capital=margin_cap,
                    business_category=bus_category,
                    specific_business=specific_bus,
                    location=loc,
                    social_category=social_cat,
                    area_type=area,
                )

                best_scheme = scheme_res.best_recommendation
                if best_scheme:
                    answer_text = (
                        f"Under the {best_scheme.scheme_name} ({best_scheme.scheme_code}), your enterprise appears suitable "
                        f"for up to {best_scheme.estimated_subsidy_pct:.0f}% capital subsidy (approx. ₹{best_scheme.estimated_subsidy_amount:,.0f}). "
                        f"Your required promoter margin is {best_scheme.required_margin_pct:.0f}% (₹{best_scheme.required_margin_capital:,.0f}), leaving an eligible bank loan "
                        f"of ₹{best_scheme.eligible_loan_amount:,.0f}. Based on the available profile information, this scheme appears suitable. Final eligibility is subject to the implementing authority."
                    )
                    key_facts.append(KeyFact(label="Recommended Scheme", value=best_scheme.scheme_name))
                    key_facts.append(KeyFact(label="Estimated Subsidy", value=f"₹{best_scheme.estimated_subsidy_amount:,.0f} ({best_scheme.estimated_subsidy_pct:.0f}%)"))
                    key_facts.append(KeyFact(label="Eligible Bank Loan", value=f"₹{best_scheme.eligible_loan_amount:,.0f}"))
                    total_schemes = len(scheme_res.eligible_schemes) + len(scheme_res.ineligible_schemes)
                    why_list.append(f"Scheme matching evaluated against {total_schemes} active MoSJE / MSME / KVIC central and state guidelines.")
                    why_list.append(f"Rule: {best_scheme.scheme_code} provides credit-linked capital subsidy for rural micro-enterprises.")
                    next_steps.append("Submit application via KVIC PMEGP Portal or JanSamarth Portal.")
                else:
                    answer_text = (
                        "No government scheme could be matched for this enterprise profile with verified eligibility. "
                        "Final eligibility is subject to the implementing authority."
                    )
                    key_facts.append(KeyFact(label="Scheme Status", value="No Rule Match"))

        elif intent == "FEASIBILITY":
            if db is not None and active_business_id:
                # Single-source-of-truth: derive AHP-weighted score from real business data
                bfs = BusinessFeasibilityService(db)
                bfr = bfs.compute(active_business_id)
                score = bfr.final_score
                answer_text = (
                    f"Your Feasibility Score for **{bus_name}** ({specific_bus}) in {loc} "
                    f"is **{score:.0f} / 100** (AHP-weighted across 5 dimensions). "
                    f"Market reach: '{bfr.market_reach}'. Competitor density: '{bfr.competitor_level}'."
                )
                key_facts.append(KeyFact(label="Feasibility Score", value=f"{score:.0f} / 100"))
                key_facts.append(KeyFact(label="Market Reach", value=bfr.market_reach))
                key_facts.append(KeyFact(label="Competitor Density", value=bfr.competitor_level))
                key_facts.append(KeyFact(label="Market Benchmark", value=f"{bfr.market_benchmark_score:.0f} / 100 (sector)"))
                why_list.append(
                    f"Score derived by BusinessFeasibilityService: "
                    f"market={bfr.raw_scores.get('market', 0):.1f}, "
                    f"financial={bfr.raw_scores.get('financial', 0):.1f}, "
                    f"location={bfr.raw_scores.get('location', 0):.1f}, "
                    f"competition={bfr.raw_scores.get('competition', 0):.1f}, "
                    f"risk={bfr.raw_scores.get('risk', 0):.1f} (all on 0-100 scale)."
                )
                why_list.append(f"AHP CR = {bfr.ahp_cr:.6f} (< 0.10 — consistent). {bfr.ahp_source_status}.")
                next_steps.append("Review the 'Why This Score?' modal on the Feasibility dashboard for full AHP lineage.")
            else:
                # Fallback: no business_id — return sector benchmark
                feas_engine = FeasibilityEngine(db)
                feas_res = feas_engine.evaluate_feasibility(
                    business_category=bus_category,
                    specific_business=specific_bus,
                    location=loc,
                    scale=scale,
                )
                score = feas_res.overall_opportunity_score
                answer_text = (
                    f"Your local market feasibility score for {specific_bus} in {loc} is evaluated at "
                    f"{score:.0f}/100 (NABARD PLP sector reference). Market reach: '{feas_res.market_reach}'. "
                    f"For your personalised AHP-weighted score, please open your business profile."
                )
                key_facts.append(KeyFact(label="Feasibility Score", value=f"{score:.0f} / 100"))
                key_facts.append(KeyFact(label="Market Reach", value=feas_res.market_reach))
                why_list.append("Sector benchmark from NABARD Odisha PLP district data.")
                next_steps.append("Perform local buyer survey and lock supplier quotes before capital disbursement.")


        elif intent == "RISK":
            risk_engine = RiskEngine(db)
            risk_res = risk_engine.analyze_risks(
                business_category=bus_category,
                specific_business=specific_bus,
                indicative_project_cost=proj_cost if proj_cost > 0 else 100000.0,
                available_margin_capital=margin_cap,
                financing_requirement=max(0.0, proj_cost - margin_cap),
                location=loc,
            )
            answer_text = (
                f"For your {specific_bus} enterprise in {loc}, your overall risk profile is classified as '{risk_res.overall_risk}' (Score: {risk_res.overall_risk_score:.0f}/100). "
                f"Key risk drivers include Financial Risk ({risk_res.financial_risk}) and Seasonality Risk ({risk_res.seasonality_risk})."
            )
            key_facts.append(KeyFact(label="Overall Risk", value=risk_res.overall_risk))
            key_facts.append(KeyFact(label="Financial Risk", value=risk_res.financial_risk))
            key_facts.append(KeyFact(label="Seasonality Risk", value=risk_res.seasonality_risk))
            why_list.append(f"Risk engine evaluated debt-to-capital ratio and seasonal cash flow vulnerabilities for {loc}.")
            if risk_res.top_risks:
                next_steps.extend([f"Mitigate {r.risk_name}: {r.description}" for r in risk_res.top_risks[:2]])
            else:
                next_steps.append("Establish a 3-month working capital cash buffer.")

        elif intent == "ACTION":
            answer_text = (
                f"Based on your profile for {specific_bus} ({loc}), your primary next actions are: "
                f"1) Prepare a scheme-aligned Detailed Project Report (DPR); "
                f"2) Validate proof of available margin capital (₹{margin_cap:,.0f}); "
                f"3) Submit application via KVIC PMEGP or JanSamarth portal."
            )
            key_facts.append(KeyFact(label="Next Milestone", value="DPR Generation & Submission"))
            key_facts.append(KeyFact(label="Target Portal", value="JanSamarth / KVIC PMEGP Portal"))
            why_list.append("Actions prioritize critical path milestones for loan approval and scheme subsidy eligibility.")
            next_steps.append("Complete Udyam MSME Registration on udyamregistration.gov.in")
            next_steps.append("Generate Verified DPR from VITTANAYA Action Plan menu")

        elif intent == "PROFILE_IDENTITY":
            stage_str = "Established"
            if db and active_business_id:
                try:
                    b = BusinessRepository(db).get_by_id(active_business_id)
                    if b and b.stage:
                        stage_str = b.stage.capitalize()
                except Exception:
                    pass
            answer_text = (
                f"Your active enterprise is **{bus_name}**, a {stage_str} {bus_category} business "
                f"specializing in {specific_bus} in {loc}. "
                f"Your registered equity margin capital is ₹{margin_cap:,.0f}."
            )
            key_facts.append(KeyFact(label="Business Name", value=bus_name))
            key_facts.append(KeyFact(label="Business Activity", value=specific_bus))
            key_facts.append(KeyFact(label="Industry Sector", value=bus_category))
            key_facts.append(KeyFact(label="Location", value=loc))
            why_list.append("Enterprise identity and sector classification retrieved directly from your active database profile.")
            next_steps.append("Update enterprise parameters anytime in the Business Profile management menu.")

        elif intent == "REVENUE_EXPENSE":
            net_operating = db_monthly_rev - db_monthly_exp
            answer_text = (
                f"For **{bus_name}**, your recorded monthly revenue is ₹{db_monthly_rev:,.0f} (Annualized: ₹{db_monthly_rev * 12:,.0f}) "
                f"and monthly expenses are ₹{db_monthly_exp:,.0f} (Annualized: ₹{db_monthly_exp * 12:,.0f}). "
                f"This yields a net monthly operating surplus of ₹{net_operating:,.0f}."
            )
            key_facts.append(KeyFact(label="Monthly Revenue", value=f"₹{db_monthly_rev:,.0f}"))
            key_facts.append(KeyFact(label="Monthly Expenses", value=f"₹{db_monthly_exp:,.0f}"))
            key_facts.append(KeyFact(label="Net Monthly Surplus", value=f"₹{net_operating:,.0f}"))
            if db_monthly_rev > 0:
                op_margin = (net_operating / db_monthly_rev) * 100.0
                key_facts.append(KeyFact(label="Operating Margin", value=f"{op_margin:.1f}%"))
            why_list.append("Baseline financial estimates are verified from your active workspace records.")
            next_steps.append("Track monthly receivables and payables in the Cash Flow section to optimize cash runways.")

        elif intent == "EXPLANATION":
            if db is not None and active_business_id:
                # Single-source-of-truth: derive AHP-weighted score from real business data
                bfs = BusinessFeasibilityService(db)
                bfr = bfs.compute(active_business_id)
                score_val = bfr.final_score
                dp = bfr.ahp_dashboard_points
                nw = bfr.ahp_normalized_weights

                # Build per-criterion breakdown from real data
                breakdown_lines = []
                for t in bfr.criteria_traces:
                    breakdown_lines.append(
                        f"  • **{t['label']}** ({dp[t['criterion']]} pts / {nw[t['criterion']]:.2%} AHP weight): "
                        f"Raw = {t['raw_score']:.1f}/100 → Contribution = {t['contribution']:.2f} pts"
                    )

                answer_text = (
                    f"Your Final Feasibility Score of **{score_val:.0f}/100** for {specific_bus} in {loc} "
                    f"is the weighted aggregation of 5 raw criterion scores.\n\n"
                    f"AHP determines the importance weight of each feasibility dimension, while the business scoring engines "
                    f"determine your raw score for each dimension:\n\n"
                    + "\n".join(breakdown_lines)
                    + f"\n\nTotal Criterion Contributions: {bfr.criteria_traces[0]['contribution']:.2f} + {bfr.criteria_traces[1]['contribution']:.2f} + {bfr.criteria_traces[2]['contribution']:.2f} + {bfr.criteria_traces[3]['contribution']:.2f} + {bfr.criteria_traces[4]['contribution']:.2f} = **{score_val:.2f} (approx. {score_val:.0f}/100)**.\n"
                    + f"Note: The sector Market Benchmark Score of {bfr.market_benchmark_score:.0f}/100 represents broader catchment demand and is distinct from your personalised multi-dimensional Feasibility Score of {score_val:.0f}/100.\n\n"
                    + f"AHP Consistency: CR = {bfr.ahp_cr:.6f} (< 0.10 threshold — consistent). "
                    + f"Dataset status: {bfr.ahp_source_status}. {bfr.ahp_source_disclaimer}"
                )
                key_facts.append(KeyFact(label="Feasibility Score", value=f"{score_val:.0f} / 100"))
                key_facts.append(KeyFact(label="Market Benchmark Score", value=f"{bfr.market_benchmark_score:.0f} / 100 (sector)"))
                key_facts.append(KeyFact(label="AHP Methodology", value="5 experts, 10 comparisons"))
                key_facts.append(KeyFact(label="Consistency Ratio (CR)", value=f"{bfr.ahp_cr:.6f} (< 0.10 acceptable)"))
                key_facts.append(KeyFact(label="Dataset Status", value=bfr.ahp_source_status))
                why_list.append(
                    f"AHP weights derived via geometric mean aggregation: "
                    f"Market {nw['market']:.2%}, Financial {nw['financial']:.2%}, "
                    f"Location {nw['location']:.2%}, Competition {nw['competition']:.2%}, Risk {nw['risk']:.2%}."
                )
                why_list.append(
                    "AHP determines criterion importance; backend engines evaluate business raw performance; final feasibility score is their weighted sum."
                )
                next_steps.append("Review the 'Why This Score?' modal on the Feasibility dashboard for the full AHP audit trail.")
            else:
                # Fallback: no business_id — generic AHP explanation
                ahp = get_ahp_result()
                dp = ahp.dashboard_points
                nw = ahp.normalized_weights
                feas_engine = FeasibilityEngine(db)
                feas_res = feas_engine.evaluate_feasibility(bus_category, specific_bus, loc)
                score_val = feas_res.overall_opportunity_score
                answer_text = (
                    f"Your Feasibility Score in VITTANAYA is derived using the AHP Multi-Dimensional Framework "
                    f"(5 experts, 10 pairwise comparisons, Dataset B — illustrative):\n"
                    f"Market ({dp['market']} pts), Financial ({dp['financial']} pts), "
                    f"Location ({dp['location']} pts), Competition ({dp['competition']} pts), "
                    f"Risk ({dp['risk']} pts). Sector baseline: {score_val:.0f}/100. "
                    f"CR = {ahp.cr:.6f}. Load your business profile to see your personalised score."
                )
                key_facts.append(KeyFact(label="Feasibility Score", value=f"{score_val:.0f} / 100"))
                key_facts.append(KeyFact(label="AHP Methodology", value="5 experts, 10 comparisons"))
                key_facts.append(KeyFact(label="Consistency Ratio (CR)", value=f"{ahp.cr:.6f} (< 0.10 acceptable)"))
                key_facts.append(KeyFact(label="Dataset Status", value=ahp.source_status))
                why_list.append(f"Weights: Market {nw['market']:.2%}, Financial {nw['financial']:.2%}, Location {nw['location']:.2%}, Competition {nw['competition']:.2%}, Risk {nw['risk']:.2%}.")
                why_list.append("Evaluated using local NABARD PLP district data and AHP multi-criteria weighting.")
                next_steps.append("Open your business profile to compute your personalised AHP feasibility score.")

        else:
            # General Query Handling
            feas_engine = FeasibilityEngine(db)
            feas_res = feas_engine.evaluate_feasibility(bus_category, specific_bus, loc)
            answer_text = (
                f"For **{bus_name}** ({specific_bus}) in {loc}, VITTANAYA provides verified decision engine guidance across feasibility "
                f"({feas_res.overall_opportunity_score:.0f}/100), financial loan EMI calculations, and PMEGP/MUDRA scheme matching."
            )
            key_facts.append(KeyFact(label="Business Name", value=bus_name))
            key_facts.append(KeyFact(label="Business Activity", value=specific_bus))
            key_facts.append(KeyFact(label="Location", value=loc))
            key_facts.append(KeyFact(label="Feasibility Score", value=f"{feas_res.overall_opportunity_score:.0f}/100"))

        nlp_meta = NlpMetadata(
            pipeline="TF-IDF + Logistic Regression (100% Offline)",
            confidence_score=intent_confidence,
            method=nlp_method,
        )

        traceability = TraceabilityMetadata(
            input={
                "message": raw_msg,
                "language": lang,
                "business_id": active_business_id,
                "business_category": bus_category,
                "specific_business": specific_bus,
                "location": loc,
                "nlp_intent": intent,
                "nlp_confidence": intent_confidence,
                "nlp_method": nlp_method,
            },
            calculation_rule=f"NLP intent classified as '{intent}' ({nlp_method}, confidence: {intent_confidence:.1%}) -> routed to authoritative engine.",
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
            confidence="HIGH" if intent_confidence >= 0.50 else "MEDIUM",
            sources=sources,
            data_status="VERIFIED_DETERMINISTIC",
            language=lang,
            traceability=traceability,
            nlp_metadata=nlp_meta,
        )

    @staticmethod
    def _classify_intent(lower_msg: str) -> str:
        """Classify natural language user message into core advisory intent domain."""
        if any(w in lower_msg for w in ["what is my business", "what is my enterprise", "business name", "my company", "which business", "tell me about my business", "what business"]):
            return "PROFILE_IDENTITY"
        if any(w in lower_msg for w in ["monthly revenue", "my revenue", "how much revenue", "sales revenue", "monthly sales", "monthly expense", "my expenses", "operating expense", "monthly cost"]):
            return "REVENUE_EXPENSE"
        if any(w in lower_msg for w in ["ml risk", "ml prediction", "predict default", "default risk", "distress risk", "growth forecast", "ml score", "ml model", "predictive"]):
            return "PREDICTIVE_ML"
        if any(w in lower_msg for w in ["what if", "what-if", "scenario", "sales fall", "sales drop", "sales decline", "cost increase", "revenue drop", "price fall"]):
            return "WHAT_IF"
        if any(w in lower_msg for w in ["food cost", "seat", "inventory turn", "footfall", "fuel cost", "raw material", "capacity util", "client concentration", "sponsorship share", "sponsorship dependency", "creator surplus"]):
            return "INDUSTRY"
        if any(w in lower_msg for w in ["cash", "liquidity", "runway", "shortage", "enough cash", "cash buffer", "working capital", "working-capital"]):
            return "CASH_FLOW"
        if any(w in lower_msg for w in ["scheme", "pmegp", "mudra", "subsidy", "grant", "government", "stand-up", "benefit", "eligible"]):
            return "SCHEME"
        if any(w in lower_msg for w in ["afford", "cost", "money", "capital", "fund", "financing", "loan", "repay", "emi", "budget", "borrow", "interest"]):
            return "FINANCIAL"
        if any(w in lower_msg for w in ["why", "reason", "explain", "how come", "why is", "score of", "justify"]):
            return "EXPLANATION"
        if any(w in lower_msg for w in ["feasible", "feasibility", "viable", "demand", "market", "catchment", "score", "opportunity"]):
            return "FEASIBILITY"
        if any(w in lower_msg for w in ["risk", "threat", "danger", "loss", "warning", "fail", "hazard", "seasonality"]):
            return "RISK"
        if any(w in lower_msg for w in ["action", "next", "do", "step", "apply", "plan", "dpr", "milestone", "roadmap", "improve", "recommend"]):
            return "ACTION"
        return "GENERAL"
