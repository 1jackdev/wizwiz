from uuid import UUID

from pydantic import BaseModel

from app.domain.types import CharacterClass, CharacterSpecies


class CreateNpcSchema(BaseModel):
    name: str
    character_class: CharacterClass
    species: CharacterSpecies
    dm_id: UUID
