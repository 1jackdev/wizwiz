import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  CampaignAction,
  listCampaignActions,
  listCharacterCampaignActions,
} from '../api/campaignAction';
import { useTheme } from '../context/ThemeContext';
import { ColorScheme } from '../theme';

type CombatFilter = 'all' | 'combat' | 'outside';

interface CharacterOpt {
  id: string;
  name: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  campaignId: string;
  mode: 'player' | 'dm';
  characters?: CharacterOpt[];
  playerCharacterId?: string;
  title?: string;
}

const PAGE_SIZE = 20;

function formatWhen(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString();
}

function actionLabel(a: CampaignAction): string {
  const base =
    a.action_type === 'action'
      ? a.action_name ?? 'Action'
      : a.action_type === 'bonus'
        ? 'Bonus Action'
        : 'Reaction';
  const combat = a.in_combat
    ? a.round_number
      ? `Round ${a.round_number}`
      : 'In combat'
    : 'Outside combat';
  return `${base} · ${combat}`;
}

export default function CampaignActionHistory({
  visible,
  onClose,
  campaignId,
  mode,
  characters,
  playerCharacterId,
  title,
}: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<CampaignAction[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [characterFilter, setCharacterFilter] = useState<string | null>(null);
  const [combatFilter, setCombatFilter] = useState<CombatFilter>('all');

  const load = useCallback(async () => {
    if (!visible) return;
    setLoading(true);
    setError('');
    try {
      if (mode === 'player' && playerCharacterId) {
        const res = await listCharacterCampaignActions(
          campaignId,
          playerCharacterId,
          page,
          PAGE_SIZE,
        );
        setItems(res.items);
        setTotal(res.total);
      } else {
        const inCombat =
          combatFilter === 'combat'
            ? true
            : combatFilter === 'outside'
              ? false
              : null;
        const res = await listCampaignActions(campaignId, {
          page,
          pageSize: PAGE_SIZE,
          characterId: characterFilter,
          inCombat,
        });
        setItems(res.items);
        setTotal(res.total);
      }
    } catch (e: any) {
      setError(e.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [
    visible,
    mode,
    campaignId,
    page,
    playerCharacterId,
    characterFilter,
    combatFilter,
  ]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (visible) setPage(1);
  }, [visible]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const characterName = (id: string) =>
    characters?.find((c) => c.id === id)?.name ?? id.slice(0, 6);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.title}>{title ?? 'Action History'}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>

        {mode === 'dm' && (
          <View style={styles.filters}>
            <Text style={styles.filterLabel}>Player</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
            >
              <TouchableOpacity
                style={[styles.chip, characterFilter === null && styles.chipActive]}
                onPress={() => {
                  setCharacterFilter(null);
                  setPage(1);
                }}
              >
                <Text style={styles.chipText}>All</Text>
              </TouchableOpacity>
              {(characters ?? []).map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.chip,
                    characterFilter === c.id && styles.chipActive,
                  ]}
                  onPress={() => {
                    setCharacterFilter(c.id);
                    setPage(1);
                  }}
                >
                  <Text style={styles.chipText}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.filterLabel}>Combat</Text>
            <View style={styles.chipRow}>
              {(['all', 'combat', 'outside'] as CombatFilter[]).map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[styles.chip, combatFilter === f && styles.chipActive]}
                  onPress={() => {
                    setCombatFilter(f);
                    setPage(1);
                  }}
                >
                  <Text style={styles.chipText}>
                    {f === 'all' ? 'All' : f === 'combat' ? 'In Combat' : 'Outside'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Text style={styles.error}>{error}</Text>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.empty}>No actions yet.</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.list}>
            {items.map((a) => (
              <View key={a.id} style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{actionLabel(a)}</Text>
                  <Text style={styles.rowSub}>
                    {mode === 'dm'
                      ? `${characterName(a.character_id)} · ${formatWhen(a.created_at)}`
                      : formatWhen(a.created_at)}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        {total > 0 && (
          <View style={styles.pager}>
            <TouchableOpacity
              style={[styles.pageButton, page <= 1 && styles.pageButtonDisabled]}
              disabled={page <= 1}
              onPress={() => setPage((p) => Math.max(1, p - 1))}
            >
              <Text style={styles.pageButtonText}>Prev</Text>
            </TouchableOpacity>
            <Text style={styles.pageText}>
              Page {page} / {totalPages} · {total} total
            </Text>
            <TouchableOpacity
              style={[
                styles.pageButton,
                page >= totalPages && styles.pageButtonDisabled,
              ]}
              disabled={page >= totalPages}
              onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <Text style={styles.pageButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

const createStyles = (colors: ColorScheme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  title: { color: colors.text, fontSize: 18, fontWeight: '700' },
  closeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  closeText: { color: colors.text, fontWeight: '600' },
  filters: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: 8,
  },
  filterLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipRow: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  chipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipText: { color: colors.text, fontSize: 12, fontWeight: '600' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { color: colors.error },
  empty: { color: colors.textSecondary },
  list: { padding: 16, gap: 8 },
  row: {
    backgroundColor: colors.bgCard,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowTitle: { color: colors.text, fontSize: 14, fontWeight: '600' },
  rowSub: { color: colors.textSecondary, fontSize: 12, marginTop: 4 },
  pager: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  pageButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  pageButtonDisabled: { opacity: 0.3 },
  pageButtonText: { color: colors.text, fontWeight: '600' },
  pageText: { color: colors.textSecondary, fontSize: 12 },
});
