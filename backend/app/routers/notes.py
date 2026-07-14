from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from app.models.note import NoteCreate, NoteUpdate, NoteOut
from app.database import notes_collection
from app.deps import get_current_user
from app.utils.time_utils import today_str

router = APIRouter(prefix="/notes", tags=["notes"])


def serialize(doc: dict) -> NoteOut:
    return NoteOut(id=str(doc["_id"]), title=doc["title"], description=doc["description"], date=doc["date"])


@router.get("", response_model=list[NoteOut])
async def list_notes(search: str | None = None, current_user: dict = Depends(get_current_user)):
    query = {"user_id": current_user["_id"]}
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
        ]
    cursor = notes_collection.find(query).sort("date", -1)
    docs = await cursor.to_list(length=500)
    return [serialize(d) for d in docs]


@router.post("", response_model=NoteOut, status_code=201)
async def create_note(payload: NoteCreate, current_user: dict = Depends(get_current_user)):
    doc = payload.model_dump()
    doc["user_id"] = current_user["_id"]
    doc["date"] = today_str()
    result = await notes_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize(doc)


@router.put("/{note_id}", response_model=NoteOut)
async def update_note(note_id: str, payload: NoteUpdate, current_user: dict = Depends(get_current_user)):
    existing = await notes_collection.find_one({"_id": ObjectId(note_id), "user_id": current_user["_id"]})
    if not existing:
        raise HTTPException(status_code=404, detail="Note not found")
    await notes_collection.update_one({"_id": existing["_id"]}, {"$set": payload.model_dump()})
    existing.update(payload.model_dump())
    return serialize(existing)


@router.delete("/{note_id}", status_code=204)
async def delete_note(note_id: str, current_user: dict = Depends(get_current_user)):
    result = await notes_collection.delete_one({"_id": ObjectId(note_id), "user_id": current_user["_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Note not found")
