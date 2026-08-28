from server.extensions import db
from server.models import User


def _admin_headers(client, app):
    # register a normal user, then promote them to admin directly in the db
    client.post("/auth/register", json={"name": "Boss", "email": "boss@example.com", "password": "secret123"})
    with app.app_context():
        user = User.query.filter_by(email="boss@example.com").first()
        user.role = "admin"
        db.session.commit()
    login = client.post("/auth/login", json={"email": "boss@example.com", "password": "secret123"}).get_json()
    return {"Authorization": f"Bearer {login['token']}"}


def test_faqs_are_publicly_listable(client):
    assert client.get("/faqs").status_code == 200


def test_only_admin_can_create_faq(client, app, auth):
    _, _, student_headers = auth
    # a student is forbidden
    res = client.post("/faqs", headers=student_headers, json={"question": "q", "answer": "a"})
    assert res.status_code == 403

    # an admin succeeds
    admin_headers = _admin_headers(client, app)
    res = client.post("/faqs", headers=admin_headers, json={"question": "q", "answer": "a", "category": "Git"})
    assert res.status_code == 201
