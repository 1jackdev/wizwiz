from uuid import UUID

from pydantic import BaseModel


class CreateUserSchema(BaseModel):
    email: str
    password: str


class LoginSchema(BaseModel):
    email: str
    password: str


class UserSchema(BaseModel):
    id: UUID
    email: str
    is_dm: bool
