"""Exception handlers for FastAPI"""

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from typing import Any, Dict
from datetime import datetime
import traceback

from app.exceptions import BibliothequeException
from app.logging_config import get_logger

logger = get_logger(__name__)


def format_error_response(
    status_code: int,
    error_code: str,
    message: str,
    details: Dict[str, Any] | None = None,
    request_id: str | None = None,
) -> Dict[str, Any]:
    """Format standardized error response"""
    return {
        "error": {
            "status_code": status_code,
            "error_code": error_code,
            "message": message,
            "timestamp": datetime.utcnow().isoformat(),
            "details": details or {},
            "request_id": request_id,
        }
    }


async def bibliotheque_exception_handler(
    request: Request, exc: BibliothequeException
) -> JSONResponse:
    """Handle custom Bibliotheque exceptions"""
    request_id = request.headers.get("X-Request-ID", "unknown")

    logger.warning(
        f"BibliothequeException: {exc.error_code} - {exc.message}",
        exc_info=True,
        extra={'extra_data': {
            'error_code': exc.error_code,
            'status_code': exc.status_code,
            'path': request.url.path,
            'method': request.method,
            'request_id': request_id,
        }}
    )

    return JSONResponse(
        status_code=exc.status_code,
        content=format_error_response(
            status_code=exc.status_code,
            error_code=exc.error_code,
            message=exc.message,
            details=exc.details,
            request_id=request_id,
        ),
    )


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Handle Pydantic validation errors"""
    request_id = request.headers.get("X-Request-ID", "unknown")

    # Extract validation errors
    errors = []
    for error in exc.errors():
        errors.append({
            "field": ".".join(str(x) for x in error["loc"][1:]),
            "message": error["msg"],
            "type": error["type"],
        })

    logger.warning(
        f"Validation error: {len(errors)} field(s) failed validation",
        exc_info=True,
        extra={'extra_data': {
            'validation_errors': errors,
            'path': request.url.path,
            'method': request.method,
            'request_id': request_id,
        }}
    )

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=format_error_response(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error_code="VALIDATION_ERROR",
            message="Request validation failed",
            details={"errors": errors},
            request_id=request_id,
        ),
    )


async def generic_exception_handler(
    request: Request, exc: Exception
) -> JSONResponse:
    """Handle unexpected exceptions"""
    request_id = request.headers.get("X-Request-ID", "unknown")

    logger.error(
        f"Unexpected exception: {type(exc).__name__}",
        exc_info=True,
        extra={'extra_data': {
            'exception_type': type(exc).__name__,
            'path': request.url.path,
            'method': request.method,
            'request_id': request_id,
        }}
    )

    # Don't expose sensitive details in production
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=format_error_response(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_code="INTERNAL_SERVER_ERROR",
            message="An unexpected error occurred",
            details={"error_id": request_id},
            request_id=request_id,
        ),
    )


def register_exception_handlers(app: FastAPI) -> None:
    """Register all exception handlers with the FastAPI app"""
    app.add_exception_handler(BibliothequeException, bibliotheque_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, generic_exception_handler)
