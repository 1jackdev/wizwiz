import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Animated, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { DieSelection, DieType } from './DiceContext';
import { getDieComponent } from './shapes';

interface DiceSelectionSheetProps {
  visible: boolean;
  onRoll: (selections: DieSelection[]) => void;
  onClose: () => void;
}

const DIE_TYPES: DieType[] = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'];

const DIE_MAX: Record<DieType, number> = {
  d4: 4,
  d6: 6,
  d8: 8,
  d10: 10,
  d12: 12,
  d20: 20,
};

type CountsMap = Record<DieType, number>;

const initialCounts = (): CountsMap => ({
  d4: 0,
  d6: 0,
  d8: 0,
  d10: 0,
  d12: 0,
  d20: 0,
});

export default function DiceSelectionSheet({ visible, onRoll, onClose }: DiceSelectionSheetProps) {
  const [counts, setCounts] = useState<CountsMap>(initialCounts());
  const slideAnim = useRef(new Animated.Value(400)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 400,
        duration: 260,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const increment = useCallback((type: DieType) => {
    setCounts((prev) => ({ ...prev, [type]: Math.min(prev[type] + 1, 20) }));
  }, []);

  const decrement = useCallback((type: DieType) => {
    setCounts((prev) => ({ ...prev, [type]: Math.max(prev[type] - 1, 0) }));
  }, []);

  const totalDice = DIE_TYPES.reduce((sum, t) => sum + counts[t], 0);

  const summaryText = DIE_TYPES.filter((t) => counts[t] > 0)
    .map((t) => `${counts[t]}${t}`)
    .join(' + ');

  const handleRoll = useCallback(() => {
    const selections: DieSelection[] = DIE_TYPES.filter((t) => counts[t] > 0).map((t) => ({
      type: t,
      count: counts[t],
    }));
    setCounts(initialCounts());
    onRoll(selections);
  }, [counts, onRoll]);

  const renderItem = useCallback(
    ({ item: dieType }: { item: DieType }) => {
      const DieComponent = getDieComponent(dieType);
      return (
        <View style={styles.row}>
          <DieComponent size={44} value={DIE_MAX[dieType]} />
          <Text style={styles.dieLabel}>{dieType.toUpperCase()}</Text>
          <View style={styles.spacer} />
          <TouchableOpacity
            style={styles.counterBtn}
            onPress={() => decrement(dieType)}
            accessibilityLabel={`Remove ${dieType}`}
          >
            <Text style={styles.counterBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.countText}>{counts[dieType]}</Text>
          <TouchableOpacity
            style={styles.counterBtn}
            onPress={() => increment(dieType)}
            accessibilityLabel={`Add ${dieType}`}
          >
            <Text style={styles.counterBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      );
    },
    [counts, increment, decrement]
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
          {/* Drag handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          <Text style={styles.title}>Select Dice</Text>

          {totalDice > 0 && <Text style={styles.summary}>{summaryText}</Text>}
          <FlatList
            data={DIE_TYPES}
            keyExtractor={(item) => item}
            renderItem={renderItem}
            scrollEnabled={false}
            style={styles.list}
          />

          <TouchableOpacity
            style={[styles.rollBtn, totalDice === 0 && styles.rollBtnDisabled]}
            onPress={handleRoll}
            disabled={totalDice === 0}
            activeOpacity={0.8}
          >
            <Text style={styles.rollBtnText}>{totalDice > 0 ? `Roll ${summaryText}` : 'Roll'}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1a1f2e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#4B5563',
  },
  title: {
    color: '#F9FAFB',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 12,
  },
  list: {
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dieLabel: {
    color: '#E5E7EB',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
    width: 36,
  },
  spacer: {
    flex: 1,
  },
  counterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnText: {
    color: '#F9FAFB',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 22,
  },
  countText: {
    color: '#F9FAFB',
    fontSize: 18,
    fontWeight: '700',
    width: 36,
    textAlign: 'center',
  },
  summary: {
    color: '#A5B4FC',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 20,
  },
  rollBtn: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 14,
    marginHorizontal: 20,
    marginTop: 12,
    alignItems: 'center',
  },
  rollBtnDisabled: {
    opacity: 0.4,
  },
  rollBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
