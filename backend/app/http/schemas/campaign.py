from uuid import UUID

from pydantic import BaseModel

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
