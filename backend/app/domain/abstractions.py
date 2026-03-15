from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.entities import User
from app.domain.models.character import Character


class CharacterRepo(ABC):
    @abstractmethod
    def create_character(self, character: Character) -> None:
        pass

    @abstractmethod
    def get_by_id(self, character_id: UUID) -> Character | None:
        pass

    @abstractmethod
    def get_by_name(self, name: str) -> Character | None:
        pass

    @abstractmethod
    def get_by_user_id(self, user_id: UUID) -> list[Character]:
        pass

    @abstractmethod
    def update_character(self, character: Character) -> None:
        pass

    @abstractmethod
    def delete_character(self, character_id: UUID) -> None:
        pass


class UserRepo(ABC):
    @abstractmethod
    def create_user(self, user: User) -> None:
        pass

    @abstractmethod
    def get_by_id(self, user_id: UUID) -> User | None:
        pass

    @abstractmethod
    def get_by_username(self, username: str) -> User | None:
        pass

    @abstractmethod
    def search_by_username(self, username: str) -> User | None:
        pass
