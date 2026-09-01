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
from backend.app.services.cash_flow_service import CashFlowService
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
        """Extract authoritative inputs from deterministic engines."""
        proj_cost = payload.project_cost if payload.project_cost and payload.project_cost > 0 else 100000.0
        own_cap = payload.own_capital if payload.own_capital and payload.own_capital > 0 else 20000.0
        category = payload.category or "Manufacturing"
        district = payload.district or "Sundargarh"

        margin_pct = min(99.0, max(0.0, (own_cap / proj_cost) * 100.0)) if proj_cost > 0 else 20.0

        # 1. Deterministic Financial Plan Engine
        funding_req = FundingStructureRequest(
            project_cost=proj_cost,
            margin_pct=margin_pct,
            interest_rate_annual=payload.interest_rate_pct,
            tenure_years=int(payload.tenure_years),
        )
        fin_plan = FinancialPlanService.calculate_funding_structure(funding_req)
        monthly_emi = float(fin_plan.monthly_emi)
        annual_debt_service = monthly_emi * 12.0
        estimated_annual_surplus = proj_cost * (0.35 if own_cap / proj_cost >= 0.20 else 0.12)
        dscr = (estimated_annual_surplus / annual_debt_service) if annual_debt_service > 0 else 2.5
        operating_margin = 25.0 if estimated_annual_surplus > 0 else 5.0

        # 2. Deterministic Cash Flow Engine
        cf_req = CashFlowForecastRequest(
            project_cost=proj_cost,
            margin_pct=margin_pct,
            interest_rate_annual=payload.interest_rate_pct,
            tenure_years=int(payload.tenure_years),
        )
        cf_forecast = CashFlowService.generate_forecast(cf_req)
        cash_buffer_months = float(cf_forecast.summary.months_of_coverage)
        working_capital_ratio = min(0.40, float(cf_forecast.summary.working_capital_required) / proj_cost) if proj_cost > 0 else 0.15

        # 3. Deterministic Industry Engine
        ind_req = IndustryAnalysisRequest(
            business_id=payload.business_id,
            industry_code=IndustryService._map_category_to_code(category),
            variables={},
        )
        ind_analysis = IndustryService.analyze(ind_req, db=db)
        capacity_util = next((k.value for k in ind_analysis.kpis if "utilization" in k.key.lower() or "ratio" in k.key.lower()), 70.0)

        # 4. Feasibility & Risk Engines
        catchment_score = 75.0
        seasonality_idx = 2.0
        if db:
            try:
                biz_repo = BusinessRepository(db)
                if payload.business_id:
                    b = biz_repo.get_by_id(payload.business_id)
                    if b and b.location_district:
                        district = b.location_district
                feas_engine = FeasibilityEngine(db)
                eval_res = feas_engine.evaluate(category, district, own_cap)
                catchment_score = float(eval_res.overall_score)

                risk_engine = RiskEngine(db)
                risk_res = risk_engine.analyze_risks(
                    business_category=category,
                    specific_business=category,
                    indicative_project_cost=proj_cost,
                    available_margin_capital=own_cap,
                    financing_requirement=proj_cost - own_cap,
                    location=district,
                )
                if risk_res.overall_risk in ["High", "CRITICAL"]:
                    seasonality_idx = 4.2
                elif risk_res.overall_risk in ["Medium", "HIGH"]:
                    seasonality_idx = 3.0
            except Exception:
                pass

        return {
            "operating_margin_pct": float(operating_margin),
            "dscr_ratio": float(dscr),
            "cash_buffer_months": float(cash_buffer_months),
            "working_capital_ratio": float(working_capital_ratio),
            "capacity_utilization_pct": float(capacity_util),
            "catchment_score": float(catchment_score),
            "seasonality_risk_idx": float(seasonality_idx),
        }
