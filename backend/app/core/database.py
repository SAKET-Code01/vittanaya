"""Database setup and session management with SQLAlchemy."""

from collections.abc import Generator
from typing import Any

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from backend.app.core.config import settings


def normalize_database_url(url: str) -> str:
    """
    Normalize DATABASE_URL for Psycopg 3 compatibility and cloud hosting providers.

    Converts legacy 'postgres://' or driverless 'postgresql://' to 'postgresql+psycopg://'.
    """
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+psycopg://", 1)
    if url.startswith("postgresql://") and not url.startswith("postgresql+"):
        return url.replace("postgresql://", "postgresql+psycopg://", 1)
    return url


db_url = normalize_database_url(settings.DATABASE_URL)

connect_args: dict[str, Any] = {}
engine_kwargs: dict[str, Any] = {
    "echo": settings.DEBUG,
    "pool_pre_ping": True,
}

if db_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False
else:
    # Production PostgreSQL connection pool parameters
    engine_kwargs.update({
        "pool_size": 10,
        "max_overflow": 20,
        "pool_recycle": 300,
    })

engine = create_engine(
    db_url,
    connect_args=connect_args,
    **engine_kwargs,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


def auto_migrate_sqlite_schema(target_engine: Any) -> None:
    """Automatically add missing columns to SQLite tables defined in Base.metadata."""
    if target_engine.dialect.name != "sqlite":
        return
    from sqlalchemy import inspect, text

    import backend.app.models  # noqa: F401

    try:
        inspector = inspect(target_engine)
        tables = inspector.get_table_names()
        with target_engine.begin() as conn:
            for table_name, table in Base.metadata.tables.items():
                if table_name not in tables:
                    continue
                existing_cols = {col["name"] for col in inspector.get_columns(table_name)}
                for column in table.columns:
                    if column.name not in existing_cols:
                        col_type = column.type.compile(target_engine.dialect)
                        sql = f"ALTER TABLE {table_name} ADD COLUMN {column.name} {col_type}"
                        conn.execute(text(sql))
    except Exception:
        pass


def get_db() -> Generator[Any, None, None]:
    """Dependency for providing a database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

