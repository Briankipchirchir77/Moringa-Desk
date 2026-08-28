"""Application configuration.

Reads settings from environment variables (loaded from a .env file in
development). The database URL defaults to a local SQLite file so the app
runs with zero setup, but in production you set DATABASE_URL to a
PostgreSQL connection string (the project's required database).
"""
import os
from datetime import timedelta


class Config:
    # --- Security ---
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-change-me")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "dev-jwt-secret-change-me")
    # How long a login token stays valid.
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=1)

    # --- Database ---
    # In production DATABASE_URL points at PostgreSQL, e.g.
    #   postgresql://user:password@host:5432/moringadesk
    # Locally, if it is not set, we fall back to a SQLite file.
    _db_url = os.environ.get("DATABASE_URL", "sqlite:///moringadesk.db")
    # Some hosts (Render/Heroku) hand out "postgres://" which SQLAlchemy no
    # longer accepts; normalise it to "postgresql://".
    if _db_url.startswith("postgres://"):
        _db_url = _db_url.replace("postgres://", "postgresql://", 1)
    SQLALCHEMY_DATABASE_URI = _db_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False


class TestConfig(Config):
    """Used by the test suite: a fast, throwaway in-memory database."""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    JWT_SECRET_KEY = "test-jwt-secret"
