import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { CharacterDetail, getCharacter, updateCharacter } from '../../api/character';
import { useCurrentCharacter } from '../../context/CurrentCharacterContext';
import { CharacterStackParamList } from '../../navigation/CharactersNavigator';
import { CharacterClass, Species } from '../../types';
import { NavRow, SectionHeader, SelectField, TappableField } from './CharacterDetail/fields';
import { InputModal, StepperModal } from './CharacterDetail/modals';
import { styles } from './CharacterDetail/styles';

type Props = NativeStackScreenProps<CharacterStackParamList, 'CharacterDetail'>;

const CHARACTER_CLASS_OPTIONS = Object.values(CharacterClass ?? {});
const SPECIES_OPTIONS = Object.values(Species ?? {});

export default function CharacterDetailScreen({ route, navigation }: Props) {
  const { characterId } = route.params;
  const { currentCharacterId, setCurrentCharacter } = useCurrentCharacter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const savedOpacity = useRef(new Animated.Value(0)).current;

  const [name, setName] = useState('');
  const [characterClass, setCharacterClass] = useState('');
  const [species, setSpecies] = useState('');
  const [level, setLevel] = useState('');
  const [xp, setXp] = useState('');

  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [levelModalOpen, setLevelModalOpen] = useState(false);
  const [xpModalOpen, setXpModalOpen] = useState(false);

  const original = useRef<CharacterDetail | null>(null);

  useEffect(() => {
    getCharacter(characterId)
      .then((c) => {
        original.current = c;
        setName(c.name);
        setCharacterClass(
          CharacterClass[c.character_class as keyof typeof CharacterClass] ?? c.character_class
        );
        setSpecies(Species[c.species as keyof typeof Species] ?? c.species);
        setLevel(String(c.level));
        setXp(String(c.experience_points));
      })
      .catch((e: any) => setError(e.message ?? 'Failed to load character'))
      .finally(() => setLoading(false));
  }, [characterId]);

  const orig = original.current;
  const hasChanges =
    orig !== null &&
    (name !== orig.name ||
      characterClass !==
        (CharacterClass[orig.character_class as keyof typeof CharacterClass] ??
          orig.character_class) ||
      species !== (Species[orig.species as keyof typeof Species] ?? orig.species) ||
      Number(level) !== orig.level ||
      Number(xp) !== orig.experience_points);

  async function handleSave() {
    if (!hasChanges) return;
    const origVal = original.current;
    if (!origVal) return;

    const changes: Record<string, unknown> = {};
    if (name !== origVal.name) changes.name = name;
    if (
      characterClass !==
      (CharacterClass[origVal.character_class as keyof typeof CharacterClass] ??
        origVal.character_class)
    ) {
      changes.character_class =
        Object.entries(CharacterClass).find(([, v]) => v === characterClass)?.[0] ?? characterClass;
    }
    if (species !== (Species[origVal.species as keyof typeof Species] ?? origVal.species)) {
      changes.species = Object.entries(Species).find(([, v]) => v === species)?.[0] ?? species;
    }
    if (Number(level) !== origVal.level) changes.level = Number(level);
    if (Number(xp) !== origVal.experience_points) changes.experience_points = Number(xp);

    if (Object.keys(changes).length === 0) return;

    setSaving(true);
    setError('');
    try {
      const changed = await updateCharacter(characterId, changes);
      original.current = { ...origVal, ...changes } as CharacterDetail;
      navigation.setOptions({ title: name });
      if (changed) {
        setSaved(true);
        Animated.sequence([
          Animated.timing(savedOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.delay(1600),
          Animated.timing(savedOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start(() => setSaved(false));
      }
    } catch (e: any) {
      setError(e.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            hasChanges && styles.saveButtonActive,
            pressed && hasChanges && { opacity: 0.7 },
          ]}
          onPress={handleSave}
          disabled={saving || !hasChanges}
        >
          {saving ? (
            <ActivityIndicator size="small" />
          ) : (
            <Text style={[styles.saveButtonText, hasChanges && styles.saveButtonTextActive]}>
              Save
            </Text>
          )}
        </Pressable>
      ),
    });
  }, [navigation, saving, hasChanges, name, characterClass, species, level, xp]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {saved && (
        <Animated.View style={[styles.successBanner, { opacity: savedOpacity }]}>
          <Text style={styles.successText}>✓ Saved</Text>
        </Animated.View>
      )}
      {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

      <SectionHeader title="Basic Info" />
      <TappableField label="Name" value={name} onPress={() => setNameModalOpen(true)} />
      {nameModalOpen && (
        <InputModal
          label="Name"
          value={name}
          onConfirm={setName}
          onClose={() => setNameModalOpen(false)}
        />
      )}
      <SelectField
        label="Class"
        value={characterClass}
        options={CHARACTER_CLASS_OPTIONS}
        onChange={setCharacterClass}
      />
      <SelectField
        label="Species"
        value={species}
        options={SPECIES_OPTIONS}
        onChange={setSpecies}
      />
      <TappableField label="Level" value={level} onPress={() => setLevelModalOpen(true)} />
      {levelModalOpen && (
        <StepperModal value={level} onConfirm={setLevel} onClose={() => setLevelModalOpen(false)} />
      )}
      <TappableField label="Experience Points" value={xp} onPress={() => setXpModalOpen(true)} />
      {xpModalOpen && (
        <InputModal
          label="Experience Points"
          value={xp}
          keyboardType="numeric"
          onConfirm={setXp}
          onClose={() => setXpModalOpen(false)}
        />
      )}

      <SectionHeader title="Stats" />
      <NavRow label="Abilities" onPress={() => navigation.navigate('Abilities', { characterId })} />
      <NavRow label="Skills" onPress={() => navigation.navigate('Skills', { characterId })} />

      <TouchableOpacity
        style={[styles.setCurrentButton, currentCharacterId === characterId && styles.setCurrentButtonActive]}
        onPress={() => setCurrentCharacter(characterId, name)}
        disabled={currentCharacterId === characterId}
        activeOpacity={0.8}
      >
        <Text style={styles.setCurrentButtonText}>
          {currentCharacterId === characterId ? '✓ Current Character' : 'Set as Current Character'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
