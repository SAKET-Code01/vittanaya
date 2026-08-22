"""Finance and Ledger endpoints for transactions, receivables, and payables."""

from typing import Sequence

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.schemas.payable import PayableCreate, PayableResponse
from backend.app.schemas.receivable import ReceivableCreate, ReceivableResponse
from backend.app.schemas.transaction import TransactionCreate, TransactionResponse
from backend.app.services.business_service import BusinessService
from backend.app.services.ledger_service import LedgerService

router = APIRouter(prefix="/finance", tags=["Finance & Ledger"])


@router.get("/transactions", response_model=list[TransactionResponse], summary="List Transactions")
def list_transactions(
    business_id: int = Query(1, description="ID of the business"),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
) -> Sequence[TransactionResponse]:
    """Retrieve transaction history for a business."""
    service = LedgerService(db)
    return service.list_transactions(business_id, limit=limit)  # type: ignore


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
    # Enforce ownership check: business must exist
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
    business_id: int = Query(1, description="ID of the business"),
    db: Session = Depends(get_db),
) -> Sequence[ReceivableResponse]:
    """Retrieve outstanding receivables / expected cash inflows."""
    service = LedgerService(db)
    return service.list_receivables(business_id)  # type: ignore


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
    business_id: int = Query(1, description="ID of the business"),
    db: Session = Depends(get_db),
) -> Sequence[PayableResponse]:
    """Retrieve upcoming vendor payables / liabilities."""
    service = LedgerService(db)
    return service.list_payables(business_id)  # type: ignore


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
