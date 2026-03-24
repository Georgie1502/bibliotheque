"""Logging configuration for Bibliotheque API."""

from __future__ import annotations

import logging
import os
import sys
import json
from datetime import datetime


RESET = "\033[0m"
COLORS = {
    "DEBUG": "\033[36m",  # cyan
    "INFO": "\033[32m",   # green
    "WARNING": "\033[33m",  # yellow
    "ERROR": "\033[31m",  # red
    "CRITICAL": "\033[35m",  # magenta
    "DIM": "\033[2m",
}


class MinimalConsoleFormatter(logging.Formatter):
    """Compact console formatter with optional colors and contextual extras."""

    def __init__(self, *, use_color: bool, include_source: bool) -> None:
        super().__init__()
        self.use_color = use_color
        self.include_source = include_source

    def format(self, record: logging.LogRecord) -> str:
        ts = datetime.utcnow().strftime("%H:%M:%S")
        level = record.levelname
        logger_name = record.name
        message = record.getMessage()

        source = ""
        if self.include_source:
            source = f" {record.module}.{record.funcName}:{record.lineno}"

        extra = ""
        extra_data = getattr(record, "extra_data", None)
        if isinstance(extra_data, dict) and extra_data:
            ordered_keys = [
                "method",
                "path",
                "status_code",
                "process_time_seconds",
                "request_id",
                "correlation_id",
                "error_code",
            ]
            chunks: list[str] = []
            for key in ordered_keys:
                if key in extra_data and extra_data[key] is not None:
                    chunks.append(f"{key}={extra_data[key]}")
            for key, value in extra_data.items():
                if key not in ordered_keys and value is not None:
                    chunks.append(f"{key}={value}")
            if chunks:
                extra = f" | {' '.join(chunks)}"

        if self.use_color:
            level_color = COLORS.get(level, "")
            dim = COLORS["DIM"]
            return (
                f"{dim}{ts}{RESET} "
                f"{level_color}{level:<8}{RESET} "
                f"{dim}{logger_name}{RESET}"
                f"{source} - {message}{extra}"
            )

        return f"{ts} {level:<8} {logger_name}{source} - {message}{extra}"


class JsonLogFormatter(logging.Formatter):
    """Structured JSON formatter for production and demo tracing."""

    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }

        extra_data = getattr(record, "extra_data", None)
        if isinstance(extra_data, dict) and extra_data:
            payload["extra"] = extra_data

        if record.exc_info:
            payload["exception"] = {
                "type": record.exc_info[0].__name__ if record.exc_info[0] else None,
                "message": str(record.exc_info[1]) if record.exc_info[1] else None,
            }

        return json.dumps(payload, ensure_ascii=True)


def _resolve_log_mode(mode: str | None) -> str:
    candidate = (mode or "").strip().upper()
    if candidate in {"DEBUG", "DEV", "PROD"}:
        return candidate
    return "DEV"


def _resolve_level(log_mode: str, log_level: str | None) -> int:
    if log_level:
        level_name = log_level.strip().upper()
        if hasattr(logging, level_name):
            return getattr(logging, level_name)
    defaults = {
        "DEBUG": logging.DEBUG,
        "DEV": logging.INFO,
        "PROD": logging.INFO,
    }
    return defaults[log_mode]


def setup_logging(log_level: str | None = None, log_mode: str | None = None) -> None:
    """Configure app logging once, with profile-based output style."""
    resolved_mode = _resolve_log_mode(log_mode or os.getenv("LOG_MODE"))
    resolved_level = _resolve_level(resolved_mode, log_level or os.getenv("LOG_LEVEL"))
    include_source = resolved_mode == "DEBUG"
    use_color = resolved_mode in {"DEBUG", "DEV"}

    root_logger = logging.getLogger()
    root_logger.setLevel(resolved_level)

    # Idempotent setup: avoid duplicate handlers when reload/import cycles happen.
    root_logger.handlers.clear()

    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(resolved_level)
    if resolved_mode == "PROD":
        console_handler.setFormatter(JsonLogFormatter())
    else:
        console_handler.setFormatter(
            MinimalConsoleFormatter(use_color=use_color, include_source=include_source)
        )
    root_logger.addHandler(console_handler)

    # Let third-party loggers propagate to root without adding their own duplicates.
    for logger_name in (
        "uvicorn",
        "uvicorn.error",
        "uvicorn.access",
        "fastapi",
        "sqlalchemy",
        "sqlalchemy.engine",
    ):
        external_logger = logging.getLogger(logger_name)
        external_logger.handlers.clear()
        external_logger.propagate = True

    logging.getLogger("sqlalchemy.engine").setLevel(
        logging.INFO if resolved_mode == "DEBUG" else logging.WARNING
    )
    logging.getLogger("uvicorn.access").setLevel(
        logging.INFO if resolved_mode in {"DEBUG", "DEV"} else logging.WARNING
    )


def get_logger(name: str) -> logging.Logger:
    """Get logger configured by setup_logging."""
    return logging.getLogger(name)
