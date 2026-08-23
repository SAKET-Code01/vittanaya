"""Risk Advisory Engine for VITTANAYA (SIH26091).

Calculates multi-dimensional business risks:
- market_risk
- competition_risk
- operational_risk
- seasonality_risk
- financial_risk

Returns overall_risk, top_risks, and empirical reasons.
"""

from typing import List, Optional

from sqlalchemy.orm import Session

from backend.app.schemas.insights import (
    RiskAnalysisResponse,
    RiskFactorDetail,
    TraceabilityMetadata,
)


def score_to_rating(score: float) -> str:
    """Convert numeric risk score (0-100) to qualitative rating."""
    if score >= 65.0:
        return "High"
    elif score >= 40.0:
        return "Medium"
    return "Low"


class RiskEngine:
    """Deterministic Multi-Dimensional Risk Advisory Engine."""

    def __init__(self, db: Session):
        self.db = db

    def analyze_risks(
        self,
        business_category: str,
        specific_business: str,
        indicative_project_cost: float,
        available_margin_capital: float,
        financing_requirement: float,
        location: str = "Odisha",
        seasonality_factor: Optional[str] = None,
    ) -> RiskAnalysisResponse:
        """Calculate score and rating for 5 risk dimensions and overall risk profile."""
        reasons: List[str] = []

        # 1. Financial Risk Calculation (Debt ratio & Margin sufficiency)
        debt_ratio = (
            (financing_requirement / indicative_project_cost)
            if indicative_project_cost > 0
            else 0.0
        )
        margin_ratio = (
            (available_margin_capital / indicative_project_cost)
            if indicative_project_cost > 0
            else 0.0
        )

        if debt_ratio >= 0.90:
            fin_score = 85.0
            reasons.append(
                f"High financial risk: Extremely high debt dependency ({debt_ratio * 100:.1f}% loan leverage)."
            )
        elif debt_ratio >= 0.75:
            fin_score = 60.0
            reasons.append(
                f"Moderate financial risk: Standard bank loan leverage ({debt_ratio * 100:.1f}%)."
            )
        else:
            fin_score = 30.0
            reasons.append(
                f"Low financial risk: Strong promoter margin equity ({margin_ratio * 100:.1f}%)."
            )

        if margin_ratio < 0.10:
            fin_score = min(100.0, fin_score + 15.0)
            reasons.append("Margin equity is below the 10% standard bank threshold.")

        # 2. Seasonality Risk Calculation
        cat_lower = business_category.lower() + " " + specific_business.lower()
        if any(
            s in cat_lower
            for s in ["poultry", "agri", "crop", "fisheries", "ice", "beverage", "brick"]
        ):
            season_score = 75.0
            reasons.append(
                "High seasonality risk: Business cycle heavily impacted by monsoon or summer heat."
            )
        elif any(s in cat_lower for s in ["dairy", "food processing", "handloom", "woodwork"]):
            season_score = 45.0
            reasons.append("Moderate seasonality risk: Moderate seasonal demand fluctuation.")
        else:
            season_score = 25.0
            reasons.append("Low seasonality risk: Steady year-round demand pattern.")

        # 3. Operational Risk Calculation (Perishability & skill dependency)
        if any(o in cat_lower for o in ["broiler", "dairy", "milk", "fish", "meat", "vegetable"]):
            op_score = 70.0
            reasons.append(
                "High operational risk: Highly perishable products requiring cold chain / biosecurity."
            )
        elif any(o in cat_lower for o in ["processing", "milling", "transport", "vehicle"]):
            op_score = 50.0
            reasons.append(
                "Moderate operational risk: Equipment maintenance & electricity continuity dependency."
            )
        else:
            op_score = 30.0
            reasons.append(
                "Low operational risk: Low inventory decay and simple operational workflow."
            )

        # 4. Market Risk Calculation
        if any(m in cat_lower for m in ["retail", "grocery", "garment", "general store"]):
            market_score = 55.0
            reasons.append(
                "Moderate market risk: Consumer price sensitivity & local purchasing power dependency."
            )
        elif any(m in cat_lower for m in ["poultry", "dairy", "agri"]):
            market_score = 35.0
            reasons.append("Low market risk: Essential food commodity with inelastic rural demand.")
        else:
            market_score = 45.0
            reasons.append("Moderate market risk: General market demand dynamics.")

        # 5. Competition Risk Calculation
        if any(c in cat_lower for c in ["retail", "grocery", "tailoring", "fast food"]):
            comp_score = 65.0
            reasons.append("High competition risk: High density of unorganized local competitors.")
        elif any(c in cat_lower for c in ["custom hiring", "cold storage", "cashew", "hatchery"]):
            comp_score = 35.0
            reasons.append(
                "Low competition risk: Capital-intensive barrier to entry in rural block."
            )
        else:
            comp_score = 50.0
            reasons.append("Moderate competition risk: Standard local market competition.")

        # Weighted Overall Risk Score
        # Financial (30%), Operational (20%), Seasonality (20%), Market (15%), Competition (15%)
        overall_score = (
            (fin_score * 0.30)
            + (op_score * 0.20)
            + (season_score * 0.20)
            + (market_score * 0.15)
            + (comp_score * 0.15)
        )

        overall_rating = score_to_rating(overall_score)

        # Build list of top risk factors
        all_factors = [
            RiskFactorDetail(
                risk_name="Financial Risk",
                severity=score_to_rating(fin_score),
                score=fin_score,
                description=f"Loan leverage is {debt_ratio * 100:.1f}% of indicative cost.",
            ),
            RiskFactorDetail(
                risk_name="Seasonality Risk",
                severity=score_to_rating(season_score),
                score=season_score,
                description="Monsoon/summer cycle vulnerability.",
            ),
            RiskFactorDetail(
                risk_name="Operational Risk",
                severity=score_to_rating(op_score),
                score=op_score,
                description="Perishability, biosecurity & infrastructure requirements.",
            ),
            RiskFactorDetail(
                risk_name="Market Risk",
                severity=score_to_rating(market_score),
                score=market_score,
                description="Local consumer purchasing power & demand elasticity.",
            ),
            RiskFactorDetail(
                risk_name="Competition Risk",
                severity=score_to_rating(comp_score),
                score=comp_score,
                description="Local competitor density & pricing pressure.",
            ),
        ]

        all_factors.sort(key=lambda f: f.score, reverse=True)
        top_risks = all_factors[:3]  # Top 3 highest risks

        traceability = TraceabilityMetadata(
            input={
                "business_category": business_category,
                "specific_business": specific_business,
                "indicative_project_cost": indicative_project_cost,
                "available_margin_capital": available_margin_capital,
                "financing_requirement": financing_requirement,
                "location": location,
                "seasonality_factor": seasonality_factor,
            },
            calculation_rule=(
                f"Multi-dimensional weighted risk model: Financial (30%), Operational (20%), "
                f"Seasonality (20%), Market (15%), Competition (15%). Overall Score: {overall_score:.1f}/100."
            ),
            source_authority="VITTANAYA Multi-Dimensional Risk Framework",
            source_year="2026",
            provenance_priority="DETERMINISTIC_MODEL",
            official_source_url=None,
        )

        return RiskAnalysisResponse(
            market_risk=score_to_rating(market_score),
            competition_risk=score_to_rating(comp_score),
            operational_risk=score_to_rating(op_score),
            seasonality_risk=score_to_rating(season_score),
            financial_risk=score_to_rating(fin_score),
            market_risk_score=market_score,
            competition_risk_score=comp_score,
            operational_risk_score=op_score,
            seasonality_risk_score=season_score,
            financial_risk_score=fin_score,
            overall_risk=overall_rating,
            overall_risk_score=round(overall_score, 1),
            top_risks=top_risks,
            reasons=reasons,
            traceability=traceability,
        )
