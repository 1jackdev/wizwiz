import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { joinCampaign } from '../../api/campaign';
import { CharacterSummary, listCharacters } from '../../api/character';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { CharacterStackParamList } from '../../navigation/CharactersNavigator';
import { ColorScheme } from '../../theme';
import { CharacterClass } from '../../types';

type Props = NativeStackScreenProps<CharacterStackParamList, 'JoinCampaign'>;

export default function JoinCampaignScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { userId } = useAuth();
  const [characters, setCharacters] = useState<CharacterSummary[]>([]);
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!userId) return;
    listCharacters(userId)
      .then((list) => {
        setCharacters(list.filter((_) => true));
        if (list.length > 0) setSelectedCharId(list[0].id);
      })
      .catch((e: any) => setError(e.message ?? 'Failed to load characters'));
  }, [userId]);

  async function handleJoin() {
    if (!selectedCharId || !code.trim()) return;
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const campaign = await joinCampaign(code.trim(), selectedCharId);
      setSuccess(`Joined "${campaign.name}"`);
      setTimeout(() => navigation.goBack(), 800);
    } catch (e: any) {
      setError(e.message ?? 'Failed to join campaign');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Invite Code</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter code from DM"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
        value={code}
        onChangeText={setCode}
      />

      <Text style={styles.label}>Character</Text>
      {characters.length === 0 ? (
        <Text style={styles.empty}>Create a character first.</Text>
      ) : (
        <FlatList
          data={characters}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.charRow, selectedCharId === item.id && styles.charRowSelected]}
              onPress={() => setSelectedCharId(item.id)}
            >
              <Text style={styles.charName}>{item.name}</Text>
              <Text style={styles.charSub}>
                {CharacterClass[item.character_class as keyof typeof CharacterClass] ??
                  item.character_class}{' '}
                · Level {item.level}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}

      <TouchableOpacity
        style={[styles.button, (!selectedCharId || !code.trim()) && styles.buttonDisabled]}
        onPress={handleJoin}
        disabled={loading || !selectedCharId || !code.trim()}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Join Campaign</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colors: ColorScheme) => StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.bg, gap: 12 },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: colors.bgInput,
    color: colors.text,
  },
  empty: { color: colors.textMuted, fontSize: 14 },
  charRow: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    marginBottom: 8,
  },
  charRowSelected: { borderColor: colors.accent, backgroundColor: '#1e1b4b' },
  charName: { color: colors.text, fontSize: 16, fontWeight: '600' },
  charSub: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { backgroundColor: colors.accentDisabled },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  error: { color: colors.error, textAlign: 'center' },
  success: { color: colors.success, textAlign: 'center' },
});
