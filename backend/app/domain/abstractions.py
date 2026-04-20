from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.entities import CampaignAction, User
from app.domain.models.campaign import Campaign
from app.domain.models.character import Character


class CharacterRepo(ABC):
    @abstractmethod
    def create_character(self, character: Character) -> None:
        pass

    @abstractmethod
    def get_by_id(self, character_id: UUID) -> Character | None:
        pass

    @abstractmethod
    def get_by_name(self, name: str) -> Character | None:
        pass

    @abstractmethod
    def get_by_user_id(self, user_id: UUID) -> list[Character]:
        pass

    @abstractmethod
    def get_player_characters_by_user_id(self, user_id: UUID) -> list[Character]:
        pass

    @abstractmethod
    def get_npcs_by_dm_id(self, dm_id: UUID) -> list[Character]:
        pass

    @abstractmethod
    def update_character(self, character: Character) -> None:
        pass

    @abstractmethod
    def delete_character(self, character_id: UUID) -> None:
        pass


class UserRepo(ABC):
    @abstractmethod
    def create_user(self, user: User) -> None:
        pass

    @abstractmethod
    def get_by_id(self, user_id: UUID) -> User | None:
        pass

    @abstractmethod
    def get_by_email(self, email: str) -> User | None:
        pass

    @abstractmethod
    def search_by_email(self, email: str) -> User | None:
        pass

    @abstractmethod
    def set_is_dm(self, user_id: UUID, is_dm: bool) -> None:
        pass


class CampaignRepo(ABC):
    @abstractmethod
    def create_campaign(self, campaign: Campaign) -> None:
        pass

    @abstractmethod
    def get_by_id(self, campaign_id: UUID) -> Campaign | None:
        pass

    @abstractmethod
    def get_by_invite_code(self, invite_code: str) -> Campaign | None:
        pass

    @abstractmethod
    def get_by_dm_id(self, dm_id: UUID) -> list[Campaign]:
        pass

    @abstractmethod
    def get_by_character_id(self, character_id: UUID) -> list[Campaign]:
        pass

    @abstractmethod
    def update_campaign(self, campaign: Campaign) -> None:
        pass

    @abstractmethod
    def delete_campaign(self, campaign_id: UUID) -> None:
        pass


class CampaignActionRepo(ABC):
    @abstractmethod
    def add(self, action: CampaignAction) -> None:
        pass

    @abstractmethod
    def list_by_campaign(
        self,
        campaign_id: UUID,
        character_id: UUID | None,
        in_combat: bool | None,
        page: int,
        page_size: int,
    ) -> tuple[list[CampaignAction], int]:
        pass

    @abstractmethod
    def list_by_character(
        self,
        character_id: UUID,
        campaign_id: UUID,
        page: int,
        page_size: int,
    ) -> tuple[list[CampaignAction], int]:
        pass
