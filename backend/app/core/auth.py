import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, jwk, JWTError
from app.core.config import settings

security = HTTPBearer()

# Cache for JWKS public keys
_jwks_cache: dict | None = None


def _get_jwks() -> dict:
    """Fetch and cache JWKS from Supabase."""
    global _jwks_cache
    if _jwks_cache is None:
        resp = httpx.get(f"{settings.SUPABASE_URL}/auth/v1/.well-known/jwks.json", timeout=10.0)
        resp.raise_for_status()
        _jwks_cache = resp.json()
    return _jwks_cache


def verify_supabase_token(token: str) -> dict:
    """Verify a Supabase JWT token using JWKS (ES256)."""
    try:
        header = jwt.get_unverified_header(token)
        kid = header.get("kid")

        jwks = _get_jwks()
        key_data = next((k for k in jwks["keys"] if k["kid"] == kid), None)

        if not key_data:
            # Key not found — refresh JWKS cache and retry
            global _jwks_cache
            _jwks_cache = None
            jwks = _get_jwks()
            key_data = next((k for k in jwks["keys"] if k["kid"] == kid), None)

        if not key_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token signing key not found",
            )

        key = jwk.construct(key_data, algorithm="ES256")
        payload = jwt.decode(token, key, algorithms=["ES256"], audience="authenticated")
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )


def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """Dependency: extract and verify admin from Supabase JWT token."""
    payload = verify_supabase_token(credentials.credentials)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    # Check admin role in app_metadata
    app_metadata = payload.get("app_metadata", {})
    role = app_metadata.get("role", "")
    if role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    return {
        "id": user_id,
        "email": payload.get("email"),
        "role": role,
    }
