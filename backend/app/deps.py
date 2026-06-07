"""Shared FastAPI dependencies for resolving the current user from a token."""
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlmodel import Session

from app.db import get_session
from app.models import User
from app.services.auth import decode_access_token

bearer_scheme = HTTPBearer(auto_error=False)

_TOKEN_ERRORS = (jwt.PyJWTError, ValueError, KeyError)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    session: Session = Depends(get_session),
) -> User:
    """Require a valid token; return the logged-in user or raise 401."""
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        user_id = decode_access_token(credentials.credentials)
    except _TOKEN_ERRORS:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = session.get(User, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer exists.",
        )
    return user


def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    session: Session = Depends(get_session),
) -> User | None:
    """Return the logged-in user if a valid token is present, else None."""
    if credentials is None:
        return None
    try:
        user_id = decode_access_token(credentials.credentials)
    except _TOKEN_ERRORS:
        return None
    return session.get(User, user_id)