"""Shared pytest fixtures.

Each test gets a fresh app backed by a throwaway in-memory SQLite database,
plus small helpers to register a user and grab an auth token/headers.
"""
import pytest

from server import create_app
from server.config import TestConfig
from server.extensions import db


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


def register(client, name="Amina", email="amina@example.com", password="secret123", cohort="Cohort 27"):
    return client.post("/auth/register", json={
        "name": name, "email": email, "password": password, "cohort": cohort,
    })


@pytest.fixture
def auth(client):
    """Return (token, user, headers) for a freshly-registered student."""
    res = register(client)
    body = res.get_json()
    token = body["token"]
    return token, body["user"], {"Authorization": f"Bearer {token}"}
