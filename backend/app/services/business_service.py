"""Business profile management service layer."""

from typing import Optional, Sequence

from sqlalchemy.orm import Session

from backend.app.models.business import Business
from backend.app.repositories.business_repository import BusinessRepository
from backend.app.schemas.business import BusinessCreate, BusinessUpdate


class BusinessService:
    """Service coordinating business profile operations."""

    def __init__(self, db: Session):
        self.repo = BusinessRepository(db)

    def get_business(self, business_id: int) -> Optional[Business]:
        return self.repo.get_by_id(business_id)

    def list_user_businesses(self, user_id: int) -> Sequence[Business]:
        return self.repo.get_by_owner(user_id)

    def list_businesses(self, limit: int = 50) -> Sequence[Business]:
        """Return all registered business profiles."""
        return self.repo.list_all(limit=limit)

    def create_business(self, data: BusinessCreate) -> Business:
        return self.repo.create(data)

    def update_business(self, business_id: int, data: BusinessUpdate) -> Optional[Business]:
        business = self.repo.get_by_id(business_id)
        if not business:
            return None
        return self.repo.update(business, data)
