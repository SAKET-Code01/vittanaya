# VITTANAYA Insights Architecture (SIH26091)

## Overview
The **VITTANAYA Insights Backend** is a hyper-local business advisory and financial structuring engine developed for **Smart India Hackathon Problem SIH26091** (Ministry of Social Justice and Empowerment - MoSJE). It provides deterministic financial calculation, project-cost lookup, scheme matching, feasibility scoring, risk advisory, what-if scenario simulation, and zero-hallucination AI advice for rural micro-entrepreneurs.

## Architectural Principles
1. **100% Deterministic Financial Calculation**: Financial numbers, cost lookups, scheme eligibility, and risk scores are computed strictly via Python/SQLAlchemy algorithms. No LLM is involved in financial arithmetic.
2. **Odisha-First Priority Hierarchy**: Project cost lookup enforces an explicit source hierarchy (`ODISHA_DISTRICT_PRIMARY` > `ODISHA_OBSERVED_PRIMARY` > `INDIA_OFFICIAL_FALLBACK`). Costs are never fabricated.
3. **Indicative Naming Mandate**: Calculated costs are strictly designated as `indicative_project_cost`.
4. **Isolated What-If Simulation**: Scenario simulation never modifies the underlying baseline business plan.
5. **Zero-Hallucination AI Advisor**: The LLM / Advisor component receives ONLY structured backend JSON results and formats natural language advice without introducing unverified figures.
6. **Full Traceability**: Every output contains a `traceability` block recording input parameters, calculation formulas, and official issuing authorities/URLs.

## High-Level Architecture Diagram
```
+-----------------------------------------------------------------------------------+
|                                 FASTAPI APPLICATION                               |
|                                                                                   |
|  POST /api/insights/analyze  POST /api/project-cost  POST /api/scheme-match       |
|  POST /api/feasibility       POST /api/risk-analysis POST /api/simulation       |
|  POST /api/advisor                                                                |
+-----------------------------------------------------------------------------------+
                                         |
     +-----------------------------------+-----------------------------------+
     |                                   |                                   |
+----+-------------------+     +---------+---------+               +---------+---------+
| ProjectCostEngine      |     | SchemeEngine      |               | FeasibilityEngine |
| (Odisha Cost Library)  |     | (Scheme Rules DB) |               | (Local Benchmarks)|
+------------------------+     +-------------------+               +-------------------+
     |                                   |                                   |
     +-----------------------------------+-----------------------------------+
                                         |
     +-----------------------------------+-----------------------------------+
     |                                   |                                   |
+----+-------------------+     +---------+---------+               +---------+---------+
| FinancialEngine        |     | RiskEngine        |               | WhatIfEngine      |
| (Gap Analysis)         |     | (Multi-Risk Model)|               | (Isolated Scenario|
+------------------------+     +-------------------+               +-------------------+
                                         |
                                         v
                         +-------------------------------+
                         | AIBusinessAdvisor             |
                         | (Zero-Hallucination Synthesis)|
                         +-------------------------------+
```

## System Components
- **`ProjectCostEngine`**: Sourced from `project_cost_references` table (seeded from `VITTANAYA_ODISHA_200PLUS_PROJECT_COST_LIBRARY.csv`).
- **`FinancialEngine`**: Computes `financing_requirement = indicative_project_cost - available_margin_capital`.
- **`SchemeEngine`**: Matches rules stored in `scheme_rules` table (PMEGP, MUDRA, PM-FME, PM Vishwakarma, Stand Up India).
- **`FeasibilityEngine`**: Grounded in verified sector profiles or returns `"Data insufficient"` per strict integrity rules.
- **`RiskEngine`**: Evaluates 5 risk dimensions (market, competition, operational, seasonality, financial).
- **`WhatIfEngine`**: Recalculates isolated scenario outcomes under parameter perturbations.
- **`AIBusinessAdvisor`**: Generates plain-language summaries, justifications, and next steps for micro-entrepreneurs.

## Database Schemas
- `project_cost_references`: 292 official reference cost rows preserving 15 metadata fields.
- `scheme_rules`: Structured rule parameters for state and central credit schemes.
