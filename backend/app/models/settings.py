from pydantic import BaseModel, Field, ConfigDict
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
    salary_cycle_start_day: Optional[int] = None
 
 
class SettingsOut(BaseModel):
    monthly_salary: float
    office_start_time: str
    office_end_time: str
    overtime_rate: float
    salary_cycle_start_day: int = 1
    theme: str = "light"
    notify_attendance: bool = True
    notify_salary: bool = True
    notify_expense: bool = False
    public_visibility: bool = False
    compact_mode: bool = False
 
class SettingsUpdateSchema(BaseModel):
    salary_cycle_start_day: Optional[int] = Field(None, alias="salaryCycleStartDay", ge=1, le=31)
    working_days_per_month: Optional[int] = Field(None, alias="workingDaysPerMonth")
    currency: Optional[str] = Field(None)
 
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True
    )
 