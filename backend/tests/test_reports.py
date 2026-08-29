def test_reports_summary_is_admin_only(client, auth, admin_auth):
    _, _, student_headers = auth
    _, _, admin_headers = admin_auth

    assert client.get("/reports/summary").status_code == 401
    assert client.get("/reports/summary", headers=student_headers).status_code == 403

    res = client.get("/reports/summary", headers=admin_headers)
    assert res.status_code == 200
    body = res.get_json()
    assert "totals" in body and "topContributors" in body and "topTags" in body
