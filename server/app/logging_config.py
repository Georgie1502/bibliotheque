"""Logging configuration for Bibliotheque API"""

import logging
import logging.config
import json
from typing import Any
from datetime import datetime
import sys


class JSONFormatter(logging.Formatter):
    """Custom JSON formatter for structured logging"""

    def format(self, record: logging.LogRecord) -> str:
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }

        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = {
                "type": record.exc_info[0].__name__,
                "message": str(record.exc_info[1]),
                "traceback": self.formatException(record.exc_info),
            }

        # Add extra fields
        if hasattr(record, "extra_data"):
            log_data["extra"] = record.extra_data

        return json.dumps(log_data)


def setup_logging(log_level: str = "INFO") -> None:
    """Configure logging for the application"""

    # Create formatters
    json_formatter = JSONFormatter()
    simple_formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )

    # Setup root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, log_level))

    # Console handler with JSON formatting
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(getattr(logging, log_level))
    console_handler.setFormatter(json_formatter)
    root_logger.addHandler(console_handler)

    # File handler (optional - uncomment if needed)
    # file_handler = logging.FileHandler("app.log")
    # file_handler.setLevel(getattr(logging, log_level))
    # file_handler.setFormatter(json_formatter)
    # root_logger.addHandler(file_handler)

    # Set third-party loggers to WARNING
    logging.getLogger("uvicorn").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.LoggerAdapter:
    """Get a logger instance with extra context support"""
    logger = logging.getLogger(name)
    return logging.LoggerAdapter(logger, {})
