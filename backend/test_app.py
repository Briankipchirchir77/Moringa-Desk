import pytest

from backend.app import create_app, db


@pytest.fixture()
def client():
    app = create_app({
        "TESTING": True,
        "JWT_SECRET_KEY": "test-secret-key-that-is-long-enough",
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
    })
    with app.test_client() as test_client:
        with app.app_context():
            db.drop_all()
            db.create_all()
        yield test_client


def register(client, email="student@example.com"):
    response = client.post("/api/auth/register", json={
        "name": "Test Student",
        "email": email,
        "password": "password123",
    })
    assert response.status_code == 201
    return {"Authorization": f"Bearer {response.json['token']}"}


def test_problem_answer_relationship_and_crud(client):
    headers = register(client)

    problem_response = client.post("/api/problems", headers=headers, json={
        "title": "How do I use migrations?",
        "body": "My database schema is out of date.",
    })
    assert problem_response.status_code == 201
    problem_id = problem_response.json["id"]

    answer_response = client.post("/api/answers", headers=headers, json={
        "problemId": problem_id,
        "body": "Run the migration command against the configured database.",
    })
    assert answer_response.status_code == 201
    answer_id = answer_response.json["id"]

    update_response = client.patch(f"/api/answers/{answer_id}", headers=headers, json={"votes": 3})
    assert update_response.status_code == 200
    assert update_response.json["votes"] == 3

    list_response = client.get(f"/api/answers?problemId={problem_id}", headers=headers)
    assert [answer["id"] for answer in list_response.json] == [answer_id]

    delete_response = client.delete(f"/api/problems/{problem_id}", headers=headers)
    assert delete_response.status_code == 204
    assert client.get(f"/api/answers?problemId={problem_id}", headers=headers).json == []


def test_protected_routes_reject_anonymous_requests(client):
    response = client.get("/api/notifications")
    assert response.status_code == 401
    assert response.json["msg"] == "Missing Authorization Header"


def test_public_question_browsing_does_not_require_login(client):
    response = client.get("/api/problems")
    assert response.status_code == 200


def test_users_cannot_edit_or_delete_another_users_problem(client):
    owner_headers = register(client, "owner@example.com")
    problem_response = client.post("/api/problems", headers=owner_headers, json={
        "title": "Owner question",
        "body": "Only the owner should edit this.",
    })
    problem_id = problem_response.json["id"]
    other_headers = register(client, "other@example.com")

    update_response = client.patch(f"/api/problems/{problem_id}", headers=other_headers, json={"body": "Changed"})
    assert update_response.status_code == 403
    delete_response = client.delete(f"/api/problems/{problem_id}", headers=other_headers)
    assert delete_response.status_code == 403

    vote_response = client.patch(f"/api/problems/{problem_id}", headers=other_headers, json={"votes": 1})
    assert vote_response.status_code == 200
