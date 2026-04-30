import React, { useRef, useMemo, useEffect } from 'react';
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
import type { HistoryStep, RollRecord } from './DiceContext';
import { useTheme } from '../../context/ThemeContext';
import type { ColorScheme } from '../../theme';

type Step = 'thin' | 'peek' | 'full';

const THIN_HEIGHT = 40;
const PEEK_HEIGHT = 90;
const FULL_HEIGHT = Dimensions.get('window').height * 0.65;

const HEIGHTS: Record<string, number> = {
  hidden: THIN_HEIGHT,
  thin: THIN_HEIGHT,
  peek: PEEK_HEIGHT,
  full: FULL_HEIGHT,
};

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

function formatSigned(n: number): string {
  return n >= 0 ? `+${n}` : String(n);
}

function RollEntryRow({ record }: { record: RollRecord }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  if (record.passive) {
    return (
      <View style={styles.entryRow}>
        <View style={styles.entryLeft}>
          <Text style={styles.entryBreakdown} numberOfLines={1}>
            {record.modifier?.label ?? 'Passive'}
          </Text>
          <Text style={styles.entryTime}>{timeAgo(record.timestamp)}</Text>
        </View>
        <Text style={styles.entryTotal}>{record.total}</Text>
      </View>
    );
  }

  const breakdown = record.dice.map((d) => `${d.type}: ${d.value}`).join('   ');
  const modSuffix = record.modifier
    ? `  ·  ${record.modifier.label} ${formatSigned(record.modifier.value)}`
    : '';
  const finalTotal = record.modifier ? record.total + record.modifier.value : record.total;

  return (
    <View style={styles.entryRow}>
      <View style={styles.entryLeft}>
        <Text style={styles.entryBreakdown} numberOfLines={1} ellipsizeMode="tail">
          {breakdown}{modSuffix}
        </Text>
        <Text style={styles.entryTime}>{timeAgo(record.timestamp)}</Text>
      </View>
      <Text style={styles.entryTotal}>= {finalTotal}</Text>
    </View>
  );
}

export default function DiceHistory() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { rollHistory, historyStep, setHistoryStep } = useDice();
  const heightAnim = useRef(new Animated.Value(THIN_HEIGHT)).current;
  const prevStepRef = useRef<HistoryStep>(historyStep);
  const stepRef = useRef<Step>('thin');

  // Mirror context step → animation (handles external changes like addRoll setting 'peek')
  useEffect(() => {
    if (prevStepRef.current !== historyStep) {
      prevStepRef.current = historyStep;
      Animated.spring(heightAnim, {
        toValue: HEIGHTS[historyStep] ?? THIN_HEIGHT,
        useNativeDriver: false,
        tension: 60,
        friction: 12,
      }).start();
    }
    stepRef.current = (historyStep === 'hidden' ? 'thin' : historyStep) as Step;
  }, [historyStep, heightAnim]);

  const animateTo = (next: Step) => {
    prevStepRef.current = next;
    stepRef.current = next;
    setHistoryStep(next);
    Animated.spring(heightAnim, {
      toValue: HEIGHTS[next],
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
        gestureState: PanResponderGestureState,
      ) => Math.abs(gestureState.dy) > 5,

      onPanResponderRelease: (
        _evt: GestureResponderEvent,
        gestureState: PanResponderGestureState,
      ) => {
        const dy = gestureState.dy;
        const current = stepRef.current;
        const BIG = 80;
        const SMALL = 20;

        if (dy < -SMALL) {
          if (current === 'thin') {
            animateTo(dy < -BIG ? 'full' : 'peek');
          } else if (current === 'peek') {
            animateTo('full');
          }
        } else if (dy > SMALL) {
          if (current === 'full') {
            animateTo(dy > BIG ? 'thin' : 'peek');
          } else if (current === 'peek') {
            animateTo('thin');
          }
        }
      },
    }),
  ).current;

  const lastRecord = useMemo(() => rollHistory[0] ?? null, [rollHistory]);
  const displayStep = historyStep === 'hidden' ? 'thin' : historyStep;

  if (rollHistory.length === 0) return null;

  return (
    <Animated.View style={[styles.container, { height: heightAnim }]}>
      <View style={styles.header} {...panResponder.panHandlers}>
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Roll History</Text>
        </View>
      </View>

      {displayStep === 'full' ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {rollHistory.map((record) => (
            <RollEntryRow key={record.id} record={record} />
          ))}
        </ScrollView>
      ) : displayStep === 'peek' ? (
        <View style={styles.collapsedContent}>
          {lastRecord !== null ? <RollEntryRow record={lastRecord} /> : null}
        </View>
      ) : null}
    </Animated.View>
  );
}

const createStyles = (colors: ColorScheme) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.bgCard,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      zIndex: 101,
      overflow: 'hidden',
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
      backgroundColor: colors.border,
    },
    titleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingBottom: 4,
    },
    title: {
      color: colors.text,
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
      borderBottomColor: colors.border,
    },
    entryLeft: {
      flex: 1,
      marginRight: 12,
    },
    entryBreakdown: {
      color: colors.text,
      fontSize: 13,
    },
    entryTime: {
      color: colors.textMuted,
      fontSize: 11,
      marginTop: 2,
    },
    entryTotal: {
      color: colors.accent,
      fontSize: 20,
      fontWeight: '700',
    },
  });
