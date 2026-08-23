"""SQLAlchemy Models for VITTANAYA Insights & Reference Data.

SIH26091 - Deterministic Financial Structuring & Scheme Engines.
"""

from sqlalchemy import Boolean, Column, Float, Integer, String, Text

from backend.app.core.database import Base


class ProjectCostReference(Base):
    """Odisha-first 200+ Project Cost Reference Library Table."""

    __tablename__ = "project_cost_references"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    business_activity = Column(String(255), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)
    scale_or_specification = Column(String(255), nullable=False)
    unit = Column(String(50), nullable=True)
    reference_cost_min_inr = Column(Float, nullable=False)
    reference_cost_max_inr = Column(Float, nullable=False)
    cost_basis = Column(String(255), nullable=False)
    source_authority = Column(String(255), nullable=False)
    source_year = Column(String(100), nullable=False)
    state_or_scope = Column(String(255), nullable=False)
    source_page = Column(String(255), nullable=True)
    official_source_url = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    provenance_priority = Column(String(100), nullable=False, index=True)
    use_for_vittanaya = Column(Text, nullable=False)

    def __repr__(self) -> str:
        return (
            f"<ProjectCostReference(activity='{self.business_activity}', "
            f"category='{self.category}', priority='{self.provenance_priority}')>"
        )


class SchemeRule(Base):
    """Structured Credit Scheme Rules for Scheme Match Engine."""

    __tablename__ = "scheme_rules"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    scheme_code = Column(String(50), unique=True, nullable=False, index=True)
    scheme_name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    max_project_cost_mfg = Column(Float, nullable=True)
    max_project_cost_service = Column(Float, nullable=True)
    min_margin_pct_gen = Column(Float, nullable=False, default=10.0)
    min_margin_pct_special = Column(Float, nullable=False, default=5.0)
    max_subsidy_pct_rural_gen = Column(Float, nullable=False, default=25.0)
    max_subsidy_pct_rural_special = Column(Float, nullable=False, default=35.0)
    max_subsidy_pct_urban_gen = Column(Float, nullable=False, default=15.0)
    max_subsidy_pct_urban_special = Column(Float, nullable=False, default=25.0)
    max_subsidy_amount = Column(Float, nullable=True)
    interest_subsidy_pct = Column(Float, nullable=False, default=0.0)
    collateral_required = Column(Boolean, nullable=False, default=False)
    eligible_categories = Column(String(255), nullable=False, default="ALL")
    trading_restricted = Column(Boolean, nullable=False, default=False)
    source_authority = Column(String(255), nullable=False)
    source_year = Column(String(100), nullable=False)
    official_source_url = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)

    def __repr__(self) -> str:
        return f"<SchemeRule(code='{self.scheme_code}', name='{self.scheme_name}')>"
