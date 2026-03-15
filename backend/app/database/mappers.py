from uuid import UUID, uuid4

from app.database.models import (
    CharacterAbilityORM,
    CharacterORM,
    CharacterSkillORM,
    UserAccountORM,
)
from app.domain.entities import Ability, CharacterDescription, Skill, User
from app.domain.models.character import Character
from app.domain.types import (
    AbilityName,
    CharacterClass,
    CharacterSpecies,
    ProficiencyLevel,
    SkillName,
)


def user_to_orm(user: User) -> UserAccountORM:
    return UserAccountORM(
        id=user.id,
        username=user.username,
        password_hash=user.password_hash,
    )


def user_from_orm(orm: UserAccountORM) -> User:
    return User(
        id=orm.id,
        username=orm.username,
        password_hash=orm.password_hash,
    )


def ability_to_orm(ability: Ability, character_id: UUID) -> CharacterAbilityORM:
    return CharacterAbilityORM(
        id=uuid4(),
        character_id=character_id,
        ability_name=ability.name.value,
        score=ability.score,
        modifier=ability.modifier,
    )


def skill_to_orm(skill: Skill, character_id: UUID) -> CharacterSkillORM:
    return CharacterSkillORM(
        id=uuid4(),
        character_id=character_id,
        skill_name=skill.name.value,
        ability_name=skill.ability.value,
        proficiency_level=ProficiencyLevel.to_int(skill.proficiency),
        passive_score=skill.passive_score,
    )


def character_to_orm(character: Character) -> CharacterORM:
    return CharacterORM(
        id=character.id,
        user_id=character.user.id,
        name=character.name,
        character_class=character.character_class,
        species=character.species,
        level=character.level,
        experience_points=character.experience_points,
        abilities=[ability_to_orm(a, character.id) for a in character.abilities],
        skills=[skill_to_orm(s, character.id) for s in character.skills],
    )


def character_from_orm(orm: CharacterORM) -> Character:
    return Character(
        id=orm.id,
        name=orm.name,
        user=user_from_orm(orm.user_account),
        character_class=CharacterClass(orm.character_class),
        species=CharacterSpecies(orm.species),
        level=orm.level,
        experience_points=orm.experience_points,
        description=character_description_from_orm(orm) if orm.description else None,
        abilities=[ability_from_orm(a) for a in orm.abilities],
        skills=[skill_from_orm(s) for s in orm.skills],
    )


def ability_from_orm(orm: CharacterAbilityORM) -> Ability:
    return Ability(
        name=AbilityName(orm.ability_name),
        score=orm.score,
        modifier=orm.modifier,
    )


def skill_from_orm(orm: CharacterSkillORM) -> Skill:
    return Skill(
        name=SkillName(orm.skill_name),
        ability=AbilityName(orm.ability_name),
        proficiency=ProficiencyLevel.from_int(orm.proficiency_level),
        passive_score=orm.passive_score,
    )


def character_description_from_orm(orm: CharacterORM) -> CharacterDescription:
    return CharacterDescription(
        height=orm.description.height,
        weight=orm.description.weight,
        eye_color=orm.description.eye_color,
        hair_color=orm.description.hair_color,
        backstory=orm.description.backstory,
        general_appearance=orm.description.general_appearance,
    )
