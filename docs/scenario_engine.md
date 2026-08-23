# VITTANAYA What-If Simulation Engine Specification (`scenario_engine.md`)

## Overview
The **What-If Simulation Engine** allows rural entrepreneurs and business advisors to stress-test business plans against sensitivity inputs without mutating the underlying baseline parameters.

## Core Principle: Isolated Scenarios
> [!IMPORTANT]
> **Plan Immutability Mandate**: Every scenario simulation executes in an isolated environment. The original business plan data is NEVER altered or mutated.

## Supported Simulation Inputs
- `sales_change`: Percentage change in sales volume (e.g. -10.0%)
- `cost_change`: Percentage change in operating cost (e.g. +5.0%)
- `price_change`: Percentage change in selling price (e.g. -5.0%)
- `financing_change`: Percentage change in financing requirement (e.g. +10.0%)
- `demand_change`: Percentage change in overall demand (e.g. -15.0%)

## Recalculation Formulas
$$\text{sim\_revenue} = \text{base\_sales} \times \left(1 + \frac{\text{sales\_change}}{100}\right) \times \left(1 + \frac{\text{price\_change}}{100}\right) \times \left(1 + \frac{\text{demand\_change}}{100}\right)$$

$$\text{sim\_operating\_cost} = \text{base\_cost} \times \left(1 + \frac{\text{cost\_change}}{100}\right)$$

$$\text{sim\_financing\_need} = \text{base\_financing\_need} \times \left(1 + \frac{\text{financing\_change}}{100}\right)$$

$$\text{sim\_surplus} = \text{sim\_revenue} - \text{sim\_operating\_cost}$$

$$\text{operating\_margin\_pct} = \left(\frac{\text{sim\_surplus}}{\text{sim\_revenue}}\right) \times 100$$

## Outputs Computed
- `baseline`: Original scenario figures (`revenue`, `operating_cost`, `financing_need`, `surplus`, `operating_margin_pct`, `risk`).
- `simulated`: Recalculated isolated scenario figures.
- `variance`: Exact diffs and percentage variances (`revenue_diff`, `revenue_change_pct`, `cost_diff`, `surplus_diff`, `financing_need_diff`).
- `isolated_scenario`: Always `true`.

## API Contract
- Endpoint: `POST /api/simulation`
