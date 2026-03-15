from unittest.mock import Mock
from uuid import uuid4

import pytest

from app.domain.abstractions import UserRepo
from app.domain.entities import Ability, CharacterDescription, Skill
from app.domain.errors import UnknownUserError
from app.domain.handlers.command import (
    CreateCharacterHandler,
    UpdateCharacterHandler,
)
from app.domain.messages import (
    CharacterCreated,
    CharacterUpdated,
    CreateCharacter,
    UpdateCharacter,
)
from app.domain.types import (
    AbilityName,
    CharacterClass,
    CharacterSpecies,
    SkillName,
)
from app.http.schemas.character import UpdateCharacterSchema
from tests.factories.entities import CharacterFactory, UserFactory


def test_create_character_success():
    user = UserFactory(username="testuser")
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


def test_update_character_success():
    character = CharacterFactory()
    msg = UpdateCharacter(
        character=character,
        new_values=UpdateCharacterSchema(
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
        ),
    )

    handler = UpdateCharacterHandler()

    events = handler(msg)
    assert len(events) == 1
    updated_event = events[0]

    assert isinstance(updated_event, CharacterUpdated)
    assert updated_event.character.name == "Updated Hero"
    assert updated_event.character.character_class == CharacterClass.WIZARD
    assert updated_event.character.species == CharacterSpecies.HIGH_ELF
    assert updated_event.character.level == 10
    assert updated_event.character.experience_points == 1000
    assert updated_event.character.description.general_appearance == "A good-looking dude"
    assert len(updated_event.character.abilities) == 1
    assert updated_event.character.abilities[0].name == AbilityName.STRENGTH
    assert len(updated_event.character.skills) == 1
    assert updated_event.character.skills[0].name == SkillName.ATHLETICS
