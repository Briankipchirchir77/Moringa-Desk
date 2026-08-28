def _make_problem(client, headers, title="setState looks stale"):
    return client.post("/problems", headers=headers, json={
        "title": title, "body": "Why is my logged value old?",
        "category": "Logical", "tagIds": [],
    })


def test_create_and_list_problem(client, auth):
    _, _, headers = auth
    res = _make_problem(client, headers)
    assert res.status_code == 201
    assert res.get_json()["title"] == "setState looks stale"

    listed = client.get("/problems").get_json()
    assert len(listed) == 1


def test_vote_notifies_owner(client, auth):
    # owner posts a problem
    owner_token, owner, owner_headers = auth
    problem = _make_problem(client, owner_headers).get_json()

    # a second user votes on it
    client.post("/auth/register", json={
        "name": "Bob", "email": "bob@example.com", "password": "secret123",
    })
    login = client.post("/auth/login", json={"email": "bob@example.com", "password": "secret123"}).get_json()
    bob_headers = {"Authorization": f"Bearer {login['token']}"}

    res = client.patch(f"/problems/{problem['id']}", headers=bob_headers, json={"votes": 1})
    assert res.status_code == 200
    assert res.get_json()["votes"] == 1

    # the owner should now have a 'vote' notification
    notes = client.get(f"/notifications?userId={owner['id']}", headers=owner_headers).get_json()
    assert any(n["type"] == "vote" for n in notes)


def test_only_author_or_admin_can_delete(client, auth):
    _, _, owner_headers = auth
    problem = _make_problem(client, owner_headers).get_json()

    client.post("/auth/register", json={"name": "Eve", "email": "eve@example.com", "password": "secret123"})
    login = client.post("/auth/login", json={"email": "eve@example.com", "password": "secret123"}).get_json()
    eve_headers = {"Authorization": f"Bearer {login['token']}"}

    res = client.delete(f"/problems/{problem['id']}", headers=eve_headers)
    assert res.status_code == 403
