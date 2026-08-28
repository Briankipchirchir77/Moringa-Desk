# MoringaDesk API

The Phase 2 backend is a Flask REST API backed by PostgreSQL through SQLAlchemy. It replaces the Phase 1 MSW handlers while keeping the response shapes expected by the React client.

## Quick start

```bash
cd backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
cp .env.example .env
# Create the PostgreSQL database named moringa_desk, then update .env if needed.
.venv/bin/python app.py
```

The API runs at `http://localhost:5000`. The health check is `GET /api/health`.

To add showcase records to a new database, run this once from the `backend` directory:

```bash
.venv/bin/python seed.py
```

This creates sample users, tags, related questions, and an accepted answer. The demo student login is `alex.kimani@moringaschool.com` with password `password123`.

For a quick local smoke test without PostgreSQL, set `DATABASE_URL=sqlite:///moringa_desk.db`. Production and the documented project setup should use PostgreSQL.

## Deploy with the frontend on Vercel

The repository includes `api/index.py`, which exposes the Flask app as a Vercel Python function. In the Vercel project settings, add these environment variables before deploying:

```env
DATABASE_URL=postgresql+psycopg://user:password@host:5432/moringa_desk
JWT_SECRET_KEY=replace-with-a-long-random-secret
FRONTEND_ORIGIN=https://moringadesk.vercel.app
```

The included `vercel.json` sends `/api/*` to Flask and all other paths to the React SPA. Without `DATABASE_URL`, the deployed API cannot persist data.

## Data model

```mermaid
erDiagram
    USER ||--o{ PROBLEM : asks
    USER ||--o{ ANSWER : writes
    PROBLEM ||--o{ ANSWER : receives
    PROBLEM }o--o{ TAG : has
    USER }o--o{ PROBLEM : follows
    PROBLEM ||--o| ANSWER : accepts
    USER ||--o{ NOTIFICATION : receives

    USER { integer id PK string email string role }
    PROBLEM { integer id PK integer user_id FK integer solved_answer_id FK }
    ANSWER { integer id PK integer problem_id FK integer user_id FK }
    TAG { integer id PK string name }
    NOTIFICATION { integer id PK integer user_id FK }
```

The two primary related resources are `Problem` and `Answer`: one student can ask many problems, and each problem can receive many answers. Tags and followers provide additional many-to-many organization, while `solvedAnswerId` identifies the accepted solution.

## API contract

All routes use the `/api` prefix. Protected routes require `Authorization: Bearer <token>`.

- `POST /auth/register`, `POST /auth/login`, `GET /users/me`
- `GET /problems`, `GET /problems/:id`, `POST /problems`, `PATCH /problems/:id`, `DELETE /problems/:id`
- `GET /answers?problemId=:id`, `POST /answers`, `PATCH /answers/:id`, `DELETE /answers/:id`
- `GET /tags`
- `GET /faqs`, `POST /faqs`, `PATCH /faqs/:id`, `DELETE /faqs/:id` (admin writes)
- `GET /notifications`, `POST /notifications`, `PATCH /notifications/:id`

Write operations validate required fields, enforce JWT authentication, and restrict edits/deletes to the resource owner or an admin. Failed requests return a JSON `message` and an appropriate 4xx/5xx status.

## Tests

```bash
../.venv/bin/python -m pytest -q test_app.py
```

The tests cover authenticated relational CRUD, cascade deletion of answers when a problem is deleted, and rejection of anonymous access.

## Test with Postman

Import [MoringaDesk.postman_collection.json](MoringaDesk.postman_collection.json) into Postman. The collection defaults to `http://127.0.0.1:5000/api`.

1. Start the API with `.venv/bin/python app.py`.
2. Run `Health` and confirm the response is `200 OK` with `status: ok`.
3. Run `Auth > Register student` or `Auth > Login`. The response script saves the JWT as the collection `token` variable.
4. Run `Auth > Current user` to verify authentication.
5. Run `Problems > Create problem`. The response script saves `problemId`.
6. Run the problem and answer requests in order. The response scripts save `answerId` after creating an answer.

Protected requests use `Authorization: Bearer {{token}}` automatically. To test the deployed API, edit the collection `baseUrl` variable to your public Flask API URL, for example `https://your-api-domain.com/api`.
