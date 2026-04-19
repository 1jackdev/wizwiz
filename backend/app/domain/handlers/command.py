from uuid import uuid4

from app.auth import hash_password
from app.domain.abstractions import CampaignRepo, CharacterRepo, UserRepo
from app.domain.entities import User
from app.domain.errors import (
    EmailAlreadyExistsError,
    InvalidInviteCodeError,
    UnknownCharacterError,
    UnknownUserError,
    UserIsNotDmError,
)
from app.domain.messages import (
    CreateCampaign,
    CreateCharacter,
    CreateNpc,
    CreateUser,
    JoinCampaign,
    Message,
    PromoteToDm,
    UserCreated,
    UserPromotedToDm,
)
from app.domain.models.campaign import Campaign
from app.domain.models.character import Character


class CreateCharacterHandler:
    def __init__(self, user_repo: UserRepo) -> None:
        self.user_repo = user_repo

    def __call__(self, msg: CreateCharacter) -> list[Message]:
        user = self.user_repo.get_by_id(msg.user_id)
        if not user:
            raise UnknownUserError("The provided user does not exist.")
        return Character.create(
            name=msg.name,
            character_class=msg.character_class,
            species=msg.species,
            user=user,
        )


class CreateUserHandler:
    def __init__(self, repo: UserRepo) -> None:
        self.repo = repo

    def __call__(self, msg: CreateUser) -> list[Message]:
        existing_user = self.repo.get_by_email(msg.email)
        if existing_user is not None:
            raise EmailAlreadyExistsError("Email already exists")

        user = User(
            id=uuid4(),
            email=msg.email,
            password_hash=hash_password(msg.password),
        )
        return [UserCreated(user=user)]


class PromoteToDmHandler:
    def __init__(self, repo: UserRepo) -> None:
        self.repo = repo

    def __call__(self, msg: PromoteToDm) -> list[Message]:
        user = self.repo.get_by_id(msg.user_id)
        if not user:
            raise UnknownUserError("The provided user does not exist.")
        user.is_dm = True
        return [UserPromotedToDm(user=user)]


class CreateNpcHandler:
    def __init__(self, user_repo: UserRepo) -> None:
        self.user_repo = user_repo

    def __call__(self, msg: CreateNpc) -> list[Message]:
        dm = self.user_repo.get_by_id(msg.dm_id)
        if not dm:
            raise UnknownUserError("The provided DM does not exist.")
        if not dm.is_dm:
            raise UserIsNotDmError("Only DMs can create NPCs.")
        return Character.create(
            name=msg.name,
            character_class=msg.character_class,
            species=msg.species,
            user=dm,
            is_npc=True,
        )


class CreateCampaignHandler:
    def __init__(self, user_repo: UserRepo) -> None:
        self.user_repo = user_repo

    def __call__(self, msg: CreateCampaign) -> list[Message]:
        dm = self.user_repo.get_by_id(msg.dm_id)
        if not dm:
            raise UnknownUserError("The provided DM does not exist.")
        return Campaign.create(
            name=msg.name,
            dm=dm,
            level=msg.level,
            description=msg.description,
        )


class JoinCampaignHandler:
    def __init__(
        self, campaign_repo: CampaignRepo, character_repo: CharacterRepo
    ) -> None:
        self.campaign_repo = campaign_repo
        self.character_repo = character_repo

    def __call__(self, msg: JoinCampaign) -> list[Message]:
        campaign = self.campaign_repo.get_by_invite_code(msg.invite_code)
        if not campaign:
            raise InvalidInviteCodeError("Invite code is invalid.")
        character = self.character_repo.get_by_id(msg.character_id)
        if not character:
            raise UnknownCharacterError("Character does not exist.")
        return campaign.add_character(character)
