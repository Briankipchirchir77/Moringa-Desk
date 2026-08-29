def _make_problem(client, headers):
    return client.post("/problems", headers=headers, json={
        "title": "Why is useEffect looping?", "body": "...", "tagIds": [],
    }).get_json()


def test_create_and_list_answers_by_problem(client, auth):
    _, _, headers = auth
    problem = _make_problem(client, headers)

    res = client.post("/answers", headers=headers, json={
        "problemId": problem["id"], "body": "Check your dependency array.",
    })
    assert res.status_code == 201

    listed = client.get(f"/answers?problemId={problem['id']}").get_json()
    assert len(listed) == 1
    assert listed[0]["body"] == "Check your dependency array."


def test_only_author_or_admin_can_delete_answer(client, auth):
    _, _, headers = auth
    problem = _make_problem(client, headers)
    answer = client.post("/answers", headers=headers, json={
        "problemId": problem["id"], "body": "An answer.",
    }).get_json()

    client.post("/auth/register", json={"name": "Eve", "email": "eve@example.com", "password": "secret123"})
    eve_login = client.post("/auth/login", json={"email": "eve@example.com", "password": "secret123"}).get_json()
    eve_headers = {"Authorization": f"Bearer {eve_login['token']}"}

    res = client.delete(f"/answers/{answer['id']}", headers=eve_headers)
    assert res.status_code == 403
