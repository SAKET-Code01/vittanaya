# VITTANAYA Feasibility & Local Opportunity Engine (`feasibility_engine.md`)

## Overview
The **Feasibility Engine** assesses local market dynamics for rural micro-entrepreneurs. It evaluates market reach, market opportunity, competition density, pricing structure, threats, and SWOT analysis.

## Strict Data Integrity Policy
> [!CAUTION]
> **No Fabricated Market Statistics**: If empirical local market data is unavailable for a given sector/location combination, the engine returns:
> `"Data insufficient"`
> for market reach, opportunity, competitor level, pricing, and threats, rather than inventing unverified statistics.

## Verified Odisha Empirical Benchmarks
The engine includes verified empirical benchmarks derived from NABARD Odisha PLPs and KVIC sector studies for core rural activities:
- **Dairy / Cattle Farming** (OMFED collection guarantee, liquid daily cash flow)
- **Broiler / Layer Poultry** (Block-level meat deficit, 40-45 day batch cycle)
- **Agro Processing** (Cashew, turmeric, pulses, spices value addition; PM-FME eligibility)
- **Composite Fisheries** (ODISHA fish consumption demand, 8-10 month crop cycle)
- **Transport & Logistics** (Mandi-to-urban transport, light commercial vehicles)
- **Artisan & Crafts** (PM Vishwakarma 5% subvention, ORMAS & export potential)

## Outputs Computed
- `market_reach`: Geographical target market
- `opportunity`: Identified local market demand driver
- `competitor_level`: Local vendor density & structure
- `pricing`: Sector benchmark pricing & margins
- `threats`: Verified sector threats
- `SWOT`: Structured strengths, weaknesses, opportunities, threats
- `overall_opportunity_score`: 0-100 deterministic feasibility score
- `is_data_sufficient`: Boolean flag indicating empirical data availability

## API Contract
- Endpoint: `POST /api/feasibility`
