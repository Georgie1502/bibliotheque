from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Preference, User
from app.schemas import PreferenceRead, PreferenceUpdate
from app.security import verify_token

router = APIRouter(prefix="/api/preferences", tags=["preferences"])


def _get_or_create_preference(user: User, db: Session) -> Preference:
    """Return the user's Preference row, creating defaults if absent."""
    if user.preference:
        return user.preference
    pref = Preference(user_id=user.id)
    db.add(pref)
    db.commit()
    db.refresh(pref)
    return pref


def _resolve_user(email: str, db: Session) -> User:
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.get("/me", response_model=PreferenceRead)
def get_my_preferences(
    email: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """Return the current user's display preferences (auto-creates defaults on first call)."""
    user = _resolve_user(email, db)
    return _get_or_create_preference(user, db)


@router.put("/me", response_model=PreferenceRead)
def update_my_preferences(
    payload: PreferenceUpdate,
    email: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """Upsert the current user's display preferences."""
    user = _resolve_user(email, db)
    pref = _get_or_create_preference(user, db)

    if payload.theme is not None:
        pref.theme = payload.theme
    if payload.font_scale is not None:
        pref.font_scale = payload.font_scale

    db.commit()
    db.refresh(pref)
    return pref
