"""SQLAlchemy Models for Administrative Hierarchy & Location Intelligence.

SIH26091 - Local Government Directory (LGD) Location Database.
"""

from sqlalchemy import Column, Integer, String

from backend.app.core.database import Base


class LocationRef(Base):
    """Indian Administrative Location Reference Table."""

    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    state_code = Column(String(10), nullable=False, index=True)
    state_name = Column(String(100), nullable=False, index=True)
    district_name = Column(String(100), nullable=False, index=True)
    block_name = Column(String(100), nullable=False, index=True)
    panchayat_or_village = Column(String(100), nullable=False, index=True)
    pincode = Column(String(20), nullable=True, index=True)
    lgd_code = Column(String(50), nullable=True)

    def __repr__(self) -> str:
        return (
            f"<LocationRef(district='{self.district_name}', "
            f"block='{self.block_name}', village='{self.panchayat_or_village}')>"
        )
