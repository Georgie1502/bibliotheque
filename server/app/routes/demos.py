from fastapi import APIRouter

from app.exceptions import (
    AuthenticationError,
    ConflictError,
    DatabaseError,
    ResourceNotFoundError,
    ValidationError,
)
from app.logging_config import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/api/demos", tags=["demos"])


@router.get("/errors/validation")
def demo_validation_error():
    """Intentional validation error for front/back demo walkthroughs."""
    logger.warning("Demo endpoint: validation error requested")
    raise ValidationError(
        message="Donnees invalides (demo)",
        details={"demo": True, "field": "sample"},
    )


@router.get("/errors/auth")
def demo_auth_error():
    """Intentional auth error for front/back demo walkthroughs."""
    logger.warning("Demo endpoint: authentication error requested")
    raise AuthenticationError(message="Authentification requise (demo)")


@router.get("/errors/not-found")
def demo_not_found_error():
    """Intentional not-found error for front/back demo walkthroughs."""
    logger.warning("Demo endpoint: not found error requested")
    raise ResourceNotFoundError("DemoResource", "missing")


@router.get("/errors/conflict")
def demo_conflict_error():
    """Intentional conflict error for front/back demo walkthroughs."""
    logger.warning("Demo endpoint: conflict error requested")
    raise ConflictError(
        message="Conflit de donnees (demo)",
        details={"demo": True, "resource": "demo_conflict"},
    )


@router.get("/errors/internal")
def demo_internal_error():
    """Intentional internal error for front/back demo walkthroughs."""
    logger.error("Demo endpoint: internal server error requested")
    raise DatabaseError(message="Erreur serveur interne (demo)")
