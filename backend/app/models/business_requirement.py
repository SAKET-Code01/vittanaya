"""SQLAlchemy model for Business Requirements & Document Tracking.

SIH26091 - Business Readiness Engine & Statutory Verification Tracking.
"""

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from backend.app.core.database import Base


class BusinessRequirement(Base):
    """Business readiness requirement, statutory license, permit, or document item."""

    __tablename__ = "business_requirements"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    business_id = Column(
        Integer, ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    requirement_id = Column(String(100), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    category = Column(
        String(50), nullable=False, index=True
    )  # 'Capital', 'Registration', 'Permission', 'License', 'Document', 'Infrastructure', 'Operations'
    required = Column(Boolean, nullable=False, default=True)
    status = Column(
        String(50), nullable=False, default="pending", index=True
    )  # 'pending', 'in_progress', 'submitted', 'verified', 'completed', 'not_applicable'
    reason = Column(Text, nullable=False)
    source = Column(String(255), nullable=False)

    # Action Plan & Document Tracking Linkages
    linked_action_task_id = Column(Integer, nullable=True, index=True)
    document_type = Column(String(100), nullable=True)  # e.g., 'Aadhaar Card', 'Rent Agreement'
    submission_status = Column(
        String(50), nullable=True, default="pending"
    )  # 'pending', 'submitted', 'verified', 'not_applicable'
    verification_status = Column(
        String(50), nullable=True, default="unverified"
    )  # 'unverified', 'verified', 'rejected'
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    business = relationship("Business", back_populates="requirements")

    def __repr__(self) -> str:
        return (
            f"<BusinessRequirement(id={self.id}, biz_id={self.business_id}, "
            f"req_id='{self.requirement_id}', status='{self.status}')>"
        )
