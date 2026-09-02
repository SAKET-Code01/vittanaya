"""Database setup and session management with SQLAlchemy and SQLite."""

from collections.abc import Generator
from typing import Any

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from backend.app.core.config import settings

# Engine configuration for SQLite (enforce check_same_thread=False for FastAPI concurrency)
connect_args: dict[str, Any] = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=settings.DEBUG,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


def auto_migrate_sqlite_schema(target_engine: Any) -> None:
    """Automatically add missing columns to SQLite tables defined in Base.metadata."""
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

