import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { CampaignSummary, listDmCampaigns } from '../../api/campaign';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { CampaignStackParamList } from '../../navigation/CampaignsNavigator';
import { ColorScheme } from '../../theme';

type Props = NativeStackScreenProps<CampaignStackParamList, 'CampaignList'>;

export default function CampaignListScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { userId } = useAuth();
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCampaigns = useCallback(async () => {
    if (!userId) return;
    try {
      setError('');
      const data = await listDmCampaigns(userId);
      setCampaigns(data);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchCampaigns);
    return unsubscribe;
  }, [navigation, fetchCampaigns]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {campaigns.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No campaigns yet.</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('CreateCampaign')}
          >
            <Text style={styles.buttonText}>Create Campaign</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={campaigns}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() =>
                  navigation.navigate('CampaignDetail', {
                    campaignId: item.id,
                    name: item.name,
                  })
                }
              >
                <Text style={styles.cardName}>{item.name}</Text>
                <Text style={styles.cardSub}>Level {item.level}</Text>
                {item.description ? (
                  <Text style={styles.cardDesc} numberOfLines={2}>
                    {item.description}
                  </Text>
                ) : null}
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            style={styles.fab}
            onPress={() => navigation.navigate('CreateCampaign')}
          >
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const createStyles = (colors: ColorScheme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  emptyText: { fontSize: 16, color: colors.textSecondary, marginBottom: 20 },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardName: { fontSize: 18, fontWeight: '600', marginBottom: 4, color: colors.text },
  cardSub: { fontSize: 14, color: colors.textSecondary },
  cardDesc: { fontSize: 13, color: colors.textMuted, marginTop: 6 },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 32 },
  error: { color: colors.error, textAlign: 'center', margin: 16 },
});
