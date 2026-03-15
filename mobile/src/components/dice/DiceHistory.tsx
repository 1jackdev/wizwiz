import React, { useState, useRef, useMemo } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
  type PanResponderGestureState,
} from 'react-native';
import { useDice } from './DiceContext';
import type { RollRecord } from './DiceContext';

const COLLAPSED_HEIGHT = 64;
const EXPANDED_HEIGHT = Dimensions.get('window').height * 0.65;

function timeAgo(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 10) return 'just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

function RollEntryRow({ record }: { record: RollRecord }) {
  const breakdown = record.dice.map((d) => `${d.type}: ${d.value}`).join('   ');

  return (
    <View style={styles.entryRow}>
      <View style={styles.entryLeft}>
        <Text style={styles.entryBreakdown} numberOfLines={1} ellipsizeMode="tail">
          {breakdown}
        </Text>
        <Text style={styles.entryTime}>{timeAgo(record.timestamp)}</Text>
      </View>
      <Text style={styles.entryTotal}>= {record.total}</Text>
    </View>
  );
}

export default function DiceHistory() {
  const { rollHistory, setHistoryExpanded } = useDice();
  const [expanded, setExpanded] = useState(false);
  const heightAnim = useRef(new Animated.Value(COLLAPSED_HEIGHT)).current;

  const animateToExpanded = () => {
    setExpanded(true);
    setHistoryExpanded(true);
    Animated.spring(heightAnim, {
      toValue: EXPANDED_HEIGHT,
      useNativeDriver: false,
      tension: 60,
      friction: 12,
    }).start();
  };

  const animateToCollapsed = () => {
    setExpanded(false);
    setHistoryExpanded(false);
    Animated.spring(heightAnim, {
      toValue: COLLAPSED_HEIGHT,
      useNativeDriver: false,
      tension: 60,
      friction: 12,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (
        _evt: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => Math.abs(gestureState.dy) > 5,

      onPanResponderRelease: (
        _evt: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        if (gestureState.dy < -40) {
          animateToExpanded();
        } else if (gestureState.dy > 40) {
          animateToCollapsed();
        }
      },
    })
  ).current;

  const lastRecord = useMemo(() => rollHistory[0] ?? null, [rollHistory]);

  if (rollHistory.length === 0) return null;

  return (
    <Animated.View style={[styles.container, { height: heightAnim }]}>
      {/* Handle / header */}
      <View style={styles.header} {...panResponder.panHandlers}>
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Roll History</Text>
        </View>
      </View>

      {expanded ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {rollHistory.length === 0 ? (
            <Text style={styles.emptyText}>No rolls yet</Text>
          ) : (
            rollHistory.map((record) => <RollEntryRow key={record.id} record={record} />)
          )}
        </ScrollView>
      ) : (
        <View style={styles.collapsedContent}>
          {lastRecord !== null ? (
            <RollEntryRow record={lastRecord} />
          ) : (
            <Text style={styles.emptyText}>No rolls yet</Text>
          )}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1a1f2e',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    zIndex: 101,
    overflow: 'hidden',
    minHeight: 100,
  },
  header: {
    paddingBottom: 4,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#4B5563',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  title: {
    color: '#F9FAFB',
    fontSize: 14,
    fontWeight: '700',
  },
  collapsedContent: {
    paddingHorizontal: 16,
    flex: 1,
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#374151',
  },
  entryLeft: {
    flex: 1,
    marginRight: 12,
  },
  entryBreakdown: {
    color: '#D1D5DB',
    fontSize: 13,
  },
  entryTime: {
    color: '#6B7280',
    fontSize: 11,
    marginTop: 2,
  },
  entryTotal: {
    color: '#A5B4FC',
    fontSize: 20,
    fontWeight: '700',
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 8,
  },
});
