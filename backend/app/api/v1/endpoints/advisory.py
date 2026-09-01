"""Advisory status and Ask VITTANAYA chatbot endpoints."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.schemas.advisory import ChatRequest, ChatResponse
from backend.app.services.advisory_service import AdvisoryService

router = APIRouter(prefix="/advisory", tags=["Business Advisory"])


@router.get("/status", summary="Advisory Engine Status")
def get_advisory_status() -> dict[str, str]:
    """Returns safe advisory engine operational status."""
    return AdvisoryService.get_status()


@router.post(
    "/chat",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Ask VITTANAYA Grounded Chatbot Endpoint",
)
def process_chat_message(
    payload: ChatRequest,
    db: Session = Depends(get_db),
) -> ChatResponse:
    """Process natural language entrepreneur inquiry grounded in verified decision engines."""
    return AdvisoryService.process_chat(payload, db=db)
