"""What-If Simulation Engine for VITTANAYA (SIH26091).

Recalculates revenue, operating cost, financing need, surplus, and risk under isolated scenarios:
- sales_change (% change)
- cost_change (% change)
- price_change (% change)
- financing_change (% change)
- demand_change (% change)

Strict Principle: Never modify the original business plan. Every simulation creates an isolated scenario.
"""

from backend.app.schemas.insights import (
    SimulationResponse,
    SimulationScenarioResult,
    TraceabilityMetadata,
)


class WhatIfEngine:
    """Isolated What-If Scenario Simulation Engine."""

    def simulate(
        self,
        baseline_project_cost: float,
        baseline_available_margin: float,
        baseline_sales_annual: float,
        baseline_operating_cost_annual: float,
        sales_change: float = 0.0,
        cost_change: float = 0.0,
        price_change: float = 0.0,
        financing_change: float = 0.0,
        demand_change: float = 0.0,
    ) -> SimulationResponse:
        """Run isolated scenario simulation without altering baseline data."""
        # 1. Baseline Calculation
        base_financing_need = max(0.0, baseline_project_cost - baseline_available_margin)
        base_surplus = baseline_sales_annual - baseline_operating_cost_annual
        base_margin_pct = (
            (base_surplus / baseline_sales_annual * 100.0) if baseline_sales_annual > 0 else 0.0
        )

        if base_surplus <= 0:
            base_risk = "High"
        elif base_margin_pct < 15.0:
            base_risk = "Medium"
        else:
            base_risk = "Low"

        baseline_result = SimulationScenarioResult(
            revenue=round(baseline_sales_annual, 2),
            operating_cost=round(baseline_operating_cost_annual, 2),
            financing_need=round(base_financing_need, 2),
            surplus=round(base_surplus, 2),
            operating_margin_pct=round(base_margin_pct, 2),
            risk=base_risk,
        )

        # 2. Isolated Simulation Recalculation
        sales_multiplier = 1.0 + (sales_change / 100.0)
        price_multiplier = 1.0 + (price_change / 100.0)
        demand_multiplier = 1.0 + (demand_change / 100.0)

        sim_revenue = (
            baseline_sales_annual * sales_multiplier * price_multiplier * demand_multiplier
        )

        cost_multiplier = 1.0 + (cost_change / 100.0)
        sim_operating_cost = baseline_operating_cost_annual * cost_multiplier

        financing_multiplier = 1.0 + (financing_change / 100.0)
        sim_financing_need = base_financing_need * financing_multiplier

        sim_surplus = sim_revenue - sim_operating_cost
        sim_margin_pct = (sim_surplus / sim_revenue * 100.0) if sim_revenue > 0 else 0.0

        if sim_surplus <= 0:
            sim_risk = "High"
        elif sim_margin_pct < 15.0 or (sales_change + demand_change) < -15.0:
            sim_risk = "Medium"
        else:
            sim_risk = "Low"

        simulated_result = SimulationScenarioResult(
            revenue=round(sim_revenue, 2),
            operating_cost=round(sim_operating_cost, 2),
            financing_need=round(sim_financing_need, 2),
            surplus=round(sim_surplus, 2),
            operating_margin_pct=round(sim_margin_pct, 2),
            risk=sim_risk,
        )

        # 3. Variance Analysis
        variance = {
            "revenue_diff": round(sim_revenue - baseline_sales_annual, 2),
            "revenue_change_pct": round(
                ((sim_revenue - baseline_sales_annual) / baseline_sales_annual * 100.0), 2
            )
            if baseline_sales_annual > 0
            else 0.0,
            "cost_diff": round(sim_operating_cost - baseline_operating_cost_annual, 2),
            "cost_change_pct": round(
                (
                    (sim_operating_cost - baseline_operating_cost_annual)
                    / baseline_operating_cost_annual
                    * 100.0
                ),
                2,
            )
            if baseline_operating_cost_annual > 0
            else 0.0,
            "surplus_diff": round(sim_surplus - base_surplus, 2),
            "financing_need_diff": round(sim_financing_need - base_financing_need, 2),
        }

        traceability = TraceabilityMetadata(
            input={
                "baseline_project_cost": baseline_project_cost,
                "baseline_available_margin": baseline_available_margin,
                "baseline_sales_annual": baseline_sales_annual,
                "baseline_operating_cost_annual": baseline_operating_cost_annual,
                "sales_change": sales_change,
                "cost_change": cost_change,
                "price_change": price_change,
                "financing_change": financing_change,
                "demand_change": demand_change,
            },
            calculation_rule=(
                f"Isolated scenario simulation: sim_revenue = base_sales * (1 + sales%) * (1 + price%) * (1 + demand%) "
                f"= {sim_revenue:.2f} INR. sim_operating_cost = base_cost * (1 + cost%) = {sim_operating_cost:.2f} INR. "
                f"Net surplus delta = {variance['surplus_diff']:.2f} INR."
            ),
            source_authority="VITTANAYA Sensitivity Simulation Engine",
            source_year="2026",
            provenance_priority="ISOLATED_SIMULATION",
            official_source_url=None,
        )

        return SimulationResponse(
            baseline=baseline_result,
            simulated=simulated_result,
            variance=variance,
            isolated_scenario=True,
            traceability=traceability,
        )
