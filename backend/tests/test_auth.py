def test_register_and_login(client):
    res = client.post("/auth/register", json={
        "name": "Amina", "email": "Amina@Example.com", "password": "secret123",
    })
    assert res.status_code == 201
    assert res.get_json()["user"]["role"] == "student"

    # case-insensitive email on login
    res = client.post("/auth/login", json={
        "email": "amina@example.com", "password": "secret123",
    })
    assert res.status_code == 200
    assert "token" in res.get_json()


def test_login_rejects_wrong_password(client, auth):
    _, user, _ = auth
    res = client.post("/auth/login", json={"email": user["email"], "password": "wrong"})
    assert res.status_code == 401


def test_register_rejects_duplicate_email(client, auth):
    _, user, _ = auth
    res = client.post("/auth/register", json={
        "name": "Someone Else", "email": user["email"], "password": "secret123",
    })
    assert res.status_code == 409


def test_me_requires_auth(client):
    assert client.get("/users/me").status_code == 401
