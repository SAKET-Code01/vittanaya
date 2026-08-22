"""API v1 Central Router aggregating all sub-routers."""

from fastapi import APIRouter

from backend.app.api.v1.endpoints.advisory import router as advisory_router
from backend.app.api.v1.endpoints.auth import router as auth_router
from backend.app.api.v1.endpoints.business import router as business_router
from backend.app.api.v1.endpoints.dashboard import router as dashboard_router
from backend.app.api.v1.endpoints.finance import router as finance_router
from backend.app.api.v1.endpoints.health import router as health_router

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(health_router)
api_v1_router.include_router(auth_router)
api_v1_router.include_router(business_router)
api_v1_router.include_router(dashboard_router)
api_v1_router.include_router(finance_router)
api_v1_router.include_router(advisory_router)
