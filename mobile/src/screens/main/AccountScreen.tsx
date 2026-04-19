import React, { useState, useEffect } from 'react';
import {
  Alert,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme';

const FAB_KEY = '@wizwiz_dice_fab_visible';

export default function AccountScreen() {
  const { logout, isDm, viewMode, setViewMode, promoteToDm } = useAuth();
  const [diceButtonVisible, setDiceButtonVisible] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(FAB_KEY).then((val) => {
      if (val !== null) setDiceButtonVisible(val === 'true');
    });
  }, []);

  const handleToggleDiceButton = (value: boolean) => {
    setDiceButtonVisible(value);
    AsyncStorage.setItem(FAB_KEY, value ? 'true' : 'false');
  };

  async function handlePromote() {
    setBusy(true);
    try {
      await promoteToDm();
      await setViewMode('dm');
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to enable DM');
    } finally {
      setBusy(false);
    }
  }

  async function handleViewToggle(toDm: boolean) {
    await setViewMode(toDm ? 'dm' : 'player');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Account</Text>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Settings</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Show Dice Button</Text>
          <Switch
            value={diceButtonVisible}
            onValueChange={handleToggleDiceButton}
            trackColor={{ false: '#374151', true: '#818cf8' }}
            thumbColor={diceButtonVisible ? '#6366f1' : '#9CA3AF'}
            ios_backgroundColor="#374151"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Dungeon Master</Text>
        {isDm ? (
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>DM View</Text>
            <Switch
              value={viewMode === 'dm'}
              onValueChange={handleViewToggle}
              trackColor={{ false: '#374151', true: '#818cf8' }}
              thumbColor={viewMode === 'dm' ? '#6366f1' : '#9CA3AF'}
              ios_backgroundColor="#374151"
            />
          </View>
        ) : (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handlePromote}
            disabled={busy}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>
              {busy ? 'Enabling…' : 'Create DM Profile'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.spacer} />

      <TouchableOpacity style={styles.button} onPress={logout} activeOpacity={0.8}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1117',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },
  spacer: { flex: 1 },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F9FAFB',
    marginBottom: 32,
  },
  section: {
    backgroundColor: '#1a1f2e',
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
  },
  sectionHeader: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#374151',
  },
  settingLabel: { color: '#E5E7EB', fontSize: 16 },
  primaryButton: {
    backgroundColor: colors.accent,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  button: {
    backgroundColor: '#DC2626',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
