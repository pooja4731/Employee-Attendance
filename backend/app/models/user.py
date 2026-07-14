from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class RegisterRequest(BaseModel):
    full_name: str
    employee_id: str
    email: EmailStr
    password: str
    confirm_password: str
    mobile_number: str
    gender: str
    date_of_birth: str
    date_of_joining: str
    department: str
    designation: str
    monthly_salary: float
    office_start_time: str = "09:00 AM"
    office_end_time: str = "06:00 PM"
    overtime_rate: float = 0.0
    profile_photo: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: str
    full_name: str
    employee_id: str
    email: str
    mobile_number: str
    gender: str
    date_of_birth: str
    date_of_joining: str
    department: str
    designation: str
    monthly_salary: float
    office_start_time: str
    office_end_time: str
    overtime_rate: float
    profile_photo: Optional[str] = None


class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    mobile_number: Optional[str] = None
    profile_photo: Optional[str] = None


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str
