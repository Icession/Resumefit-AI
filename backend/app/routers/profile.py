"""User profile: saved applicant details that auto-fill cover letters."""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.db import get_session
from app.deps import get_current_user
from app.models import Profile, User
from app.schemas import ProfileRead, ProfileWrite

router = APIRouter(tags=["profile"])


@router.get("/profile", response_model=ProfileRead)
def get_profile(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> ProfileRead:
    """Return the logged-in user's saved details, or empty defaults if none yet."""
    profile = session.exec(
        select(Profile).where(Profile.user_id == current_user.id)
    ).first()
    if profile is None:
        return ProfileRead()
    return ProfileRead.model_validate(profile)


@router.put("/profile", response_model=ProfileRead)
def save_profile(
    data: ProfileWrite,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> ProfileRead:
    """Create or update the logged-in user's saved details."""
    profile = session.exec(
        select(Profile).where(Profile.user_id == current_user.id)
    ).first()
    if profile is None:
        profile = Profile(user_id=current_user.id)

    profile.full_name = data.full_name
    profile.email = data.email
    profile.phone = data.phone
    profile.location = data.location
    profile.links = [link.model_dump() for link in data.links]
    profile.updated_at = datetime.now(timezone.utc)

    session.add(profile)
    session.commit()
    session.refresh(profile)
    return ProfileRead.model_validate(profile)