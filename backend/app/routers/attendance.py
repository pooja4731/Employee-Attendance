from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from zoneinfo import ZoneInfo
from bson import ObjectId
from app.models.attendance import CheckInRequest, CheckOutRequest, AttendanceOut, ManualAttendanceRequest
from app.database import attendance_collection
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

    now = datetime.now(ZoneInfo("Asia/Kolkata"))
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
        "status": compute_status(hours),
        "work_note": payload.work_note or existing.get("work_note", ""),
    }
    await attendance_collection.update_one({"_id": existing["_id"]}, {"$set": update})
    existing.update(update)
    return serialize(existing)


@router.get("", response_model=list[AttendanceOut])
async def list_attendance(month: str | None = None, current_user: dict = Depends(get_current_user)):
    query = {"user_id": current_user["_id"]}
    if month:
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

    if check_out_dt <= check_in_dt:
        raise HTTPException(
            status_code=400,
            detail="Check-out must be after check-in"
        )

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
        "work_note": payload.work_note,
    }

    result = await attendance_collection.insert_one(doc)
    doc["_id"] = result.inserted_id

    return serialize(doc)