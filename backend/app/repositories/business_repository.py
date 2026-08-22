"""Repository for Business entity persistence operations."""

from typing import Optional, Sequence

from sqlalchemy.orm import Session

from backend.app.models.business import Business
from backend.app.schemas.business import BusinessCreate, BusinessUpdate


class BusinessRepository:
    """Data access operations for businesses."""

    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, business_id: int) -> Optional[Business]:
        return self.db.query(Business).filter(Business.id == business_id).first()

    def get_by_owner(self, owner_id: int) -> Sequence[Business]:
        return self.db.query(Business).filter(Business.owner_id == owner_id).all()

    def create(self, data: BusinessCreate) -> Business:
        business = Business(
            owner_id=data.owner_id,
            name=data.name,
            type=data.type,
            industry=data.industry,
            location_village=data.location_village,
            location_district=data.location_district,
            location_state=data.location_state,
            location_pin=data.location_pin,
            phone=data.phone,
            email=data.email,
            description=data.description,
            monthly_revenue_estimate=data.monthly_revenue_estimate,
            monthly_expense_estimate=data.monthly_expense_estimate,
        )
        self.db.add(business)
        self.db.commit()
        self.db.refresh(business)
        return business

    def update(self, business: Business, data: BusinessUpdate) -> Business:
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(business, field, value)
        self.db.commit()
        self.db.refresh(business)
        return business
