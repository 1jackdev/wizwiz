from uuid import UUID

from sqlalchemy.orm import Session

from app.database.mappers import campaign_from_orm, campaign_to_orm
from app.database.models import CampaignORM, CharacterORM
from app.domain.abstractions import CampaignRepo
from app.domain.models.campaign import Campaign


class CampaignDB(CampaignRepo):
    def __init__(self, db: Session):
        self.db = db

    def create_campaign(self, campaign: Campaign) -> None:
        existing = self.db.get(CampaignORM, campaign.id)
        if existing is not None:
            raise ValueError("Campaign already exists")
        orm = campaign_to_orm(campaign)
        self.db.add(orm)
        self.db.commit()

    def get_by_id(self, campaign_id: UUID) -> Campaign | None:
        orm = self.db.get(CampaignORM, campaign_id)
        if orm is None:
            return None
        return campaign_from_orm(orm)

    def get_by_invite_code(self, invite_code: str) -> Campaign | None:
        orm = (
            self.db.query(CampaignORM)
            .filter_by(invite_code=invite_code)
            .one_or_none()
        )
        if orm is None:
            return None
        return campaign_from_orm(orm)

    def get_by_dm_id(self, dm_id: UUID) -> list[Campaign]:
        orms = self.db.query(CampaignORM).filter_by(dm_id=dm_id).all()
        return [campaign_from_orm(o) for o in orms]

    def get_by_character_id(self, character_id: UUID) -> list[Campaign]:
        orms = (
            self.db.query(CampaignORM)
            .filter(CampaignORM.characters.any(CharacterORM.id == character_id))
            .all()
        )
        return [campaign_from_orm(o) for o in orms]

    def update_campaign(self, campaign: Campaign) -> None:
        orm = self.db.get(CampaignORM, campaign.id)
        if orm is None:
            raise ValueError("Campaign not found")
        orm.name = campaign.name
        orm.description = campaign.description
        orm.level = campaign.level
        orm.invite_code = campaign.invite_code

        desired_ids = {c.id for c in campaign.characters}
        current_ids = {c.id for c in orm.characters}

        for remove_id in current_ids - desired_ids:
            orm.characters = [c for c in orm.characters if c.id != remove_id]

        to_add = desired_ids - current_ids
        if to_add:
            new_chars = (
                self.db.query(CharacterORM)
                .filter(CharacterORM.id.in_(to_add))
                .all()
            )
            orm.characters.extend(new_chars)

        self.db.commit()

    def delete_campaign(self, campaign_id: UUID) -> None:
        orm = self.db.get(CampaignORM, campaign_id)
        if orm is None:
            raise ValueError("Campaign not found")
        self.db.delete(orm)
        self.db.commit()
