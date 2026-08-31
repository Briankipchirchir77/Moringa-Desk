# MoringaDesk

MoringaDesk is a student support platform for Moringa learners. Students can look up common technical issues, ask questions, reply with solutions, upvote helpful answers, follow active discussions, and mark a response as the accepted solution.

This project combines a React + Redux frontend with a Flask API and PostgreSQL database. The backend handles authentication, user data, authorization, and CRUD operations, while the frontend communicates with it through the `/api` layer.

## Project structure

- `src/`: React + Redux Toolkit frontend
- `backend/`: Flask REST API, SQLAlchemy models, tests, and database setup
- `api/`: serverless entry point used for deployment

## Running the backend

Read [backend/README.md](backend/README.md) for the setup guide, ERD, endpoint contract, environment variables, and test details.

```bash
cd backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
cp .env.example .env
.venv/bin/python app.py
```

The frontend expects the API at `/api`. If you are running the Vite dev server separately, create a frontend environment file and set `VITE_API_URL=http://localhost:5000/api` unless a proxy is already configured.

For Vercel deployment, set `DATABASE_URL`, `JWT_SECRET_KEY`, and `FRONTEND_ORIGIN` in the project settings. The included `api/index.py` and `vercel.json` route `/api/*` to Flask while preserving React routes such as `/questions`.

## Frontend

```bash
npm install
npm run dev
```

The backend tests can run without PostgreSQL by using an in-memory SQLite database:

```bash
.venv/bin/python -m pytest -q backend/test_app.py
```
