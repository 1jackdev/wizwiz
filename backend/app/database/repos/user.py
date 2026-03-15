from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.database.mappers import user_from_orm, user_to_orm
from app.database.models import UserAccountORM
from app.domain.abstractions import UserRepo
from app.domain.entities import User


class UserDB(UserRepo):
    def __init__(self, db: Session):
        self.db = db

    def create_user(self, user: User) -> None:
        existing = self.db.get(UserAccountORM, user.id)
        if existing is not None:
            raise ValueError("User already exists")

        orm = user_to_orm(user)

        self.db.add(orm)
        self.db.commit()

    def get_by_id(self, user_id: UUID) -> User | None:
        stmt = select(UserAccountORM).filter_by(id=user_id)
        result = self.db.execute(stmt)
        orm = result.scalar_one_or_none()
        return user_from_orm(orm) if orm else None

    def get_by_username(self, username: str) -> User | None:
        stmt = (
            select(UserAccountORM)
            .filter_by(username=username)
            .options(selectinload(UserAccountORM.characters))
        )
        result = self.db.execute(stmt)
        orm = result.scalar_one_or_none()
        return user_from_orm(orm) if orm else None

    def search_by_username(self, username: str) -> User | None:
        stmt = (
            select(UserAccountORM)
            .filter(UserAccountORM.username.contains(username))
            .options(selectinload(UserAccountORM.characters))
        )
        result = self.db.execute(stmt)
        orm = result.scalar_one_or_none()
        return user_from_orm(orm) if orm else None
