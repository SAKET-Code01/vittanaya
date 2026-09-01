"""SQLAlchemy Model for Local Market Data & Sector Benchmarks.

SIH26091 - Panchayat & Block Level Market Intelligence Dataset.
"""

from sqlalchemy import Column, Float, Integer, String, Text

from backend.app.core.database import Base


class LocalMarketData(Base):
    """Local Market Benchmark & Demand Analysis Dataset Table."""

    __tablename__ = "local_market_data"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    district_name = Column(String(100), nullable=False, index=True)
    block_name = Column(String(100), nullable=False, index=True)
    sector_category = Column(String(100), nullable=False, index=True)
    demand_level = Column(String(50), nullable=False, default="Moderate")
    competitor_count = Column(Integer, nullable=False, default=3)
    avg_price_point = Column(Float, nullable=True)
    unit_of_measure = Column(String(50), nullable=True)
    market_reach_description = Column(Text, nullable=False)
    opportunity_summary = Column(Text, nullable=False)
    swot_json = Column(Text, nullable=True)
    base_score = Column(Float, nullable=False, default=75.0)
    source_authority = Column(String(255), nullable=False, default="NABARD Odisha PLP 2025-26")
    source_year = Column(String(50), nullable=False, default="2025-26")

    def __repr__(self) -> str:
        return (
            f"<LocalMarketData(district='{self.district_name}', block='{self.block_name}', "
            f"sector='{self.sector_category}', score={self.base_score})>"
        )
