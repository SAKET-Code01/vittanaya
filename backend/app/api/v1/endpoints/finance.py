"""Finance and Ledger endpoints for transactions, receivables, payables, and funding structure with business validation."""

from typing import Optional, Sequence

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.schemas.financial_plan import FundingStructureRequest, FundingStructureResponse
from backend.app.schemas.payable import PayableCreate, PayableResponse
from backend.app.schemas.receivable import ReceivableCreate, ReceivableResponse
from backend.app.schemas.transaction import TransactionCreate, TransactionResponse
from backend.app.services.business_service import BusinessService
from backend.app.services.financial_plan_service import FinancialPlanService
from backend.app.services.ledger_service import LedgerService

router = APIRouter(prefix="/finance", tags=["Finance & Ledger"])


def _resolve_business_id(db: Session, business_id: Optional[int]) -> int:
    """Validate explicit business_id or resolve to first active business; raise 404 if invalid/missing."""
    biz_service = BusinessService(db)
    if business_id is not None:
        if not biz_service.get_business(business_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Business with ID {business_id} does not exist",
            )
        return business_id

    businesses = biz_service.list_businesses(limit=1)
    if not businesses:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No business profile exists in active workspace",
        )
    return businesses[0].id


@router.post(
    "/funding-structure",
    response_model=FundingStructureResponse,
    status_code=status.HTTP_200_OK,
    summary="Calculate Funding Structure & Amortization Schedule",
)
def calculate_funding_structure(
    data: FundingStructureRequest,
) -> FundingStructureResponse:
    """Calculate authoritative loan amount, EMI, totals, and reducing-balance repayment schedule."""
    return FinancialPlanService.calculate_funding_structure(data)


@router.get("/transactions", response_model=list[TransactionResponse], summary="List Transactions")
def list_transactions(
    business_id: Optional[int] = Query(None, description="ID of the business"),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
) -> Sequence[TransactionResponse]:
    """Retrieve transaction history for a business."""
    target_id = _resolve_business_id(db, business_id)
    service = LedgerService(db)
    return service.list_transactions(target_id, limit=limit)  # type: ignore


@router.post(
    "/transactions",
    response_model=TransactionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record New Transaction",
)
def create_transaction(
    data: TransactionCreate,
    db: Session = Depends(get_db),
) -> TransactionResponse:
    """Record a new cash inflow or outflow transaction."""
    biz_service = BusinessService(db)
    biz = biz_service.get_business(data.business_id)
    if not biz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Business with ID {data.business_id} does not exist",
        )

    service = LedgerService(db)
    return service.create_transaction(data)  # type: ignore


@router.get("/receivables", response_model=list[ReceivableResponse], summary="List Receivables")
def list_receivables(
    business_id: Optional[int] = Query(None, description="ID of the business"),
    db: Session = Depends(get_db),
) -> Sequence[ReceivableResponse]:
    """Retrieve outstanding receivables / expected cash inflows."""
    target_id = _resolve_business_id(db, business_id)
    service = LedgerService(db)
    return service.list_receivables(target_id)  # type: ignore


@router.post(
    "/receivables",
    response_model=ReceivableResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Receivable",
)
def create_receivable(
    data: ReceivableCreate,
    db: Session = Depends(get_db),
) -> ReceivableResponse:
    """Record a new receivable invoice."""
    biz_service = BusinessService(db)
    if not biz_service.get_business(data.business_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Business with ID {data.business_id} does not exist",
        )
    service = LedgerService(db)
    return service.create_receivable(data)  # type: ignore


@router.get("/payables", response_model=list[PayableResponse], summary="List Payables")
def list_payables(
    business_id: Optional[int] = Query(None, description="ID of the business"),
    db: Session = Depends(get_db),
) -> Sequence[PayableResponse]:
    """Retrieve upcoming vendor payables / liabilities."""
    target_id = _resolve_business_id(db, business_id)
    service = LedgerService(db)
    return service.list_payables(target_id)  # type: ignore


@router.post(
    "/payables",
    response_model=PayableResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Payable",
)
def create_payable(
    data: PayableCreate,
    db: Session = Depends(get_db),
) -> PayableResponse:
    """Record a new payable obligation."""
    biz_service = BusinessService(db)
    if not biz_service.get_business(data.business_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Business with ID {data.business_id} does not exist",
        )
    service = LedgerService(db)
    return service.create_payable(data)  # type: ignore
