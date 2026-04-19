from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.orm import Session

from app.database.mappers import character_from_orm, character_to_orm
from app.database.models import CharacterORM
from app.domain.abstractions import CharacterRepo
from app.domain.models.character import Character
from app.domain.types import ProficiencyLevel


class CharacterDB(CharacterRepo):
    def __init__(self, db: Session):
        self.db = db

    def create_character(self, character: Character) -> None:
        existing = self.db.get(CharacterORM, character.id)
        if existing is not None:
            raise ValueError("Character already exists")

        orm = character_to_orm(character)

        self.db.add(orm)
        self.db.commit()

    def get_by_id(self, character_id: UUID) -> Character | None:
        orm = self.db.query(CharacterORM).filter_by(id=character_id).one_or_none()
        if orm is None:
            return None
        return character_from_orm(orm)

    def get_by_name(self, name: str) -> Character | None:
        orm = self.db.query(CharacterORM).filter_by(name=name).one_or_none()
        if orm is None:
            return None
        return character_from_orm(orm)

    def get_by_user_id(self, user_id: UUID) -> list[Character]:
        orms = (
            self.db.query(CharacterORM)
            .filter_by(user_id=user_id)
            .filter(CharacterORM.deleted_at.is_(None))
            .all()
        )
        return [character_from_orm(orm) for orm in orms]

    def get_player_characters_by_user_id(self, user_id: UUID) -> list[Character]:
        orms = (
            self.db.query(CharacterORM)
            .filter_by(user_id=user_id, is_npc=False)
            .filter(CharacterORM.deleted_at.is_(None))
            .all()
        )
        return [character_from_orm(orm) for orm in orms]

    def get_npcs_by_dm_id(self, dm_id: UUID) -> list[Character]:
        orms = (
            self.db.query(CharacterORM)
            .filter_by(user_id=dm_id, is_npc=True)
            .filter(CharacterORM.deleted_at.is_(None))
            .all()
        )
        return [character_from_orm(orm) for orm in orms]

    def update_character(self, character: Character) -> None:
        orm = self.db.get(CharacterORM, character.id)
        if orm is None:
            raise ValueError("Character not found")
        orm.name = character.name
        orm.character_class = character.character_class
        orm.species = character.species
        orm.level = character.level
        orm.experience_points = character.experience_points

        ability_map = {a.ability_name: a for a in orm.abilities}
        for ability in character.abilities:
            existing_ability = ability_map.get(ability.name.value)
            if existing_ability:
                existing_ability.score = ability.score
                existing_ability.modifier = ability.modifier

        skill_map = {s.skill_name: s for s in orm.skills}
        for skill in character.skills:
            existing_skill = skill_map.get(skill.name.value)
            if existing_skill:
                existing_skill.proficiency_level = ProficiencyLevel.to_int(
                    skill.proficiency
                )
                existing_skill.passive_score = skill.passive_score

        self.db.commit()

    def delete_character(self, character_id: UUID) -> None:
        orm = self.db.get(CharacterORM, character_id)
        if orm is None:
            raise ValueError("Character not found")
        orm.deleted_at = datetime.now(timezone.utc)
        self.db.commit()

    def search_by_name(self, name: str) -> Character | None:
        orm = (
            self.db.query(CharacterORM)
            .filter(CharacterORM.name.contains(name))
            .one_or_none()
        )
        if orm is None:
            return None
        return character_from_orm(orm)
