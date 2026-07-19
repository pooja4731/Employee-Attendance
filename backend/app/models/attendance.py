from pydantic import BaseModel
from typing import Optional


class CheckInRequest(BaseModel):
    work_note: Optional[str] = ""


class CheckOutRequest(BaseModel):
    work_note: Optional[str] = ""


class AttendanceOut(BaseModel):
    id: str
    date: str
    check_in: Optional[str] = None
    check_out: Optional[str] = None
    check_in_iso: Optional[str] = None
    check_out_iso: Optional[str] = None
    working_hours: float = 0
    working_hours_display: str = "0h 00m"
    overtime_hours: float = 0
    overtime_display: str = "0h 00m"
    status: str = "Absent"
    work_note: str = ""


class ManualAttendanceRequest(BaseModel):
    date: str
    check_in: str
    check_out: str
    work_note: Optional[str] = ""