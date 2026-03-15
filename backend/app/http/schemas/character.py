from uuid import UUID

from pydantic import BaseModel

from app.domain.entities import (
    Ability,
    CharacterDescription,
    SavingThrow,
    Skill,
)
from app.domain.types import CharacterClass, CharacterSpecies


class CreateCharacterSchema(BaseModel):
    name: str
    character_class: CharacterClass
    species: CharacterSpecies
    user_id: UUID


class CharacterSummarySchema(BaseModel):
    id: UUID
    name: str
    character_class: str
    species: str
    level: int
    experience_points: int


class CharacterDetailSchema(CharacterSummarySchema):
    description: CharacterDescription | None
    abilities: list[Ability]
    skills: list[Skill]
    proficiency_bonus: int
    saving_throws: list[SavingThrow]


class UpdateCharacterSchema(BaseModel):
    name: str | None = None
    character_class: CharacterClass | None = None
    species: CharacterSpecies | None = None
    level: int | None = None
    experience_points: int | None = None
    description: CharacterDescription | None = None
    abilities: list[Ability] | None = None
    skills: list[Skill] | None = None
