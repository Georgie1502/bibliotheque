"""Custom exceptions for Bibliotheque API"""

from typing import Optional, Dict, Any


class BibliothequeException(Exception):
    """Base exception for all Bibliotheque API errors"""

    def __init__(
        self,
        message: str,
        status_code: int = 500,
        error_code: str = "INTERNAL_ERROR",
        details: Optional[Dict[str, Any]] = None,
    ):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        self.details = details or {}
        super().__init__(self.message)


class ValidationError(BibliothequeException):
    """400 Bad Request - Validation error"""

    def __init__(
        self,
        message: str,
        error_code: str = "VALIDATION_ERROR",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            message=message,
            status_code=400,
            error_code=error_code,
            details=details,
        )


class DuplicateResourceError(ValidationError):
    """400 - Attempted to create a duplicate resource"""

    def __init__(
        self, message: str, details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            message=message,
            error_code="DUPLICATE_RESOURCE",
            details=details,
        )


class AuthenticationError(BibliothequeException):
    """401 Unauthorized - Authentication failed"""

    def __init__(
        self,
        message: str = "Authentication failed",
        error_code: str = "AUTHENTICATION_FAILED",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            message=message,
            status_code=401,
            error_code=error_code,
            details=details,
        )


class InvalidTokenError(AuthenticationError):
    """401 - Invalid or expired token"""

    def __init__(
        self, message: str = "Invalid or expired token"
    ):
        super().__init__(
            message=message,
            error_code="INVALID_TOKEN",
        )


class PermissionError(BibliothequeException):
    """403 Forbidden - User lacks permission"""

    def __init__(
        self,
        message: str = "Permission denied",
        error_code: str = "PERMISSION_DENIED",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            message=message,
            status_code=403,
            error_code=error_code,
            details=details,
        )


class ResourceNotFoundError(BibliothequeException):
    """404 Not Found"""

    def __init__(
        self,
        resource_type: str,
        resource_id: Any,
        error_code: str = "RESOURCE_NOT_FOUND",
        details: Optional[Dict[str, Any]] = None,
    ):
        message = f"{resource_type} with ID {resource_id} not found"
        if details is None:
            details = {"resource_type": resource_type, "resource_id": resource_id}
        super().__init__(
            message=message,
            status_code=404,
            error_code=error_code,
            details=details,
        )


class ConflictError(BibliothequeException):
    """409 Conflict - Request conflicts with current state"""

    def __init__(
        self,
        message: str,
        error_code: str = "CONFLICT",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            message=message,
            status_code=409,
            error_code=error_code,
            details=details,
        )


class RateLimitError(BibliothequeException):
    """429 Too Many Requests"""

    def __init__(
        self,
        message: str = "Rate limit exceeded",
        error_code: str = "RATE_LIMIT_EXCEEDED",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            message=message,
            status_code=429,
            error_code=error_code,
            details=details,
        )


class DatabaseError(BibliothequeException):
    """500 Internal Server Error - Database error"""

    def __init__(
        self,
        message: str = "Database operation failed",
        error_code: str = "DATABASE_ERROR",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            message=message,
            status_code=500,
            error_code=error_code,
            details=details,
        )


class ExternalServiceError(BibliothequeException):
    """503 Service Unavailable - External service error"""

    def __init__(
        self,
        service_name: str,
        message: str = "External service unavailable",
        error_code: str = "EXTERNAL_SERVICE_ERROR",
        details: Optional[Dict[str, Any]] = None,
    ):
        if details is None:
            details = {"service_name": service_name}
        super().__init__(
            message=message,
            status_code=503,
            error_code=error_code,
            details=details,
        )
