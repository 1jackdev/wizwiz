import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  CampaignDetail,
  deleteCampaign,
  getCampaign,
  regenerateInvite,
  removeCharacterFromCampaign,
} from '../../api/campaign';
import { CampaignStackParamList } from '../../navigation/CampaignsNavigator';
import { colors } from '../../theme';
import { CharacterClass, Species } from '../../types';

type Props = NativeStackScreenProps<CampaignStackParamList, 'CampaignDetail'>;

export default function CampaignDetailScreen({ navigation, route }: Props) {
  const { campaignId } = route.params;
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const data = await getCampaign(campaignId);
      setCampaign(data);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation, load]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRegen() {
    try {
      const updated = await regenerateInvite(campaignId);
      setCampaign((c) => (c ? { ...c, invite_code: updated.invite_code } : c));
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to regenerate invite');
    }
  }

  function confirmRemove(charId: string, name: string) {
    Alert.alert('Remove character', `Remove ${name} from campaign?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeCharacterFromCampaign(campaignId, charId);
            load();
          } catch (e: any) {
            Alert.alert('Error', e.message ?? 'Failed to remove');
          }
        },
      },
    ]);
  }

  function confirmDelete() {
    Alert.alert('Delete campaign', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCampaign(campaignId);
            navigation.goBack();
          } catch (e: any) {
            Alert.alert('Error', e.message ?? 'Failed to delete');
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }
  if (!campaign) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error || 'Not found'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      {campaign.description ? (
        <Text style={styles.description}>{campaign.description}</Text>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Details</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Level</Text>
          <Text style={styles.rowValue}>{campaign.level}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Invite Code</Text>
        <View style={styles.inviteRow}>
          <Text style={styles.inviteCode}>{campaign.invite_code}</Text>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleRegen}>
            <Text style={styles.secondaryButtonText}>Regenerate</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>
          Characters ({campaign.characters.length})
        </Text>
        {campaign.characters.length === 0 ? (
          <Text style={styles.emptySub}>
            Share the invite code so players can join.
          </Text>
        ) : (
          campaign.characters.map((c) => (
            <View key={c.id} style={styles.charRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.charName}>{c.name}</Text>
                <Text style={styles.charSub}>
                  {CharacterClass[c.character_class as keyof typeof CharacterClass] ??
                    c.character_class}{' '}
                  ·{' '}
                  {Species[c.species as keyof typeof Species] ?? c.species} · Level{' '}
                  {c.level}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => confirmRemove(c.id, c.name)}
              >
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity style={styles.dangerButton} onPress={confirmDelete}>
        <Text style={styles.dangerButtonText}>Delete Campaign</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  container: { padding: 20, gap: 16 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  description: { color: colors.textSecondary, fontSize: 15 },
  section: {
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  sectionHeader: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  rowLabel: { color: colors.textSecondary, fontSize: 15 },
  rowValue: { color: colors.text, fontSize: 15, fontWeight: '600' },
  inviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inviteCode: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 1.5,
    fontFamily: 'Menlo',
  },
  secondaryButton: {
    backgroundColor: colors.bgInput,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: { color: colors.text, fontSize: 13, fontWeight: '600' },
  emptySub: { color: colors.textMuted, fontSize: 13 },
  charRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  charName: { color: colors.text, fontSize: 15, fontWeight: '600' },
  charSub: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  removeButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.error,
  },
  removeText: { color: colors.error, fontSize: 12, fontWeight: '600' },
  dangerButton: {
    backgroundColor: '#2d0a0a',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.error,
  },
  dangerButtonText: { color: colors.error, fontSize: 15, fontWeight: '600' },
  error: { color: colors.error },
});
