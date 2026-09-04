"""Structured logging configuration with sensitive data protection."""

import logging
import sys

from backend.app.core.config import settings


class SensitiveDataFilter(logging.Filter):
    """Filter to ensure sensitive keywords or fields are not leaked in log outputs."""

    SENSITIVE_PATTERNS = (
        "password",
        "secret",
        "token",
        "authorization",
        "api_key",
        "groq_api_key",
        "groq",
        "database_url",
        "postgres:",
        "postgresql:",
    )

    def filter(self, record: logging.LogRecord) -> bool:
        msg = record.getMessage().lower()
        # If any sensitive keyword is found along with potential assignment, mask notice
        for pattern in self.SENSITIVE_PATTERNS:
            if pattern in msg and ("=" in msg or ":" in msg):
                record.msg = "[FILTERED LOG RECORD CONTAINING SENSITIVE DATA]"
                record.args = ()
                break
        return True


def setup_logging() -> None:
    """Configure root and application loggers."""
    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)

    logging.basicConfig(
        level=log_level,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        handlers=[logging.StreamHandler(sys.stdout)],
    )

    app_logger = logging.getLogger("vittanaya")
    app_logger.addFilter(SensitiveDataFilter())


setup_logging()
logger = logging.getLogger("vittanaya")
