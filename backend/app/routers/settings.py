from fastapi import APIRouter, Depends
from app.models.settings import SettingsUpdate, SettingsOut
from app.database import settings_collection, users_collection
from app.deps import get_current_user

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("", response_model=SettingsOut)
async def get_settings(current_user: dict = Depends(get_current_user)):
    doc = await settings_collection.find_one({"user_id": current_user["_id"]})
    if not doc:
        doc = {
            "monthly_salary": current_user["monthly_salary"],
            "office_start_time": current_user["office_start_time"],
            "office_end_time": current_user["office_end_time"],
            "overtime_rate": current_user["overtime_rate"],
        }
    return SettingsOut(**{**{
        "theme": "light", "notify_attendance": True, "notify_salary": True,
        "notify_expense": False, "public_visibility": False, "compact_mode": False,
    }, **doc})


@router.put("", response_model=SettingsOut)
async def update_settings(payload: SettingsUpdate, current_user: dict = Depends(get_current_user)):
    updates = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}
    if updates:
        await settings_collection.update_one(
            {"user_id": current_user["_id"]}, {"$set": updates}, upsert=True
        )
        # keep salary/overtime/office-hours in sync on the user doc too, since
        # Salary and Profile pages read from users_collection
        user_sync_fields = {k: v for k, v in updates.items()
                             if k in ("monthly_salary", "office_start_time", "office_end_time", "overtime_rate")}
        if user_sync_fields:
            await users_collection.update_one({"_id": current_user["_id"]}, {"$set": user_sync_fields})
    doc = await settings_collection.find_one({"user_id": current_user["_id"]})
    return SettingsOut(**doc)
