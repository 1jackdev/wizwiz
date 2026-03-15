from abc import ABC
from dataclasses import dataclass
from typing import TYPE_CHECKING, Any
from uuid import UUID

from app.domain.entities import User
from app.domain.types import CharacterClass, CharacterSpecies
from app.http.schemas.character import UpdateCharacterSchema

if TYPE_CHECKING:
    from app.domain.models.character import Character


class Message(ABC):
    pass


@dataclass
class CreateCharacter(Message):
    name: str
    character_class: CharacterClass
    species: CharacterSpecies
    user_id: UUID


@dataclass
class UpdateCharacter(Message):
    character: "Character"
    new_values: UpdateCharacterSchema


@dataclass
class CharacterCreated(Message):
    character: "Character"


@dataclass
class CharacterUpdated(Message):
    character: "Character"
    updated_fields: dict[str, Any]


@dataclass
class DeleteCharacter(Message):
    character: "Character"


@dataclass
class CharacterDeleted(Message):
    character: "Character"


@dataclass
class CreateUser(Message):
    username: str
    password: str


@dataclass
class UserCreated(Message):
    user: User
