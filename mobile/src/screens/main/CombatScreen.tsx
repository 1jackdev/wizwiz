import React, { useState, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { DiceProvider, useDice } from '../../components/dice/DiceContext';
import type { DieSelection } from '../../components/dice/DiceContext';
import FloatingDiceButton from '../../components/dice/FloatingDiceButton';
import DiceSelectionSheet from '../../components/dice/DiceSelectionSheet';
import DiceRollingView from '../../components/dice/DiceRollingView';
import DiceHistory from '../../components/dice/DiceHistory';

function CombatContent() {
  const { isFabVisible, activeDice, rollState, placeDice, clearDice } = useDice();
  const [sheetVisible, setSheetVisible] = useState(false);

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
    [placeDice]
  );

  const handleSheetClose = useCallback(() => {
    setSheetVisible(false);
  }, []);

  return (
    <View style={styles.container}>
      {/* Main content area — add combat UI here in future */}
      <View style={styles.content} />

      {/* Dice overlay layer */}
      <DiceRollingView />

      {/* History footer */}
      <DiceHistory />

      {/* FAB */}
      {isFabVisible && <FloatingDiceButton onPress={handleFabPress} />}

      {/* Selection sheet */}
      <DiceSelectionSheet visible={sheetVisible} onRoll={handleRoll} onClose={handleSheetClose} />
    </View>
  );
}

export default function CombatScreen() {
  return (
    <DiceProvider>
      <CombatContent />
    </DiceProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1117',
  },
  content: {
    flex: 1,
  },
});
