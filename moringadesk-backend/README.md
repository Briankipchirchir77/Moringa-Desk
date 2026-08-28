# MoringaDesk — Backend API

A Flask REST API for **MoringaDesk**, a Q&A / help-desk platform where students
raise problems, post answers, vote, mark accepted solutions, follow questions,
get notifications, and browse FAQs. This backend is built to match the existing
React + Redux Toolkit frontend with no changes to its field names.

## Tech stack

- **Python + Flask** — web framework
- **Flask-SQLAlchemy** — ORM / database models
- **Flask-Migrate (Alembic)** — database migrations
- **Flask-JWT-Extended** — JWT auth with role-based access (student / admin)
- **Flask-Bcrypt** — password hashing
- **Flask-CORS** — lets the React app call the API
- **PostgreSQL** in production (SQLite fallback for local dev)
- **pytest** — test suite

## Project structure

```
moringadesk-backend/
├── run.py                  # entry point (python run.py)
├── requirements.txt
├── .env.example            # copy to .env
├── Procfile / render.yaml  # deployment
├── server/
│   ├── __init__.py         # create_app() factory
│   ├── config.py           # settings (DB url, JWT, etc.)
│   ├── extensions.py       # db, jwt, bcrypt, migrate, cors
│   ├── models.py           # User, Tag, Problem, Answer, Faq, Notification
│   ├── utils.py            # admin_required, current_user, raise_notification
│   ├── seed.py             # loads sample data (python -m server.seed)
│   ├── seed_data.json      # the old json-server data
│   └── resources/          # one file per resource = the routes
│       ├── auth.py         # /auth/register, /auth/login
│       ├── users.py        # /users
│       ├── tags.py         # /tags
│       ├── problems.py     # /problems
│       ├── answers.py      # /answers
│       ├── faqs.py         # /faqs
│       ├── notifications.py# /notifications
│       └── reports.py      # /reports/summary (admin metrics)
└── tests/                  # pytest test suite
```

## Getting started (local)

```bash
# 1. create + activate a virtual environment
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# 2. install dependencies
pip install -r requirements.txt

# 3. (optional) copy env file and set secrets
cp .env.example .env

# 4. load the sample data
python -m server.seed

# 5. run the server (http://localhost:4000)
python run.py
```

All demo users share the password **`password123`**
(e.g. `brian@moringaschool.com`).

## Using PostgreSQL

Set `DATABASE_URL` in `.env`:

```
DATABASE_URL=postgresql://user:password@localhost:5432/moringadesk
```

Then create the tables with migrations:

```bash
export FLASK_APP=run.py
flask db init      # first time only
flask db migrate -m "initial"
flask db upgrade
python -m server.seed
```

## Running the tests

```bash
pytest -q
```

## Connecting the frontend

The frontend reads its API base URL from `VITE_API_URL`. Point it at this API:

```
# in the frontend's .env
VITE_API_URL=http://localhost:4000
```

Two small frontend follow-ups (optional but recommended):

1. **Auth** — the frontend's `authApi.js` currently fakes register/login
   against `/users`. Swap those two `queryFn` bodies for plain `POST`s to
   `/auth/register` and `/auth/login` (the code comment there already says so).
   The response shape `{ token, user }` is unchanged.
2. **Notifications** — this backend now raises notifications server-side, so
   remove the temporary client-side `createNotification` dispatches in
   `answersApi.js` and `problemsApi.js` (their comments call them stand-ins)
   to avoid creating each notification twice.

## API reference

Auth (public):

| Method | Path             | Body                              | Returns          |
|--------|------------------|-----------------------------------|------------------|
| POST   | `/auth/register` | name, email, password, cohort     | `{ token, user }`|
| POST   | `/auth/login`    | email, password                   | `{ token, user }`|

Problems:

| Method | Path              | Notes                                             |
|--------|-------------------|---------------------------------------------------|
| GET    | `/problems`       | list; filters `?category=`, `?tagId=`             |
| GET    | `/problems/:id`   | one                                               |
| POST   | `/problems`       | 🔒 create                                          |
| PATCH  | `/problems/:id`   | 🔒 vote / follow / mark solution / flag / edit     |
| DELETE | `/problems/:id`   | 🔒 author or admin                                 |

Answers:

| Method | Path             | Notes                                              |
|--------|------------------|----------------------------------------------------|
| GET    | `/answers`       | list; `?problemId=` filter                         |
| POST   | `/answers`       | 🔒 create (raises notifications)                    |
| PATCH  | `/answers/:id`   | 🔒 vote / flag / edit                               |
| DELETE | `/answers/:id`   | 🔒 author or admin                                  |

Notifications (🔒): `GET /notifications?userId=`, `POST /notifications`,
`PATCH /notifications/:id` (mark read).

FAQs: `GET /faqs` (public); `POST /faqs`, `PATCH /faqs/:id`, `DELETE /faqs/:id`
(admin).

Tags: `GET /tags` (public); `POST /tags` (admin).

Users: `GET /users`, `GET /users/:id`; `PATCH /users/:id` (self or admin);
`DELETE /users/:id` (admin).

Admin reports: `GET /reports/summary` — totals, top categories, top
contributors.

🔒 = requires `Authorization: Bearer <token>` header.

## Deploying

`render.yaml` provisions a free PostgreSQL database + web service on
[Render](https://render.com). Push this repo to GitHub, then "New → Blueprint"
and point it at the repo. Set the frontend's `VITE_API_URL` to the deployed URL.
