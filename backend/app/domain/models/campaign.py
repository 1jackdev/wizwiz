import secrets
from uuid import UUID, uuid4

from app.domain.entities import User
from app.domain.errors import (
    CharacterAlreadyInCampaignError,
    CharacterNotInCampaignError,
    NameIsTooShortError,
    NoUpdatesError,
    UserIsNotDmError,
)
from app.domain.messages import (
    CampaignCharacterAdded,
    CampaignCreated,
    Message,
)
from app.domain.models.character import Character


def generate_invite_code() -> str:
    return secrets.token_urlsafe(6)


class Campaign:
    def __init__(
        self,
        id: UUID,
        name: str,
        dm: User,
        level: int,
        invite_code: str,
        description: str | None = None,
        characters: list[Character] | None = None,
    ) -> None:
        self.id = id
        self.name = name
        self.dm = dm
        self.level = level
        self.invite_code = invite_code
        self.description = description
        self.characters: list[Character] = characters or []
        self.events: list[Message] = []

    @classmethod
    def create(
        cls,
        name: str,
        dm: User,
        level: int,
        description: str | None,
    ) -> list[Message]:
        if not dm.is_dm:
            raise UserIsNotDmError("Only DMs can create campaigns.")
        if len(name.strip()) < 2:
            raise NameIsTooShortError(f"Name {name} is too short")
        campaign = cls(
            id=uuid4(),
            name=name.strip(),
            dm=dm,
            level=level,
            invite_code=generate_invite_code(),
            description=description,
        )
        campaign.events.append(CampaignCreated(campaign=campaign))
        return campaign.events

    def update(
        self,
        name: str | None,
        level: int | None,
        description: str | None,
    ) -> None:
        changed = False
        if name and name != self.name:
            if len(name.strip()) < 2:
                raise NameIsTooShortError(f"Name {name} is too short")
            self.name = name.strip()
            changed = True
        if level is not None and level != self.level:
            self.level = level
            changed = True
        if description is not None and description != self.description:
            self.description = description
            changed = True
        if not changed:
            raise NoUpdatesError()

    def regenerate_invite(self) -> None:
        self.invite_code = generate_invite_code()

    def add_character(self, character: Character) -> list[Message]:
        if any(c.id == character.id for c in self.characters):
            raise CharacterAlreadyInCampaignError(
                "Character is already in this campaign."
            )
        self.characters.append(character)
        self.events.append(
            CampaignCharacterAdded(campaign=self, character=character)
        )
        return self.events

    def remove_character(self, character_id: UUID) -> None:
        found = next(
            (c for c in self.characters if c.id == character_id), None)
        if not found:
            raise CharacterNotInCampaignError(
                "Character is not in this campaign.")
        self.characters = [c for c in self.characters if c.id != character_id]
