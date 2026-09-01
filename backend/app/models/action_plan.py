"""SQLAlchemy Models for Action Plan & Bankable DPR Documents.

SIH26091 - Business Execution Roadmap & Pre-Funding DPR Compilation.
"""

from sqlalchemy import Boolean, Column, Float, Integer, String, Text

from backend.app.core.database import Base


class ActionPlanTask(Base):
    """Action Plan Task execution item for micro-entrepreneurs."""

    __tablename__ = "action_plan_tasks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    business_id = Column(Integer, nullable=False, index=True, default=1)
    phase = Column(String(100), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="pending", index=True)
    target_days = Column(Integer, nullable=False, default=7)
    is_mandatory = Column(Boolean, nullable=False, default=True)
    authority_name = Column(String(255), nullable=True)

    def __repr__(self) -> str:
        return f"<ActionPlanTask(id={self.id}, title='{self.title}', status='{self.status}')>"


class DPRDocument(Base):
    """Detailed Project Report (DPR) record for bank loan sanction."""

    __tablename__ = "dpr_documents"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    business_id = Column(Integer, nullable=False, index=True, default=1)
    document_name = Column(String(255), nullable=False)
    project_cost = Column(Float, nullable=False)
    own_margin = Column(Float, nullable=False)
    eligible_loan = Column(Float, nullable=False)
    subsidy_amount = Column(Float, nullable=False, default=0.0)
    generated_at = Column(String(100), nullable=False)
    content_json = Column(Text, nullable=True)

    def __repr__(self) -> str:
        return f"<DPRDocument(id={self.id}, name='{self.document_name}')>"
