from fastapi import APIRouter, Depends
from pydantic import BaseModel
from datetime import date
from app.database import attendance_collection
from app.deps import get_current_user
from app.utils.salary_cycle import get_salary_cycle
from app.routers.attendance import get_user_salary_start_day
 
router = APIRouter(prefix="/salary", tags=["salary"])
 
 
class SalaryOut(BaseModel):
    monthly_salary: float
    daily_salary: float
    hourly_salary: float
    total_overtime_hours: float
    overtime_amount: float
    final_salary: float
    cycle_start: str
    cycle_end: str
    cycle_days: int
 
 
@router.get("", response_model=SalaryOut)
async def get_salary(current_user: dict = Depends(get_current_user)):
    monthly_salary = current_user["monthly_salary"]
    overtime_rate = current_user.get("overtime_rate", 0)
 
    # Salary cycle comes from Settings (salary_cycle_start_day), not the
    # calendar month, e.g. start_day=5 -> 5 Aug to 4 Sep.
    start_day = await get_user_salary_start_day(current_user["_id"])
    cycle_start, cycle_end = get_salary_cycle(date.today(), start_day)
    cycle_days = (cycle_end - cycle_start).days + 1
 
    daily_salary = round(monthly_salary / cycle_days, 2)
    hourly_salary = round(monthly_salary / (cycle_days * 8), 2)
 
    cursor = attendance_collection.find({
        "user_id": current_user["_id"],
        "date": {
            "$gte": cycle_start.isoformat(),
            "$lte": cycle_end.isoformat(),
        },
    })
    docs = await cursor.to_list(length=cycle_days + 5)
    total_overtime = round(sum(d.get("overtime_hours", 0) for d in docs), 2)
    overtime_amount = round(total_overtime * overtime_rate, 2)
    final_salary = round(monthly_salary + overtime_amount, 2)
 
    return SalaryOut(
        monthly_salary=monthly_salary,
        daily_salary=daily_salary,
        hourly_salary=hourly_salary,
        total_overtime_hours=total_overtime,
        overtime_amount=overtime_amount,
        final_salary=final_salary,
        cycle_start=cycle_start.isoformat(),
        cycle_end=cycle_end.isoformat(),
        cycle_days=cycle_days,
    )