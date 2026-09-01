"""Pydantic validation schemas for Machine Learning Predictive API."""

from typing import List, Optional

from pydantic import BaseModel, Field

from backend.app.schemas.insights import TraceabilityMetadata


class FeatureImportanceItem(BaseModel):
    """Single feature importance driver ranking."""

    feature_name: str
    label: str
    importance_pct: float = Field(..., description="Gini feature importance percentage (0-100%)")
    value: float = Field(..., description="Extracted feature value")
    impact_direction: str = Field("POSITIVE", description="POSITIVE or NEGATIVE contribution to risk")


class MlModelMetadata(BaseModel):
    """Scikit-Learn model pipeline metadata."""

    classifier_name: str = "RandomForestClassifier"
    regressor_name: str = "RandomForestRegressor"
    n_estimators: int = 60
    max_depth: int = 5
    features_evaluated: int = 7


class PredictiveMlRequest(BaseModel):
    """Payload for POST /api/v1/ml/predict endpoint."""

    business_id: Optional[int] = Field(None, description="Optional active business ID")
    project_cost: Optional[float] = Field(100000.0, description="Total project capital requirement in INR")
    own_capital: Optional[float] = Field(20000.0, description="Promoter margin capital in INR")
    category: Optional[str] = Field("Manufacturing", description="Business sector / category")
    district: Optional[str] = Field("Sundargarh", description="Location district name")
    interest_rate_pct: float = Field(9.5, description="Annual loan interest rate in %")
    tenure_years: float = Field(5.0, description="Loan tenure in years")


class PredictiveMlResponse(BaseModel):
    """Authoritative response from Scikit-Learn Predictive ML Engine."""

    business_id: Optional[int] = None
    distress_probability: float = Field(..., description="Predicted loan default / business distress probability (0.0 - 1.0)")
    distress_probability_pct: float = Field(..., description="Predicted distress probability as percentage (0 - 100%)")
    distress_tier: str = Field("LOW", description="LOW, MEDIUM, HIGH, CRITICAL")
    predicted_growth_rate_pct: float = Field(..., description="Predicted 12-month annual revenue growth rate %")
    confidence_score: float = Field(..., description="Ensemble variance confidence score (0.0 - 1.0)")
    feature_importances: List[FeatureImportanceItem] = Field(default_factory=list)
    model_metadata: MlModelMetadata
    data_status: str = Field("VERIFIED_ML_PREDICTION", description="ML_PREDICTION data status tag")
    traceability: TraceabilityMetadata
