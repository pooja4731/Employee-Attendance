from pydantic import BaseModel


class NoteCreate(BaseModel):
    title: str
    description: str


class NoteUpdate(BaseModel):
    title: str
    description: str


class NoteOut(BaseModel):
    id: str
    title: str
    description: str
    date: str
