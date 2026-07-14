from pydantic import BaseModel


class ExpenseCreate(BaseModel):
    date: str
    category: str
    description: str
    amount: float


class ExpenseUpdate(BaseModel):
    date: str
    category: str
    description: str
    amount: float


class ExpenseOut(BaseModel):
    id: str
    date: str
    category: str
    description: str
    amount: float
