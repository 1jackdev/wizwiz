from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field, model_validator

from app.domain.types import AbilityName, ProficiencyLevel, SkillName


class Ability(BaseModel):
    name: AbilityName
    score: int = 10
    modifier: int = 0

    @model_validator(mode="after")
    def validate_ability(self) -> "Ability":
        if not (1 <= self.score <= 30):
            raise ValueError(f"Ability score {self.score} must be between 1 and 30.")
        expected_modifier = (self.score - 10) // 2
        if self.modifier != expected_modifier:
            raise ValueError(
                f"Modifier {self.modifier} doesn't match score {self.score} (expected {expected_modifier})."
            )
        return self


class Skill(BaseModel):
    name: SkillName
    ability: AbilityName
    proficiency: ProficiencyLevel = ProficiencyLevel.NONE
    is_core: bool = True
    passive_score: int = 10
    modifier: int = 0
    description: str | None = None

    @model_validator(mode="after")
    def validate_skill(self) -> "Skill":
        if self.description is not None and len(self.description.strip()) == 0:
            raise ValueError("Description cannot be an empty string.")
        return self


class CharacterDescription(BaseModel):
    height: int | None = None  # in cm
    weight: int | None = None  # in kg
    eye_color: str | None = None
    hair_color: str | None = None
    backstory: str | None = None
    general_appearance: str | None = None

    @model_validator(mode="after")
    def validate_description(self) -> "CharacterDescription":
        if self.height and not (10 <= self.height <= 3000):  # cm
            raise ValueError(
                f"Height {self.height}cm is outside a reasonable range (10–300cm)."
            )
        if self.weight and not (1 <= self.weight <= 1000):  # kg
            raise ValueError(
                f"Weight {self.weight}kg is outside a reasonable range (1–1000kg)."
            )
        for field in ("eye_color", "hair_color", "backstory", "general_appearance"):
            val = getattr(self, field)
            if val is not None and len(val.strip()) == 0:
                raise ValueError(f"{field} cannot be an empty string.")
        return self


class CharacterUpdateLog(BaseModel):
    id: UUID
    character_id: UUID
    old_values: dict[str, Any]
    new_values: dict[str, Any]


class SavingThrow(BaseModel):
    ability: AbilityName
    value: int


class User(BaseModel):
    id: UUID
    username: str
    password_hash: str = Field(default="", exclude=True)
