# MoringaDesk

Contribution refresh: 2026-08-31.

MoringaDesk is a peer support knowledge base for Moringa students. Students can search recurring technical problems, post questions, add answers, vote on useful solutions, follow discussions, and identify accepted answers.

Phase 2 adds a persistent Flask and PostgreSQL API to the existing React and Redux frontend. The backend owns authentication, relational data, authorization, and CRUD operations; the frontend communicates with it through the existing `/api` request layer.

## Project structure

- `src/`: React + Redux Toolkit frontend
- `backend/`: Flask REST API, SQLAlchemy models, tests, and PostgreSQL configuration

## Run the backend

Read [backend/README.md](backend/README.md) for setup, the ERD, endpoint contract, environment variables, and tests.

```bash
cd backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
cp .env.example .env
.venv/bin/python app.py
```

The frontend expects the API at `/api`. When running the Vite dev server separately, set `VITE_API_URL=http://localhost:5000/api` in a frontend environment file if a proxy is not configured.

For the Vercel deployment, configure `DATABASE_URL`, `JWT_SECRET_KEY`, and `FRONTEND_ORIGIN` in Vercel Project Settings. The included `api/index.py` and `vercel.json` route `/api/*` to Flask while preserving React routes such as `/questions`.

## Frontend

```bash
npm install
npm run dev
```

The backend test suite can run without PostgreSQL using an in-memory SQLite database:

```bash
.venv/bin/python -m pytest -q backend/test_app.py
```
