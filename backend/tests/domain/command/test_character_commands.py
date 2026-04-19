from unittest.mock import Mock
from uuid import uuid4

import pytest

from app.domain.abstractions import UserRepo
from app.domain.entities import Ability, CharacterDescription, Skill
from app.domain.errors import NoUpdatesError, UnknownUserError
from app.domain.handlers.command import CreateCharacterHandler
from app.domain.messages import CharacterCreated, CreateCharacter
from app.domain.types import (
    AbilityName,
    CharacterClass,
    CharacterSpecies,
    SkillName,
)
from tests.factories.entities import CharacterFactory, UserFactory


def test_create_character_success():
    user = UserFactory(email="testuser@example.com")
    msg = CreateCharacter(
        user_id=user.id, name="Hero", character_class="BARBARIAN", species="HUMAN"
    )
    user_repo = Mock(UserRepo)
    user_repo.get_by_id.return_value = user

    handler = CreateCharacterHandler(user_repo=user_repo)

    events = handler(msg)
    assert len(events) > 0
    assert isinstance(events[0], CharacterCreated)
    assert events[0].character.name == "Hero"


def test_create_character_unknown_user():
    msg = CreateCharacter(
        user_id=uuid4(),
        name="Hero",
        character_class=CharacterClass.DRUID,
        species=CharacterSpecies.LIGHTFOOT_HALFLING,
    )
    user_repo = Mock(UserRepo)
    user_repo.get_by_id.return_value = None

    handler = CreateCharacterHandler(user_repo=user_repo)

    with pytest.raises(UnknownUserError):
        handler(msg)


def test_character_update_details():
    character = CharacterFactory()
    character.update_details(
        name="Updated Hero",
        character_class=CharacterClass.WIZARD,
        species=CharacterSpecies.HIGH_ELF,
        level=10,
        experience_points=1000,
        description=CharacterDescription(general_appearance="A good-looking dude"),
        abilities=[Ability(name=AbilityName.STRENGTH, score=15, modifier=2)],
        skills=[
            Skill(
                name=SkillName.ATHLETICS,
                ability=AbilityName.STRENGTH,
                is_core=True,
            )
        ],
    )
    assert character.name == "Updated Hero"
    assert character.character_class == CharacterClass.WIZARD
    assert character.species == CharacterSpecies.HIGH_ELF
    assert character.level == 10
    assert character.experience_points == 1000
    assert character.description.general_appearance == "A good-looking dude"


def test_character_update_no_changes():
    character = CharacterFactory()
    with pytest.raises(NoUpdatesError):
        character.update_details(
            name=character.name,
            character_class=None,
            species=None,
            level=None,
            experience_points=None,
            description=None,
            abilities=None,
            skills=None,
        )
