from abc import ABC
from dataclasses import dataclass
from typing import TYPE_CHECKING
from uuid import UUID

from app.domain.entities import User
from app.domain.types import CharacterClass, CharacterSpecies

if TYPE_CHECKING:
    from app.domain.models.campaign import Campaign
    from app.domain.models.character import Character


class Message(ABC):
    pass


@dataclass
class CreateCharacterBase(Message):
    name: str
    character_class: CharacterClass
    species: CharacterSpecies


@dataclass
class CreateCharacter(CreateCharacterBase):
    user_id: UUID


@dataclass
class CreateNpc(CreateCharacterBase):
    dm_id: UUID


@dataclass
class CharacterCreated(Message):
    character: "Character"


@dataclass
class CreateUser(Message):
    email: str
    password: str


@dataclass
class UserCreated(Message):
    user: User


@dataclass
class PromoteToDm(Message):
    user_id: UUID


@dataclass
class UserPromotedToDm(Message):
    user: User


@dataclass
class CreateCampaign(Message):
    name: str
    dm_id: UUID
    level: int
    description: str | None = None


@dataclass
class CampaignCreated(Message):
    campaign: "Campaign"


@dataclass
class JoinCampaign(Message):
    invite_code: str
    character_id: UUID


@dataclass
class CampaignCharacterAdded(Message):
    campaign: "Campaign"
    character: "Character"
