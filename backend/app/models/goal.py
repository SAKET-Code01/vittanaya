"""Business Goal database model for financial structuring and working-capital targets."""

from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from backend.app.core.database import Base


class BusinessGoal(Base):
    """Financial structuring goal (e.g., equipment purchase, inventory buffer target)."""

    __tablename__ = "business_goals"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    business_id = Column(
        Integer, ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title = Column(String(150), nullable=False)
    target_amount = Column(Numeric(12, 2), nullable=False)
    current_amount = Column(Numeric(12, 2), default=0.00, nullable=False)
    deadline = Column(Date, nullable=True)
    priority = Column(String(20), default="medium", nullable=False)  # low, medium, high
    status = Column(
        String(20), default="in_progress", nullable=False
    )  # in_progress, achieved, cancelled

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    business = relationship("Business", back_populates="goals")
