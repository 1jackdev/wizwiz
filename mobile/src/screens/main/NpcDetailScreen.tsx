import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  CharacterDetail,
  getCharacter,
} from '../../api/character';
import { api } from '../../api/client';
import { useTheme } from '../../context/ThemeContext';
import { NpcStackParamList } from '../../navigation/NpcsNavigator';
import { ColorScheme } from '../../theme';
import { CharacterClass, Species } from '../../types';

type Props = NativeStackScreenProps<NpcStackParamList, 'NpcDetail'>;

export default function NpcDetailScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { characterId } = route.params;
  const [npc, setNpc] = useState<CharacterDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getCharacter(characterId)
      .then(setNpc)
      .catch((e: any) => setError(e.message ?? 'Failed to load'))
      .finally(() => setLoading(false));
  }, [characterId]);

  function confirmDelete() {
    Alert.alert('Delete NPC', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/character/${characterId}/delete`);
            navigation.goBack();
          } catch (e: any) {
            Alert.alert('Error', e.message ?? 'Failed to delete');
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }
  if (!npc) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error || 'Not found'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>Class</Text>
          <Text style={styles.value}>
            {CharacterClass[npc.character_class as keyof typeof CharacterClass] ??
              npc.character_class}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Species</Text>
          <Text style={styles.value}>
            {Species[npc.species as keyof typeof Species] ?? npc.species}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Level</Text>
          <Text style={styles.value}>{npc.level}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>XP</Text>
          <Text style={styles.value}>{npc.experience_points}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Abilities</Text>
        {npc.abilities.map((a) => (
          <View key={a.name} style={styles.row}>
            <Text style={styles.label}>{a.name}</Text>
            <Text style={styles.value}>
              {a.score} ({a.modifier >= 0 ? '+' : ''}
              {a.modifier})
            </Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.dangerButton} onPress={confirmDelete}>
        <Text style={styles.dangerButtonText}>Delete NPC</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const createStyles = (colors: ColorScheme) => StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  container: { padding: 20, gap: 16 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  section: {
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  sectionHeader: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { color: colors.textSecondary, fontSize: 15 },
  value: { color: colors.text, fontSize: 15, fontWeight: '600' },
  dangerButton: {
    backgroundColor: '#2d0a0a',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.error,
  },
  dangerButtonText: { color: colors.error, fontSize: 15, fontWeight: '600' },
  error: { color: colors.error },
});
