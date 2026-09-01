"""Authoritative Industry-Adaptive Business Intelligence Service for VITTANAYA (SIH26091).

Provides sector-specific configuration, KPI calculation, risk signal detection,
revenue/expense normalization, and scenario simulations for Manufacturing, Retail,
Restaurant, Transport, Services, and Creator industries.
"""

from typing import Dict, List, Optional, Tuple

from sqlalchemy.orm import Session

from backend.app.core.industry_config import (
    INDUSTRY_CONFIGS,
    INDUSTRY_CREATOR,
    INDUSTRY_MANUFACTURING,
    INDUSTRY_RESTAURANT,
    INDUSTRY_RETAIL,
    INDUSTRY_SERVICES,
    INDUSTRY_TRANSPORT,
    SUPPORTED_INDUSTRIES,
)
from backend.app.repositories.business_repository import BusinessRepository
from backend.app.schemas.industry import (
    IndustryAnalysisRequest,
    IndustryAnalysisResponse,
    IndustryFieldDefinition,
    IndustryKpiItem,
    IndustryRiskSignal,
    IndustryScenarioResult,
    IndustryTemplateResponse,
)
from backend.app.schemas.insights import TraceabilityMetadata


class IndustryService:
    """Deterministic Industry Intelligence Engine."""

    @staticmethod
    def _map_category_to_code(cat_str: Optional[str]) -> str:
        """Map raw user business type/category string to one of 6 supported industry codes."""
        if not cat_str:
            return INDUSTRY_MANUFACTURING
        c = cat_str.upper()
        if any(w in c for w in ["RETAIL", "SHOP", "STORE", "TRADE", "GROCERY"]):
            return INDUSTRY_RETAIL
        if any(w in c for w in ["RESTAURANT", "FOOD", "DABHA", "CAFE", "EATERY", "BAKERY", "CATERING"]):
            return INDUSTRY_RESTAURANT
        if any(w in c for w in ["TRANSPORT", "VEHICLE", "TAXI", "TRUCK", "LOGISTICS", "CARGO", "AUTO"]):
            return INDUSTRY_TRANSPORT
        if any(w in c for w in ["SERVICE", "IT", "SOFTWARE", "CONSULTING", "AGENCY", "PROFESSIONAL"]):
            return INDUSTRY_SERVICES
        if any(w in c for w in ["CREATOR", "DIGITAL", "MEDIA", "YOUTUBE", "CONTENT", "BLOG", "STUDIO"]):
            return INDUSTRY_CREATOR
        return INDUSTRY_MANUFACTURING

    @staticmethod
    def get_templates() -> List[IndustryTemplateResponse]:
        """Return available industry input templates for progressive UI intake."""
        templates: List[IndustryTemplateResponse] = []
        for code, cfg in INDUSTRY_CONFIGS.items():
            fields = [IndustryFieldDefinition(**f) for f in cfg["fields"]]
            templates.append(
                IndustryTemplateResponse(
                    industry_code=code,
                    display_name=cfg["display_name"],
                    description=cfg["description"],
                    fields=fields,
                )
            )
        return templates

    @staticmethod
    def analyze(
        payload: IndustryAnalysisRequest,
        db: Optional[Session] = None,
    ) -> IndustryAnalysisResponse:
        """Analyze industry-specific variables, compute sector KPIs, generate risk signals, and normalize monthly revenue/expenses."""
        ind_code = payload.industry_code.upper()
        if ind_code not in SUPPORTED_INDUSTRIES:
            ind_code = INDUSTRY_MANUFACTURING

        cfg = INDUSTRY_CONFIGS[ind_code]
        display_name = cfg["display_name"]

        # Merge input variables with default configuration values
        merged_vars: Dict[str, float] = {}
        for f in cfg["fields"]:
            key = f["key"]
            val = payload.variables.get(key)
            if val is not None and str(val).strip() != "":
                try:
                    merged_vars[key] = max(0.0, float(val))
                except (ValueError, TypeError):
                    merged_vars[key] = float(f["default"])
            else:
                merged_vars[key] = float(f["default"])

        # Determine Data Status
        data_status = "ESTIMATE"
        if payload.business_id and db:
            try:
                repo = BusinessRepository(db)
                biz = repo.get_by_id(int(payload.business_id))
                if biz and (biz.monthly_revenue_estimate or biz.monthly_expense_estimate):
                    data_status = "ACTUAL"
            except Exception:
                pass

        # Dispatch Sector-Specific Analytics
        if ind_code == INDUSTRY_MANUFACTURING:
            rev, exp, kpis, risks = IndustryService._analyze_manufacturing(merged_vars, data_status)
        elif ind_code == INDUSTRY_RETAIL:
            rev, exp, kpis, risks = IndustryService._analyze_retail(merged_vars, data_status)
        elif ind_code == INDUSTRY_RESTAURANT:
            rev, exp, kpis, risks = IndustryService._analyze_restaurant(merged_vars, data_status)
        elif ind_code == INDUSTRY_TRANSPORT:
            rev, exp, kpis, risks = IndustryService._analyze_transport(merged_vars, data_status)
        elif ind_code == INDUSTRY_SERVICES:
            rev, exp, kpis, risks = IndustryService._analyze_services(merged_vars, data_status)
        else:  # CREATOR
            rev, exp, kpis, risks = IndustryService._analyze_creator(merged_vars, data_status)

        # Run Sector What-If Scenario
        scenario_res = IndustryService._run_scenario(ind_code, merged_vars, rev, exp)

        traceability = TraceabilityMetadata(
            input={
                "business_id": payload.business_id,
                "industry_code": ind_code,
                "variables": merged_vars,
            },
            calculation_rule=f"Sector-specific KPI & risk calculation pipeline for {display_name}.",
            source_authority=f"VITTANAYA {display_name} Intelligence Model",
            source_year="2026",
            provenance_priority="DETERMINISTIC_GROUNDED",
        )

        return IndustryAnalysisResponse(
            business_id=payload.business_id,
            industry_code=ind_code,
            display_name=display_name,
            normalized_monthly_revenue=round(rev, 2),
            normalized_monthly_expense=round(exp, 2),
            kpis=kpis,
            risk_signals=risks,
            scenario_result=scenario_res,
            data_status=data_status,
            traceability=traceability,
        )

    @staticmethod
    def _analyze_manufacturing(v: Dict[str, float], status: str) -> Tuple[float, float, List[IndustryKpiItem], List[IndustryRiskSignal]]:
        cap = v["production_capacity_units"]
        util = v["utilization_pct"]
        wastage = v["wastage_pct"]
        price = v["selling_price_per_unit"]
        cost = v["unit_cost"]
        mat_pct = v["raw_material_cost_pct"]

        effective_units = cap * (util / 100.0) * (1.0 - wastage / 100.0)
        rev = effective_units * price
        mat_cost = rev * (mat_pct / 100.0)
        exp = mat_cost + (effective_units * cost * 0.3)

        margin_pct = (((price - cost) / price) * 100.0) if price > 0 else 0.0
        break_even_units = round(exp / (price - cost), 0) if (price > cost) else 0.0
        wastage_loss = (cap * (util / 100.0) * (wastage / 100.0)) * cost

        kpis = [
            IndustryKpiItem(key="capacity_utilization", label="Capacity Utilization", value=util, formatted_value=f"{util:.1f}%", unit="%", data_status=status, benchmark_advice="Target >= 75% for optimal machine efficiency."),
            IndustryKpiItem(key="contribution_margin", label="Contribution Margin Ratio", value=round(margin_pct, 1), formatted_value=f"{margin_pct:.1f}%", unit="%", data_status=status, benchmark_advice="Higher margin absorbs fixed factory overheads."),
            IndustryKpiItem(key="break_even_units", label="Monthly Production Break-Even", value=break_even_units, formatted_value=f"{break_even_units:,.0f} Units", unit="Units", data_status=status, benchmark_advice="Minimum production required to cover monthly operating costs."),
            IndustryKpiItem(key="wastage_loss", label="Monthly Scrap / Wastage Loss", value=round(wastage_loss, 0), formatted_value=f"₹{wastage_loss:,.0f}", unit="INR", data_status=status, benchmark_advice="Keep scrap loss below 3% of raw material throughput."),
        ]

        risks = []
        if mat_pct > 60.0:
            risks.append(IndustryRiskSignal(risk_name="Raw Material Volatility", severity="HIGH", reason=f"Raw material accounts for {mat_pct:.1f}% of production cost.", recommendation="Hedge prices with long-term supplier contracts."))
        if util < 55.0:
            risks.append(IndustryRiskSignal(risk_name="Capacity Under-Utilization", severity="MEDIUM", reason=f"Factory is operating at only {util:.1f}% capacity.", recommendation="Seek B2B contract manufacturing work to absorb idle capacity."))
        if wastage > 5.0:
            risks.append(IndustryRiskSignal(risk_name="Excessive Scrap Loss", severity="MEDIUM", reason=f"Production scrap loss rate is {wastage:.1f}%.", recommendation="Implement quality control jigs and operator retraining."))

        return rev, exp, kpis, risks

    @staticmethod
    def _analyze_retail(v: Dict[str, float], status: str) -> Tuple[float, float, List[IndustryKpiItem], List[IndustryRiskSignal]]:
        footfall = v["monthly_footfall"]
        atv = v["average_transaction_value"]
        margin_pct = v["gross_margin_pct"]
        inv_val = v["inventory_value"]
        holding_days = v["stock_holding_days"]

        rev = footfall * atv
        exp = rev * (1.0 - margin_pct / 100.0)
        annual_cogs = exp * 12.0
        inv_turnover = (annual_cogs / inv_val) if inv_val > 0 else 0.0

        kpis = [
            IndustryKpiItem(key="gross_margin", label="Gross Margin Ratio", value=margin_pct, formatted_value=f"{margin_pct:.1f}%", unit="%", data_status=status, benchmark_advice="Retail benchmark: 20% - 30% gross margin."),
            IndustryKpiItem(key="inventory_turnover", label="Annual Inventory Turnover", value=round(inv_turnover, 1), formatted_value=f"{inv_turnover:.1f}x / yr", unit="times", data_status=status, benchmark_advice="Higher turnover prevents cash lock-up in stock."),
            IndustryKpiItem(key="average_transaction", label="Average Transaction Value", value=atv, formatted_value=f"₹{atv:,.0f}", unit="INR", data_status=status, benchmark_advice="Cross-sell impulse products near cash checkout."),
            IndustryKpiItem(key="stock_holding", label="Stock Holding Period", value=holding_days, formatted_value=f"{holding_days:.0f} Days", unit="Days", data_status=status, benchmark_advice="Aim for < 45 days stock holding for liquid cash-flow."),
        ]

        risks = []
        if holding_days > 60.0:
            risks.append(IndustryRiskSignal(risk_name="Inventory Lock-Up Risk", severity="HIGH", reason=f"Stock holding period is high at {holding_days:.0f} days.", recommendation="Discount slow-moving stock to free up working capital."))
        if margin_pct < 18.0:
            risks.append(IndustryRiskSignal(risk_name="Margin Compression", severity="HIGH", reason=f"Gross margin of {margin_pct:.1f}% leaves low buffer for overheads.", recommendation="Renegotiate wholesale distributor margins."))

        return rev, exp, kpis, risks

    @staticmethod
    def _analyze_restaurant(v: Dict[str, float], status: str) -> Tuple[float, float, List[IndustryKpiItem], List[IndustryRiskSignal]]:
        seats = v["seating_capacity"]
        orders_day = v["daily_orders"]
        aov = v["average_order_value"]
        food_pct = v["food_cost_pct"]
        staff_cost = v["staff_cost_monthly"]
        op_days = v["operating_days_monthly"]

        rev = orders_day * aov * op_days
        food_cost = rev * (food_pct / 100.0)
        exp = food_cost + staff_cost + (rev * 0.15)  # Rent & utilities estimate

        rev_per_seat = (rev / seats) if seats > 0 else 0.0
        seat_turns = (orders_day / seats) if seats > 0 else 0.0
        contribution_per_order = aov * (1.0 - food_pct / 100.0)
        be_orders_daily = ((staff_cost + (rev * 0.15)) / (contribution_per_order * op_days)) if contribution_per_order > 0 else 0.0

        kpis = [
            IndustryKpiItem(key="revenue_per_seat", label="Monthly Revenue per Seat", value=round(rev_per_seat, 0), formatted_value=f"₹{rev_per_seat:,.0f} / seat", unit="INR", data_status=status, benchmark_advice="Target >= ₹3,500 monthly revenue per seat."),
            IndustryKpiItem(key="food_cost_ratio", label="Food Cost Ratio", value=food_pct, formatted_value=f"{food_pct:.1f}%", unit="%", data_status=status, benchmark_advice="Maintain food cost between 30% - 35% of revenue."),
            IndustryKpiItem(key="daily_break_even_orders", label="Daily Break-Even Orders", value=round(be_orders_daily, 0), formatted_value=f"{be_orders_daily:.0f} Orders/day", unit="Orders", data_status=status, benchmark_advice="Minimum daily covers required to break even."),
            IndustryKpiItem(key="seat_turnover", label="Seat Turnover Rate", value=round(seat_turns, 2), formatted_value=f"{seat_turns:.1f} Turns/day", unit="Turns", data_status=status, benchmark_advice="Optimizing table turns increases peak hour revenue."),
        ]

        risks = []
        if food_pct > 38.0:
            risks.append(IndustryRiskSignal(risk_name="Food Cost Inflation Pressure", severity="HIGH", reason=f"Food cost ratio is high at {food_pct:.1f}%.", recommendation="Standardize portion sizes and control kitchen ingredient wastage."))
        if seat_turns < 1.0:
            risks.append(IndustryRiskSignal(risk_name="Low Seat Utilization", severity="MEDIUM", reason=f"Average seat turnover is only {seat_turns:.1f} turns per day.", recommendation="Offer lunch combo specials to drive off-peak footfall."))

        return rev, exp, kpis, risks

    @staticmethod
    def _analyze_transport(v: Dict[str, float], status: str) -> Tuple[float, float, List[IndustryKpiItem], List[IndustryRiskSignal]]:
        vehicles = v["vehicle_count"]
        trips = v["monthly_trips_per_vehicle"]
        fare = v["average_fare_per_trip"]
        fuel = v["fuel_cost_per_trip"]
        maint = v["maintenance_cost_monthly"]

        total_trips = vehicles * trips
        rev = total_trips * fare
        tot_fuel = total_trips * fuel
        exp = tot_fuel + maint + (rev * 0.10)

        rev_per_veh = (rev / vehicles) if vehicles > 0 else 0.0
        fuel_pct = ((tot_fuel / rev) * 100.0) if rev > 0 else 0.0

        kpis = [
            IndustryKpiItem(key="revenue_per_vehicle", label="Monthly Revenue per Vehicle", value=round(rev_per_veh, 0), formatted_value=f"₹{rev_per_veh:,.0f} / vehicle", unit="INR", data_status=status, benchmark_advice="Benchmark: ₹45,000+ monthly revenue per commercial vehicle."),
            IndustryKpiItem(key="fuel_cost_ratio", label="Fuel Cost Ratio", value=round(fuel_pct, 1), formatted_value=f"{fuel_pct:.1f}%", unit="%", data_status=status, benchmark_advice="Keep fuel expenditure under 40% of total fares."),
            IndustryKpiItem(key="trips_per_vehicle", label="Trips per Vehicle / Month", value=trips, formatted_value=f"{trips:.0f} Trips", unit="Trips", data_status=status, benchmark_advice="Maximizing monthly trips improves fleet vehicle payback."),
            IndustryKpiItem(key="maintenance_cost", label="Monthly Fleet Maintenance", value=maint, formatted_value=f"₹{maint:,.0f}", unit="INR", data_status=status, benchmark_advice="Schedule preventive maintenance to avoid costly breakdowns."),
        ]

        risks = []
        if fuel_pct > 42.0:
            risks.append(IndustryRiskSignal(risk_name="Fuel Price Sensitivity Risk", severity="HIGH", reason=f"Fuel consumes {fuel_pct:.1f}% of gross fare revenue.", recommendation="Implement fuel-efficient route planning and tire pressure monitoring."))
        if trips < 25.0:
            risks.append(IndustryRiskSignal(risk_name="Fleet Under-Utilization", severity="MEDIUM", reason=f"Vehicles average only {trips:.0f} trips per month.", recommendation="Partner with local aggregators to secure return-trip cargo."))

        return rev, exp, kpis, risks

    @staticmethod
    def _analyze_services(v: Dict[str, float], status: str) -> Tuple[float, float, List[IndustryKpiItem], List[IndustryRiskSignal]]:
        clients = v["active_clients"]
        billing = v["average_monthly_billing_per_client"]
        headcount = v["headcount"]
        salary = v["average_salary_per_employee"]
        recurring_pct = v["recurring_revenue_pct"]

        rev = clients * billing
        tot_salary = headcount * salary
        exp = tot_salary + (rev * 0.15)

        rev_per_emp = (rev / headcount) if headcount > 0 else 0.0
        payroll_pct = ((tot_salary / rev) * 100.0) if rev > 0 else 0.0
        client_conc = (100.0 / clients) if clients > 0 else 100.0

        kpis = [
            IndustryKpiItem(key="revenue_per_employee", label="Revenue per Team Member", value=round(rev_per_emp, 0), formatted_value=f"₹{rev_per_emp:,.0f} / member", unit="INR", data_status=status, benchmark_advice="Services benchmark: ₹60,000+ monthly revenue per employee."),
            IndustryKpiItem(key="payroll_ratio", label="Payroll Cost Share", value=round(payroll_pct, 1), formatted_value=f"{payroll_pct:.1f}%", unit="%", data_status=status, benchmark_advice="Maintain payroll under 60% of service billing."),
            IndustryKpiItem(key="recurring_share", label="Recurring Contract Share", value=recurring_pct, formatted_value=f"{recurring_pct:.1f}%", unit="%", data_status=status, benchmark_advice="High recurring revenue stabilizes monthly cash flow."),
            IndustryKpiItem(key="client_concentration", label="Max Single Client Share", value=round(client_conc, 1), formatted_value=f"~{client_conc:.1f}% max", unit="%", data_status=status, benchmark_advice="Diversify client retainer portfolio to reduce churn risk."),
        ]

        risks = []
        if clients < 5.0:
            risks.append(IndustryRiskSignal(risk_name="High Client Concentration Risk", severity="HIGH", reason=f"Business depends on only {clients:.0f} active retainer clients.", recommendation="Acquire new retainer accounts to diversify revenue concentration."))
        if payroll_pct > 65.0:
            risks.append(IndustryRiskSignal(risk_name="Payroll Overhead Pressure", severity="HIGH", reason=f"Salaries absorb {payroll_pct:.1f}% of total billing.", recommendation="Tie employee bonuses to billable project completion milestones."))

        return rev, exp, kpis, risks

    @staticmethod
    def _analyze_creator(v: Dict[str, float], status: str) -> Tuple[float, float, List[IndustryKpiItem], List[IndustryRiskSignal]]:
        equip = v["equipment_investment"]
        sub = v["recurring_subscription_revenue"]
        spon = v["sponsorship_revenue_monthly"]
        ad = v["platform_ad_revenue_monthly"]
        prod_cost = v["production_cost_monthly"]

        rev = sub + spon + ad
        exp = prod_cost + (rev * 0.10)
        net = rev - exp

        sub_pct = ((sub / rev) * 100.0) if rev > 0 else 0.0
        spon_pct = ((spon / rev) * 100.0) if rev > 0 else 0.0
        payback_months = (equip / net) if net > 0 else 99.0

        kpis = [
            IndustryKpiItem(key="recurring_ratio", label="Recurring Subscription Share", value=round(sub_pct, 1), formatted_value=f"{sub_pct:.1f}%", unit="%", data_status=status, benchmark_advice="Membership revenues buffer seasonal brand sponsorship dips."),
            IndustryKpiItem(key="sponsorship_share", label="Sponsorship Revenue Share", value=round(spon_pct, 1), formatted_value=f"{spon_pct:.1f}%", unit="%", data_status=status, benchmark_advice="Sponsorship deals provide high margin cash inflows."),
            IndustryKpiItem(key="equipment_payback", label="Equipment Payback Period", value=round(payback_months, 1), formatted_value=f"{payback_months:.1f} Months", unit="Months", data_status=status, benchmark_advice="Production gear should pay for itself within 18 months."),
            IndustryKpiItem(key="net_creator_surplus", label="Monthly Creator Surplus", value=round(net, 0), formatted_value=f"₹{net:,.0f}", unit="INR", data_status=status, benchmark_advice="Reinvest surplus into higher-quality camera/editing gear."),
        ]

        risks = []
        if spon_pct > 55.0:
            risks.append(IndustryRiskSignal(risk_name="Sponsorship Dependency Risk", severity="HIGH", reason=f"Sponsorship accounts for {spon_pct:.1f}% of total creator revenue.", recommendation="Launch direct digital products (courses, templates, community)."))
        if sub_pct < 20.0:
            risks.append(IndustryRiskSignal(risk_name="Cash-Flow Volatility Risk", severity="MEDIUM", reason=f"Recurring subscription share is low at {sub_pct:.1f}%.", recommendation="Build a paid Patreon / YouTube Membership community."))

        return rev, exp, kpis, risks

    @staticmethod
    def _run_scenario(code: str, v: Dict[str, float], base_rev: float, base_exp: float) -> IndustryScenarioResult:
        cfg = INDUSTRY_CONFIGS[code]
        sc_info = cfg["default_scenario"]
        name = sc_info["name"]
        param = sc_info["parameter"]
        change = sc_info["change"]

        # Create copy of variables for scenario
        sim_v = dict(v)
        sim_v[param] = sim_v[param] * (1.0 + (change / 100.0))

        if code == INDUSTRY_MANUFACTURING:
            sim_rev, sim_exp, _, _ = IndustryService._analyze_manufacturing(sim_v, "ESTIMATE")
        elif code == INDUSTRY_RETAIL:
            sim_rev, sim_exp, _, _ = IndustryService._analyze_retail(sim_v, "ESTIMATE")
        elif code == INDUSTRY_RESTAURANT:
            sim_rev, sim_exp, _, _ = IndustryService._analyze_restaurant(sim_v, "ESTIMATE")
        elif code == INDUSTRY_TRANSPORT:
            sim_rev, sim_exp, _, _ = IndustryService._analyze_transport(sim_v, "ESTIMATE")
        elif code == INDUSTRY_SERVICES:
            sim_rev, sim_exp, _, _ = IndustryService._analyze_services(sim_v, "ESTIMATE")
        else:
            sim_rev, sim_exp, _, _ = IndustryService._analyze_creator(sim_v, "ESTIMATE")

        base_net = base_rev - base_exp
        sim_net = sim_rev - sim_exp

        return IndustryScenarioResult(
            scenario_name=name,
            baseline_revenue_monthly=round(base_rev, 2),
            simulated_revenue_monthly=round(sim_rev, 2),
            revenue_delta=round(sim_rev - base_rev, 2),
            baseline_net_monthly=round(base_net, 2),
            simulated_net_monthly=round(sim_net, 2),
            net_delta=round(sim_net - base_net, 2),
            description=f"Sensitivity shock on {param} ({change:+.0f}% change).",
        )
