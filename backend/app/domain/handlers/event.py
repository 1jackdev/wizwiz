from app.domain.abstractions import (
    CampaignActionRepo,
    CampaignRepo,
    CharacterRepo,
    UserRepo,
)
from app.domain.messages import (
    CampaignActionLogged,
    CampaignCharacterAdded,
    CampaignCreated,
    CharacterCreated,
    UserCreated,
    UserPromotedToDm,
)


class CreateCharacter:
    def __init__(self, repo: CharacterRepo) -> None:
        self.repo = repo

    def __call__(self, msg: CharacterCreated) -> None:
        self.repo.create_character(character=msg.character)


class CreateUser:
    def __init__(self, repo: UserRepo) -> None:
        self.repo = repo

    def __call__(self, msg: UserCreated) -> None:
        self.repo.create_user(user=msg.user)


class PromoteUserToDm:
    def __init__(self, repo: UserRepo) -> None:
        self.repo = repo

    def __call__(self, msg: UserPromotedToDm) -> None:
        self.repo.set_is_dm(user_id=msg.user.id, is_dm=True)


class CreateCampaign:
    def __init__(self, repo: CampaignRepo) -> None:
        self.repo = repo

    def __call__(self, msg: CampaignCreated) -> None:
        self.repo.create_campaign(campaign=msg.campaign)


class PersistCampaignCharacterAdded:
    def __init__(self, repo: CampaignRepo) -> None:
        self.repo = repo

    def __call__(self, msg: CampaignCharacterAdded) -> None:
        self.repo.update_campaign(campaign=msg.campaign)


class PersistCampaignAction:
    def __init__(self, repo: CampaignActionRepo) -> None:
        self.repo = repo

    def __call__(self, msg: CampaignActionLogged) -> None:
        self.repo.add(action=msg.action)
