"""FastAPI endpoints for Machine Learning Predictive Intelligence."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.ml.predictive_engine import PredictiveEngine
from backend.app.schemas.ml import (
    MlModelMetadata,
    PredictiveMlRequest,
    PredictiveMlResponse,
)
from backend.app.services.business_service import BusinessService

router = APIRouter(prefix="/ml", tags=["Machine Learning Intelligence"])


@router.post(
    "/predict",
    response_model=PredictiveMlResponse,
    status_code=status.HTTP_200_OK,
    summary="Execute Predictive Machine Learning Risk & Growth Inference",
)
def predict_ml_insights(
    data: PredictiveMlRequest,
    db: Session = Depends(get_db),
) -> PredictiveMlResponse:
    """Execute Scikit-Learn model inference for default distress probability, growth trajectory, and feature importances."""
    if data.business_id:
        biz_service = BusinessService(db)
        biz = biz_service.get_business(data.business_id)
        if not biz:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Business with ID {data.business_id} does not exist",
            )
        # Populate defaults from database business record if omitted
        if not data.project_cost or data.project_cost <= 0:
            data.project_cost = float(biz.existing_investment) if biz.existing_investment and float(biz.existing_investment) > 0 else (float(biz.own_capital or 20000.0) * 4.0)
        if not data.own_capital or data.own_capital <= 0:
            data.own_capital = float(biz.own_capital or 20000.0)
        if not data.category:
            data.category = biz.type or biz.category or "Manufacturing"
        if not data.district:
            data.district = biz.location_district or "Sundargarh"

    return PredictiveEngine.predict(data, db=db)


@router.get(
    "/metadata",
    response_model=MlModelMetadata,
    status_code=status.HTTP_200_OK,
    summary="Get Scikit-Learn Model Pipeline Metadata",
)
def get_ml_metadata() -> MlModelMetadata:
    """Retrieve active machine learning model metadata."""
    clf, reg = PredictiveEngine.get_models()
    return MlModelMetadata(
        classifier_name=type(clf).__name__,
        regressor_name=type(reg).__name__,
        n_estimators=getattr(clf, "n_estimators", 60),
        max_depth=getattr(clf, "max_depth", 5),
        features_evaluated=7,
    )
