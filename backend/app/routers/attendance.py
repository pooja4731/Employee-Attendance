from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from bson import ObjectId
from datetime import date
from app.utils.salary_cycle import get_salary_cycle
from app.models.attendance import CheckInRequest, CheckOutRequest, AttendanceOut, ManualAttendanceRequest,  AttendanceTypeRequest 
from app.database import attendance_collection
from app.database import db
from app.deps import get_current_user
from app.utils.time_utils import today_str, now_time_str, parse_hms, format_hours, compute_status
 
router = APIRouter(prefix="/attendance", tags=["attendance"])
 
 
def serialize(doc: dict) -> AttendanceOut:
    return AttendanceOut(
        id=str(doc["_id"]),
        date=doc["date"],
        check_in=doc.get("check_in"),
        check_out=doc.get("check_out"),
        check_in_iso=doc.get("check_in_iso"),
        check_out_iso=doc.get("check_out_iso"),
        working_hours=doc.get("working_hours", 0),
        working_hours_display=doc.get("working_hours_display", "0h 00m"),
        overtime_hours=doc.get("overtime_hours", 0),
        overtime_display=doc.get("overtime_display", "0h 00m"),
        status=doc.get("status", "Absent"),
        work_note=doc.get("work_note", ""),
        attendance_type=doc.get("attendance_type", "Present"),
        late_minutes=doc.get("late_minutes", 0),
        early_leave_minutes=doc.get("early_leave_minutes", 0),
        manual_correction=doc.get("manual_correction", False),
        leave_reason=doc.get("leave_reason", ""),
    )
 
 
@router.get("/today", response_model=AttendanceOut | None)
async def get_today(current_user: dict = Depends(get_current_user)):
    doc = await attendance_collection.find_one({"user_id": current_user["_id"], "date": today_str()})
    return serialize(doc) if doc else None
 
 
@router.post("/checkin", response_model=AttendanceOut)
async def check_in(payload: CheckInRequest, current_user: dict = Depends(get_current_user)):
    date_key = today_str()
    existing = await attendance_collection.find_one({"user_id": current_user["_id"], "date": date_key})
    if existing and existing.get("check_in"):
        raise HTTPException(status_code=400, detail="Already checked in today")
 
    if payload.check_in:
        now = datetime.fromisoformat(payload.check_in)
    else:
        now = datetime.now(ZoneInfo("Asia/Kolkata"))
    doc = {
        "user_id": current_user["_id"],
        "date": date_key,
        "check_in": now.strftime("%I:%M %p"),
        "check_in_iso": now.isoformat(),
        "check_out": None,
        "check_out_iso": None,
        "working_hours": 0,
        "working_hours_display": "0h 00m",
        "overtime_hours": 0,
        "overtime_display": "0h 00m",
        "attendance_type": "Present",
        "late_minutes": 0,
        "early_leave_minutes": 0,
        "manual_correction": False,
        "leave_reason": "",
        "status": "In Progress",
        "work_note": payload.work_note or "",
    }
    if existing:
        await attendance_collection.update_one({"_id": existing["_id"]}, {"$set": doc})
        doc["_id"] = existing["_id"]
    else:
        result = await attendance_collection.insert_one(doc)
        doc["_id"] = result.inserted_id
    return serialize(doc)
 
 
@router.post("/checkout", response_model=AttendanceOut)
async def check_out(payload: CheckOutRequest, current_user: dict = Depends(get_current_user)):
    date_key = today_str()
    existing = await attendance_collection.find_one({"user_id": current_user["_id"], "date": date_key})
    if not existing or not existing.get("check_in"):
        raise HTTPException(status_code=400, detail="You must check in before checking out")
    if existing.get("check_out"):
        raise HTTPException(status_code=400, detail="Already checked out today")
 
    if payload.check_out:
        now = datetime.fromisoformat(payload.check_out)
    else:
        now = datetime.now(ZoneInfo("Asia/Kolkata"))
 
    check_in_dt = datetime.fromisoformat(existing["check_in_iso"])
    # Night-shift support: if the (manual) checkout timestamp is earlier
    # than check-in, assume it rolled past midnight into the next day
    # instead of producing a negative duration.
    if now <= check_in_dt:
        now = now + timedelta(days=1)
 
    hours = parse_hms(existing["check_in_iso"], now.isoformat())
 
    office_end_hour = 9.0  # default standard working hours threshold for OT
    overtime = max(0.0, round(hours - office_end_hour, 2))
    regular = round(hours - overtime, 2)
 
    update = {
        "check_out": now.strftime("%I:%M %p"),
        "check_out_iso": now.isoformat(),
        "working_hours": hours,
        "working_hours_display": format_hours(hours),
        "overtime_hours": overtime,
        "overtime_display": format_hours(overtime),
        "attendance_type": existing.get("attendance_type", "Present"),
        "late_minutes": 0,
        "early_leave_minutes": 0,
        "manual_correction": True,
        "leave_reason": existing.get("leave_reason", ""),
        "status": compute_status(hours),
        "work_note": payload.work_note or existing.get("work_note", ""),
    }
    await attendance_collection.update_one({"_id": existing["_id"]}, {"$set": update})
    existing.update(update)
    return serialize(existing)
 
 
@router.get("", response_model=list[AttendanceOut])
async def list_attendance(
    month: str | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
    current_user: dict = Depends(get_current_user),
):
    query = {"user_id": current_user["_id"]}
    if start_date or end_date:
        # Range query - used by the salary-cycle-aware calendar/summary,
        # since a cycle (e.g. 5 Aug - 4 Sep) can span two calendar months.
        date_filter = {}
        if start_date:
            date_filter["$gte"] = start_date
        if end_date:
            date_filter["$lte"] = end_date
        query["date"] = date_filter
    elif month:
        # month format: YYYY-MM
        query["date"] = {"$regex": f"^{month}"}
    cursor = attendance_collection.find(query).sort("date", -1)
    docs = await cursor.to_list(length=500)
    return [serialize(d) for d in docs]
 
 
@router.delete("/{attendance_id}")
async def delete_attendance(
    attendance_id: str,
    current_user: dict = Depends(get_current_user)
):
    result = await attendance_collection.delete_one({
        "_id": ObjectId(attendance_id),
        "user_id": current_user["_id"]
    })
 
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Attendance not found")
 
    return {"message": "Attendance deleted successfully"}
 
 
@router.post("/manual", response_model=AttendanceOut)
async def manual_attendance(
    payload: ManualAttendanceRequest,
    current_user: dict = Depends(get_current_user)
):
    existing = await attendance_collection.find_one({
        "user_id": current_user["_id"],
        "date": payload.date
    })
 
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Attendance already exists for this date"
        )
 
    check_in_dt = datetime.fromisoformat(f"{payload.date}T{payload.check_in}:00")
    check_out_dt = datetime.fromisoformat(f"{payload.date}T{payload.check_out}:00")
 
    # Night-shift support: e.g. 09:00 PM -> 06:00 AM. If check-out clock
    # time is not after check-in clock time, treat it as the next day
    # instead of rejecting it / producing a negative duration.
    if check_out_dt <= check_in_dt:
        check_out_dt = check_out_dt + timedelta(days=1)
 
    hours = (check_out_dt - check_in_dt).total_seconds() / 3600
 
    overtime = max(0, round(hours - 9, 2))
 
    doc = {
        "user_id": current_user["_id"],
        "date": payload.date,
        "check_in": check_in_dt.strftime("%I:%M %p"),
        "check_out": check_out_dt.strftime("%I:%M %p"),
        "check_in_iso": check_in_dt.isoformat(),
        "check_out_iso": check_out_dt.isoformat(),
        "working_hours": round(hours, 2),
        "working_hours_display": format_hours(hours),
        "overtime_hours": overtime,
        "overtime_display": format_hours(overtime),
        "status": compute_status(hours),
        "attendance_type": "Present",
        "late_minutes": 0,
        "early_leave_minutes": 0,
        "manual_correction": True,
        "leave_reason": "",
        "work_note": payload.work_note,
    }
 
    result = await attendance_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
 
    return serialize(doc)
 
@router.post("/type")
async def update_attendance_type(
    payload: AttendanceTypeRequest,
    current_user: dict = Depends(get_current_user),
):
    existing = await attendance_collection.find_one({
        "user_id": current_user["_id"],
        "date": payload.date,
    })
 
    if existing:
        await attendance_collection.update_one(
            {"_id": existing["_id"]},
            {
                "$set": {
                    "attendance_type": payload.attendance_type,
                    "leave_reason": payload.leave_reason,
                    # Keep status in sync with the type for day-types that
                    # aren't derived from check-in/check-out hours.
                    "status": (
                        payload.attendance_type
                        if payload.attendance_type in (
                            "Leave", "Holiday", "Absent", "Weekend Working", "Half Day",
                        )
                        else existing.get("status", "Present")
                    ),
                }
            },
        )
    else:
        doc = {
            "user_id": current_user["_id"],
            "date": payload.date,
            "attendance_type": payload.attendance_type,
            "leave_reason": payload.leave_reason,
 
            "check_in": None,
            "check_out": None,
            "check_in_iso": None,
            "check_out_iso": None,
 
            "working_hours": 0,
            "working_hours_display": "0h 00m",
 
            "overtime_hours": 0,
            "overtime_display": "0h 00m",
 
            "late_minutes": 0,
            "early_leave_minutes": 0,
 
            "manual_correction": False,
 
            "status": payload.attendance_type,
            "work_note": "",
        }
 
        await attendance_collection.insert_one(doc)
 
    return {"message": "Attendance type updated successfully"}
 
async def get_user_salary_start_day(user_id: ObjectId) -> int:
    settings = await db.settings.find_one({"user_id": user_id})
    if settings and "salary_cycle_start_day" in settings:
        return int(settings["salary_cycle_start_day"])
    
    user = await db.users.find_one({"_id": user_id})
    if user and "salary_cycle_start_day" in user:
        return int(user["salary_cycle_start_day"])
        
    return 1