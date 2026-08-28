import os
from datetime import timedelta

basedir = os.path.abspath(os.path.dirname(__file__))


class Config:
    # Prefer DATABASE_URL (the convention Render/Railway/Heroku-style hosts
    # inject); fall back to a local Postgres instance for development.
    _raw_url = os.environ.get(
        "DATABASE_URL", "postgresql://localhost:5432/moringadesk"
    )
    # Some hosts (Render, Heroku) hand out "postgres://" URLs, which
    # SQLAlchemy 1.4+/psycopg2 no longer accepts — normalize to postgresql://.
    if _raw_url.startswith("postgres://"):
        _raw_url = _raw_url.replace("postgres://", "postgresql://", 1)
    SQLALCHEMY_DATABASE_URI = _raw_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "dev-secret-change-me")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)

    # Comma-separated list of allowed frontend origins (Vite dev server +
    # the deployed Vercel URL). '*' during local dev is fine since there's
    # no cookie-based auth (JWT is sent via Authorization header).
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*")
