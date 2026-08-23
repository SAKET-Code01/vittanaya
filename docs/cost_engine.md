# VITTANAYA Project Cost Engine Specification (`cost_engine.md`)

## Overview
The **Project Cost Engine** provides official, auditable indicative project cost estimates for rural micro-enterprises in Odisha.

## Provenance Priority Rules
The engine queries the database table `project_cost_references` enforcing strict priority sorting:

1. **`ODISHA_DISTRICT_PRIMARY`**: NABARD Sundargarh PLP 2025-26 Annexure 4/5 official unit costs & scale of finance. First choice for Odisha district-specific estimates.
2. **`ODISHA_OBSERVED_PRIMARY`**: Official KVIC/PMEGP Odisha portal beneficiary project claim records. Observed project costs for actual Odisha projects.
3. **`INDIA_OFFICIAL_FALLBACK`**: KVIC/PMEGP national model project profiles. Official national fallback when district-specific records are unavailable.

> [!IMPORTANT]
> **Strict Prohibition**: The engine will NEVER invent or hallucinate project costs. If no matching record exists in the library, an HTTP 404 error is raised with details.

## Calculation Formula
All calculated outputs are explicitly designated as `indicative_project_cost`:
$$\text{indicative\_project\_cost} = \frac{\text{reference\_cost\_min\_inr} + \text{reference\_cost\_max\_inr}}{2}$$

## Database Schema (`project_cost_references`)
| Field | Type | Description |
|---|---|---|
| `id` | Integer (PK) | Unique Identifier |
| `business_activity` | String(255) | Specific activity name |
| `category` | String(100) | Broad sector category |
| `scale_or_specification` | String(255) | Scale or capacity specification |
| `unit` | String(50) | Unit of scale (e.g. 1000 birds, ha, unit) |
| `reference_cost_min_inr` | Float | Min reference cost in INR |
| `reference_cost_max_inr` | Float | Max reference cost in INR |
| `cost_basis` | String(255) | Basis of reference cost |
| `source_authority` | String(255) | Issuing authority (NABARD, KVIC, etc.) |
| `source_year` | String(100) | Reference year (e.g. 2025-26 PLP) |
| `state_or_scope` | String(255) | Geographic scope |
| `source_page` | String(255) | Document page/annexure reference |
| `official_source_url` | Text | URL of official document |
| `notes` | Text | Important caveats & notes |
| `provenance_priority` | String(100) | Priority rank |
| `use_for_vittanaya` | Text | Usage recommendation |

## API Contract
- Endpoint: `POST /api/project-cost`
- Input: `business_activity`, `business_category` (optional), `location`, `scale` (optional)
- Output: `indicative_project_cost`, `reference_cost_min_inr`, `reference_cost_max_inr`, `scale_or_specification`, `unit`, `source_authority`, `source_year`, `provenance_priority`, `official_source_url`, `traceability`.
