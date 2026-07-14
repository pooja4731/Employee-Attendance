from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from bson import ObjectId
from app.models.user import (
    RegisterRequest, LoginRequest, TokenResponse, UserOut,
    ProfileUpdateRequest, PasswordChangeRequest,
)
from app.database import users_collection, attendance_collection, expenses_collection, notes_collection, settings_collection
from app.security import hash_password, verify_password, create_access_token
from app.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


def serialize_user(user: dict) -> UserOut:
    return UserOut(
        id=str(user["_id"]),
        full_name=user["full_name"],
        employee_id=user["employee_id"],
        email=user["email"],
        mobile_number=user["mobile_number"],
        gender=user["gender"],
        date_of_birth=user["date_of_birth"],
        date_of_joining=user["date_of_joining"],
        department=user["department"],
        designation=user["designation"],
        monthly_salary=user["monthly_salary"],
        office_start_time=user["office_start_time"],
        office_end_time=user["office_end_time"],
        overtime_rate=user["overtime_rate"],
        profile_photo=user.get("profile_photo"),
    )


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest):
    if payload.password != payload.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    existing = await users_collection.find_one({
        "$or": [{"email": payload.email}, {"employee_id": payload.employee_id}]
    })
    if existing:
        raise HTTPException(status_code=400, detail="Email or Employee ID already registered")

    user_doc = payload.model_dump(exclude={"password", "confirm_password"})
    user_doc["password_hash"] = hash_password(payload.password)
    result = await users_collection.insert_one(user_doc)
    user_id = result.inserted_id

    # auto-create empty settings doc mirroring salary/overtime defaults
    await settings_collection.insert_one({
        "user_id": user_id,
        "monthly_salary": payload.monthly_salary,
        "office_start_time": payload.office_start_time,
        "office_end_time": payload.office_end_time,
        "overtime_rate": payload.overtime_rate,
        "theme": "light",
        "notify_attendance": True,
        "notify_salary": True,
        "notify_expense": False,
        "public_visibility": False,
        "compact_mode": False,
    })
    # Attendance and notes/expenses collections just need no seed documents;
    # they are populated lazily per-user via user_id queries.

    new_user = await users_collection.find_one({"_id": user_id})
    return serialize_user(new_user)


@router.post("/login", response_model=TokenResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await users_collection.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token({"sub": str(user["_id"])})
    return TokenResponse(access_token=token)


@router.post("/login-json", response_model=TokenResponse)
async def login_json(payload: LoginRequest):
    user = await users_collection.find_one({"email": payload.email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token({"sub": str(user["_id"])})
    return TokenResponse(access_token=token)


@router.get("/profile", response_model=UserOut)
async def get_profile(current_user: dict = Depends(get_current_user)):
    return serialize_user(current_user)


@router.put("/profile", response_model=UserOut)
async def update_profile(payload: ProfileUpdateRequest, current_user: dict = Depends(get_current_user)):
    updates = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}
    if updates:
        await users_collection.update_one({"_id": current_user["_id"]}, {"$set": updates})
    updated = await users_collection.find_one({"_id": current_user["_id"]})
    return serialize_user(updated)


@router.put("/change-password")
async def change_password(payload: PasswordChangeRequest, current_user: dict = Depends(get_current_user)):
    if not verify_password(payload.current_password, current_user["password_hash"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    new_hash = hash_password(payload.new_password)
    await users_collection.update_one({"_id": current_user["_id"]}, {"$set": {"password_hash": new_hash}})
    return {"message": "Password updated successfully"}
