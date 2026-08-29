"""Shared pytest fixtures.

Each test gets a fresh app backed by a throwaway in-memory SQLite
database, plus small helpers to register a user and grab an auth token.
"""
import pytest

from app import create_app
from config import TestConfig
from app.extensions import db


@pytest.fixture
def app():
    app = create_app(TestConfig)
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


def register(client, name="Amina", email="amina@example.com", password="secret123", role="student"):
    return client.post("/auth/register", json={
        "name": name, "email": email, "password": password, "role": role,
    })


@pytest.fixture
def auth(client):
    """Return (token, user, headers) for a freshly-registered student."""
    res = register(client)
    body = res.get_json()
    return body["token"], body["user"], {"Authorization": f"Bearer {body['token']}"}


@pytest.fixture
def admin_auth(client):
    """Same as `auth`, but for a freshly-registered admin."""
    res = register(client, name="Admin Amina", email="admin@example.com", role="admin")
    body = res.get_json()
    return body["token"], body["user"], {"Authorization": f"Bearer {body['token']}"}
