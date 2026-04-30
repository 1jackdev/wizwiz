import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { DieSelection, DieType } from './DiceContext';
import { useDice } from './DiceContext';
import { getDieComponent } from './shapes';
import type { CharacterDetail } from '../../api/character';
import { useTheme } from '../../context/ThemeContext';
import type { ColorScheme } from '../../theme';

interface DiceSelectionSheetProps {
  visible: boolean;
  onRoll: (selections: DieSelection[]) => void;
  onClose: () => void;
  character?: CharacterDetail;
}

const DIE_TYPES: DieType[] = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'];

const DIE_MAX: Record<DieType, number> = {
  d4: 4, d6: 6, d8: 8, d10: 10, d12: 12, d20: 20,
};

type CheckType = 'attack' | 'ability' | 'save';

const CHECK_TYPES: { key: CheckType; label: string }[] = [
  { key: 'attack', label: 'Attack' },
  { key: 'ability', label: 'Ability' },
  { key: 'save', label: 'Save' },
];

const ABILITY_ABBREV: Record<string, string> = {
  STRENGTH: 'STR',
  DEXTERITY: 'DEX',
  CONSTITUTION: 'CON',
  INTELLIGENCE: 'INT',
  WISDOM: 'WIS',
  CHARISMA: 'CHA',
};

type CountsMap = Record<DieType, number>;
const initialCounts = (): CountsMap => ({ d4: 0, d6: 0, d8: 0, d10: 0, d12: 0, d20: 0 });


export default function DiceSelectionSheet({ visible, onRoll, onClose, character }: DiceSelectionSheetProps) {
  const { colors } = useTheme();
  const { setPendingModifier } = useDice();
  const [counts, setCounts] = useState<CountsMap>(initialCounts());
  const [checkType, setCheckType] = useState<CheckType | null>(null);
  const [selectedAbility, setSelectedAbility] = useState<string | null>(null);
  const slideAnim = useRef(new Animated.Value(400)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 400,
        duration: 260,
        useNativeDriver: true,
      }).start();
      setCheckType(null);
      setSelectedAbility(null);
    }
  }, [visible, slideAnim]);

  const handleCheckTypePress = useCallback((type: CheckType) => {
    setCheckType((prev) => (prev === type ? null : type));
    setSelectedAbility(null);
  }, []);

  const totalDice = DIE_TYPES.reduce((sum, t) => sum + counts[t], 0);
  const summaryText = DIE_TYPES.filter((t) => counts[t] > 0)
    .map((t) => `${counts[t]}${t}`)
    .join(' + ');

  const handleRoll = useCallback(() => {
    if (checkType === 'attack') {
      setPendingModifier({ label: 'ATK', value: 0 });
    } else if (checkType === 'ability' && selectedAbility && character) {
      const ability = character.abilities.find((a) => a.name === selectedAbility);
      if (ability) {
        setPendingModifier({ label: ABILITY_ABBREV[ability.name] ?? ability.name, value: ability.modifier });
      }
    } else if (checkType === 'save' && selectedAbility && character) {
      const st = character.saving_throws.find((s) => s.ability === selectedAbility);
      if (st) {
        setPendingModifier({ label: `${ABILITY_ABBREV[selectedAbility] ?? selectedAbility} Save`, value: st.value });
      }
    }

    const selections = DIE_TYPES.filter((t) => counts[t] > 0).map((t) => ({ type: t, count: counts[t] }));
    setCounts(initialCounts());
    setCheckType(null);
    setSelectedAbility(null);
    onRoll(selections);
  }, [checkType, selectedAbility, character, counts, onRoll, setPendingModifier]);

  const styles = createStyles(colors);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>

            <Text style={styles.title}>Select Dice</Text>

            <View style={styles.diceSection}>
              {totalDice > 0 && <Text style={styles.summary}>{summaryText}</Text>}
              {DIE_TYPES.map((dieType) => {
                const DieComponent = getDieComponent(dieType);
                return (
                  <View key={dieType} style={styles.row}>
                    <DieComponent size={44} value={DIE_MAX[dieType]} />
                    <Text style={styles.dieLabel}>{dieType.toUpperCase()}</Text>
                    <View style={styles.spacer} />
                    <TouchableOpacity
                      style={styles.counterBtn}
                      onPress={() => setCounts((prev) => ({ ...prev, [dieType]: Math.max(prev[dieType] - 1, 0) }))}
                    >
                      <Text style={styles.counterBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.countText}>{counts[dieType]}</Text>
                    <TouchableOpacity
                      style={styles.counterBtn}
                      onPress={() => setCounts((prev) => ({ ...prev, [dieType]: Math.min(prev[dieType] + 1, 20) }))}
                    >
                      <Text style={styles.counterBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>

            {character && (
              <View style={styles.checkSection}>
                <Text style={styles.checkLabel}>CHECK</Text>
                <View style={styles.chipRow}>
                  {CHECK_TYPES.map((ct) => (
                    <TouchableOpacity
                      key={ct.key}
                      style={[styles.chip, checkType === ct.key && styles.chipSelected]}
                      onPress={() => handleCheckTypePress(ct.key)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.chipText, checkType === ct.key && styles.chipTextSelected]}>
                        {ct.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {(checkType === 'ability' || checkType === 'save') && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.subRow}
                    contentContainerStyle={styles.subRowContent}
                  >
                    {character.abilities.map((a) => (
                      <TouchableOpacity
                        key={a.name}
                        style={[styles.chip, selectedAbility === a.name && styles.chipSelected]}
                        onPress={() => setSelectedAbility((prev) => (prev === a.name ? null : a.name))}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.chipText, selectedAbility === a.name && styles.chipTextSelected]}>
                          {ABILITY_ABBREV[a.name] ?? a.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            )}

            <TouchableOpacity
              style={[styles.rollBtn, totalDice === 0 && styles.rollBtnDisabled]}
              onPress={handleRoll}
              disabled={totalDice === 0}
              activeOpacity={0.8}
            >
              <Text style={styles.rollBtnText}>{totalDice > 0 ? `Roll ${summaryText}` : 'Roll'}</Text>
            </TouchableOpacity>

            <View style={styles.bottomPad} />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: ColorScheme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    backdrop: {
      flex: 1,
    },
    sheet: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.bgCard,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '90%',
    },
    handleContainer: {
      alignItems: 'center',
      paddingTop: 12,
      paddingBottom: 4,
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
    },
    title: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '700',
      textAlign: 'center',
      paddingVertical: 12,
    },
    diceSection: {
      paddingHorizontal: 20,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
    },
    dieLabel: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 12,
      width: 36,
    },
    spacer: {
      flex: 1,
    },
    counterBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    counterBtnText: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 22,
    },
    countText: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '700',
      width: 36,
      textAlign: 'center',
    },
    summary: {
      color: colors.accent,
      fontSize: 15,
      textAlign: 'center',
      marginTop: 8,
      marginBottom: 4,
    },
    checkSection: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 4,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      marginTop: 8,
    },
    checkLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.textMuted,
      letterSpacing: 1,
      marginBottom: 10,
    },
    chipRow: {
      flexDirection: 'row',
      gap: 8,
      flexWrap: 'wrap',
    },
    subRow: {
      marginTop: 10,
    },
    subRowContent: {
      gap: 8,
      paddingRight: 4,
    },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: colors.bgInput,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipSelected: {
      backgroundColor: colors.accentDisabled,
      borderColor: colors.accent,
    },
    chipText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    chipTextSelected: {
      color: colors.text,
    },
    rollBtn: {
      backgroundColor: colors.accent,
      borderRadius: 12,
      paddingVertical: 14,
      marginHorizontal: 20,
      marginTop: 16,
      alignItems: 'center',
    },
    rollBtnDisabled: {
      opacity: 0.4,
    },
    rollBtnText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '700',
    },
    bottomPad: {
      height: 34,
    },
  });
