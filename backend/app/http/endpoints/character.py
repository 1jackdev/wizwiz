from uuid import UUID

from fastapi import APIRouter, HTTPException, Response

from app.containers import container
from app.domain.abstractions import CharacterRepo
from app.domain.errors import NoUpdatesError
from app.domain.messages import CreateCharacter
from app.http.schemas.character import (
    CharacterDetailSchema,
    CharacterSummarySchema,
    CreateCharacterSchema,
    UpdateCharacterSchema,
)

router = APIRouter(prefix="/character")


@router.get("/user/{user_id}")
async def list_user_characters(user_id: UUID) -> list[CharacterSummarySchema]:
    character_repo: CharacterRepo = container.db().character_repo()
    characters = character_repo.get_by_user_id(user_id)
    return [
        CharacterSummarySchema(
            id=c.id,
            name=c.name,
            character_class=c.character_class,
            species=c.species,
            level=c.level,
            experience_points=c.experience_points,
        )
        for c in characters
    ]


@router.get("/search")
async def search_by_character_name(name: str) -> CharacterSummarySchema:
    character_repo = container.db().character_repo()
    character = character_repo.get_by_name(name)
    if not character:
        raise HTTPException(status_code=404)
    return CharacterSummarySchema(
        id=character.id,
        name=character.name,
        character_class=character.character_class,
        species=character.species,
        level=character.level,
        experience_points=character.experience_points,
    )


@router.get("/{character_id}/details")
async def get_character(character_id: UUID) -> CharacterDetailSchema:
    character_repo: CharacterRepo = container.db().character_repo()
    character = character_repo.get_by_id(character_id)
    if not character:
        raise HTTPException(status_code=404)
    pb = character.proficiency_bonus
    ability_modifier_map = {a.name: a.modifier for a in character.abilities}
    proficiency_bonus_multiplier = {
        "NONE": 0,
        "PROFICIENT": pb,
        "EXPERTISE": pb * 2,
    }
    skills = [
        skill.model_copy(
            update={
                "modifier": ability_modifier_map.get(skill.ability, 0)
                + proficiency_bonus_multiplier.get(skill.proficiency, 0)
            }
        )
        for skill in character.skills
    ]
    return CharacterDetailSchema(
        id=character.id,
        name=character.name,
        character_class=character.character_class,
        species=character.species,
        level=character.level,
        experience_points=character.experience_points,
        description=character.description,
        abilities=character.abilities,
        skills=skills,
        proficiency_bonus=pb,
        saving_throws=character.saving_throws,
    )


@router.put("/{character_id}/update")
async def update_character(
    character_id: UUID, schema: UpdateCharacterSchema
) -> Response:
    character_repo: CharacterRepo = container.db().character_repo()
    character = character_repo.get_by_id(character_id)
    if not character:
        raise HTTPException(status_code=404)
    try:
        character.update_details(
            name=schema.name,
            character_class=schema.character_class,
            species=schema.species,
            level=schema.level,
            experience_points=schema.experience_points,
            description=schema.description,
            abilities=schema.abilities,
            skills=schema.skills,
        )
    except NoUpdatesError:
        return Response(status_code=204)
    character_repo.update_character(character=character)
    container.db.scoped_session().commit()
    return Response(status_code=201)


@router.delete("/{character_id}/delete")
async def delete_character(character_id: UUID) -> Response:
    character_repo: CharacterRepo = container.db().character_repo()
    character = character_repo.get_by_id(character_id)
    if not character:
        raise HTTPException(status_code=404)
    character_repo.delete_character(character_id=character.id)
    container.db.scoped_session().commit()
    return Response(status_code=204)


@router.post("/create")
async def create_character(schema: CreateCharacterSchema) -> Response:
    bus = container.msg_bus()
    msg = CreateCharacter(
        name=schema.name,
        character_class=schema.character_class,
        species=schema.species,
        user_id=schema.user_id,
    )
    bus.handle_msg(msg)
    container.db.scoped_session().commit()
    return Response(status_code=201)
