import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DiceProvider, useDice } from '../../components/dice/DiceContext';
import type { DieSelection } from '../../components/dice/DiceContext';
import FloatingDiceButton from '../../components/dice/FloatingDiceButton';
import DiceSelectionSheet from '../../components/dice/DiceSelectionSheet';
import DiceRollingView from '../../components/dice/DiceRollingView';
import DiceHistory from '../../components/dice/DiceHistory';
import CampaignActionHistory from '../../components/CampaignActionHistory';
import { useCurrentCharacter } from '../../context/CurrentCharacterContext';
import {
  CampaignSummary,
  listCharacterCampaigns,
} from '../../api/campaign';
import {
  ActionType,
  logCampaignAction,
} from '../../api/campaignAction';
import { colors } from '../../theme';

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

function CampaignPicker({
  characterId,
  onPick,
}: {
  characterId: string;
  onPick: (c: CampaignSummary) => void;
}) {
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setError('');
        const data = await listCharacterCampaigns(characterId);
        setCampaigns(data);
      } catch (e: any) {
        setError(e.message ?? 'Failed to load campaigns');
      } finally {
        setLoading(false);
      }
    })();
  }, [characterId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.pickerContainer}>
      <Text style={styles.pickerTitle}>Select Campaign</Text>
      <Text style={styles.pickerSub}>
        Choose a campaign to track actions in.
      </Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {campaigns.length === 0 ? (
        <Text style={styles.empty}>
          This character isn&apos;t in any campaigns yet.
        </Text>
      ) : (
        campaigns.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={styles.pickerCard}
            onPress={() => onPick(c)}
          >
            <Text style={styles.pickerCardName}>{c.name}</Text>
            <Text style={styles.pickerCardSub}>Level {c.level}</Text>
          </TouchableOpacity>
        ))
      )}
    </View>
  );
}

function ActionsContent() {
  const insets = useSafeAreaInsets();
  const { isFabVisible, activeDice, rollState, placeDice, clearDice } = useDice();
  const { currentCharacterId, currentCharacterName } = useCurrentCharacter();
  const [sheetVisible, setSheetVisible] = useState(false);
  const [inCombat, setInCombat] = useState(false);
  const [round, setRound] = useState<number | null>(null);
  const [turnActive, setTurnActive] = useState(false);
  const [actionUsed, setActionUsed] = useState<StandardAction | null>(null);
  const [bonusUsed, setBonusUsed] = useState(false);
  const [reactionUsed, setReactionUsed] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [campaign, setCampaign] = useState<CampaignSummary | null>(null);
  const [historyVisible, setHistoryVisible] = useState(false);

  useEffect(() => {
    setCampaign(null);
    setInCombat(false);
    setRound(null);
    setTurnActive(false);
    setActionUsed(null);
    setBonusUsed(false);
    setReactionUsed(false);
    setConfirmed(false);
  }, [currentCharacterId]);

  const logAction = useCallback(
    async (actionType: ActionType, actionName: string | null) => {
      if (!campaign || !currentCharacterId) return;
      try {
        await logCampaignAction(campaign.id, {
          character_id: currentCharacterId,
          action_type: actionType,
          action_name: actionName,
          in_combat: inCombat,
          round_number: inCombat ? round : null,
        });
      } catch (e: any) {
        Alert.alert('Error', e.message ?? 'Failed to log action');
      }
    },
    [campaign, currentCharacterId, inCombat, round],
  );

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
    [placeDice],
  );

  const handleSheetClose = useCallback(() => setSheetVisible(false), []);

  const resetSlots = () => {
    setActionUsed(null);
    setBonusUsed(false);
    setReactionUsed(false);
    setConfirmed(false);
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
        ],
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
      if (confirmed) return;
      if (actionUsed === name) { setActionUsed(null); return; }
      if (actionUsed) return;
      setActionUsed(name);
    },
    [confirmed, actionUsed],
  );

  const handleBonus = useCallback(() => {
    if (confirmed) return;
    setBonusUsed((v) => !v);
  }, [confirmed]);

  const handleReaction = useCallback(() => {
    if (confirmed) return;
    setReactionUsed((v) => !v);
  }, [confirmed]);

  const handleConfirm = useCallback(async () => {
    if (!campaign || !currentCharacterId) return;
    setConfirming(true);
    try {
      const tasks: Promise<void>[] = [];
      if (actionUsed) tasks.push(logAction('action', actionUsed));
      if (bonusUsed) tasks.push(logAction('bonus', null));
      if (reactionUsed) tasks.push(logAction('reaction', null));
      await Promise.all(tasks);
      setConfirmed(true);
      setTimeout(resetSlots, 2000);
    } finally {
      setConfirming(false);
    }
  }, [campaign, currentCharacterId, actionUsed, bonusUsed, reactionUsed, logAction]);

  const actionsEnabled = !inCombat || turnActive;

  if (!currentCharacterId) {
    return (
      <View style={styles.container}>
        <View style={[styles.centered, { paddingTop: insets.top + 40 }]}>
          <Text style={styles.empty}>
            Select a character on the Characters tab first.
          </Text>
        </View>
      </View>
    );
  }

  if (!campaign) {
    return (
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={[
            styles.pickerScroll,
            { paddingTop: insets.top + 16 },
          ]}
        >
          <View style={styles.headerRow}>
            <Text style={styles.title} numberOfLines={1}>
              {currentCharacterName ?? 'Actions'}
            </Text>
          </View>
          <CampaignPicker
            characterId={currentCharacterId}
            onPick={setCampaign}
          />
        </ScrollView>
      </View>
    );
  }

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

        <View style={styles.campaignRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.campaignLabel}>Campaign</Text>
            <Text style={styles.campaignName} numberOfLines={1}>
              {campaign.name}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => setCampaign(null)}
          >
            <Text style={styles.linkButtonText}>Change</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => setHistoryVisible(true)}
          >
            <Text style={styles.linkButtonText}>History</Text>
          </TouchableOpacity>
        </View>

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
              const disabled = confirmed || !actionsEnabled || (actionUsed !== null && !isUsed);
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
                (!actionsEnabled || (confirmed && !bonusUsed)) && styles.actionButtonDisabled,
                bonusUsed && styles.actionButtonUsed,
              ]}
              onPress={handleBonus}
              disabled={confirmed || !actionsEnabled}
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
                (confirmed && !reactionUsed) && styles.actionButtonDisabled,
                reactionUsed && styles.actionButtonUsed,
              ]}
              onPress={handleReaction}
              disabled={confirmed}
              activeOpacity={0.8}
            >
              <Text style={styles.slotButtonText}>{reactionUsed ? 'Used' : 'Use'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.confirmButton,
            confirmed && styles.confirmButtonDone,
            (!actionUsed && !bonusUsed && !reactionUsed && !confirmed) && styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirm}
          disabled={confirmed || confirming || (!actionUsed && !bonusUsed && !reactionUsed)}
          activeOpacity={0.8}
        >
          {confirming ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmButtonText}>
              {confirmed ? 'Logged ✓' : 'Confirm Actions'}
            </Text>
          )}
        </TouchableOpacity>

        {inCombat && (
          <TouchableOpacity
            style={[styles.turnButton, turnActive && styles.turnButtonActive]}
            onPress={handleToggleTurn}
            activeOpacity={0.8}
          >
            <Text style={styles.turnButtonText}>{turnActive ? 'End Turn' : 'Start Turn'}</Text>
          </TouchableOpacity>
        )}

        {!inCombat && <Text style={styles.footnote}>Outside of combat</Text>}
      </ScrollView>

      <DiceRollingView />
      <DiceHistory />
      {isFabVisible && <FloatingDiceButton onPress={handleFabPress} />}
      <DiceSelectionSheet visible={sheetVisible} onRoll={handleRoll} onClose={handleSheetClose} />
      <CampaignActionHistory
        visible={historyVisible}
        onClose={() => setHistoryVisible(false)}
        campaignId={campaign.id}
        mode="player"
        playerCharacterId={currentCharacterId}
        title={`${campaign.name} · Your Actions`}
      />
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
  pickerScroll: {
    paddingHorizontal: 16,
    paddingBottom: 40,
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
  campaignRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1f2e',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    gap: 8,
  },
  campaignLabel: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  campaignName: {
    color: '#F9FAFB',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  linkButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
    backgroundColor: '#0f1117',
  },
  linkButtonText: { color: '#E5E7EB', fontSize: 12, fontWeight: '600' },
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
  confirmButton: {
    backgroundColor: '#6366f1',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  confirmButtonDone: {
    backgroundColor: '#16a34a',
  },
  confirmButtonDisabled: {
    backgroundColor: '#374151',
    opacity: 0.5,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  footnote: {
    color: '#6B7280',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  empty: { color: '#9CA3AF', fontSize: 14, textAlign: 'center' },
  error: { color: '#f87171', marginBottom: 12 },
  pickerContainer: { gap: 10 },
  pickerTitle: {
    color: '#F9FAFB',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  pickerSub: { color: '#9CA3AF', fontSize: 13, marginBottom: 12 },
  pickerCard: {
    backgroundColor: '#1a1f2e',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#374151',
  },
  pickerCardName: { color: '#F9FAFB', fontSize: 15, fontWeight: '600' },
  pickerCardSub: { color: '#9CA3AF', fontSize: 12, marginTop: 4 },
});
