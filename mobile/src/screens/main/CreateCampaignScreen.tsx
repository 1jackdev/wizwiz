import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { createCampaign } from '../../api/campaign';
import { useAuth } from '../../context/AuthContext';
import { CampaignStackParamList } from '../../navigation/CampaignsNavigator';
import { colors } from '../../theme';

type Props = NativeStackScreenProps<CampaignStackParamList, 'CreateCampaign'>;

export default function CreateCampaignScreen({ navigation }: Props) {
  const { userId } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate() {
    if (!userId || name.trim().length < 2) return;
    setLoading(true);
    setError('');
    try {
      await createCampaign(userId, {
        name: name.trim(),
        level: Number(level) || 1,
        description: description.trim() || null,
      });
      navigation.goBack();
    } catch (e: any) {
      setError(e.message ?? 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  }

  const isValid = name.trim().length >= 2;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Campaign name"
        placeholderTextColor={colors.textMuted}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Starting level"
        placeholderTextColor={colors.textMuted}
        keyboardType="number-pad"
        value={level}
        onChangeText={(t) => setLevel(t.replace(/[^0-9]/g, ''))}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Description (optional)"
        placeholderTextColor={colors.textMuted}
        multiline
        value={description}
        onChangeText={setDescription}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity
        style={[styles.button, !isValid && styles.buttonDisabled]}
        onPress={handleCreate}
        disabled={!isValid || loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Create</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: colors.bg },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: colors.bgInput,
    color: colors.text,
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { backgroundColor: colors.accentDisabled },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  error: { color: colors.error, marginBottom: 8, textAlign: 'center' },
});
