import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CharacterDetail, getCharacter } from '../../api/character';
import { CharacterStackParamList } from '../../navigation/CharactersNavigator';
import { colors } from '../../theme';

type Props = NativeStackScreenProps<CharacterStackParamList, 'Abilities'>;

const ABILITY_ABBREV: Record<string, string> = {
  STRENGTH: 'STR',
  DEXTERITY: 'DEX',
  CONSTITUTION: 'CON',
  INTELLIGENCE: 'INT',
  WISDOM: 'WIS',
  CHARISMA: 'CHA',
};

function formatSigned(n: number): string {
  return n >= 0 ? `+${n}` : String(n);
}

export default function AbilitiesScreen({ route }: Props) {
  const { characterId } = route.params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [abilities, setAbilities] = useState<CharacterDetail['abilities']>([]);
  const [savingThrows, setSavingThrows] = useState<CharacterDetail['saving_throws']>([]);

  useEffect(() => {
    getCharacter(characterId)
      .then((c) => {
        setAbilities(c.abilities);
        setSavingThrows(c.saving_throws);
      })
      .catch((e: any) => setError(e.message ?? 'Failed to load'))
      .finally(() => setLoading(false));
  }, [characterId]);

  const savingThrowMap = Object.fromEntries(savingThrows.map((st) => [st.ability, st.value]));

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
    <ScrollView style={styles.scroll} contentContainerStyle={styles.grid}>
      {abilities.map((ability) => (
        <View key={ability.name} style={styles.card}>
          <Text style={styles.abbrev}>{ABILITY_ABBREV[ability.name] ?? ability.name}</Text>
          <Text style={styles.score}>{ability.score}</Text>
          <Text style={styles.modifier}>{formatSigned(ability.modifier)}</Text>
          <View style={styles.divider} />
          <Text style={styles.saveLabel}>Save</Text>
          <Text style={styles.saveValue}>{formatSigned(savingThrowMap[ability.name] ?? 0)}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  scroll: { flex: 1, backgroundColor: colors.bg },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  card: {
    width: '30%',
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    paddingVertical: 20,
    gap: 4,
  },
  abbrev: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  score: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.text,
  },
  modifier: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
  },
  divider: {
    width: '60%',
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: 6,
  },
  saveLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  saveValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  error: {
    color: colors.error,
    fontSize: 16,
  },
});
