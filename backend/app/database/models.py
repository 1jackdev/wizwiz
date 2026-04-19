from datetime import datetime
from typing import Annotated, Any
from uuid import UUID

from sqlalchemy import (
    JSON,
    Column,
    DateTime,
    ForeignKey,
    String,
    Table,
    UniqueConstraint,
    Uuid,
    func,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

PK = Annotated[UUID, mapped_column(primary_key=True)]


class Base(DeclarativeBase):
    type_annotation_map = {
        UUID: Uuid(as_uuid=True, native_uuid=False),
        datetime: DateTime(timezone=True),
    }


class BaseMixin:
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), onupdate=func.now()
    )


class UserAccountORM(Base, BaseMixin):
    __tablename__ = "user_account"

    id: Mapped[PK]
    email: Mapped[str] = mapped_column(nullable=False, unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(nullable=False)
    is_dm: Mapped[bool] = mapped_column(default=False, nullable=False)

    characters: Mapped[list["CharacterORM"]] = relationship(
        cascade="all, delete-orphan",
        primaryjoin="UserAccountORM.id == foreign(CharacterORM.user_id)",
        back_populates="user_account",
        viewonly=True,
    )


class CharacterUpdateLogORM(Base, BaseMixin):
    __tablename__ = "character_update_log"

    id: Mapped[PK]
    character_id: Mapped[UUID] = mapped_column(
        ForeignKey("character.id", ondelete="CASCADE"), nullable=False, index=True
    )
    old_values: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    new_values: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)

    character: Mapped["CharacterORM"] = relationship(back_populates="update_logs")


class CharacterORM(Base, BaseMixin):
    __tablename__ = "character"

    id: Mapped[PK]
    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("user_account.id", ondelete="CASCADE"), nullable=False, index=True
    )
    deleted_at: Mapped[datetime | None] = mapped_column(nullable=True)

    name: Mapped[str] = mapped_column(nullable=False, index=True)
    character_class: Mapped[str] = mapped_column(nullable=False)
    species: Mapped[str] = mapped_column(nullable=False)
    level: Mapped[int] = mapped_column(default=1, nullable=False)
    experience_points: Mapped[int] = mapped_column(default=0, nullable=False)
    is_npc: Mapped[bool] = mapped_column(default=False, nullable=False, index=True)

    user_account: Mapped[UserAccountORM] = relationship(back_populates="characters")

    description: Mapped["CharacterDescriptionORM"] = relationship(
        back_populates="character", uselist=False, cascade="all, delete-orphan"
    )
    abilities: Mapped[list["CharacterAbilityORM"]] = relationship(
        back_populates="character", cascade="all, delete-orphan"
    )
    skills: Mapped[list["CharacterSkillORM"]] = relationship(
        back_populates="character", cascade="all, delete-orphan"
    )
    update_logs: Mapped[list["CharacterUpdateLogORM"]] = relationship(
        back_populates="character", cascade="all, delete-orphan"
    )


class CharacterDescriptionORM(Base, BaseMixin):
    __tablename__ = "character_description"

    id: Mapped[PK]
    character_id: Mapped[UUID] = mapped_column(
        ForeignKey("character.id"), nullable=False, index=True
    )
    height: Mapped[int | None] = mapped_column(nullable=True)
    weight: Mapped[int | None] = mapped_column(nullable=True)
    eye_color: Mapped[str | None] = mapped_column(nullable=True)
    hair_color: Mapped[str | None] = mapped_column(nullable=True)
    backstory: Mapped[str | None] = mapped_column(nullable=True)
    general_appearance: Mapped[str | None] = mapped_column(nullable=True)

    character: Mapped["CharacterORM"] = relationship(
        back_populates="description", uselist=False
    )


class CharacterAbilityORM(Base, BaseMixin):
    __tablename__ = "character_ability"

    id: Mapped[PK]
    character_id: Mapped[UUID] = mapped_column(
        ForeignKey("character.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    ability_name: Mapped[str] = mapped_column(String, nullable=False)
    score: Mapped[int] = mapped_column(default=10)
    modifier: Mapped[int] = mapped_column(default=0)

    character: Mapped["CharacterORM"] = relationship(back_populates="abilities")

    __table_args__ = (
        UniqueConstraint("character_id", "ability_name", name="uq_character_ability"),
    )


campaign_character_table = Table(
    "campaign_character",
    Base.metadata,
    Column(
        "campaign_id",
        Uuid(as_uuid=True, native_uuid=False),
        ForeignKey("campaign.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "character_id",
        Uuid(as_uuid=True, native_uuid=False),
        ForeignKey("character.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


class CampaignORM(Base, BaseMixin):
    __tablename__ = "campaign"

    id: Mapped[PK]
    name: Mapped[str] = mapped_column(nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(nullable=True)
    level: Mapped[int] = mapped_column(default=1, nullable=False)
    invite_code: Mapped[str] = mapped_column(
        nullable=False, unique=True, index=True
    )
    dm_id: Mapped[UUID] = mapped_column(
        ForeignKey("user_account.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    dm: Mapped[UserAccountORM] = relationship()
    characters: Mapped[list["CharacterORM"]] = relationship(
        secondary=campaign_character_table,
    )


class CharacterSkillORM(Base, BaseMixin):
    __tablename__ = "character_skill"

    id: Mapped[PK]
    character_id: Mapped[UUID] = mapped_column(
        ForeignKey("character.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    skill_name: Mapped[str] = mapped_column(String, nullable=False)
    ability_name: Mapped[str] = mapped_column(String, nullable=False)
    proficiency_level: Mapped[int] = mapped_column(default=0)
    passive_score: Mapped[int] = mapped_column(default=10)

    character: Mapped["CharacterORM"] = relationship(back_populates="skills")

    __table_args__ = (
        UniqueConstraint("character_id", "skill_name", name="uq_character_skill"),
    )
