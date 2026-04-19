from uuid import UUID

from fastapi import APIRouter, HTTPException, Response

from app.containers import container
from app.domain.abstractions import UserRepo
from app.domain.entities import User
from app.domain.messages import CreateUser, PromoteToDm
from app.http.schemas.user import CreateUserSchema, UserSchema

router = APIRouter(prefix="/user")


def _to_schema(user: User) -> UserSchema:
    return UserSchema(id=user.id, email=user.email, is_dm=user.is_dm)


@router.get("/search")
async def search_by_email(email: str) -> UserSchema:
    user_repo = container.db().user_repo()
    user = user_repo.search_by_email(email=email)
    if not user:
        raise HTTPException(status_code=404)
    return _to_schema(user)


@router.get("/{user_id}/details")
async def get_user(user_id: UUID) -> UserSchema:
    user_repo: UserRepo = container.db().user_repo()
    user = user_repo.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404)
    return _to_schema(user)


@router.post("/create")
async def create_user(schema: CreateUserSchema) -> Response:
    bus = container.msg_bus()
    msg = CreateUser(email=schema.email, password=schema.password)
    bus.handle_msg(msg)
    container.db.scoped_session().commit()
    return Response(status_code=201)


@router.post("/{user_id}/promote_dm")
async def promote_to_dm(user_id: UUID) -> UserSchema:
    bus = container.msg_bus()
    bus.handle_msg(PromoteToDm(user_id=user_id))
    container.db.scoped_session().commit()
    user_repo: UserRepo = container.db().user_repo()
    user = user_repo.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404)
    return _to_schema(user)
