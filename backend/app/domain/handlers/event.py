from app.database.repos.character import CharacterRepo
from app.domain.abstractions import UserRepo
from app.domain.messages import (
    CharacterCreated,
    CharacterDeleted,
    CharacterUpdated,
    UserCreated,
)


class CreateCharacter:
    def __init__(self, repo: CharacterRepo) -> None:
        self.repo = repo

    def __call__(self, msg: CharacterCreated) -> None:
        self.repo.create_character(character=msg.character)


class UpdateCharacter:
    def __init__(self, repo: CharacterRepo) -> None:
        self.repo = repo

    def __call__(self, msg: CharacterUpdated) -> None:
        self.repo.update_character(character=msg.character)


class DeleteCharacter:
    def __init__(self, repo: CharacterRepo) -> None:
        self.repo = repo

    def __call__(self, msg: CharacterDeleted) -> None:
        self.repo.delete_character(character_id=msg.character.id)


class CreateUser:
    def __init__(self, repo: UserRepo) -> None:
        self.repo = repo

    def __call__(self, msg: UserCreated) -> None:
        self.repo.create_user(user=msg.user)
