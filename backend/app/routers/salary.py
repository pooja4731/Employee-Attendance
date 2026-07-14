from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.database import attendance_collection
from app.deps import get_current_user
from datetime import date

router = APIRouter(prefix="/salary", tags=["salary"])


class SalaryOut(BaseModel):
    monthly_salary: float
    daily_salary: float
    hourly_salary: float
    total_overtime_hours: float
    overtime_amount: float
    final_salary: float


@router.get("", response_model=SalaryOut)
async def get_salary(current_user: dict = Depends(get_current_user)):
    monthly_salary = current_user["monthly_salary"]
    overtime_rate = current_user.get("overtime_rate", 0)
    daily_salary = round(monthly_salary / 30, 2)
    hourly_salary = round(monthly_salary / (30 * 8), 2)

    month_key = date.today().strftime("%Y-%m")
    cursor = attendance_collection.find({
        "user_id": current_user["_id"],
        "date": {"$regex": f"^{month_key}"},
    })
    docs = await cursor.to_list(length=100)
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
    )
