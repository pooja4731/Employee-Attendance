from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_indexes
from app.routers import auth, attendance, expenses, notes, settings as settings_router, salary, reports, dashboard

app = FastAPI(title="Attendance & Expense Management API", version="1.0.0")

origins = [o.strip() for o in settings.cors_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(attendance.router)
app.include_router(expenses.router)
app.include_router(notes.router)
app.include_router(settings_router.router)
app.include_router(salary.router)
app.include_router(reports.router)
app.include_router(dashboard.router)


@app.on_event("startup")
async def on_startup():
    await init_indexes()


@app.get("/")
async def root():
    return {"status": "ok", "service": "attendance-expense-api"}
