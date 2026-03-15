from uuid import uuid4

from factory import Factory
from factory.declarations import LazyFunction, SubFactory

from app.domain.entities import CharacterDescription, CharacterUpdateLog, User
from app.domain.models.character import Character
from app.domain.types import CharacterClass, CharacterSpecies


class UserFactory(Factory):
    class Meta:
        model = User

    id = LazyFunction(uuid4)
    username = "testuser"


class CharacterUpdateLogFactory(Factory):
    class Meta:
        model = CharacterUpdateLog

    character_id = LazyFunction(uuid4)
    old_values = {}
    new_values = {}


class CharacterDescriptionFactory(Factory):
    class Meta:
        model = CharacterDescription

    character_id = LazyFunction(uuid4)
    height = None
    weight = None
    eye_color = None
    hair_color = None
    backstory = None
    general_appearance = None
    update_logs = []


class CharacterFactory(Factory):
    class Meta:
        model = Character

    id = LazyFunction(uuid4)
    name = "Test Character"
    character_class = CharacterClass.BARD
    species = CharacterSpecies.FOREST_GNOME
    level = 1
    experience_points = 0
    description = None
    skills = []
    abilities = []
    user = SubFactory(UserFactory)
