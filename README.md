# Attendance & Expense Management — Full Stack App

Your React mockup is now wired to a real FastAPI + MongoDB backend: real auth
(JWT + bcrypt), real persistence, and every page fetching/saving live data
instead of mock arrays.

```
attendance-expense-app/
  backend/    FastAPI + MongoDB (Motor) + JWT auth
  frontend/   Vite + React + Tailwind, calling the backend over axios
```

## Quick start

**1. Backend**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # edit JWT_SECRET and MONGO_URI
uvicorn app.main:app --reload --port 8000
```
Needs a running MongoDB (local `mongod`, Docker, or Atlas — just point
`MONGO_URI` at it). API docs at http://localhost:8000/docs.

**2. Frontend**
```bash
cd frontend
npm install
cp .env.example .env          # VITE_API_BASE_URL=http://localhost:8000
npm run dev
```
Open http://localhost:5173 — register a new account, then log in.

## What's wired up

- **Auth**: register/login/logout with real JWT tokens stored in
  `localStorage`; every API call attaches `Authorization: Bearer <token>`;
  401s auto-redirect to `/login`.
- **Dashboard**: pulls a single aggregated `/dashboard` payload — today's
  status, weekly hours, monthly expenses, attendance %, recent activity —
  computed from real Mongo records.
- **Attendance**: Check In/Check Out hit `/attendance/checkin` and
  `/attendance/checkout`; a live timer runs client-side off the stored
  check-in timestamp; history table supports month filtering.
- **Salary**: view-only, computed server-side from your monthly salary +
  this month's overtime.
- **Expenses & Notes**: full CRUD against MongoDB, with the pie chart and
  monthly total recalculated from live data.
- **Reports**: weekly/monthly summaries, plus real PDF (ReportLab) and
  Excel (openpyxl) export downloads.
- **Profile & Settings**: profile edits and settings (salary, office hours,
  overtime rate, password) persist to Mongo; Employee ID stays locked.
- **Security**: every query is scoped to the logged-in user's `user_id` —
  verified in the backend smoke tests, including a 401 check for
  unauthenticated requests.

I ran an end-to-end smoke test (register → login → check-in/out → expense
CRUD → notes → salary → settings → dashboard → reports → PDF/Excel export →
unauthorized-access check) against the real route handlers, and did a
production `vite build` — both are clean.

## Known trade-offs to know about

- Profile photo upload is currently a URL/base64 string field, not a file
  upload endpoint — wire up `python-multipart` file handling if you want
  actual image uploads.
- Overtime is calculated as hours worked beyond a flat 9h/day threshold,
  not from your per-user office start/end time — worth revisiting if you
  want per-user shift lengths to drive overtime.
- No test MongoDB is bundled here — you'll need `mongod` running locally
  or an Atlas connection string in `.env` before the backend can serve
  real traffic.
