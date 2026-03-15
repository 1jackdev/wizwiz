from app.domain.types import (
    AbilityName,
    CharacterClass,
    CharacterSpecies,
    SkillName,
)

STANDARD_ARRAY = [15, 14, 13, 12, 10, 8]

CLASS_ABILITY_PRIORITY: dict[CharacterClass, list[AbilityName]] = {
    CharacterClass.BARBARIAN: [
        AbilityName.STRENGTH,
        AbilityName.CONSTITUTION,
        AbilityName.DEXTERITY,
        AbilityName.WISDOM,
        AbilityName.INTELLIGENCE,
        AbilityName.CHARISMA,
    ],
    CharacterClass.BARD: [
        AbilityName.CHARISMA,
        AbilityName.DEXTERITY,
        AbilityName.CONSTITUTION,
        AbilityName.INTELLIGENCE,
        AbilityName.WISDOM,
        AbilityName.STRENGTH,
    ],
    CharacterClass.CLERIC: [
        AbilityName.WISDOM,
        AbilityName.CONSTITUTION,
        AbilityName.STRENGTH,
        AbilityName.INTELLIGENCE,
        AbilityName.CHARISMA,
        AbilityName.DEXTERITY,
    ],
    CharacterClass.DRUID: [
        AbilityName.WISDOM,
        AbilityName.CONSTITUTION,
        AbilityName.INTELLIGENCE,
        AbilityName.DEXTERITY,
        AbilityName.CHARISMA,
        AbilityName.STRENGTH,
    ],
    CharacterClass.FIGHTER: [
        AbilityName.STRENGTH,
        AbilityName.CONSTITUTION,
        AbilityName.DEXTERITY,
        AbilityName.WISDOM,
        AbilityName.INTELLIGENCE,
        AbilityName.CHARISMA,
    ],
    CharacterClass.MONK: [
        AbilityName.DEXTERITY,
        AbilityName.WISDOM,
        AbilityName.CONSTITUTION,
        AbilityName.STRENGTH,
        AbilityName.INTELLIGENCE,
        AbilityName.CHARISMA,
    ],
    CharacterClass.PALADIN: [
        AbilityName.STRENGTH,
        AbilityName.CHARISMA,
        AbilityName.CONSTITUTION,
        AbilityName.WISDOM,
        AbilityName.INTELLIGENCE,
        AbilityName.DEXTERITY,
    ],
    CharacterClass.RANGER: [
        AbilityName.DEXTERITY,
        AbilityName.WISDOM,
        AbilityName.CONSTITUTION,
        AbilityName.STRENGTH,
        AbilityName.INTELLIGENCE,
        AbilityName.CHARISMA,
    ],
    CharacterClass.ROGUE: [
        AbilityName.DEXTERITY,
        AbilityName.INTELLIGENCE,
        AbilityName.CONSTITUTION,
        AbilityName.WISDOM,
        AbilityName.CHARISMA,
        AbilityName.STRENGTH,
    ],
    CharacterClass.SORCERER: [
        AbilityName.CHARISMA,
        AbilityName.CONSTITUTION,
        AbilityName.DEXTERITY,
        AbilityName.INTELLIGENCE,
        AbilityName.WISDOM,
        AbilityName.STRENGTH,
    ],
    CharacterClass.WARLOCK: [
        AbilityName.CHARISMA,
        AbilityName.CONSTITUTION,
        AbilityName.DEXTERITY,
        AbilityName.INTELLIGENCE,
        AbilityName.WISDOM,
        AbilityName.STRENGTH,
    ],
    CharacterClass.WIZARD: [
        AbilityName.INTELLIGENCE,
        AbilityName.CONSTITUTION,
        AbilityName.DEXTERITY,
        AbilityName.WISDOM,
        AbilityName.CHARISMA,
        AbilityName.STRENGTH,
    ],
}

SPECIES_ABILITY_BONUSES: dict[CharacterSpecies, dict[AbilityName, int]] = {
    CharacterSpecies.HUMAN: {a: 1 for a in AbilityName},
    CharacterSpecies.HILL_DWARF: {AbilityName.WISDOM: 1, AbilityName.CONSTITUTION: 2},
    CharacterSpecies.MOUNTAIN_DWARF: {
        AbilityName.STRENGTH: 2,
        AbilityName.CONSTITUTION: 2,
    },
    CharacterSpecies.HIGH_ELF: {AbilityName.DEXTERITY: 2, AbilityName.INTELLIGENCE: 1},
    CharacterSpecies.WOOD_ELF: {AbilityName.DEXTERITY: 2, AbilityName.WISDOM: 1},
    CharacterSpecies.DARK_ELF: {AbilityName.DEXTERITY: 2, AbilityName.CHARISMA: 1},
    CharacterSpecies.LIGHTFOOT_HALFLING: {
        AbilityName.DEXTERITY: 2,
        AbilityName.CHARISMA: 1,
    },
    CharacterSpecies.STOUT_HALFLING: {
        AbilityName.DEXTERITY: 2,
        AbilityName.CONSTITUTION: 1,
    },
    CharacterSpecies.HALF_ELF: {
        AbilityName.CHARISMA: 2,
        AbilityName.INTELLIGENCE: 1,
        AbilityName.WISDOM: 1,
    },
    CharacterSpecies.HALF_ORC: {AbilityName.STRENGTH: 2, AbilityName.CONSTITUTION: 1},
    CharacterSpecies.TIEFLING: {AbilityName.INTELLIGENCE: 1, AbilityName.CHARISMA: 2},
    CharacterSpecies.DRAGONBORN: {AbilityName.STRENGTH: 2, AbilityName.CHARISMA: 1},
    CharacterSpecies.FOREST_GNOME: {
        AbilityName.INTELLIGENCE: 2,
        AbilityName.DEXTERITY: 1,
    },
    CharacterSpecies.ROCK_GNOME: {
        AbilityName.INTELLIGENCE: 2,
        AbilityName.CONSTITUTION: 1,
    },
}

PROFICIENCY_BONUS_BY_LEVEL: dict[int, int] = {
    **{level: 2 for level in range(1, 5)},
    **{level: 3 for level in range(5, 9)},
    **{level: 4 for level in range(9, 13)},
    **{level: 5 for level in range(13, 17)},
    **{level: 6 for level in range(17, 21)},
}

SKILL_ABILITY_MAP: dict[SkillName, AbilityName] = {
    SkillName.ACROBATICS: AbilityName.DEXTERITY,
    SkillName.ANIMAL_HANDLING: AbilityName.WISDOM,
    SkillName.ARCANA: AbilityName.INTELLIGENCE,
    SkillName.ATHLETICS: AbilityName.STRENGTH,
    SkillName.DECEPTION: AbilityName.CHARISMA,
    SkillName.HISTORY: AbilityName.INTELLIGENCE,
    SkillName.INSIGHT: AbilityName.WISDOM,
    SkillName.INTIMIDATION: AbilityName.CHARISMA,
    SkillName.INVESTIGATION: AbilityName.INTELLIGENCE,
    SkillName.MEDICINE: AbilityName.WISDOM,
    SkillName.NATURE: AbilityName.INTELLIGENCE,
    SkillName.PERCEPTION: AbilityName.WISDOM,
    SkillName.PERFORMANCE: AbilityName.CHARISMA,
    SkillName.PERSUASION: AbilityName.CHARISMA,
    SkillName.RELIGION: AbilityName.INTELLIGENCE,
    SkillName.SLEIGHT_OF_HAND: AbilityName.DEXTERITY,
    SkillName.STEALTH: AbilityName.DEXTERITY,
    SkillName.SURVIVAL: AbilityName.WISDOM,
}
