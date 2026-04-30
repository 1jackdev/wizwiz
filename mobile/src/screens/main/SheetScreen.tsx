import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CharacterDetail, getCharacter } from '../../api/character';
import { useCurrentCharacter } from '../../context/CurrentCharacterContext';
import { useTheme } from '../../context/ThemeContext';
import { ColorScheme } from '../../theme';

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

export default function SheetScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const insets = useSafeAreaInsets();
  const { currentCharacterId, currentCharacterName } = useCurrentCharacter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [character, setCharacter] = useState<CharacterDetail | null>(null);

  useEffect(() => {
    if (!currentCharacterId) {
      setCharacter(null);
      return;
    }
    setLoading(true);
    setError('');
    getCharacter(currentCharacterId)
      .then(setCharacter)
      .catch((e: any) => setError(e.message ?? 'Failed to load'))
      .finally(() => setLoading(false));
  }, [currentCharacterId]);

  if (!currentCharacterId) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.empty}>Select a character on the Characters tab first.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!character) return null;

  const savingThrowMap = Object.fromEntries(
    character.saving_throws.map((st) => [st.ability, st.value]),
  );

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
    >
      <View style={styles.headerRow}>
        <Text style={styles.characterName} numberOfLines={1}>
          {currentCharacterName}
        </Text>
        <View style={styles.profChip}>
          <Text style={styles.profLabel}>PROF</Text>
          <Text style={styles.profValue}>{formatSigned(character.proficiency_bonus)}</Text>
        </View>
      </View>

      <Text style={styles.sectionHeader}>Abilities</Text>
      <View style={styles.abilityGrid}>
        {character.abilities.map((ability) => (
          <View key={ability.name} style={styles.abilityCard}>
            <Text style={styles.abilityAbbrev}>{ABILITY_ABBREV[ability.name] ?? ability.name}</Text>
            <Text style={styles.abilityScore}>{ability.score}</Text>
            <Text style={styles.abilityModifier}>{formatSigned(ability.modifier)}</Text>
            <View style={styles.divider} />
            <Text style={styles.saveLabel}>Save</Text>
            <Text style={styles.saveValue}>{formatSigned(savingThrowMap[ability.name] ?? 0)}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionHeader}>Skills</Text>
      <View style={styles.skillsCard}>
        {character.skills.map((skill, i) => (
          <View
            key={skill.name}
            style={[styles.skillRow, i < character.skills.length - 1 && styles.skillRowBorder]}
          >
            <Text style={styles.profSymbol}>{PROFICIENCY_SYMBOL[skill.proficiency] ?? '○'}</Text>
            <View style={styles.skillMiddle}>
              <Text style={styles.skillName}>{toTitleCase(skill.name)}</Text>
              <Text style={styles.skillAbility}>
                {ABILITY_ABBREV[skill.ability] ?? skill.ability}
              </Text>
            </View>
            <Text style={styles.skillModifier}>{formatSigned(skill.modifier)}</Text>
            <View style={styles.passiveChip}>
              <Text style={styles.passiveLabel}>PASS</Text>
              <Text style={styles.passiveValue}>{skill.passive_score}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: ColorScheme) =>
  StyleSheet.create({
    scroll: { flex: 1, backgroundColor: colors.bg },
    content: { paddingHorizontal: 16, paddingBottom: 40 },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.bg,
      padding: 24,
    },
    empty: { color: colors.textSecondary, fontSize: 14, textAlign: 'center' },
    errorText: { color: colors.error, fontSize: 14, textAlign: 'center' },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    characterName: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      flexShrink: 1,
      marginRight: 8,
    },
    profChip: {
      backgroundColor: colors.bgCard,
      borderRadius: 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      paddingHorizontal: 12,
      paddingVertical: 6,
      alignItems: 'center',
    },
    profLabel: {
      fontSize: 9,
      fontWeight: '700',
      color: colors.textMuted,
      letterSpacing: 1,
    },
    profValue: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.accent,
    },
    sectionHeader: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 10,
      marginTop: 4,
    },
    abilityGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginBottom: 24,
    },
    abilityCard: {
      width: '30%',
      flexGrow: 1,
      backgroundColor: colors.bgCard,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      alignItems: 'center',
      paddingVertical: 16,
      gap: 3,
    },
    abilityAbbrev: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    abilityScore: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.text,
    },
    abilityModifier: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.accent,
    },
    divider: {
      width: '60%',
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
      marginVertical: 4,
    },
    saveLabel: {
      fontSize: 9,
      fontWeight: '600',
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    saveValue: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    skillsCard: {
      backgroundColor: colors.bgCard,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    skillRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 12,
      gap: 12,
    },
    skillRowBorder: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    profSymbol: {
      width: 18,
      fontSize: 13,
      color: colors.accent,
      textAlign: 'center',
    },
    skillMiddle: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    skillName: { fontSize: 15, color: colors.text },
    skillAbility: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.textMuted,
      letterSpacing: 0.5,
    },
    skillModifier: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.accent,
      minWidth: 28,
      textAlign: 'right',
    },
    passiveChip: {
      alignItems: 'center',
      backgroundColor: colors.bgInput,
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 3,
      marginLeft: 4,
    },
    passiveLabel: {
      fontSize: 8,
      fontWeight: '700',
      color: colors.textMuted,
      letterSpacing: 0.8,
    },
    passiveValue: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textSecondary,
    },
  });
