from pydantic import BaseModel
from typing import Optional


class SettingsUpdate(BaseModel):
    monthly_salary: Optional[float] = None
    office_start_time: Optional[str] = None
    office_end_time: Optional[str] = None
    overtime_rate: Optional[float] = None
    theme: Optional[str] = None
    notify_attendance: Optional[bool] = None
    notify_salary: Optional[bool] = None
    notify_expense: Optional[bool] = None
    public_visibility: Optional[bool] = None
    compact_mode: Optional[bool] = None


class SettingsOut(BaseModel):
    monthly_salary: float
    office_start_time: str
    office_end_time: str
    overtime_rate: float
    theme: str = "light"
    notify_attendance: bool = True
    notify_salary: bool = True
    notify_expense: bool = False
    public_visibility: bool = False
    compact_mode: bool = False
