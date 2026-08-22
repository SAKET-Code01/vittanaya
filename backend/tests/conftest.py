"""Pytest shared test configuration and fixtures."""

from collections.abc import Generator
from decimal import Decimal

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.core.database import Base, get_db
from backend.app.models.business import Business
from backend.app.models.user import User
from backend.main import app

# In-memory SQLite for testing with StaticPool to share connection across threads
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session() -> Generator[Session, None, None]:
    """Create a fresh database schema for each test."""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session: Session) -> Generator[TestClient, None, None]:
    """FastAPI TestClient with overridden database dependency."""

    def override_get_db() -> Generator[Session, None, None]:
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def sample_user(db_session: Session) -> User:
    """Create a sample rural micro-entrepreneur user."""
    user = User(
        name="Lakshmi Devi",
        email="lakshmi@sundargram.in",
        hashed_password="mock_hashed_secret",
        phone="+91 98765 43210",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture(scope="function")
def sample_business(db_session: Session, sample_user: User) -> Business:
    """Create a sample rural business profile."""
    business = Business(
        owner_id=sample_user.id,
        name="Lakshmi Handlooms & Terracotta",
        type="Handicraft",
        industry="Artisanal Manufacturing",
        location_village="Sundargram",
        location_district="Puri",
        location_state="Odisha",
        location_pin="752001",
        phone="+91 98765 43210",
        email="lakshmi@sundargram.in",
        description="Rural women-led terracotta and handloom craft unit.",
        monthly_revenue_estimate=Decimal("45000.00"),
        monthly_expense_estimate=Decimal("28000.00"),
    )
    db_session.add(business)
    db_session.commit()
    db_session.refresh(business)
    return business
