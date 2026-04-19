from fastapi import APIRouter
from pydantic import BaseModel

from app.auth import create_access_token, verify_password
from app.containers import container
from app.domain.errors import InvalidCredentialsError
from app.http.schemas.user import LoginSchema

router = APIRouter(prefix="/auth")


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/login")
async def login(schema: LoginSchema) -> TokenResponse:
    user_repo = container.db().user_repo()
    user = user_repo.get_by_email(schema.email)
    container.db.scoped_session().commit()

    if not user or not verify_password(schema.password, user.password_hash):
        raise InvalidCredentialsError("Invalid email or password")

    token = create_access_token(user_id=user.id, email=user.email)
    return TokenResponse(access_token=token)
