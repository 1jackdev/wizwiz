from uuid import UUID

from fastapi import APIRouter, Response

from app.containers import container
from app.domain.abstractions import CharacterRepo
from app.domain.messages import CreateNpc
from app.http.schemas.character import CharacterSummarySchema
from app.http.schemas.npc import CreateNpcSchema

router = APIRouter(prefix="/npc")


@router.post("/create")
async def create_npc(schema: CreateNpcSchema) -> Response:
    bus = container.msg_bus()
    bus.handle_msg(
        CreateNpc(
            name=schema.name,
            character_class=schema.character_class,
            species=schema.species,
            dm_id=schema.dm_id,
        )
    )
    container.db.scoped_session().commit()
    return Response(status_code=201)


@router.get("/dm/{dm_id}")
async def list_npcs(dm_id: UUID) -> list[CharacterSummarySchema]:
    repo: CharacterRepo = container.db().character_repo()
    npcs = repo.get_npcs_by_dm_id(dm_id)
    return [
        CharacterSummarySchema(
            id=n.id,
            name=n.name,
            character_class=n.character_class,
            species=n.species,
            level=n.level,
            experience_points=n.experience_points,
        )
        for n in npcs
    ]
