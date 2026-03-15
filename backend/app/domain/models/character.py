from typing import Any
from uuid import UUID, uuid4

from app.domain.entities import (
    Ability,
    CharacterDescription,
    CharacterUpdateLog,
    SavingThrow,
    Skill,
    User,
)
from app.domain.errors import (
    InvalidClassError,
    InvalidLevelError,
    InvalidSpeciesError,
    InvalidXPValueError,
    NameIsTooShortError,
    NoUpdatesError,
)
from app.domain.messages import (
    CharacterCreated,
    CharacterDeleted,
    CharacterUpdated,
    Message,
)
from app.domain.models.defaults import (
    CLASS_ABILITY_PRIORITY,
    PROFICIENCY_BONUS_BY_LEVEL,
    SKILL_ABILITY_MAP,
    SPECIES_ABILITY_BONUSES,
    STANDARD_ARRAY,
)
from app.domain.types import (
    AbilityName,
    CharacterClass,
    CharacterSpecies,
    ProficiencyLevel,
)


class Character:
    def __init__(
        self,
        id: UUID,
        name: str,
        character_class: CharacterClass,
        species: CharacterSpecies,
        user: User,
        abilities: list[Ability],
        skills: list[Skill],
        level: int = 1,
        experience_points: int = 0,
        description: CharacterDescription | None = None,
    ) -> None:
        self.id = id
        self.name = name
        self.character_class = character_class
        self.species = species
        self.user = user
        self.level = level
        self.experience_points = experience_points
        self.description = description
        self.abilities = abilities
        self.skills = skills
        self.update_logs: list[CharacterUpdateLog] = []
        self.events: list[Message] = []

    @classmethod
    def create_character(
        cls,
        name: str,
        character_class: CharacterClass,
        species: CharacterSpecies,
        user: User,
    ) -> list[Message]:
        abilities = cls._build_default_abilities(character_class, species)
        skills = cls._build_default_skills(abilities)
        new_char = cls(
            name=name,
            id=uuid4(),
            character_class=character_class,
            species=species,
            user=user,
            abilities=abilities,
            skills=skills,
        )
        new_char.register_created_event()
        return new_char.events

    @staticmethod
    def _build_default_abilities(
        character_class: CharacterClass,
        species: CharacterSpecies,
    ) -> list[Ability]:
        priority = CLASS_ABILITY_PRIORITY[character_class]
        bonuses = SPECIES_ABILITY_BONUSES.get(species, {})
        scores = dict(zip(priority, STANDARD_ARRAY))
        abilities = []
        for ability_name in AbilityName:
            score = min(scores[ability_name] + bonuses.get(ability_name, 0), 20)
            modifier = (score - 10) // 2
            abilities.append(Ability(name=ability_name, score=score, modifier=modifier))
        return abilities

    @staticmethod
    def _build_default_skills(abilities: list[Ability]) -> list[Skill]:
        modifiers = {a.name: a.modifier for a in abilities}
        return [
            Skill(
                name=skill_name,
                ability=ability_name,
                proficiency=ProficiencyLevel.NONE,
                passive_score=10 + modifiers[ability_name],
            )
            for skill_name, ability_name in SKILL_ABILITY_MAP.items()
        ]

    def update_details(
        self,
        name: str | None,
        character_class: str | None,
        species: str | None,
        level: int | None,
        experience_points: int | None,
        description: CharacterDescription | None,
        abilities: list[Ability] | None,
        skills: list[Skill] | None,
    ) -> list[Message]:
        changes: dict[str, Any] = {}

        if name and name != self.name:
            if len(name.strip()) < 2:
                raise NameIsTooShortError(f"Name {name} is too short")
            changes["name"] = name
            self.name = name

        if character_class and character_class != self.character_class:
            try:
                new_class = CharacterClass(character_class)
            except ValueError:
                raise InvalidClassError(f"{character_class} is not a supported class.")
            changes["character_class"] = new_class
            self.character_class = new_class

        if species and species != self.species:
            try:
                new_species = CharacterSpecies(species)
            except ValueError:
                raise InvalidSpeciesError(f"{species} is not a supported species.")
            changes["species"] = new_species
            self.species = new_species

        if level and level != self.level:
            if not (1 <= level <= 20):
                raise InvalidLevelError(f"{level} is not allowed.")
            changes["level"] = level
            self.level = level

        if experience_points and experience_points != self.experience_points:
            if not (0 <= experience_points <= 355_000):
                raise InvalidXPValueError(
                    f"{experience_points} is not a valid amount of experience points."
                )
            changes["experience_points"] = experience_points
            self.experience_points = experience_points

        if description and description != self.description:
            changes["description"] = description
            self.description = description

        if abilities and abilities != self.abilities:
            changes["abilities"] = abilities
            self.abilities = abilities

        if skills and skills != self.skills:
            changes["skills"] = skills
            self.skills = skills

        if not changes:
            raise NoUpdatesError()

        self.register_updated_event(updated_fields=changes)
        return self.events

    @property
    def proficiency_bonus(self) -> int:
        return PROFICIENCY_BONUS_BY_LEVEL[self.level]

    @property
    def saving_throws(self) -> list[SavingThrow]:
        modifier_map = {a.name: a.modifier for a in self.abilities}
        return [
            SavingThrow(
                ability=ability,
                value=modifier_map.get(ability, 0) + self.proficiency_bonus,
            )
            for ability in AbilityName
        ]

    def delete(self) -> list[Message]:
        self.register_deleted_event()
        return self.events

    def register_created_event(self) -> None:
        created_event = CharacterCreated(character=self)
        self.events.append(created_event)

    def register_updated_event(self, updated_fields: dict[str, Any]) -> None:
        updated_event = CharacterUpdated(character=self, updated_fields=updated_fields)
        self.events.append(updated_event)

    def register_deleted_event(self) -> None:
        deleted_event = CharacterDeleted(character=self)
        self.events.append(deleted_event)
