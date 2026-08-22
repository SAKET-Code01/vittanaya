"""Transaction database model for historical settled cash movements."""

from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from backend.app.core.database import Base


class Transaction(Base):
    """Historical and realized cash inflows and outflows."""

    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    business_id = Column(
        Integer, ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    transaction_date = Column(Date, nullable=False, index=True)
    amount = Column(Numeric(12, 2), nullable=False)  # positive for inflow, negative for outflow
    category = Column(
        String(50), nullable=False
    )  # e.g., 'sales', 'raw_material', 'payroll', 'rent', 'utilities'
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    business = relationship("Business", back_populates="transactions")
