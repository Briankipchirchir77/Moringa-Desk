def test_list_faqs_is_public(client):
    assert client.get("/faqs").status_code == 200


def test_only_admin_can_create_faq(client, auth, admin_auth):
    _, _, student_headers = auth
    _, _, admin_headers = admin_auth
    payload = {"category": "Grading", "question": "Q?", "answer": "A."}

    res = client.post("/faqs", headers=student_headers, json=payload)
    assert res.status_code == 403

    res = client.post("/faqs", headers=admin_headers, json=payload)
    assert res.status_code == 201


def test_create_faq_requires_auth(client):
    res = client.post("/faqs", json={"question": "Q?", "answer": "A."})
    assert res.status_code == 401
