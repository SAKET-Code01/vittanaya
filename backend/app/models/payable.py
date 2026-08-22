"""Payable database model for upcoming supplier/vendor obligations."""

from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from backend.app.core.database import Base


class Payable(Base):
    """Upcoming vendor liabilities and operational obligations."""

    __tablename__ = "payables"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    business_id = Column(
        Integer, ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    vendor_name = Column(String(100), nullable=False)
    bill_number = Column(String(50), nullable=True)
    amount = Column(Numeric(12, 2), nullable=False)
    due_date = Column(Date, nullable=False, index=True)
    priority_tier = Column(
        Integer, default=1, nullable=False
    )  # 1=Critical (payroll/raw materials), 3=Flexible
    status = Column(String(20), default="unpaid", nullable=False)  # unpaid, paid, deferred

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    business = relationship("Business", back_populates="payables")
