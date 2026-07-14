# Attendance & Expense Management — Backend (FastAPI + MongoDB)

## Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # then edit JWT_SECRET, MONGO_URI, etc.
uvicorn app.main:app --reload --port 8000
```

Requires a running MongoDB instance (local `mongod` or MongoDB Atlas — just point
`MONGO_URI` in `.env` at it).

API docs: http://localhost:8000/docs

## Notes on auth

- `/auth/register` — JSON body, creates the user + a linked settings document.
- `/auth/login` — **form-encoded** (OAuth2 password flow: `username`=email, `password`).
  This is what the Swagger UI's "Authorize" button uses.
- `/auth/login-json` — same thing but plain JSON body `{email, password}`, easier
  to call from the frontend fetch/axios code.
- Every other route requires `Authorization: Bearer <token>` and only ever reads/writes
  documents where `user_id` matches the token's user — enforced in every query.
