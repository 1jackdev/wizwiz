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

    def get_by_email(self, email: str) -> User | None:
        stmt = (
            select(UserAccountORM)
            .filter_by(email=email)
            .options(selectinload(UserAccountORM.characters))
        )
        result = self.db.execute(stmt)
        orm = result.scalar_one_or_none()
        return user_from_orm(orm) if orm else None

    def search_by_email(self, email: str) -> User | None:
        stmt = (
            select(UserAccountORM)
            .filter(UserAccountORM.email.contains(email))
            .options(selectinload(UserAccountORM.characters))
        )
        result = self.db.execute(stmt)
        orm = result.scalar_one_or_none()
        return user_from_orm(orm) if orm else None

    def set_is_dm(self, user_id: UUID, is_dm: bool) -> None:
        orm = self.db.get(UserAccountORM, user_id)
        if orm is None:
            raise ValueError("User not found")
        orm.is_dm = is_dm
        self.db.commit()
