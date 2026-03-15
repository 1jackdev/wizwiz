import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';

const FAB_KEY = '@wizwiz_dice_fab_visible';

export default function AccountScreen() {
  const { logout } = useAuth();
  const [diceButtonVisible, setDiceButtonVisible] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(FAB_KEY).then(val => {
      if (val !== null) {
        setDiceButtonVisible(val === 'true');
      }
    });
  }, []);

  const handleToggleDiceButton = (value: boolean) => {
    setDiceButtonVisible(value);
    AsyncStorage.setItem(FAB_KEY, value ? 'true' : 'false');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Account</Text>

      {/* Settings section */}
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

      {/* Sign Out */}
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
  },
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
  settingLabel: {
    color: '#E5E7EB',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#DC2626',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
