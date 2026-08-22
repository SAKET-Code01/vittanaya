"""Receivable database model for outstanding customer invoices / expected inflows."""

from sqlalchemy import Column, Date, DateTime, Float, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from backend.app.core.database import Base


class Receivable(Base):
    """Expected cash inflow from customers, distributors, or village buyers."""

    __tablename__ = "receivables"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    business_id = Column(
        Integer, ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    customer_name = Column(String(100), nullable=False)
    invoice_number = Column(String(50), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    due_date = Column(Date, nullable=False, index=True)
    expected_date = Column(Date, nullable=False)
    status = Column(
        String(20), default="pending", nullable=False
    )  # pending, collected, overdue, cancelled
    reliability_score = Column(Float, default=1.0, nullable=False)  # 0.0 to 1.0

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    business = relationship("Business", back_populates="receivables")
