from uuid import uuid4

from factory import LazyFunction, post_generation
from factory.alchemy import SESSION_PERSISTENCE_FLUSH, SQLAlchemyModelFactory

from app.database.models import (
    CampaignORM,
    CharacterAbilityORM,
    CharacterDescriptionORM,
    CharacterORM,
    CharacterSkillORM,
    UserAccountORM,
)
from app.domain.models.defaults import SKILL_ABILITY_MAP
from app.domain.types import AbilityName
from tests.conftest import SessionTest


class UserAccountORMFactory(SQLAlchemyModelFactory):
    class Meta:
        model = UserAccountORM
        sqlalchemy_session = SessionTest
        sqlalchemy_session_persistence = SESSION_PERSISTENCE_FLUSH

    id = LazyFunction(uuid4)
    email = LazyFunction(lambda: f"test-{uuid4().hex[:8]}@example.com")
    password_hash = "$2b$12$placeholderhashfortest000000000000000000000000000000000"
    is_dm = False


class CharacterDescriptionORMFactory(SQLAlchemyModelFactory):
    class Meta:
        model = CharacterDescriptionORM
        sqlalchemy_session = SessionTest
        sqlalchemy_session_persistence = SESSION_PERSISTENCE_FLUSH

    id = LazyFunction(uuid4)
    character_id = LazyFunction(uuid4)
    update_logs = []


class CharacterORMFactory(SQLAlchemyModelFactory):
    class Meta:
        model = CharacterORM
        sqlalchemy_session = SessionTest
        sqlalchemy_session_persistence = SESSION_PERSISTENCE_FLUSH

    id = LazyFunction(uuid4)
    user_id = LazyFunction(uuid4)
    name = "Test Character"
    character_class = "BARBARIAN"
    species = "HUMAN"
    level = 1
    experience_points = 0
    is_npc = False

    @post_generation
    def with_defaults(obj, create, extracted, **kwargs):
        if not create:
            return

        session = SessionTest()

        for ability_name in AbilityName:
            session.add(
                CharacterAbilityORM(
                    id=uuid4(),
                    character_id=obj.id,
                    ability_name=ability_name.value,
                    score=10,
                    modifier=0,
                )
            )

        for skill_name, ability_name in SKILL_ABILITY_MAP.items():
            session.add(
                CharacterSkillORM(
                    id=uuid4(),
                    character_id=obj.id,
                    skill_name=skill_name.value,
                    ability_name=ability_name.value,
                    proficiency_level=0,
                    passive_score=10,
                )
            )

        session.flush()


class CampaignORMFactory(SQLAlchemyModelFactory):
    class Meta:
        model = CampaignORM
        sqlalchemy_session = SessionTest
        sqlalchemy_session_persistence = SESSION_PERSISTENCE_FLUSH

    id = LazyFunction(uuid4)
    name = "Test Campaign"
    description = None
    level = 1
    invite_code = LazyFunction(lambda: uuid4().hex[:8])
    dm_id = LazyFunction(uuid4)
