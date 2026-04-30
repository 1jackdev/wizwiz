import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { createCharacter } from '../../api/character';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { CharacterStackParamList } from '../../navigation/CharactersNavigator';
import { ColorScheme } from '../../theme';
import { CharacterClass, Species } from '../../types';

type Props = NativeStackScreenProps<CharacterStackParamList, 'CreateCharacter'>;

const CHARACTER_CLASS_OPTIONS = Object.values(CharacterClass);
const SPECIES_OPTIONS = Object.values(Species);

interface PickerProps {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}

function PickerField({ label, value, options, onChange }: PickerProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [visible, setVisible] = useState(false);
  return (
    <>
      <TouchableOpacity style={styles.pickerButton} onPress={() => setVisible(true)}>
        <Text style={[styles.pickerText, !value && styles.placeholder]}>
          {value ? value : `Select ${label}`}
        </Text>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <TouchableOpacity style={styles.modalSheet} activeOpacity={1} onPress={() => {}}>
            <Text style={styles.modalTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.optionRow, item === value && styles.optionSelected]}
                  onPress={() => {
                    onChange(item);
                    setVisible(false);
                  }}
                >
                  <Text style={[styles.optionText, item === value && styles.optionTextSelected]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.cancelButton} onPress={() => setVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

export default function CreateCharacterScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { userId } = useAuth();
  const [name, setName] = useState('');
  const [characterClass, setCharacterClass] = useState('');
  const [species, setSpecies] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate() {
    if (!name.trim() || !characterClass || !species || !userId) return;
    setError('');
    setLoading(true);
    try {
      await createCharacter({
        name: name.trim(),
        character_class:
          Object.entries(CharacterClass).find(([, v]) => v === characterClass)?.[0] ??
          characterClass,
        species: Object.entries(Species).find(([, v]) => v === species)?.[0] ?? species,
        user_id: userId,
      });
      navigation.goBack();
    } catch (e: any) {
      setError(e.message ?? 'Failed to create character');
    } finally {
      setLoading(false);
    }
  }

  const isValid = name.trim().length >= 2 && characterClass && species;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Character name"
        placeholderTextColor={colors.textMuted}
        value={name}
        onChangeText={setName}
      />

      <PickerField
        label="Class"
        value={characterClass}
        options={CHARACTER_CLASS_OPTIONS}
        onChange={setCharacterClass}
      />

      <PickerField
        label="Species"
        value={species}
        options={SPECIES_OPTIONS}
        onChange={setSpecies}
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

const createStyles = (colors: ColorScheme) => StyleSheet.create({
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
  pickerButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.bgInput,
  },
  pickerText: { fontSize: 16, color: colors.text },
  placeholder: { color: colors.textMuted },
  chevron: { fontSize: 20, color: colors.textMuted },
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalSheet: {
    backgroundColor: colors.bgModal,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
    color: colors.text,
  },
  optionRow: { paddingVertical: 14, paddingHorizontal: 24 },
  optionSelected: { backgroundColor: '#1e1b4b' },
  optionText: { fontSize: 16, color: colors.text },
  optionTextSelected: { color: colors.accent, fontWeight: '600' },
  cancelButton: {
    paddingVertical: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelText: { fontSize: 16, color: colors.textSecondary },
});
