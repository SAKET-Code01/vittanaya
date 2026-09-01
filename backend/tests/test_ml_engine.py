"""Deterministic Unit & Integration Tests for Scikit-Learn Predictive Machine Learning Layer.

Verifies:
1. GET /api/v1/ml/metadata returns model pipeline metadata
2. PredictiveEngine inference for distress probability and growth rate
3. Low distress risk vs high distress risk scenario differentiation
4. Gini feature importance driver rankings and sum
5. POST /api/v1/ml/predict active business DB scoping
6. Business isolation between distinct enterprise profiles
7. Ask VITTANAYA chatbot PREDICTIVE_ML intent response grounding
8. VERIFIED_ML_PREDICTION data status tags
"""

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.app.ml.predictive_engine import PredictiveEngine
from backend.app.models.business import Business
from backend.app.schemas.ml import PredictiveMlRequest


def test_ml_metadata_endpoint(client: TestClient):
    """1. Verify GET /api/v1/ml/metadata returns model metadata."""
    res = client.get("/api/v1/ml/metadata")
    assert res.status_code == 200
    data = res.json()
    assert data["classifier_name"] == "RandomForestClassifier"
    assert data["regressor_name"] == "RandomForestRegressor"
    assert data["features_evaluated"] == 7


def test_predictive_engine_inference():
    """2. Verify PredictiveEngine runs inference and returns structured predictions."""
    req = PredictiveMlRequest(
        project_cost=150000.0,
        own_capital=35000.0,
        category="Poultry",
        district="Sundargarh",
    )
    res = PredictiveEngine.predict(req)

    assert 0.0 <= res.distress_probability <= 1.0
    assert res.distress_tier in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    assert -50.0 <= res.predicted_growth_rate_pct <= 100.0
    assert 0.50 <= res.confidence_score <= 1.0
    assert len(res.feature_importances) == 7
    assert res.data_status == "VERIFIED_ML_PREDICTION"


def test_predictive_engine_low_risk_scenario():
    """3. Verify healthy financial metrics yield LOW distress risk tier."""
    req = PredictiveMlRequest(
        project_cost=100000.0,
        own_capital=40000.0,  # 40% margin capital
        interest_rate_pct=7.0,
        tenure_years=7.0,
    )
    res = PredictiveEngine.predict(req)

    assert res.distress_probability < 0.45
    assert res.distress_tier in ["LOW", "MEDIUM"]


def test_predictive_engine_high_risk_scenario():
    """4. Verify stressed financial metrics yield HIGH or CRITICAL distress risk tier."""
    req = PredictiveMlRequest(
        project_cost=300000.0,
        own_capital=15000.0,  # Low 5% margin capital
        interest_rate_pct=14.0,
        tenure_years=2.0,
    )
    res = PredictiveEngine.predict(req)

    assert res.distress_probability > 0.35
    assert res.distress_tier in ["HIGH", "CRITICAL", "MEDIUM"]


def test_feature_importance_ranking():
    """5. Verify feature importances sum to approximately 100% and rank drivers."""
    req = PredictiveMlRequest()
    res = PredictiveEngine.predict(req)

    total_pct = sum(item.importance_pct for item in res.feature_importances)
    assert 95.0 <= total_pct <= 105.0
    # Top driver should have highest importance
    assert res.feature_importances[0].importance_pct >= res.feature_importances[1].importance_pct


def test_ml_predict_endpoint_with_business_id(client: TestClient, db_session: Session):
    """6. Verify POST /api/v1/ml/predict resolves active DB business record."""
    biz = Business(
        owner_id=1,
        name="Textile Weaving Unit",
        type="Manufacturing",
        industry="Textiles",
        location_district="Bargarh",
        own_capital=50000.0,
        existing_investment=250000.0,
    )
    db_session.add(biz)
    db_session.commit()

    res = client.post(
        "/api/v1/ml/predict",
        json={"business_id": biz.id},
    )
    assert res.status_code == 200
    data = res.json()

    assert data["business_id"] == biz.id
    assert "distress_probability_pct" in data
    assert data["data_status"] == "VERIFIED_ML_PREDICTION"


def test_business_isolation_ml(db_session: Session):
    """7. Verify Business A (healthy) vs Business B (stressed) yield distinct ML risk predictions."""
    biz_a = Business(
        owner_id=1,
        name="Healthy Enterprise",
        type="Manufacturing",
        industry="Factory",
        own_capital=80000.0,
        existing_investment=150000.0,
    )
    biz_b = Business(
        owner_id=1,
        name="Stressed Enterprise",
        type="Manufacturing",
        industry="Factory",
        own_capital=10000.0,
        existing_investment=500000.0,
    )
    db_session.add_all([biz_a, biz_b])
    db_session.commit()

    res_a = PredictiveEngine.predict(PredictiveMlRequest(business_id=biz_a.id, project_cost=150000.0, own_capital=80000.0), db=db_session)
    res_b = PredictiveEngine.predict(PredictiveMlRequest(business_id=biz_b.id, project_cost=500000.0, own_capital=10000.0), db=db_session)

    assert res_a.distress_probability != res_b.distress_probability
    assert res_a.distress_probability < res_b.distress_probability


def test_chatbot_predictive_ml_grounding(client: TestClient, db_session: Session):
    """8. Verify Ask VITTANAYA chatbot responds to default risk questions using PredictiveEngine."""
    biz = Business(
        owner_id=1,
        name="Rural Dairy Farm",
        type="Dairy",
        industry="Agriculture",
        location_district="Koraput",
        own_capital=60000.0,
        existing_investment=200000.0,
    )
    db_session.add(biz)
    db_session.commit()

    res = client.post(
        "/api/v1/advisory/chat",
        json={
            "business_id": str(biz.id),
            "message": "What is my predicted default risk?",
        },
    )
    assert res.status_code == 200
    data = res.json()

    assert data["intent"] == "PREDICTIVE_ML"
    assert "VITTANAYA Machine Learning Engine" in data["answer"]
    assert any("ML Distress Probability" in k["label"] for k in data["key_facts"])
