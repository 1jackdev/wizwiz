from uuid import uuid4

from app.auth import hash_password
from app.domain.abstractions import UserRepo
from app.domain.entities import User
from app.domain.errors import UnknownUserError, UsernameAlreadyExistsError
from app.domain.messages import (
    CreateCharacter,
    CreateUser,
    DeleteCharacter,
    Message,
    UpdateCharacter,
    UserCreated,
)
from app.domain.models.character import Character


class CreateCharacterHandler:
    def __init__(self, user_repo: UserRepo) -> None:
        self.user_repo = user_repo

    def __call__(self, msg: CreateCharacter) -> list[Message]:
        user = self.user_repo.get_by_id(msg.user_id)
        if not user:
            raise UnknownUserError("The provided user does not exist.")
        events = Character.create_character(
            name=msg.name,
            character_class=msg.character_class,
            species=msg.species,
            user=user,
        )
        return events


class UpdateCharacterHandler:
    def __init__(self) -> None:
        pass

    def __call__(self, msg: UpdateCharacter) -> list[Message]:
        events = msg.character.update_details(
            name=msg.new_values.name,
            character_class=msg.new_values.character_class,
            species=msg.new_values.species,
            level=msg.new_values.level,
            experience_points=msg.new_values.experience_points,
            description=msg.new_values.description,
            abilities=msg.new_values.abilities,
            skills=msg.new_values.skills,
        )
        return events


class DeleteCharacterHandler:
    def __init__(self) -> None:
        pass

    def __call__(self, msg: DeleteCharacter) -> list[Message]:
        return msg.character.delete()


class CreateUserHandler:
    def __init__(self, repo: UserRepo) -> None:
        self.repo = repo

    def __call__(self, msg: CreateUser) -> list[Message]:
        existing_user = self.repo.get_by_username(msg.username)
        if existing_user is not None:
            raise UsernameAlreadyExistsError("Username already exists")

        user = User(
            id=uuid4(),
            username=msg.username,
            password_hash=hash_password(msg.password),
        )
        return [UserCreated(user=user)]
