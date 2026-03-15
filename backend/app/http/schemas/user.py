from pydantic import BaseModel


class CreateUserSchema(BaseModel):
    username: str
    password: str


class LoginSchema(BaseModel):
    username: str
    password: str
