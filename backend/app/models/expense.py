"""Expense database model for structured operational overheads."""

from sqlalchemy import Boolean, Column, Date, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from backend.app.core.database import Base


class Expense(Base):
    """Regular and recurring operational expenses (e.g., rent, utility, equipment maintenance)."""

    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    business_id = Column(
        Integer, ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    category = Column(
        String(50), nullable=False
    )  # e.g., 'rent', 'electricity', 'transport', 'maintenance'
    amount = Column(Numeric(12, 2), nullable=False)
    frequency = Column(
        String(20), default="monthly", nullable=False
    )  # daily, weekly, monthly, quarterly, annual
    description = Column(Text, nullable=True)
    due_date = Column(Date, nullable=True)
    is_recurring = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    business = relationship("Business", back_populates="expenses")
