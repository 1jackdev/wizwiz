from unittest.mock import Mock
from uuid import uuid4

import pytest

from app.domain.abstractions import CampaignRepo, CharacterRepo, UserRepo
from app.domain.errors import (
    CharacterAlreadyInCampaignError,
    CharacterNotInCampaignError,
    InvalidInviteCodeError,
    NameIsTooShortError,
    NoUpdatesError,
    UnknownCharacterError,
    UnknownUserError,
    UserIsNotDmError,
)
from app.domain.handlers.command import (
    CreateCampaignHandler,
    JoinCampaignHandler,
)
from app.domain.messages import (
    CampaignCharacterAdded,
    CampaignCreated,
    CreateCampaign,
    JoinCampaign,
)
from app.domain.models.campaign import Campaign
from tests.factories.entities import CharacterFactory, UserFactory


def _dm() -> object:
    return UserFactory(is_dm=True)


def _campaign(dm=None, characters=None) -> Campaign:
    return Campaign(
        id=uuid4(),
        name="Whispers of Phandalin",
        dm=dm or _dm(),
        level=3,
        invite_code="abc123",
        description=None,
        characters=characters or [],
    )


def test_create_campaign_success():
    dm = _dm()
    user_repo = Mock(UserRepo)
    user_repo.get_by_id.return_value = dm
    handler = CreateCampaignHandler(user_repo=user_repo)

    events = handler(
        CreateCampaign(name="New Camp", dm_id=dm.id, level=2, description=None)
    )

    assert len(events) == 1
    assert isinstance(events[0], CampaignCreated)
    assert events[0].campaign.name == "New Camp"
    assert events[0].campaign.invite_code


def test_create_campaign_requires_dm():
    non_dm = UserFactory(is_dm=False)
    user_repo = Mock(UserRepo)
    user_repo.get_by_id.return_value = non_dm
    handler = CreateCampaignHandler(user_repo=user_repo)

    with pytest.raises(UserIsNotDmError):
        handler(CreateCampaign(name="x", dm_id=non_dm.id, level=1, description=None))


def test_create_campaign_unknown_user():
    user_repo = Mock(UserRepo)
    user_repo.get_by_id.return_value = None
    handler = CreateCampaignHandler(user_repo=user_repo)

    with pytest.raises(UnknownUserError):
        handler(CreateCampaign(name="x", dm_id=uuid4(), level=1, description=None))


def test_create_campaign_name_too_short():
    dm = _dm()
    user_repo = Mock(UserRepo)
    user_repo.get_by_id.return_value = dm
    handler = CreateCampaignHandler(user_repo=user_repo)

    with pytest.raises(NameIsTooShortError):
        handler(CreateCampaign(name="x", dm_id=dm.id, level=1, description=None))


def test_campaign_update():
    campaign = _campaign()
    campaign.update(name="Renamed", level=5, description="Epic")
    assert campaign.name == "Renamed"
    assert campaign.level == 5
    assert campaign.description == "Epic"


def test_campaign_update_no_changes():
    campaign = _campaign()
    with pytest.raises(NoUpdatesError):
        campaign.update(name=campaign.name, level=campaign.level, description=None)


def test_campaign_regenerate_invite():
    campaign = _campaign()
    old = campaign.invite_code
    campaign.regenerate_invite()
    assert campaign.invite_code != old


def test_join_campaign_success():
    dm = _dm()
    campaign = _campaign(dm=dm)
    character = CharacterFactory()

    campaign_repo = Mock(CampaignRepo)
    campaign_repo.get_by_invite_code.return_value = campaign
    character_repo = Mock(CharacterRepo)
    character_repo.get_by_id.return_value = character

    events = JoinCampaignHandler(
        campaign_repo=campaign_repo, character_repo=character_repo
    )(JoinCampaign(invite_code=campaign.invite_code, character_id=character.id))

    assert isinstance(events[0], CampaignCharacterAdded)
    assert events[0].character.id == character.id


def test_join_campaign_invalid_code():
    campaign_repo = Mock(CampaignRepo)
    campaign_repo.get_by_invite_code.return_value = None
    character_repo = Mock(CharacterRepo)

    with pytest.raises(InvalidInviteCodeError):
        JoinCampaignHandler(campaign_repo=campaign_repo, character_repo=character_repo)(
            JoinCampaign(invite_code="bad", character_id=uuid4())
        )


def test_join_campaign_unknown_character():
    campaign = _campaign()
    campaign_repo = Mock(CampaignRepo)
    campaign_repo.get_by_invite_code.return_value = campaign
    character_repo = Mock(CharacterRepo)
    character_repo.get_by_id.return_value = None

    with pytest.raises(UnknownCharacterError):
        JoinCampaignHandler(campaign_repo=campaign_repo, character_repo=character_repo)(
            JoinCampaign(invite_code=campaign.invite_code, character_id=uuid4())
        )


def test_join_campaign_duplicate_character():
    character = CharacterFactory()
    campaign = _campaign(characters=[character])
    campaign_repo = Mock(CampaignRepo)
    campaign_repo.get_by_invite_code.return_value = campaign
    character_repo = Mock(CharacterRepo)
    character_repo.get_by_id.return_value = character

    with pytest.raises(CharacterAlreadyInCampaignError):
        JoinCampaignHandler(campaign_repo=campaign_repo, character_repo=character_repo)(
            JoinCampaign(invite_code=campaign.invite_code, character_id=character.id)
        )


def test_campaign_remove_character():
    character = CharacterFactory()
    campaign = _campaign(characters=[character])
    campaign.remove_character(character.id)
    assert len(campaign.characters) == 0


def test_campaign_remove_character_not_in_campaign():
    campaign = _campaign()
    with pytest.raises(CharacterNotInCampaignError):
        campaign.remove_character(uuid4())
