# VITTANAYA Scheme Match Engine Specification (`scheme_engine.md`)

## Overview
The **Scheme Match Engine** evaluates micro-enterprise proposals against government credit and subsidy schemes using 100% deterministic eligibility rules stored in the `scheme_rules` database table.

## Supported Schemes
1. **PMEGP (Prime Minister's Employment Generation Programme)**
   - Manufacturing Ceiling: ₹50 Lakhs | Service Ceiling: ₹20 Lakhs
   - Subsidy: Rural (General 25%, Special 35%) | Urban (General 15%, Special 25%)
   - Margin Required: General 10%, Special 5%
   - Note: Trading/retail activities restricted under current guidelines.
2. **PM MUDRA Yojana**
   - Shishu: up to ₹50,000 (0% margin, 0% collateral)
   - Kishor: ₹50,000 to ₹5 Lakhs (10% margin, 0% collateral)
   - Tarun: ₹5 Lakhs to ₹10 Lakhs (10% margin, 0% collateral)
3. **PM-FME (PM Formalisation of Micro food processing Enterprises Scheme)**
   - 35% credit-linked capital subsidy up to max ₹10 Lakhs for food processing & agro units.
4. **PM Vishwakarma Scheme**
   - Enterprise loan up to ₹3 Lakhs with 8% interest subvention (effective borrower rate 5%).
   - Targeted at traditional artisans, weavers, and craftspeople.
5. **Stand Up India**
   - Bank loans from ₹10 Lakhs to ₹1 Crore for SC/ST or Women entrepreneurs.

## Deterministic Rule Matching Logic
$$\text{req\_margin\_amt} = \left(\frac{\text{req\_margin\_pct}}{100}\right) \times \text{indicative\_project\_cost}$$

$$\text{raw\_subsidy} = \left(\frac{\text{subsidy\_pct}}{100}\right) \times \text{indicative\_project\_cost}$$

$$\text{estimated\_subsidy} = \min(\text{raw\_subsidy}, \text{max\_subsidy\_amount})$$

$$\text{eligible\_loan\_amount} = \max(0.0, \text{indicative\_project\_cost} - \text{available\_margin\_capital} - \text{estimated\_subsidy})$$

## Database Schema (`scheme_rules`)
| Field | Type | Description |
|---|---|---|
| `scheme_code` | String(50) (Unique) | Scheme identifier code |
| `scheme_name` | String(255) | Official name |
| `max_project_cost_mfg` | Float | Manufacturing cost limit |
| `max_project_cost_service` | Float | Service cost limit |
| `min_margin_pct_gen` | Float | General margin % |
| `min_margin_pct_special` | Float | Special category margin % |
| `max_subsidy_pct_rural_gen` | Float | Rural general subsidy % |
| `max_subsidy_pct_rural_special` | Float | Rural special subsidy % |
| `trading_restricted` | Boolean | True if trading restricted |
| `source_authority` | String(255) | Issuing ministry |
| `source_year` | String(100) | Guideline year |
| `official_source_url` | Text | Guidelines URL |

## API Contract
- Endpoint: `POST /api/scheme-match`
- Output: `eligible_schemes`, `ineligible_schemes`, `best_recommendation`, `traceability`.
