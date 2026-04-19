import React, { useRef } from 'react';
import { StyleSheet, Alert, Pressable } from 'react-native';
import { useDice } from './DiceContext';
import { D20 } from './shapes';

const FAB_SIZE = 56;
const DOUBLE_TAP_DELAY = 300;

interface FloatingDiceButtonProps {
  onPress: () => void;
}

export default function FloatingDiceButton({ onPress }: FloatingDiceButtonProps) {
  const { hideFab } = useDice();
  const lastTapRef = useRef(0);

  const handlePress = () => {
    const now = Date.now();
    const delta = now - lastTapRef.current;
    if (delta < DOUBLE_TAP_DELAY && delta > 0) {
      lastTapRef.current = 0;
      Alert.alert(
        'Hide Dice Roller',
        'Hide the dice button? You can re-enable it in Account settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Hide', style: 'destructive', onPress: hideFab },
        ]
      );
    } else {
      lastTapRef.current = now;
      onPress();
    }
  };

  return (
    <Pressable style={styles.fab} onPress={handlePress}>
      <D20 size={38} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 100,
  },
});
