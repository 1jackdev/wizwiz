import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { CharacterSummary } from '../../api/character';
import { listNpcs } from '../../api/npc';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { NpcStackParamList } from '../../navigation/NpcsNavigator';
import { ColorScheme } from '../../theme';
import { CharacterClass, Species } from '../../types';

type Props = NativeStackScreenProps<NpcStackParamList, 'NpcList'>;

export default function NpcListScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { userId } = useAuth();
  const [npcs, setNpcs] = useState<CharacterSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      setError('');
      const data = await listNpcs(userId);
      setNpcs(data);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load NPCs');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation, load]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {npcs.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No NPCs yet.</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('CreateNpc')}
          >
            <Text style={styles.buttonText}>Create NPC</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={npcs}
            keyExtractor={(i) => i.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() =>
                  navigation.navigate('NpcDetail', {
                    characterId: item.id,
                    name: item.name,
                  })
                }
              >
                <Text style={styles.cardName}>{item.name}</Text>
                <Text style={styles.cardSub}>
                  {CharacterClass[item.character_class as keyof typeof CharacterClass] ??
                    item.character_class}{' '}
                  · {Species[item.species as keyof typeof Species] ?? item.species}{' '}
                  · Level {item.level}
                </Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            style={styles.fab}
            onPress={() => navigation.navigate('CreateNpc')}
          >
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const createStyles = (colors: ColorScheme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  emptyText: { fontSize: 16, color: colors.textSecondary, marginBottom: 20 },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardName: { fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 4 },
  cardSub: { fontSize: 14, color: colors.textSecondary },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 32 },
  error: { color: colors.error, textAlign: 'center', margin: 16 },
});
