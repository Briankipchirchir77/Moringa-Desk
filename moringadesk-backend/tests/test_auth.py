from tests.conftest import register


def test_register_returns_token_and_user(client):
    res = register(client)
    assert res.status_code == 201
    body = res.get_json()
    assert "token" in body
    assert body["user"]["email"] == "amina@example.com"
    # the password must never come back to the client
    assert "password" not in body["user"]


def test_register_rejects_duplicate_email(client):
    register(client)
    res = register(client)
    assert res.status_code == 409


def test_login_succeeds_with_correct_password(client):
    register(client)
    res = client.post("/auth/login", json={"email": "amina@example.com", "password": "secret123"})
    assert res.status_code == 200
    assert "token" in res.get_json()


def test_login_fails_with_wrong_password(client):
    register(client)
    res = client.post("/auth/login", json={"email": "amina@example.com", "password": "wrong"})
    assert res.status_code == 401


def test_protected_route_requires_token(client):
    # creating a problem needs a token
    res = client.post("/problems", json={"title": "x", "body": "y"})
    assert res.status_code == 401
