from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from app.models.expense import ExpenseCreate, ExpenseUpdate, ExpenseOut
from app.database import expenses_collection
from app.deps import get_current_user

router = APIRouter(prefix="/expenses", tags=["expenses"])


def serialize(doc: dict) -> ExpenseOut:
    return ExpenseOut(
        id=str(doc["_id"]), date=doc["date"], category=doc["category"],
        description=doc["description"], amount=doc["amount"],
    )


@router.get("", response_model=list[ExpenseOut])
async def list_expenses(month: str | None = None, current_user: dict = Depends(get_current_user)):
    query = {"user_id": current_user["_id"]}
    if month:
        query["date"] = {"$regex": f"^{month}"}
    cursor = expenses_collection.find(query).sort("date", -1)
    docs = await cursor.to_list(length=1000)
    return [serialize(d) for d in docs]


@router.post("", response_model=ExpenseOut, status_code=201)
async def create_expense(payload: ExpenseCreate, current_user: dict = Depends(get_current_user)):
    doc = payload.model_dump()
    doc["user_id"] = current_user["_id"]
    result = await expenses_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize(doc)


@router.put("/{expense_id}", response_model=ExpenseOut)
async def update_expense(expense_id: str, payload: ExpenseUpdate, current_user: dict = Depends(get_current_user)):
    existing = await expenses_collection.find_one({"_id": ObjectId(expense_id), "user_id": current_user["_id"]})
    if not existing:
        raise HTTPException(status_code=404, detail="Expense not found")
    await expenses_collection.update_one({"_id": existing["_id"]}, {"$set": payload.model_dump()})
    existing.update(payload.model_dump())
    return serialize(existing)


@router.delete("/{expense_id}", status_code=204)
async def delete_expense(expense_id: str, current_user: dict = Depends(get_current_user)):
    result = await expenses_collection.delete_one({"_id": ObjectId(expense_id), "user_id": current_user["_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Expense not found")
