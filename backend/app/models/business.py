"""Business database model representing a rural MSME / micro-enterprise."""

from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from backend.app.core.database import Base


class Business(Base):
    """Business entity containing rural micro-enterprise profile and operational identity."""

    __tablename__ = "businesses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    owner_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name = Column(String(150), nullable=False, index=True)
    type = Column(
        String(50), nullable=False
    )  # e.g., 'Retail', 'Handicraft', 'Agri-Processing', 'Services'
    industry = Column(String(50), nullable=False)

    # Onboarding Stage & Canonical Profile
    stage = Column(String(50), default="established", nullable=False)  # 'new_idea', 'startup', 'established'
    category = Column(String(100), nullable=True)  # Proposed or actual category
    status = Column(String(50), default="active", nullable=False)

    # Location context (hyper-local rural fields)
    location_village = Column(String(100), nullable=True)
    location_block = Column(String(100), nullable=True)
    location_district = Column(String(100), nullable=True)
    location_state = Column(String(100), nullable=True)
    location_pin = Column(String(10), nullable=True)

    # Capital & Social Demographic Attributes
    own_capital = Column(Numeric(12, 2), default=0.00, nullable=False)
    project_cost = Column(Numeric(12, 2), default=0.00, nullable=False)
    existing_investment = Column(Numeric(12, 2), default=0.00, nullable=False)
    social_category = Column(String(50), nullable=True)  # e.g., 'General Category', 'OBC', 'SC', 'ST'
    area_type = Column(String(50), nullable=True)  # e.g., 'Rural Gram Panchayat', 'Semi-Urban / Peri-Urban'
    selected_operations = Column(Text, nullable=True)  # Comma-separated or JSON string of active operations

    phone = Column(String(20), nullable=True)
    email = Column(String(120), nullable=True)
    description = Column(Text, nullable=True)

    # Baseline monthly parameters (stored as numeric/decimal)
    monthly_revenue_estimate = Column(Numeric(12, 2), default=0.00, nullable=False)
    monthly_expense_estimate = Column(Numeric(12, 2), default=0.00, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    owner = relationship("User", back_populates="businesses")
    transactions = relationship(
        "Transaction", back_populates="business", cascade="all, delete-orphan"
    )
    receivables = relationship(
        "Receivable", back_populates="business", cascade="all, delete-orphan"
    )
    payables = relationship("Payable", back_populates="business", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="business", cascade="all, delete-orphan")
    goals = relationship("BusinessGoal", back_populates="business", cascade="all, delete-orphan")
