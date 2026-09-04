"""SQLAlchemy Models for Analytic Hierarchy Process (AHP) Data Architecture.

SIH26091 - Multi-Criteria Feasibility Weighting and Audit Lineage.
"""

from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from backend.app.core.database import Base


class AHPExpert(Base):
    """Domain expert participating in AHP pairwise comparison surveys."""

    __tablename__ = "ahp_experts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    expert_code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    role_title = Column(String(100), nullable=False)
    organization = Column(String(150), nullable=True)
    experience_years = Column(Integer, nullable=True, default=10)
    dataset_group = Column(String(50), nullable=False, default="dataset_b")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    comparisons = relationship("AHPPairwiseComparison", back_populates="expert", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<AHPExpert(code='{self.expert_code}', name='{self.name}', role='{self.role_title}')>"


class AHPPairwiseComparison(Base):
    """Individual pairwise comparison score on Saaty's 1-9 scale."""

    __tablename__ = "ahp_pairwise_comparisons"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    expert_id = Column(Integer, ForeignKey("ahp_experts.id", ondelete="CASCADE"), nullable=False, index=True)
    pair_key = Column(String(20), nullable=False, index=True)  # e.g. "M_vs_F"
    criterion_a = Column(String(50), nullable=False)           # e.g. "market"
    criterion_b = Column(String(50), nullable=False)           # e.g. "financial"
    saaty_value = Column(Float, nullable=False)                # 1.0 to 9.0 (or reciprocal 1/9 to 1)
    dataset_group = Column(String(50), nullable=False, default="dataset_b")
    created_at = Column(DateTime, default=datetime.utcnow)

    expert = relationship("AHPExpert", back_populates="comparisons")

    def __repr__(self) -> str:
        return f"<AHPPairwiseComparison(expert_id={self.expert_id}, pair='{self.pair_key}', value={self.saaty_value})>"


class AHPComputationRecord(Base):
    """Persisted snapshot of aggregated AHP matrix, weights, and consistency metrics."""

    __tablename__ = "ahp_computation_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    dataset_name = Column(String(100), nullable=False, index=True)
    expert_count = Column(Integer, nullable=False)
    comparison_count = Column(Integer, nullable=False)
    aggregated_pairwise_json = Column(Text, nullable=False)  # JSON dict of 10 GM values
    reciprocal_matrix_json = Column(Text, nullable=False)    # JSON 5x5 matrix
    row_geometric_means_json = Column(Text, nullable=False)  # JSON dict of 5 row GMs
    normalized_weights_json = Column(Text, nullable=False)   # JSON dict of normalized weights (sum=1)
    dashboard_points_json = Column(Text, nullable=False)     # JSON dict of dashboard points (sum=100)
    lambda_max = Column(Float, nullable=False)
    ci = Column(Float, nullable=False)
    cr = Column(Float, nullable=False)
    is_consistent = Column(Boolean, nullable=False, default=True)
    source_status = Column(String(100), nullable=False)
    computed_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self) -> str:
        return f"<AHPComputationRecord(dataset='{self.dataset_name}', cr={self.cr:.6f}, consistent={self.is_consistent})>"


class FeasibilityCalculationRecord(Base):
    """Persisted feasibility scoring record for a specific business profile."""

    __tablename__ = "feasibility_calculation_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    business_id = Column(Integer, ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True)
    raw_scores_json = Column(Text, nullable=False)          # JSON dict of 5 raw scores (0-100)
    ahp_weights_json = Column(Text, nullable=False)         # JSON dict of weights used
    contributions_json = Column(Text, nullable=False)       # JSON dict of criterion contributions
    final_score = Column(Float, nullable=False)             # Final weighted score (0-100)
    is_consistent = Column(Boolean, nullable=False, default=True)
    calculated_at = Column(DateTime, default=datetime.utcnow)

    business = relationship("Business")

    def __repr__(self) -> str:
        return f"<FeasibilityCalculationRecord(business_id={self.business_id}, final_score={self.final_score:.2f})>"
