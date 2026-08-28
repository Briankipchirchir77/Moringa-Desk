# MoringaDesk

A Stack Overflow–style Q&A platform for a Moringa School cohort — students post
technical problems, get answers from peers and technical mentors, vote,
follow questions, and browse a shared FAQ. Full-stack: a React frontend
talking to its own Flask + PostgreSQL REST API.

## Live demo

Frontend: **moringa-desk-sepia.vercel.app** (deployed on Vercel). The
deployed frontend currently falls back to a mocked API (see
[Architecture](#architecture) below) unless `VITE_API_URL` is set there to
point at a deployed instance of the Flask backend in `backend/`.

## Features

- Auth (register/login, JWT-based) with role-based routing (student vs. admin)
- Session persists across page reloads
- Ask, answer, vote on, and follow questions; accept a solution
- Tag-based browsing, search, and filtering
- FAQ section, notifications, and a profile page
- Admin dashboard: manage users, content, FAQs, and view reports
- **Explore tab** — live data pulled from a real external API (Stack Overflow)
- Full CRUD across relational data (Questions ↔ Answers ↔ Tags ↔ Users) backed
  by a real Flask + PostgreSQL API

## Architecture

**Frontend:** React 19 + Redux Toolkit / RTK Query, React Router, Vite.

**Backend:** Flask + SQLAlchemy + PostgreSQL, in `backend/`. This is the
real, persistent data layer — not a stand-in.

**Mock fallback:** `src/mocks/` (Mock Service Worker) is kept as a
zero-setup fallback: if the frontend is run *without* `VITE_API_URL` set
(e.g. the current Vercel deploy, before the backend is separately deployed),
it intercepts the same `/api/*` calls with realistic in-memory fake data
instead. Set `VITE_API_URL` (see [Setup](#setup) below) to talk to the real
backend instead — the mock is automatically skipped whenever that variable
is present.

## Data model (ERD)

```mermaid
erDiagram
    USER ||--o{ PROBLEM : asks
    USER ||--o{ ANSWER : writes
    USER ||--o{ NOTIFICATION : receives
    USER }o--o{ PROBLEM : follows
    PROBLEM ||--o{ ANSWER : has
    PROBLEM }o--o{ TAG : "tagged with"
    PROBLEM ||--o| ANSWER : "solved by (nullable)"

    USER {
        int id PK
        string name
        string email UK
        string password_hash
        string role "student | admin"
        string cohort
    }
    PROBLEM {
        int id PK
        string title
        text body
        int user_id FK
        int votes
        int views
        bool flagged
        int solved_answer_id FK "nullable, -> ANSWER.id"
        datetime created_at
    }
    ANSWER {
        int id PK
        int problem_id FK
        int user_id FK
        text body
        int votes
        bool flagged
        datetime created_at
    }
    TAG {
        int id PK
        string name UK
    }
    FAQ {
        int id PK
        string category
        string question
        text answer
    }
    NOTIFICATION {
        int id PK
        int user_id FK
        string type
        text message
        bool read
        datetime created_at
    }
```

The two core related resources are **Problems** and **Answers**: a
`Problem` has many `Answer`s (one-to-many), and a `Problem` optionally
points back at the one `Answer` marked as its accepted solution — deleting
that answer automatically clears the problem's solved status (`ON DELETE
SET NULL`) rather than being blocked. `Problem`↔`Tag` and `Problem`↔`User`
(followers) are many-to-many join tables. Full CRUD (create/read/
update/delete) is implemented for every resource above via the REST API
below.

## Setup

Requires Node.js 18+, Python 3.11+, and PostgreSQL (a local install, or a
free hosted instance from Render/Railway/Supabase/Neon).

### Frontend

```bash
git clone https://github.com/Briankipchirchir77/Moringa-Desk.git
cd Moringa-Desk
npm install
cp .env.example .env.local   # sets VITE_API_URL — see below
npm run dev
```

Open the URL Vite prints (defaults to `http://localhost:5173`).

- **With `backend/` running** (see below) and `VITE_API_URL` set in
  `.env.local` (defaults to `http://localhost:5000`): the app talks to the
  real Flask API — nothing persists unless it's really in Postgres.
- **Without `VITE_API_URL`** (delete/comment it out): the app runs
  standalone against the mock backend — no Python/Postgres needed at all,
  useful for pure frontend work.

Other scripts: `npm run build`, `npm run preview`, `npm run lint`, `npm test`.

### Backend

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env    # set DATABASE_URL to your local/hosted Postgres
flask db upgrade         # creates all tables
python seed.py            # optional: loads the same demo data as below
flask run --port 5000
```

`DATABASE_URL` follows the standard `postgresql://user:password@host:port/dbname`
form. If you don't have Postgres installed locally, either use a free
instance on [Neon](https://neon.tech) or [Supabase](https://supabase.com)
(copy their connection string into `DATABASE_URL`), or run
`pip install -r requirements-dev.txt && python start_test_db.py` — it
starts a throwaway embedded Postgres and prints a `DATABASE_URL` to use,
no installation/root access required.

### Demo login

Any seeded email below + password `password123` (or register a new account
— registration works end-to-end against either backend):

| Email | Role |
|---|---|
| sarah.jane@moringaschool.com | admin |
| alex.kimani@moringaschool.com | student |
| brandon.wanja@moringaschool.com | student |
| clara.mwangi@moringaschool.com | student |
| ian.kipkoech@moringaschool.com | student |

## API reference (backend, `backend/`)

All endpoints are prefixed with the backend's root (`http://localhost:5000`
locally). Endpoints marked 🔒 require `Authorization: Bearer <token>` (the
token returned from login/register).

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/login` | `{email, password}` → `{user, token}` |
| POST | `/auth/register` | `{name, email, password, role}` → `{user, token}` |
| GET 🔒 | `/users/me` | Current user |
| PUT 🔒 | `/users/me` | Update own name/cohort |
| GET | `/users` | List users |
| GET | `/users/:id` | One user |
| PATCH 🔒 | `/users/:id` | Update a user (self, or admin editing anyone) |
| DELETE 🔒 | `/users/:id` | Admin-only |
| GET | `/problems` | List questions |
| GET | `/problems/:id` | One question |
| POST 🔒 | `/problems` | Create a question |
| PATCH 🔒 | `/problems/:id` | Update (title/body/votes/tagIds/followerIds/solvedAnswerId/flagged) |
| DELETE 🔒 | `/problems/:id` | Delete |
| GET | `/answers?problemId=` | List answers, optionally filtered |
| POST 🔒 | `/answers` | Create an answer |
| PATCH 🔒 | `/answers/:id` | Update (body/votes/flagged) |
| DELETE 🔒 | `/answers/:id` | Delete |
| GET | `/tags` | List tags |
| GET | `/faqs?category=` | List FAQs, optionally filtered |
| POST | `/faqs` | Create an FAQ |
| PATCH | `/faqs/:id` | Update an FAQ |
| DELETE | `/faqs/:id` | Delete an FAQ |
| GET | `/notifications?userId=` | List notifications for a user |
| POST | `/notifications` | Create a notification |
| PATCH | `/notifications/:id` | Mark read |
| GET | `/health` | Health check |

### External API integration

The **Explore** tab (`/explore` in the frontend) additionally calls the
live, public, unauthenticated
[Stack Exchange API](https://api.stackexchange.com/docs) directly —
`GET https://api.stackexchange.com/2.3/questions?...&site=stackoverflow`,
optionally `&tagged={tag}`. See
[src/features/community/stackExchangeApi.js](src/features/community/stackExchangeApi.js).

## Tech stack

**Frontend:** React 19, React Router, Redux Toolkit + RTK Query, Vite, Mock
Service Worker, Vitest + React Testing Library, ESLint.

**Backend:** Flask, SQLAlchemy, Flask-Migrate (Alembic), Flask-JWT-Extended,
Flask-CORS, PostgreSQL, Werkzeug password hashing, Gunicorn (production).

## Known bugs / challenges

- The frontend's mock fallback (`src/mocks/`) resets on every page reload —
  data created while running against the mock doesn't persist. The real
  Flask + PostgreSQL backend does persist (that's the whole point of Phase 2).
- Stack Exchange's public API is rate-limited per IP; heavy repeated use of
  the Explore tab in a short window can return a `throttle_violation` error
  from the API (surfaced as a normal error state, not a crash).
- `/faqs` and `/notifications` write endpoints aren't currently
  role-restricted server-side (the frontend only exposes FAQ management to
  admins, and notifications are created as a side effect of other actions)
  — worth tightening with proper authorization checks before this API is
  exposed beyond a class project.
- No automated end-to-end/browser test suite yet — coverage is unit tests
  (Vitest) around slices/utilities; manual click-through, curl, and
  headless-browser screenshot verification were used to confirm auth,
  session persistence, and full CRUD (including the real Postgres-backed
  flow) during development.
- Circular FK note for anyone extending the schema: `problems.solved_answer_id`
  references `answers.id`, while `answers.problem_id` references
  `problems.id` — Alembic's autogenerate detects this cycle (via
  `use_alter=True`) but doesn't itself emit the follow-up `ALTER TABLE`
  needed to actually add the constraint; the initial migration adds it by
  hand as a separate `op.create_foreign_key(...)` step with `ondelete='SET
  NULL'` (so deleting an accepted answer clears the problem's solved state
  instead of being blocked).
