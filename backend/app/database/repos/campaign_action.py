from uuid import UUID

from sqlalchemy.orm import Session

from app.database.models import CampaignActionORM
from app.domain.abstractions import CampaignActionRepo
from app.domain.entities import ActionType, CampaignAction


def _to_entity(orm: CampaignActionORM) -> CampaignAction:
    return CampaignAction(
        id=orm.id,
        campaign_id=orm.campaign_id,
        character_id=orm.character_id,
        action_type=ActionType(orm.action_type),
        action_name=orm.action_name,
        in_combat=orm.in_combat,
        round_number=orm.round_number,
        created_at=orm.created_at,
    )


class CampaignActionDB(CampaignActionRepo):
    def __init__(self, db: Session):
        self.db = db

    def add(self, action: CampaignAction) -> None:
        orm = CampaignActionORM(
            id=action.id,
            campaign_id=action.campaign_id,
            character_id=action.character_id,
            action_type=action.action_type.value,
            action_name=action.action_name,
            in_combat=action.in_combat,
            round_number=action.round_number,
        )
        self.db.add(orm)
        self.db.commit()

    def list_by_campaign(
        self,
        campaign_id: UUID,
        character_id: UUID | None,
        in_combat: bool | None,
        page: int,
        page_size: int,
    ) -> tuple[list[CampaignAction], int]:
        q = self.db.query(CampaignActionORM).filter_by(campaign_id=campaign_id)
        if character_id is not None:
            q = q.filter_by(character_id=character_id)
        if in_combat is not None:
            q = q.filter_by(in_combat=in_combat)
        total = q.count()
        orms = (
            q.order_by(CampaignActionORM.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )
        return [_to_entity(o) for o in orms], total

    def list_by_character(
        self,
        character_id: UUID,
        campaign_id: UUID,
        page: int,
        page_size: int,
    ) -> tuple[list[CampaignAction], int]:
        q = self.db.query(CampaignActionORM).filter_by(
            character_id=character_id, campaign_id=campaign_id
        )
        total = q.count()
        orms = (
            q.order_by(CampaignActionORM.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )
        return [_to_entity(o) for o in orms], total
