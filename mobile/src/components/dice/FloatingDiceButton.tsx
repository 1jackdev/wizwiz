import React, { useRef } from 'react';
import { StyleSheet, Alert, Pressable } from 'react-native';
import Svg, { Polygon, Line } from 'react-native-svg';
import { useDice } from './DiceContext';

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
      <Svg width={30} height={28} viewBox="0 0 30 28">
        <Polygon
          points="15,2 28,26 2,26"
          fill="rgba(255,255,255,0.15)"
          stroke="white"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <Line x1="15" y1="2" x2="8.5" y2="14" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" />
        <Line x1="15" y1="2" x2="21.5" y2="14" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" />
        <Line x1="8.5" y1="14" x2="21.5" y2="14" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" />
        <Line x1="8.5" y1="14" x2="15" y2="26" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" />
        <Line x1="21.5" y1="14" x2="15" y2="26" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" />
      </Svg>
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
