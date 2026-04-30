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
import { useTheme } from '../../context/ThemeContext';
import { patchUserTheme } from '../../api/user';
import { ColorScheme, ThemeName, themeLabels } from '../../theme';

const FAB_KEY = '@wizwiz_dice_fab_visible';

const THEME_COLORS: Record<ThemeName, string> = {
  dark: '#6366f1',
  nature: '#2d6a4f',
  bloodmoon: '#dc2626',
};

export default function AccountScreen() {
  const { logout, isDm, viewMode, setViewMode, promoteToDm, userId } = useAuth();
  const { colors, themeName, setTheme } = useTheme();
  const styles = createStyles(colors);

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

  async function handleThemeChange(name: ThemeName) {
    setTheme(name);
    if (userId) {
      try {
        await patchUserTheme(userId, name);
      } catch {
        // local state already updated; backend sync failure is non-critical
      }
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Account</Text>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Theme</Text>
        <View style={styles.themeRow}>
          {(Object.keys(themeLabels) as ThemeName[]).map((name) => (
            <TouchableOpacity
              key={name}
              style={[styles.themeChip, themeName === name && styles.themeChipActive]}
              onPress={() => handleThemeChange(name)}
              activeOpacity={0.8}
            >
              <View style={[styles.themeColorDot, { backgroundColor: THEME_COLORS[name] }]} />
              <Text style={[styles.themeChipText, themeName === name && styles.themeChipTextActive]}>
                {themeLabels[name]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Settings</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Show Dice Button</Text>
          <Switch
            value={diceButtonVisible}
            onValueChange={handleToggleDiceButton}
            trackColor={{ false: colors.border, true: colors.accentDisabled }}
            thumbColor={diceButtonVisible ? colors.accent : colors.textMuted}
            ios_backgroundColor={colors.border}
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
              trackColor={{ false: colors.border, true: colors.accentDisabled }}
              thumbColor={viewMode === 'dm' ? colors.accent : colors.textMuted}
              ios_backgroundColor={colors.border}
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

const createStyles = (colors: ColorScheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: 24,
    },
    spacer: { flex: 1 },
    screenTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 32,
    },
    section: {
      backgroundColor: colors.bgCard,
      borderRadius: 12,
      marginBottom: 24,
      overflow: 'hidden',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    sectionHeader: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 6,
    },
    themeRow: {
      flexDirection: 'row',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    themeChip: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.bgInput,
    },
    themeChipActive: {
      borderColor: colors.accent,
      backgroundColor: colors.accent + '22',
    },
    themeColorDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    themeChipText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    themeChipTextActive: {
      color: colors.accent,
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    settingLabel: { color: colors.text, fontSize: 16 },
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
      backgroundColor: colors.error,
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: 'center',
    },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  });
