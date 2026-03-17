"""Request/Response middleware for logging and tracking"""

import time
import uuid
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from app.logging_config import get_logger

logger = get_logger(__name__)


class RequestIDMiddleware(BaseHTTPMiddleware):
    """Add request ID to all requests and responses"""

    async def dispatch(self, request: Request, call_next) -> Response:
        # Generate or get request ID
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        request.state.request_id = request_id

        # Add request ID to response
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response


class LoggingMiddleware(BaseHTTPMiddleware):
    """Log all requests and responses"""

    async def dispatch(self, request: Request, call_next) -> Response:
        # Start timer
        start_time = time.time()
        request_id = getattr(request.state, "request_id", "unknown")

        # Get request body (for logging POST/PUT requests)
        body = await request.body() if request.method in ["POST", "PUT", "PATCH"] else None

        # Call next middleware/handler
        response = await call_next(request)

        # Calculate processing time
        process_time = time.time() - start_time

        # Log the request/response
        logger.info(
            f"{request.method} {request.url.path}",
            extra={'extra_data': {
                'request_id': request_id,
                'method': request.method,
                'path': request.url.path,
                'status_code': response.status_code,
                'process_time_seconds': round(process_time, 3),
                'client_ip': request.client.host if request.client else None,
            }}
        )

        # Add processing time header
        response.headers["X-Process-Time"] = str(process_time)
        return response


class CorrelationIDMiddleware(BaseHTTPMiddleware):
    """Tracking middleware for correlating related requests"""

    async def dispatch(self, request: Request, call_next) -> Response:
        # Get or create correlation ID for tracing request chains
        correlation_id = request.headers.get("X-Correlation-ID") or str(uuid.uuid4())
        request.state.correlation_id = correlation_id

        response = await call_next(request)
        response.headers["X-Correlation-ID"] = correlation_id
        return response
