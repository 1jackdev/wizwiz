from uuid import UUID

from fastapi import APIRouter, HTTPException, Response

from app.containers import container
from app.domain.abstractions import CampaignActionRepo, CampaignRepo
from app.domain.entities import CampaignAction
from app.domain.errors import NoUpdatesError
from app.domain.messages import CreateCampaign, JoinCampaign, LogCampaignAction
from app.domain.models.campaign import Campaign
from app.http.schemas.campaign import (
    CampaignActionPageSchema,
    CampaignActionSchema,
    CampaignDetailSchema,
    CampaignSummarySchema,
    CreateCampaignSchema,
    JoinCampaignSchema,
    LogCampaignActionSchema,
    UpdateCampaignSchema,
)
from app.http.schemas.character import CharacterSummarySchema

router = APIRouter(prefix="/campaign")


def _summary(c: Campaign) -> CampaignSummarySchema:
    return CampaignSummarySchema(
        id=c.id,
        name=c.name,
        level=c.level,
        description=c.description,
        dm_id=c.dm.id,
        invite_code=c.invite_code,
        status=c.status,
    )


def _detail(c: Campaign) -> CampaignDetailSchema:
    return CampaignDetailSchema(
        id=c.id,
        name=c.name,
        level=c.level,
        description=c.description,
        dm_id=c.dm.id,
        invite_code=c.invite_code,
        status=c.status,
        characters=[
            CharacterSummarySchema(
                id=ch.id,
                name=ch.name,
                character_class=ch.character_class,
                species=ch.species,
                level=ch.level,
                experience_points=ch.experience_points,
            )
            for ch in c.characters
        ],
    )


@router.post("/create")
async def create_campaign(
    schema: CreateCampaignSchema, dm_id: UUID
) -> CampaignSummarySchema:
    bus = container.msg_bus()
    bus.handle_msg(
        CreateCampaign(
            name=schema.name,
            dm_id=dm_id,
            level=schema.level,
            description=schema.description,
        )
    )
    container.db.scoped_session().commit()
    repo: CampaignRepo = container.db().campaign_repo()
    campaigns = repo.get_by_dm_id(dm_id)
    if not campaigns:
        raise HTTPException(status_code=500)
    return _summary(campaigns[-1])


@router.get("/dm/{dm_id}")
async def list_dm_campaigns(dm_id: UUID) -> list[CampaignSummarySchema]:
    repo: CampaignRepo = container.db().campaign_repo()
    return [_summary(c) for c in repo.get_by_dm_id(dm_id)]


@router.get("/character/{character_id}")
async def list_character_campaigns(
    character_id: UUID,
) -> list[CampaignSummarySchema]:
    repo: CampaignRepo = container.db().campaign_repo()
    return [_summary(c) for c in repo.get_by_character_id(character_id)]


@router.get("/{campaign_id}/details")
async def get_campaign(campaign_id: UUID) -> CampaignDetailSchema:
    repo: CampaignRepo = container.db().campaign_repo()
    campaign = repo.get_by_id(campaign_id)
    if not campaign:
        raise HTTPException(status_code=404)
    return _detail(campaign)


@router.put("/{campaign_id}/update")
async def update_campaign(
    campaign_id: UUID, schema: UpdateCampaignSchema
) -> Response:
    repo: CampaignRepo = container.db().campaign_repo()
    campaign = repo.get_by_id(campaign_id)
    if not campaign:
        raise HTTPException(status_code=404)
    try:
        campaign.update(
            name=schema.name,
            level=schema.level,
            description=schema.description,
            status=schema.status,
        )
    except NoUpdatesError:
        return Response(status_code=204)
    repo.update_campaign(campaign=campaign)
    container.db.scoped_session().commit()
    return Response(status_code=201)


@router.delete("/{campaign_id}/delete")
async def delete_campaign(campaign_id: UUID) -> Response:
    repo: CampaignRepo = container.db().campaign_repo()
    campaign = repo.get_by_id(campaign_id)
    if not campaign:
        raise HTTPException(status_code=404)
    repo.delete_campaign(campaign_id=campaign.id)
    container.db.scoped_session().commit()
    return Response(status_code=204)


@router.post("/{campaign_id}/regenerate_invite")
async def regenerate_invite(
    campaign_id: UUID,
) -> CampaignSummarySchema:
    repo: CampaignRepo = container.db().campaign_repo()
    campaign = repo.get_by_id(campaign_id)
    if not campaign:
        raise HTTPException(status_code=404)
    campaign.regenerate_invite()
    repo.update_campaign(campaign=campaign)
    container.db.scoped_session().commit()
    return _summary(campaign)


@router.post("/join")
async def join_campaign(schema: JoinCampaignSchema) -> CampaignSummarySchema:
    bus = container.msg_bus()
    bus.handle_msg(
        JoinCampaign(
            invite_code=schema.invite_code,
            character_id=schema.character_id,
        )
    )
    container.db.scoped_session().commit()
    repo: CampaignRepo = container.db().campaign_repo()
    campaign = repo.get_by_invite_code(schema.invite_code)
    if not campaign:
        raise HTTPException(status_code=404)
    return _summary(campaign)


def _action_schema(a: CampaignAction) -> CampaignActionSchema:
    return CampaignActionSchema(
        id=a.id,
        campaign_id=a.campaign_id,
        character_id=a.character_id,
        action_type=a.action_type,
        action_name=a.action_name,
        in_combat=a.in_combat,
        round_number=a.round_number,
        created_at=a.created_at,
    )


@router.post("/{campaign_id}/actions")
async def log_campaign_action(
    campaign_id: UUID, schema: LogCampaignActionSchema
) -> Response:
    bus = container.msg_bus()
    bus.handle_msg(
        LogCampaignAction(
            campaign_id=campaign_id,
            character_id=schema.character_id,
            action_type=schema.action_type,
            action_name=schema.action_name,
            in_combat=schema.in_combat,
            round_number=schema.round_number,
        )
    )
    container.db.scoped_session().commit()
    return Response(status_code=201)


@router.get("/{campaign_id}/actions")
async def list_campaign_actions(
    campaign_id: UUID,
    page: int = 1,
    page_size: int = 20,
    character_id: UUID | None = None,
    in_combat: bool | None = None,
) -> CampaignActionPageSchema:
    if page < 1:
        page = 1
    page_size = max(1, min(page_size, 100))
    repo: CampaignActionRepo = container.db().campaign_action_repo()
    items, total = repo.list_by_campaign(
        campaign_id=campaign_id,
        character_id=character_id,
        in_combat=in_combat,
        page=page,
        page_size=page_size,
    )
    return CampaignActionPageSchema(
        items=[_action_schema(a) for a in items],
        page=page,
        page_size=page_size,
        total=total,
    )


@router.get("/{campaign_id}/character/{character_id}/actions")
async def list_character_actions(
    campaign_id: UUID,
    character_id: UUID,
    page: int = 1,
    page_size: int = 20,
) -> CampaignActionPageSchema:
    if page < 1:
        page = 1
    page_size = max(1, min(page_size, 100))
    repo: CampaignActionRepo = container.db().campaign_action_repo()
    items, total = repo.list_by_character(
        character_id=character_id,
        campaign_id=campaign_id,
        page=page,
        page_size=page_size,
    )
    return CampaignActionPageSchema(
        items=[_action_schema(a) for a in items],
        page=page,
        page_size=page_size,
        total=total,
    )


@router.delete("/{campaign_id}/character/{character_id}")
async def remove_character(campaign_id: UUID, character_id: UUID) -> Response:
    repo: CampaignRepo = container.db().campaign_repo()
    campaign = repo.get_by_id(campaign_id)
    if not campaign:
        raise HTTPException(status_code=404)
    campaign.remove_character(character_id)
    repo.update_campaign(campaign=campaign)
    container.db.scoped_session().commit()
    return Response(status_code=204)
