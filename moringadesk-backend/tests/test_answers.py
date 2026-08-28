def test_answer_notifies_question_owner(client, auth):
    owner_token, owner, owner_headers = auth
    problem = client.post("/problems", headers=owner_headers, json={
        "title": "Docker won't start", "body": "port already in use",
    }).get_json()

    # a helper registers and answers
    client.post("/auth/register", json={"name": "Helper", "email": "help@example.com", "password": "secret123"})
    login = client.post("/auth/login", json={"email": "help@example.com", "password": "secret123"}).get_json()
    helper_headers = {"Authorization": f"Bearer {login['token']}"}

    res = client.post("/answers", headers=helper_headers, json={
        "problemId": problem["id"], "body": "kill the process on that port",
    })
    assert res.status_code == 201

    # owner is notified their question got an answer
    notes = client.get(f"/notifications?userId={owner['id']}", headers=owner_headers).get_json()
    assert any(n["type"] == "answer" for n in notes)


def test_list_answers_by_problem(client, auth):
    _, _, headers = auth
    problem = client.post("/problems", headers=headers, json={"title": "t", "body": "b"}).get_json()
    client.post("/answers", headers=headers, json={"problemId": problem["id"], "body": "one"})

    answers = client.get(f"/answers?problemId={problem['id']}").get_json()
    assert len(answers) == 1
    assert answers[0]["problemId"] == problem["id"]
