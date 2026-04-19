from unittest.mock import Mock
from uuid import uuid4

import pytest

from app.domain.abstractions import UserRepo
from app.domain.errors import UnknownUserError, UserIsNotDmError
from app.domain.handlers.command import CreateNpcHandler, PromoteToDmHandler
from app.domain.messages import (
    CharacterCreated,
    CreateNpc,
    PromoteToDm,
    UserPromotedToDm,
)
from app.domain.types import CharacterClass, CharacterSpecies
from tests.factories.entities import UserFactory


def test_promote_to_dm_success():
    user = UserFactory(is_dm=False)
    repo = Mock(UserRepo)
    repo.get_by_id.return_value = user
    events = PromoteToDmHandler(repo=repo)(PromoteToDm(user_id=user.id))
    assert isinstance(events[0], UserPromotedToDm)
    assert events[0].user.is_dm is True


def test_promote_to_dm_unknown_user():
    repo = Mock(UserRepo)
    repo.get_by_id.return_value = None
    with pytest.raises(UnknownUserError):
        PromoteToDmHandler(repo=repo)(PromoteToDm(user_id=uuid4()))


def test_create_npc_success():
    dm = UserFactory(is_dm=True)
    repo = Mock(UserRepo)
    repo.get_by_id.return_value = dm
    events = CreateNpcHandler(user_repo=repo)(
        CreateNpc(
            name="Shopkeeper",
            character_class=CharacterClass.WIZARD,
            species=CharacterSpecies.HUMAN,
            dm_id=dm.id,
        )
    )
    assert isinstance(events[0], CharacterCreated)
    assert events[0].character.is_npc is True
    assert events[0].character.user.id == dm.id


def test_create_npc_requires_dm():
    non_dm = UserFactory(is_dm=False)
    repo = Mock(UserRepo)
    repo.get_by_id.return_value = non_dm
    with pytest.raises(UserIsNotDmError):
        CreateNpcHandler(user_repo=repo)(
            CreateNpc(
                name="Shopkeeper",
                character_class=CharacterClass.WIZARD,
                species=CharacterSpecies.HUMAN,
                dm_id=non_dm.id,
            )
        )


def test_create_npc_unknown_user():
    repo = Mock(UserRepo)
    repo.get_by_id.return_value = None
    with pytest.raises(UnknownUserError):
        CreateNpcHandler(user_repo=repo)(
            CreateNpc(
                name="Shopkeeper",
                character_class=CharacterClass.WIZARD,
                species=CharacterSpecies.HUMAN,
                dm_id=uuid4(),
            )
        )
