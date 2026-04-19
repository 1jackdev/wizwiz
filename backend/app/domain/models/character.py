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
        is_npc: bool = False,
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
        self.is_npc = is_npc
        self.update_logs: list[CharacterUpdateLog] = []
        self.events: list[Message] = []

    @classmethod
    def create(
        cls,
        name: str,
        character_class: CharacterClass,
        species: CharacterSpecies,
        user: User,
        is_npc: bool = False,
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
            is_npc=is_npc,
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
            score = min(scores[ability_name]
                        + bonuses.get(ability_name, 0), 20)
            modifier = (score - 10) // 2
            abilities.append(
                Ability(name=ability_name, score=score, modifier=modifier))
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
    ) -> None:
        changed = False

        if name and name != self.name:
            if len(name.strip()) < 2:
                raise NameIsTooShortError(f"Name {name} is too short")
            self.name = name
            changed = True

        if character_class and character_class != self.character_class:
            try:
                new_class = CharacterClass(character_class)
            except ValueError:
                raise InvalidClassError(
                    f"{character_class} is not a supported class.")
            self.character_class = new_class
            changed = True

        if species and species != self.species:
            try:
                new_species = CharacterSpecies(species)
            except ValueError:
                raise InvalidSpeciesError(
                    f"{species} is not a supported species.")
            self.species = new_species
            changed = True

        if level and level != self.level:
            if not (1 <= level <= 20):
                raise InvalidLevelError(f"{level} is not allowed.")
            self.level = level
            changed = True

        if experience_points and experience_points != self.experience_points:
            if not (0 <= experience_points <= 355_000):
                raise InvalidXPValueError(
                    f"{experience_points} is not a valid amount of experience points."
                )
            self.experience_points = experience_points
            changed = True

        if description and description != self.description:
            self.description = description
            changed = True

        if abilities and abilities != self.abilities:
            self.abilities = abilities
            changed = True

        if skills and skills != self.skills:
            self.skills = skills
            changed = True

        if not changed:
            raise NoUpdatesError()

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

    def register_created_event(self) -> None:
        created_event = CharacterCreated(character=self)
        self.events.append(created_event)
