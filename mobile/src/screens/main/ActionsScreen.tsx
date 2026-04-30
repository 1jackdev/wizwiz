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
import { CharacterDetail, getCharacter } from '../../api/character';
import { useTheme } from '../../context/ThemeContext';
import { ColorScheme } from '../../theme';

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
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setError('');
        const data = await listCharacterCampaigns(characterId);
        if (data.length === 1) {
          onPick(data[0]);
          return;
        }
        setCampaigns(data);
      } catch (e: any) {
        setError(e.message ?? 'Failed to load campaigns');
      } finally {
        setLoading(false);
      }
    })();
  }, [characterId, onPick]);

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
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const insets = useSafeAreaInsets();
  const { isFabVisible, activeDice, rollState, placeDice, clearDice } = useDice();
  const { currentCharacterId, currentCharacterName } = useCurrentCharacter();
  const [sheetVisible, setSheetVisible] = useState(false);
  const [inCombat, setInCombat] = useState(false);
  const [round, setRound] = useState<number | null>(null);
  const [turnActive, setTurnActive] = useState(false);
  const [actionUsed, setActionUsed] = useState<StandardAction | null>(null);
  const [bonusActive, setBonusActive] = useState(false);
  const [bonusAction, setBonusAction] = useState<StandardAction | null>(null);
  const [reactionUsed, setReactionUsed] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [campaign, setCampaign] = useState<CampaignSummary | null>(null);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [character, setCharacter] = useState<CharacterDetail | null>(null);

  useEffect(() => {
    setCampaign(null);
    setInCombat(false);
    setRound(null);
    setTurnActive(false);
    setActionUsed(null);
    setBonusActive(false);
    setBonusAction(null);
    setReactionUsed(false);
    setConfirmed(false);
    if (currentCharacterId) {
      getCharacter(currentCharacterId).then(setCharacter).catch(() => {});
    } else {
      setCharacter(null);
    }
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
    setBonusActive(false);
    setBonusAction(null);
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

  const handleBonusAction = useCallback(
    (name: StandardAction) => {
      if (confirmed) return;
      setBonusAction((prev) => (prev === name ? null : name));
    },
    [confirmed],
  );

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
      if (bonusAction) tasks.push(logAction('bonus', bonusAction));
      if (reactionUsed) tasks.push(logAction('reaction', null));
      await Promise.all(tasks);
      setConfirmed(true);
      setTimeout(resetSlots, 2000);
    } finally {
      setConfirming(false);
    }
  }, [campaign, currentCharacterId, actionUsed, bonusAction, reactionUsed, logAction]);

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

        <View style={styles.slot}>
          <View style={styles.slotHeader}>
            <Text style={styles.slotTitle}>Bonus Action</Text>
            <Text style={styles.slotStatus}>
              {bonusAction ? `Used: ${bonusAction}` : actionsEnabled ? 'Available' : 'Inactive'}
            </Text>
          </View>
          {!bonusActive && !bonusAction ? (
            <TouchableOpacity
              style={[styles.slotButton, (!actionsEnabled || confirmed) && styles.actionButtonDisabled]}
              onPress={() => setBonusActive(true)}
              disabled={confirmed || !actionsEnabled}
              activeOpacity={0.8}
            >
              <Text style={styles.slotButtonText}>Use Bonus Action</Text>
            </TouchableOpacity>
          ) : (
            <>
              <View style={styles.actionGrid}>
                {STANDARD_ACTIONS.map((name) => {
                  const isUsed = bonusAction === name;
                  const disabled = confirmed || !actionsEnabled || (bonusAction !== null && !isUsed);
                  return (
                    <TouchableOpacity
                      key={name}
                      style={[
                        styles.actionButton,
                        disabled && styles.actionButtonDisabled,
                        isUsed && styles.actionButtonUsed,
                      ]}
                      onPress={() => handleBonusAction(name)}
                      disabled={disabled}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.actionButtonText, disabled && styles.actionButtonTextDisabled]}>
                        {name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {!confirmed && (
                <TouchableOpacity
                  style={styles.cancelBonusButton}
                  onPress={() => { setBonusActive(false); setBonusAction(null); }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelBonusText}>Cancel Bonus Action</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        <View style={[styles.slot, styles.reactionSlot]}>
          <View style={styles.slotHeader}>
            <Text style={styles.slotTitle}>Reaction</Text>
            <Text style={styles.slotStatus}>{reactionUsed ? 'Used' : 'Available'}</Text>
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

        <TouchableOpacity
          style={[
            styles.confirmButton,
            confirmed && styles.confirmButtonDone,
            (!actionUsed && !bonusAction && !reactionUsed && !confirmed) && styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirm}
          disabled={confirmed || confirming || (!actionUsed && !bonusAction && !reactionUsed)}
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
      <DiceSelectionSheet visible={sheetVisible} onRoll={handleRoll} onClose={handleSheetClose} character={character ?? undefined} />
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

const createStyles = (colors: ColorScheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
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
    color: colors.text,
    flexShrink: 1,
    marginRight: 8,
  },
  combatChip: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  combatChipActive: {
    backgroundColor: colors.accentDisabled,
    borderColor: colors.accent,
  },
  combatChipText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  campaignRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    gap: 8,
  },
  campaignLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  campaignName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  linkButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
  },
  linkButtonText: { color: colors.text, fontSize: 12, fontWeight: '600' },
  turnButton: {
    backgroundColor: colors.success,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  turnButtonActive: {
    backgroundColor: colors.error,
  },
  turnButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  slot: {
    backgroundColor: colors.bgCard,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  reactionSlot: {
    marginBottom: 10,
  },
  cancelBonusButton: {
    marginTop: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  cancelBonusText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  slotTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  slotStatus: {
    color: colors.textSecondary,
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
    backgroundColor: colors.bg,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionButtonDisabled: {
    opacity: 0.4,
  },
  actionButtonUsed: {
    backgroundColor: colors.accentDisabled,
    borderColor: colors.accent,
  },
  actionButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  actionButtonTextDisabled: {
    color: colors.textSecondary,
  },
  slotButton: {
    backgroundColor: colors.bg,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  slotButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  confirmButtonDone: {
    backgroundColor: colors.success,
  },
  confirmButtonDisabled: {
    backgroundColor: colors.border,
    opacity: 0.5,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  footnote: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  empty: { color: colors.textSecondary, fontSize: 14, textAlign: 'center' },
  error: { color: colors.error, marginBottom: 12 },
  pickerContainer: { gap: 10 },
  pickerTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  pickerSub: { color: colors.textSecondary, fontSize: 13, marginBottom: 12 },
  pickerCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pickerCardName: { color: colors.text, fontSize: 15, fontWeight: '600' },
  pickerCardSub: { color: colors.textSecondary, fontSize: 12, marginTop: 4 },
});
