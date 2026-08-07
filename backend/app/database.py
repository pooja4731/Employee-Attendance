import os
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "attendance_db")

client = AsyncIOMotorClient(settings.mongo_uri)
db = client[settings.mongo_db_name]

users_collection = db["users"]
attendance_collection = db["attendance"]
expenses_collection = db["expenses"]
notes_collection = db["notes"]
settings_collection = db["settings"]


async def init_indexes():
    await users_collection.create_index("email", unique=True)
    await users_collection.create_index("employee_id", unique=True)
    await attendance_collection.create_index([("user_id", 1), ("date", 1)], unique=True)
    await expenses_collection.create_index("user_id")
    await notes_collection.create_index("user_id")
    await settings_collection.create_index("user_id", unique=True)
    await db.users.create_index("email", unique=True)
    await db.settings.create_index("user_id", unique=True)
    await db.attendance.create_index([("user_id", 1), ("date", 1)], unique=True)
