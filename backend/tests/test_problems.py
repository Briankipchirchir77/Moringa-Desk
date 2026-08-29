def _make_problem(client, headers, title="setState looks stale"):
    return client.post("/problems", headers=headers, json={
        "title": title, "body": "Why is my logged value old?", "tagIds": [],
    })


def test_create_and_list_problem(client, auth):
    _, _, headers = auth
    res = _make_problem(client, headers)
    assert res.status_code == 201
    assert res.get_json()["title"] == "setState looks stale"

    listed = client.get("/problems").get_json()
    assert len(listed) == 1


def test_create_requires_auth(client):
    res = client.post("/problems", json={"title": "x", "body": "y"})
    assert res.status_code == 401


def test_only_author_or_admin_can_delete(client, auth, admin_auth):
    _, _, owner_headers = auth
    problem = _make_problem(client, owner_headers).get_json()

    client.post("/auth/register", json={"name": "Eve", "email": "eve@example.com", "password": "secret123"})
    eve_login = client.post("/auth/login", json={"email": "eve@example.com", "password": "secret123"}).get_json()
    eve_headers = {"Authorization": f"Bearer {eve_login['token']}"}

    # a stranger can't delete it
    res = client.delete(f"/problems/{problem['id']}", headers=eve_headers)
    assert res.status_code == 403

    # the author can
    res = client.delete(f"/problems/{problem['id']}", headers=owner_headers)
    assert res.status_code == 204


def test_admin_can_delete_anyones_problem(client, auth, admin_auth):
    _, _, owner_headers = auth
    _, _, admin_headers = admin_auth
    problem = _make_problem(client, owner_headers).get_json()

    res = client.delete(f"/problems/{problem['id']}", headers=admin_headers)
    assert res.status_code == 204


def test_deleting_accepted_answer_clears_solved_state_instead_of_blocking(client, auth):
    """Regression test for a real bug caught during development: the FK
    from problems.solved_answer_id -> answers.id used to lack an ON DELETE
    behavior, so deleting an accepted answer raised a 500 IntegrityError
    instead of just clearing the problem's solved status."""
    _, user, headers = auth
    problem = _make_problem(client, headers).get_json()
    answer = client.post("/answers", headers=headers, json={
        "problemId": problem["id"], "body": "Wrap it in useMemo.",
    }).get_json()

    client.patch(f"/problems/{problem['id']}", headers=headers, json={"solvedAnswerId": answer["id"]})

    res = client.delete(f"/answers/{answer['id']}", headers=headers)
    assert res.status_code == 204

    updated = client.get(f"/problems/{problem['id']}").get_json()
    assert updated["solvedAnswerId"] is None
