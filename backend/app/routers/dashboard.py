from fastapi import APIRouter, Depends
from pydantic import BaseModel
from datetime import date, timedelta
from app.database import attendance_collection, expenses_collection, notes_collection
from app.deps import get_current_user
from app.utils.time_utils import today_str

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


class DashboardOut(BaseModel):
    today_status: str
    today_working_hours: float
    today_overtime_hours: float
    is_checked_in: bool
    is_checked_out: bool
    monthly_salary: float
    monthly_expenses: float
    attendance_percentage: float
    weekly_working_hours: float
    weekly_attendance: list
    monthly_expense_trend: list
    recent_attendance: list
    recent_expenses: list
    recent_notes: list


@router.get("", response_model=DashboardOut)
async def get_dashboard(current_user: dict = Depends(get_current_user)):
    today_doc = await attendance_collection.find_one({"user_id": current_user["_id"], "date": today_str()})

    month_key = date.today().strftime("%Y-%m")
    month_attendance = await attendance_collection.find(
        {"user_id": current_user["_id"], "date": {"$regex": f"^{month_key}"}}
    ).to_list(length=100)

    days_elapsed = date.today().day
    present_days = sum(1 for d in month_attendance if d.get("status") in ("Present", "Half Day"))
    attendance_pct = round((present_days / days_elapsed) * 100, 1) if days_elapsed else 0

    week_ago = (date.today() - timedelta(days=6)).isoformat()
    weekly_docs = await attendance_collection.find(
        {"user_id": current_user["_id"], "date": {"$gte": week_ago}}
    ).sort("date", 1).to_list(length=7)
    weekly_hours = round(sum(d.get("working_hours", 0) for d in weekly_docs), 2)
    weekly_attendance = [
        {"date": d["date"], "present": 1 if d.get("status") in ("Present", "Half Day") else 0,
         "absent": 1 if d.get("status") == "Absent" else 0}
        for d in weekly_docs
    ]

    month_expenses = await expenses_collection.find(
        {"user_id": current_user["_id"], "date": {"$regex": f"^{month_key}"}}
    ).to_list(length=1000)
    monthly_expense_total = round(sum(e["amount"] for e in month_expenses), 2)

    # last 6 calendar months totals
    trend = []
    cursor_month = date.today().replace(day=1)
    months = []
    for i in range(5, -1, -1):
        m = cursor_month
        for _ in range(i):
            m = (m - timedelta(days=1)).replace(day=1)
        months.append(m)
    for m in months:
        mk = m.strftime("%Y-%m")
        docs = await expenses_collection.find(
            {"user_id": current_user["_id"], "date": {"$regex": f"^{mk}"}}
        ).to_list(length=1000)
        trend.append({"month": m.strftime("%b"), "amount": round(sum(e["amount"] for e in docs), 2)})

    recent_attendance = await attendance_collection.find(
        {"user_id": current_user["_id"]}
    ).sort("date", -1).to_list(length=5)
    recent_expenses = await expenses_collection.find(
        {"user_id": current_user["_id"]}
    ).sort("date", -1).to_list(length=5)
    recent_notes = await notes_collection.find(
        {"user_id": current_user["_id"]}
    ).sort("date", -1).to_list(length=5)

    def clean(docs, fields):
        return [{f: d.get(f) for f in fields} for d in docs]

    return DashboardOut(
        today_status=today_doc.get("status") if today_doc else "Not Checked In",
        today_working_hours=today_doc.get("working_hours", 0) if today_doc else 0,
        today_overtime_hours=today_doc.get("overtime_hours", 0) if today_doc else 0,
        is_checked_in=bool(today_doc and today_doc.get("check_in")),
        is_checked_out=bool(today_doc and today_doc.get("check_out")),
        monthly_salary=current_user["monthly_salary"],
        monthly_expenses=monthly_expense_total,
        attendance_percentage=attendance_pct,
        weekly_working_hours=weekly_hours,
        weekly_attendance=weekly_attendance,
        monthly_expense_trend=trend,
        recent_attendance=clean(recent_attendance, ["date", "check_in", "check_out", "working_hours_display", "status", "work_note"]),
        recent_expenses=clean(recent_expenses, ["date", "category", "description", "amount"]),
        recent_notes=clean(recent_notes, ["title", "description", "date"]),
    )
