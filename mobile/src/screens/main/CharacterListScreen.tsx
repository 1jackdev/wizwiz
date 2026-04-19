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

import { CharacterSummary, listCharacters } from '../../api/character';
import { useAuth } from '../../context/AuthContext';
import { useCurrentCharacter } from '../../context/CurrentCharacterContext';
import { CharacterStackParamList } from '../../navigation/CharactersNavigator';
import { colors } from '../../theme';
import { CharacterClass, Species } from '../../types';

type Props = NativeStackScreenProps<CharacterStackParamList, 'CharacterList'>;

export default function CharacterListScreen({ navigation }: Props) {
  const { userId } = useAuth();
  const { currentCharacterId, setCurrentCharacter } = useCurrentCharacter();
  const [characters, setCharacters] = useState<CharacterSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCharacters = useCallback(async () => {
    if (!userId) return;
    try {
      setError('');
      const data = await listCharacters(userId);
      setCharacters(data);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load characters');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchCharacters);
    return unsubscribe;
  }, [navigation, fetchCharacters]);

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

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

      {characters.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No characters yet.</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('CreateCharacter')}
          >
            <Text style={styles.buttonText}>Create Character</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <TouchableOpacity
            style={styles.joinButton}
            onPress={() => navigation.navigate('JoinCampaign')}
          >
            <Text style={styles.joinButtonText}>Join Campaign with Code</Text>
          </TouchableOpacity>
          <FlatList
            data={characters}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const isCurrent = item.id === currentCharacterId;
              return (
                <TouchableOpacity
                  style={[styles.card, isCurrent && styles.cardCurrent]}
                  onPress={() =>
                    navigation.navigate('CharacterDetail', {
                      characterId: item.id,
                      name: item.name,
                    })
                  }
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardName}>{item.name}</Text>
                    {isCurrent ? (
                      <View style={styles.currentBadge}>
                        <Text style={styles.currentBadgeText}>CURRENT</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.setCurrentButton}
                        onPress={() => setCurrentCharacter(item.id, item.name)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={styles.setCurrentText}>Set Current</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={styles.cardSub}>
                    {CharacterClass[item.character_class as keyof typeof CharacterClass]} ·{' '}
                    {Species[item.species as keyof typeof Species]} · Level {item.level}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
          <TouchableOpacity
            style={styles.fab}
            onPress={() => navigation.navigate('CreateCharacter')}
          >
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  emptyText: { fontSize: 16, color: colors.textSecondary, marginBottom: 20 },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardCurrent: {
    borderColor: colors.accent,
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardName: { fontSize: 18, fontWeight: '600', color: colors.text, flexShrink: 1, marginRight: 8 },
  cardSub: { fontSize: 14, color: colors.textSecondary },
  currentBadge: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  currentBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  setCurrentButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  setCurrentText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
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
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 32 },
  error: { color: colors.error, textAlign: 'center', margin: 16 },
  joinButton: {
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    alignItems: 'center',
  },
  joinButtonText: { color: colors.text, fontSize: 14, fontWeight: '600' },
});
