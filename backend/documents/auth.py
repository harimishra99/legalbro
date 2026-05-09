import jwt
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed


class SupabaseUser:
    """Minimal user object derived from a validated Supabase JWT."""

    def __init__(self, payload: dict):
        self.id = payload.get("sub", "")
        self.email = payload.get("email", "")
        self.is_authenticated = True
        self.is_anonymous = False

    def __str__(self):
        return self.email


class SupabaseJWTAuthentication(BaseAuthentication):
    """
    Validates the Bearer token issued by Supabase Auth.
    Requires SUPABASE_JWT_SECRET in settings (the JWT secret from Supabase dashboard
    → Project Settings → API → JWT Secret).
    """

    def authenticate(self, request):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return None

        token = auth_header.split(" ", 1)[1].strip()
        secret = getattr(settings, "SUPABASE_JWT_SECRET", "")

        if not secret:
            # In local dev without Supabase, accept any token and return a mock user
            if settings.DEBUG:
                return (SupabaseUser({"sub": "dev-user", "email": "dev@local.test"}), None)
            raise AuthenticationFailed("SUPABASE_JWT_SECRET not configured.")

        try:
            payload = jwt.decode(
                token,
                secret,
                algorithms=["HS256"],
                options={"verify_aud": False},
            )
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("Token expired.")
        except jwt.InvalidTokenError as exc:
            raise AuthenticationFailed(f"Invalid token: {exc}")

        return (SupabaseUser(payload), token)

    def authenticate_header(self, request):
        return "Bearer"
