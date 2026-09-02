"""Predictive ML Engine for VITTANAYA (SIH26091).

Extracts feature vectors from authoritative deterministic engines (FinancialPlanService,
CashFlowService, IndustryService, FeasibilityEngine, RiskEngine), executes Scikit-Learn model inference,
and returns predictive default risk probability, distress tier, feature importance drivers, and growth trajectory.
"""

from typing import Dict, List, Optional

import numpy as np
import pandas as pd
from sqlalchemy.orm import Session

from backend.app.engines.feasibility_engine import FeasibilityEngine
from backend.app.engines.risk_engine import RiskEngine
from backend.app.ml.model_trainer import FEATURE_NAMES, load_or_train_models
from backend.app.repositories.business_repository import BusinessRepository
from backend.app.schemas.financial_plan import CashFlowForecastRequest, FundingStructureRequest
from backend.app.schemas.industry import IndustryAnalysisRequest
from backend.app.schemas.insights import TraceabilityMetadata
from backend.app.schemas.ml import (
    FeatureImportanceItem,
    MlModelMetadata,
    PredictiveMlRequest,
    PredictiveMlResponse,
)
from backend.app.services.financial_plan_service import FinancialPlanService
from backend.app.services.industry_service import IndustryService


class PredictiveEngine:
    """Scikit-Learn ML Inference Engine."""

    _clf = None
    _reg = None

    @classmethod
    def get_models(cls):
        """Lazy load or train Scikit-Learn models on startup."""
        if cls._clf is None or cls._reg is None:
            cls._clf, cls._reg = load_or_train_models()
        return cls._clf, cls._reg

    @classmethod
    def predict(
        cls,
        payload: PredictiveMlRequest,
        db: Optional[Session] = None,
    ) -> PredictiveMlResponse:
        """Execute predictive ML inference using deterministic engine outputs as input features."""
        clf, reg = cls.get_models()

        # Extract features from deterministic engines
        features = cls._extract_features(payload, db=db)
        X_df = pd.DataFrame([features])[FEATURE_NAMES]

        # ML Inference: Distress Classification Probability
        probs = clf.predict_proba(X_df.values)[0]
        distress_prob = float(probs[1]) if len(probs) > 1 else float(probs[0])

        # Categorize Distress Tier
        if distress_prob >= 0.65:
            tier = "CRITICAL"
        elif distress_prob >= 0.40:
            tier = "HIGH"
        elif distress_prob >= 0.20:
            tier = "MEDIUM"
        else:
            tier = "LOW"

        # ML Inference: 12-Month Revenue Growth Regressor
        predicted_growth = float(reg.predict(X_df.values)[0])

        # Compute Tree Ensemble Standard Error for Confidence Score
        tree_preds = [float(t.predict(X_df.values)[0]) for t in reg.estimators_]
        std_err = float(np.std(tree_preds))
        confidence = float(np.clip(1.0 - (std_err / 25.0), 0.60, 0.98))

        # Extract Gini Feature Importances and map to user-friendly labels
        raw_importances = clf.feature_importances_
        feature_labels = {
            "operating_margin_pct": "Operating Profit Margin %",
            "dscr_ratio": "Debt Service Coverage Ratio (DSCR)",
            "cash_buffer_months": "Liquid Cash Buffer (Months)",
            "working_capital_ratio": "Working Capital Ratio",
            "capacity_utilization_pct": "Capacity Utilization %",
            "catchment_score": "Local Catchment Feasibility Score",
            "seasonality_risk_idx": "Seasonality & Volatility Risk Index",
        }

        importance_items: List[FeatureImportanceItem] = []
        for name, imp_val in zip(FEATURE_NAMES, raw_importances):
            feat_val = features.get(name, 0.0)
            importance_items.append(
                FeatureImportanceItem(
                    feature_name=name,
                    label=feature_labels.get(name, name),
                    importance_pct=round(float(imp_val) * 100.0, 1),
                    value=round(float(feat_val), 2),
                    impact_direction="NEGATIVE" if (name in ["dscr_ratio", "cash_buffer_months", "operating_margin_pct"] and feat_val < 1.2) else "POSITIVE",
                )
            )

        # Sort feature importances descending
        importance_items.sort(key=lambda x: x.importance_pct, reverse=True)

        traceability = TraceabilityMetadata(
            input=features,
            calculation_rule="Scikit-Learn RandomForestClassifier (distress_classifier.joblib) & RandomForestRegressor (growth_regressor.joblib) model inference.",
            source_authority="VITTANAYA Machine Learning Predictive Layer",
            source_year="2026",
            provenance_priority="ML_PREDICTION",
        )

        return PredictiveMlResponse(
            business_id=payload.business_id,
            distress_probability=round(distress_prob, 4),
            distress_probability_pct=round(distress_prob * 100.0, 1),
            distress_tier=tier,
            predicted_growth_rate_pct=round(predicted_growth, 1),
            confidence_score=round(confidence, 2),
            feature_importances=importance_items,
            model_metadata=MlModelMetadata(
                classifier_name="RandomForestClassifier",
                regressor_name="RandomForestRegressor",
                n_estimators=60,
                max_depth=5,
                features_evaluated=len(FEATURE_NAMES),
            ),
            data_status="VERIFIED_ML_PREDICTION",
            traceability=traceability,
        )

    @classmethod
    def _extract_features(
        cls,
        payload: PredictiveMlRequest,
        db: Optional[Session] = None,
    ) -> Dict[str, float]:
        """Extract authoritative inputs from deterministic engines and stored DB business profile."""
        proj_cost = float(payload.project_cost or 0.0)
        own_cap = float(payload.own_capital or 0.0)
        category = payload.category or "Retail"
        district = payload.district or "Sundargarh"

        monthly_rev = 0.0
        monthly_exp = 0.0

        if db and payload.business_id:
            try:
                biz_repo = BusinessRepository(db)
                b = biz_repo.get_by_id(int(payload.business_id))
                if b:
                    own_cap = float(b.own_capital or own_cap)
                    proj_cost = float(getattr(b, 'project_cost', 0.0) or proj_cost)
                    category = b.type or getattr(b, 'category', None) or b.industry or category
                    district = b.location_district or district
                    monthly_rev = float(b.monthly_revenue_estimate or 0.0)
                    monthly_exp = float(b.monthly_expense_estimate or 0.0)
            except Exception:
                pass

        if proj_cost <= 0.0 and db:
            try:
                from backend.app.engines.cost_engine import ProjectCostEngine
                c_res = ProjectCostEngine(db).get_indicative_cost(category, category, district)
                proj_cost = float(c_res.indicative_project_cost)
            except Exception:
                proj_cost = 100000.0

        margin_pct = min(99.0, max(0.0, (own_cap / proj_cost) * 100.0)) if proj_cost > 0 else 20.0

        # 1. Deterministic Financial Plan Engine
        funding_req = FundingStructureRequest(
            project_cost=max(10000.0, proj_cost),
            margin_pct=margin_pct,
            interest_rate_annual=payload.interest_rate_pct,
            tenure_years=int(payload.tenure_years),
        )
        fin_plan = FinancialPlanService.calculate_funding_structure(funding_req)
        monthly_emi = float(fin_plan.monthly_emi)
        annual_debt_service = monthly_emi * 12.0

        if monthly_rev > 0.0:
            annual_surplus = max(0.0, (monthly_rev - monthly_exp) * 12.0)
            operating_margin = min(80.0, max(-30.0, ((monthly_rev - monthly_exp) / monthly_rev) * 100.0))
        else:
            annual_surplus = proj_cost * (0.35 if own_cap / proj_cost >= 0.20 else 0.12)
            operating_margin = 25.0 if annual_surplus > 0 else 5.0

        dscr = (annual_surplus / annual_debt_service) if annual_debt_service > 0 else 2.5

        # 2. Deterministic Cash Flow Engine
        from backend.app.services.cash_flow_service import CashFlowService
        cf_req = CashFlowForecastRequest(
            business_id=payload.business_id,
            project_cost=proj_cost,
            available_margin_capital=own_cap,
            interest_rate_annual=payload.interest_rate_pct,
            tenure_years=int(payload.tenure_years),
            monthly_revenue_estimate=monthly_rev if monthly_rev > 0 else None,
            monthly_expense_estimate=monthly_exp if monthly_exp > 0 else None,
        )
        cf_forecast = CashFlowService.generate_forecast(cf_req, db=db)
        cash_buffer_months = float(cf_forecast.summary.months_of_coverage)
        working_capital_ratio = min(0.40, float(cf_forecast.summary.working_capital_required) / proj_cost) if proj_cost > 0 else 0.15

        # 3. Deterministic Industry Engine
        ind_vars = {}
        if monthly_rev > 0:
            ind_vars = {
                "monthly_footfall": max(100.0, round(monthly_rev / 300.0, 0)),
                "average_transaction_value": 300.0,
                "production_capacity_units": max(100.0, round(monthly_rev / 200.0, 0)),
                "selling_price_per_unit": 200.0,
                "unit_cost": 120.0,
            }
        ind_req = IndustryAnalysisRequest(
            business_id=payload.business_id,
            industry_code=IndustryService._map_category_to_code(category),
            variables=ind_vars,
        )
        ind_analysis = IndustryService.analyze(ind_req, db=db)
        capacity_util = next((k.value for k in ind_analysis.kpis if "utilization" in k.key.lower() or "ratio" in k.key.lower()), 70.0)

        # 4. Feasibility & Risk Engines
        catchment_score = 75.0
        seasonality_idx = 2.0
        if db:
            try:
                feas = FeasibilityEngine(db).evaluate_feasibility(category, category, district)
                catchment_score = float(feas.overall_opportunity_score)
                risk_res = RiskEngine(db).analyze_risks(category, category, proj_cost, own_cap, proj_cost - own_cap, district)
                seasonality_idx = 4.0 if risk_res.seasonality_risk == "HIGH" else (2.5 if risk_res.seasonality_risk == "MEDIUM" else 1.5)
            except Exception:
                pass

        return {
            "operating_margin_pct": round(operating_margin, 2),
            "dscr_ratio": round(dscr, 2),
            "cash_buffer_months": round(cash_buffer_months, 2),
            "working_capital_ratio": round(working_capital_ratio, 2),
            "capacity_utilization_pct": round(float(capacity_util), 2),
            "catchment_score": round(catchment_score, 2),
            "seasonality_risk_idx": round(seasonality_idx, 2),
        }
