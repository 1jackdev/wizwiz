import React, { useState, useCallback } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DiceProvider, useDice } from '../../components/dice/DiceContext';
import type { DieSelection } from '../../components/dice/DiceContext';
import FloatingDiceButton from '../../components/dice/FloatingDiceButton';
import DiceSelectionSheet from '../../components/dice/DiceSelectionSheet';
import DiceRollingView from '../../components/dice/DiceRollingView';
import DiceHistory from '../../components/dice/DiceHistory';
import { useCurrentCharacter } from '../../context/CurrentCharacterContext';

const STANDARD_ACTIONS = [
  'Attack',
  'Cast Spell',
  'Dash',
  'Disengage',
  'Dodge',
  'Help',
  'Hide',
  'Ready',
  'Search',
  'Use Object',
] as const;

type StandardAction = (typeof STANDARD_ACTIONS)[number];

function ActionsContent() {
  const insets = useSafeAreaInsets();
  const { isFabVisible, activeDice, rollState, placeDice, clearDice } = useDice();
  const { currentCharacterName } = useCurrentCharacter();
  const [sheetVisible, setSheetVisible] = useState(false);
  const [inCombat, setInCombat] = useState(false);
  const [round, setRound] = useState<number | null>(null);
  const [turnActive, setTurnActive] = useState(false);
  const [actionUsed, setActionUsed] = useState<StandardAction | null>(null);
  const [bonusUsed, setBonusUsed] = useState(false);
  const [reactionUsed, setReactionUsed] = useState(false);

  const handleFabPress = useCallback(() => {
    if (activeDice.length > 0 || rollState !== 'idle') {
      clearDice();
    }
    setSheetVisible(true);
  }, [activeDice.length, rollState, clearDice]);

  const handleRoll = useCallback(
    (selections: DieSelection[]) => {
      setSheetVisible(false);
      placeDice(selections);
    },
    [placeDice]
  );

  const handleSheetClose = useCallback(() => setSheetVisible(false), []);

  const resetSlots = () => {
    setActionUsed(null);
    setBonusUsed(false);
    setReactionUsed(false);
  };

  const handleToggleCombat = useCallback(() => {
    if (inCombat) {
      Alert.alert(
        'End Combat?',
        'This will clear the current round and action slots.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'End Combat',
            style: 'destructive',
            onPress: () => {
              setInCombat(false);
              setRound(null);
              setTurnActive(false);
              resetSlots();
            },
          },
        ]
      );
    } else {
      setInCombat(true);
      setRound(1);
    }
  }, [inCombat]);

  const handleToggleTurn = useCallback(() => {
    if (turnActive) {
      setTurnActive(false);
      resetSlots();
      setRound((r) => (r ?? 0) + 1);
    } else {
      setTurnActive(true);
    }
  }, [turnActive]);

  const handleAction = useCallback(
    (name: StandardAction) => {
      if (actionUsed) return;
      setActionUsed(name);
    },
    [actionUsed]
  );

  const actionsEnabled = !inCombat || turnActive;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {currentCharacterName ?? 'Actions'}
          </Text>
          <TouchableOpacity
            style={[styles.combatChip, inCombat && styles.combatChipActive]}
            onPress={handleToggleCombat}
            activeOpacity={0.8}
          >
            <Text style={styles.combatChipText}>
              {inCombat ? `Round ${round} · End Combat` : 'Enter Combat'}
            </Text>
          </TouchableOpacity>
        </View>

        {inCombat && (
          <TouchableOpacity
            style={[styles.turnButton, turnActive && styles.turnButtonActive]}
            onPress={handleToggleTurn}
            activeOpacity={0.8}
          >
            <Text style={styles.turnButtonText}>{turnActive ? 'End Turn' : 'Start Turn'}</Text>
          </TouchableOpacity>
        )}

        <View style={styles.slot}>
          <View style={styles.slotHeader}>
            <Text style={styles.slotTitle}>Action</Text>
            <Text style={styles.slotStatus}>
              {actionUsed ? `Used: ${actionUsed}` : actionsEnabled ? 'Available' : 'Inactive'}
            </Text>
          </View>
          <View style={styles.actionGrid}>
            {STANDARD_ACTIONS.map((name) => {
              const isUsed = actionUsed === name;
              const disabled = !actionsEnabled || (actionUsed !== null && !isUsed);
              return (
                <TouchableOpacity
                  key={name}
                  style={[
                    styles.actionButton,
                    disabled && styles.actionButtonDisabled,
                    isUsed && styles.actionButtonUsed,
                  ]}
                  onPress={() => handleAction(name)}
                  disabled={disabled}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[styles.actionButtonText, disabled && styles.actionButtonTextDisabled]}
                  >
                    {name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.slotRow}>
          <View style={[styles.slot, styles.halfSlot]}>
            <View style={styles.slotHeader}>
              <Text style={styles.slotTitle}>Bonus</Text>
              <Text style={styles.slotStatus}>
                {bonusUsed ? 'Used' : actionsEnabled ? 'Avail' : '—'}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.slotButton,
                (!actionsEnabled || bonusUsed) && styles.actionButtonDisabled,
                bonusUsed && styles.actionButtonUsed,
              ]}
              onPress={() => setBonusUsed(true)}
              disabled={!actionsEnabled || bonusUsed}
              activeOpacity={0.8}
            >
              <Text style={styles.slotButtonText}>{bonusUsed ? 'Used' : 'Use'}</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.slot, styles.halfSlot]}>
            <View style={styles.slotHeader}>
              <Text style={styles.slotTitle}>Reaction</Text>
              <Text style={styles.slotStatus}>{reactionUsed ? 'Used' : 'Avail'}</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.slotButton,
                reactionUsed && styles.actionButtonDisabled,
                reactionUsed && styles.actionButtonUsed,
              ]}
              onPress={() => setReactionUsed(true)}
              disabled={reactionUsed}
              activeOpacity={0.8}
            >
              <Text style={styles.slotButtonText}>{reactionUsed ? 'Used' : 'Use'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {!inCombat && <Text style={styles.footnote}>Outside of combat</Text>}
      </ScrollView>

      <DiceRollingView />
      <DiceHistory />
      {isFabVisible && <FloatingDiceButton onPress={handleFabPress} />}
      <DiceSelectionSheet visible={sheetVisible} onRoll={handleRoll} onClose={handleSheetClose} />
    </View>
  );
}

export default function ActionsScreen() {
  return (
    <DiceProvider>
      <ActionsContent />
    </DiceProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1117',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F9FAFB',
    flexShrink: 1,
    marginRight: 8,
  },
  combatChip: {
    backgroundColor: '#1a1f2e',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  combatChipActive: {
    backgroundColor: '#4338CA',
    borderColor: '#6366f1',
  },
  combatChipText: {
    color: '#E5E7EB',
    fontSize: 12,
    fontWeight: '600',
  },
  turnButton: {
    backgroundColor: '#6366f1',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  turnButtonActive: {
    backgroundColor: '#DC2626',
  },
  turnButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  slot: {
    backgroundColor: '#1a1f2e',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  slotRow: {
    flexDirection: 'row',
    gap: 10,
  },
  halfSlot: {
    flex: 1,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  slotTitle: {
    color: '#F9FAFB',
    fontSize: 14,
    fontWeight: '700',
  },
  slotStatus: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#0f1117',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#374151',
  },
  actionButtonDisabled: {
    opacity: 0.4,
  },
  actionButtonUsed: {
    backgroundColor: '#4338CA',
    borderColor: '#6366f1',
  },
  actionButtonText: {
    color: '#E5E7EB',
    fontSize: 13,
    fontWeight: '600',
  },
  actionButtonTextDisabled: {
    color: '#9CA3AF',
  },
  slotButton: {
    backgroundColor: '#0f1117',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  slotButtonText: {
    color: '#E5E7EB',
    fontSize: 13,
    fontWeight: '600',
  },
  footnote: {
    color: '#6B7280',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
