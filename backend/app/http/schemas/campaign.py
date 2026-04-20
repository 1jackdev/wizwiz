from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.domain.entities import ActionType
from app.http.schemas.character import CharacterSummarySchema


class CreateCampaignSchema(BaseModel):
    name: str
    level: int = 1
    description: str | None = None


class UpdateCampaignSchema(BaseModel):
    name: str | None = None
    level: int | None = None
    description: str | None = None


class JoinCampaignSchema(BaseModel):
    invite_code: str
    character_id: UUID


class CampaignSummarySchema(BaseModel):
    id: UUID
    name: str
    level: int
    description: str | None
    dm_id: UUID
    invite_code: str


class CampaignDetailSchema(CampaignSummarySchema):
    characters: list[CharacterSummarySchema]


class LogCampaignActionSchema(BaseModel):
    character_id: UUID
    action_type: ActionType
    action_name: str | None = None
    in_combat: bool = False
    round_number: int | None = None


class CampaignActionSchema(BaseModel):
    id: UUID
    campaign_id: UUID
    character_id: UUID
    action_type: ActionType
    action_name: str | None
    in_combat: bool
    round_number: int | None
    created_at: datetime | None


class CampaignActionPageSchema(BaseModel):
    items: list[CampaignActionSchema]
    page: int
    page_size: int
    total: int
