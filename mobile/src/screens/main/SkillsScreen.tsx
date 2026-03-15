import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CharacterDetail, getCharacter } from '../../api/character';
import { CharacterStackParamList } from '../../navigation/CharactersNavigator';
import { colors } from '../../theme';

type Props = NativeStackScreenProps<CharacterStackParamList, 'Skills'>;

const ABILITY_ABBREV: Record<string, string> = {
  STRENGTH: 'STR',
  DEXTERITY: 'DEX',
  CONSTITUTION: 'CON',
  INTELLIGENCE: 'INT',
  WISDOM: 'WIS',
  CHARISMA: 'CHA',
};

const PROFICIENCY_SYMBOL: Record<string, string> = {
  NONE: '○',
  HALF: '◑',
  PROFICIENT: '●',
  EXPERT: '◆',
};

function formatSigned(n: number): string {
  return n >= 0 ? `+${n}` : String(n);
}

function toTitleCase(s: string): string {
  return s
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function SkillsScreen({ route }: Props) {
  const { characterId } = route.params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [skills, setSkills] = useState<CharacterDetail['skills']>([]);

  useEffect(() => {
    getCharacter(characterId)
      .then((c) => setSkills(c.skills))
      .catch((e: any) => setError(e.message ?? 'Failed to load'))
      .finally(() => setLoading(false));
  }, [characterId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll}>
      {skills.map((skill, i) => (
        <View key={skill.name} style={[styles.row, i < skills.length - 1 && styles.rowBorder]}>
          <Text style={styles.profSymbol}>{PROFICIENCY_SYMBOL[skill.proficiency] ?? '○'}</Text>
          <View style={styles.middle}>
            <Text style={styles.skillName}>{toTitleCase(skill.name)}</Text>
            <Text style={styles.abilityTag}>{ABILITY_ABBREV[skill.ability] ?? skill.ability}</Text>
          </View>
          <Text style={styles.modifier}>{formatSigned(skill.modifier)}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  scroll: { flex: 1, backgroundColor: colors.bg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  profSymbol: {
    width: 20,
    fontSize: 14,
    color: colors.accent,
    textAlign: 'center',
  },
  middle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  skillName: {
    fontSize: 16,
    color: colors.text,
  },
  abilityTag: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  modifier: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.accent,
    minWidth: 32,
    textAlign: 'right',
  },
  error: {
    color: colors.error,
    fontSize: 16,
  },
});
