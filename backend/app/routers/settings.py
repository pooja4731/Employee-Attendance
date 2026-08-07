from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from app.deps import get_current_user
from app.database import db
 
router = APIRouter(prefix="/settings", tags=["Settings"])
 
@router.get("")
async def get_settings(current_user: dict = Depends(get_current_user)):
    # Convert string ID to BSON ObjectId
    raw_id = current_user.get("_id") or current_user.get("id")
    user_id = raw_id if isinstance(raw_id, ObjectId) else ObjectId(str(raw_id))
    
    settings = await db.settings.find_one({"user_id": user_id})
    if not settings:
        # Create default document if it doesn't exist yet
        default_settings = {
            "user_id": user_id,
            "monthly_salary": 0,
            "office_start_time": "09:00",
            "office_end_time": "18:00",
            "overtime_rate": 0,
            "salary_cycle_start_day": 1,
            "notify_attendance": True,
            "notify_salary": True,
            "notify_expense": True,
            "public_visibility": False,
            "compact_mode": False
        }
        await db.settings.insert_one(default_settings)
        settings = default_settings
 
    settings["_id"] = str(settings["_id"])
    settings["user_id"] = str(settings["user_id"])
    return settings
 
 
@router.put("")
async def update_settings_route(payload: dict, current_user: dict = Depends(get_current_user)):
    raw_id = current_user.get("_id") or current_user.get("id")
    user_id = raw_id if isinstance(raw_id, ObjectId) else ObjectId(str(raw_id))
 
    # Remove empty or None values
    update_data = {k: v for k, v in payload.items() if v is not None}
 
    # salary_cycle_start_day sometimes arrived as a string/float from the
    # frontend and failed to be used correctly by get_salary_cycle - force
    # it to a clamped int so it always saves and applies correctly.
    if "salary_cycle_start_day" in update_data:
        try:
            day = int(update_data["salary_cycle_start_day"])
            update_data["salary_cycle_start_day"] = max(1, min(31, day))
        except (TypeError, ValueError):
            del update_data["salary_cycle_start_day"]
 
    if not update_data:
        return {"message": "No fields to update"}
 
    # 1. Update or create in settings collection
    await db.settings.update_one(
        {"user_id": user_id},
        {"$set": update_data},
        upsert=True
    )
 
    # 2. Mirror updates to users collection so Attendance page reads it directly
    await db.users.update_one(
        {"_id": user_id},
        {"$set": update_data}
    )
 
    updated_doc = await db.settings.find_one({"user_id": user_id})
    if updated_doc:
        updated_doc["_id"] = str(updated_doc["_id"])
        updated_doc["user_id"] = str(updated_doc["user_id"])
        return updated_doc
 
    return update_data
 