from uuid import UUID

from fastapi import APIRouter, Response

from app.containers import container
from app.domain.abstractions import UserRepo
from app.domain.entities import User
from app.domain.messages import CreateUser
from app.http.schemas.user import CreateUserSchema

router = APIRouter(prefix="/user")


@router.get("/search", response_model=None)
async def search_by_username(username: str) -> User | Response:
    user_repo = container.db().user_repo()
    user = user_repo.search_by_username(username=username)
    if not user:
        return Response(status_code=404)
    return user


@router.get("/{user_id}/details", response_model=None)
async def get_user(user_id: UUID) -> Response | User:
    user_repo: UserRepo = container.db().user_repo()
    user = user_repo.get_by_id(user_id)
    if not user:
        return Response(status_code=404)
    return user


@router.post("/create")
async def create_user(schema: CreateUserSchema) -> Response:
    bus = container.msg_bus()
    msg = CreateUser(username=schema.username, password=schema.password)
    bus.handle_msg(msg)
    container.db.scoped_session().commit()
    return Response(status_code=201)
