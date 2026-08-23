# VITTANAYA Risk Advisory Engine Specification (`risk_engine.md`)

## Overview
The **Risk Advisory Engine** evaluates micro-enterprise operational, financial, market, competitive, and seasonal vulnerabilities to provide actionable risk mitigation strategies.

## Five Risk Dimensions
1. **Market Risk** (Weight: 15%): Demand elasticity, customer concentration, and purchasing power dependency.
2. **Competition Risk** (Weight: 15%): Local competitor density and price undercut risk.
3. **Operational Risk** (Weight: 20%): Perishability, cold-chain / power dependency, and biosecurity requirements.
4. **Seasonality Risk** (Weight: 20%): Vulnerability to monsoon, summer heat, or crop cycle dips.
5. **Financial Risk** (Weight: 30%): Calculated deterministically from loan leverage and margin equity shortfall:
   $$\text{debt\_ratio} = \frac{\text{financing\_requirement}}{\text{indicative\_project\_cost}}$$
   - `debt_ratio >= 0.90` $\rightarrow$ High Financial Risk (Score 85)
   - `0.75 <= debt_ratio < 0.90` $\rightarrow$ Medium Financial Risk (Score 60)
   - `debt_ratio < 0.75` $\rightarrow$ Low Financial Risk (Score 30)

## Overall Risk Score & Classification
$$\text{overall\_score} = (0.30 \times \text{financial}) + (0.20 \times \text{operational}) + (0.20 \times \text{seasonality}) + (0.15 \times \text{market}) + (0.15 \times \text{competition})$$

- $\text{overall\_score} \ge 65.0 \rightarrow$ **High Risk**
- $40.0 \le \text{overall\_score} < 65.0 \rightarrow$ **Medium Risk**
- $\text{overall\_score} < 40.0 \rightarrow$ **Low Risk**

## Outputs Computed
- Qualitative risk ratings (`Low`, `Medium`, `High`) and 0-100 scores for each dimension.
- `overall_risk` rating and `overall_risk_score`.
- `top_risks`: Top 3 highest risk factors.
- `reasons`: Explicit explanations tied to financial ratios and business specifics.

## API Contract
- Endpoint: `POST /api/risk-analysis`
