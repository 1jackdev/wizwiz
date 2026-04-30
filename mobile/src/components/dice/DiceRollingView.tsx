import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useDice } from './DiceContext';
import type { ActiveDie, DieType } from './DiceContext';
import { getDieComponent } from './shapes';

const DIE_GLOW: Record<DieType, string> = {
  d4: '#EF4444',
  d6: '#F97316',
  d8: '#EAB308',
  d10: '#22C55E',
  d12: '#06B6D4',
  d20: '#6366F1',
};

const DIE_MAX: Record<DieType, number> = {
  d4: 4,
  d6: 6,
  d8: 8,
  d10: 10,
  d12: 12,
  d20: 20,
};

const DIE_SIZE = 72;
const DOUBLE_TAP_DELAY = 300;

// ─── RollingDie ──────────────────────────────────────────────────────────────

interface RollingDieProps {
  die: ActiveDie;
  initialX: number;
  initialY: number;
  shouldRoll: boolean;
  screenWidth: number;
  screenHeight: number;
  result: number | null;
  onComplete: (id: string, value: number) => void;
  onTap: () => void;
}

function RollingDie({
  die,
  initialX,
  initialY,
  shouldRoll,
  screenWidth,
  screenHeight,
  result,
  onComplete,
  onTap,
}: RollingDieProps) {
  const posX = useRef(new Animated.Value(initialX)).current;
  const posY = useRef(new Animated.Value(initialY)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const hasRolled = useRef(false);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!shouldRoll || hasRolled.current) return;
    hasRolled.current = true;

    const durationMs = 1000 + Math.random() * 3000;
    const numWaypoints = 3 + Math.floor(Math.random() * 4);
    const totalDegrees = (4 + Math.floor(Math.random() * 9)) * 360;

    const maxX = screenWidth - DIE_SIZE - 20;
    const maxY = screenHeight - DIE_SIZE - 300;

    const waypointsX = Array.from({ length: numWaypoints }, () => 20 + Math.random() * maxX);
    const waypointsY = Array.from({ length: numWaypoints }, () => 20 + Math.random() * maxY);
    const segDuration = durationMs / numWaypoints;

    Animated.parallel([
      Animated.sequence(
        waypointsX.map((x) =>
          Animated.timing(posX, { toValue: x, duration: segDuration, useNativeDriver: true })
        )
      ),
      Animated.sequence(
        waypointsY.map((y) =>
          Animated.timing(posY, { toValue: y, duration: segDuration, useNativeDriver: true })
        )
      ),
      Animated.timing(rotation, {
        toValue: totalDegrees,
        duration: durationMs,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onCompleteRef.current(die.id, Math.floor(Math.random() * die.sides) + 1);
    });
  }, [shouldRoll, die.id, die.sides, posX, posY, rotation, screenWidth, screenHeight]);

  const spin = rotation.interpolate({ inputRange: [0, 4320], outputRange: ['0deg', '4320deg'] });
  const DieComponent = getDieComponent(die.type);
  const glowColor = DIE_GLOW[die.type];

  return (
    <Animated.View
      style={[
        styles.dieWrapper,
        {
          transform: [{ translateX: posX }, { translateY: posY }, { rotate: spin }],
          shadowColor: glowColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.4,
          shadowRadius: 6,
        },
      ]}
    >
      <Pressable onPress={onTap} style={styles.diePressable}>
        <DieComponent
          value={shouldRoll && result == null ? null : (result ?? DIE_MAX[die.type])}
          size={DIE_SIZE}
        />
      </Pressable>
    </Animated.View>
  );
}

// ─── DiceRollingView ─────────────────────────────────────────────────────────

export default function DiceRollingView() {
  const { activeDice, rollState, triggerRoll, addRoll, clearDice } = useDice();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const [rollGen, _] = useState(0);
  const [displayResults, setDisplayResults] = useState<Map<string, number>>(new Map());
  const resultsRef = useRef<Map<string, number>>(new Map());
  const completedRef = useRef(0);

  // Auto-clear 5s after roll completes
  useEffect(() => {
    if (rollState !== 'complete') return;
    const timer = setTimeout(clearDice, 5000);
    return () => clearTimeout(timer);
  }, [rollState, clearDice]);

  useEffect(() => {
    resultsRef.current = new Map();
    completedRef.current = 0;
    setDisplayResults(new Map());
  }, [activeDice, rollGen]);

  const onDieComplete = useCallback(
    (id: string, value: number) => {
      resultsRef.current.set(id, value);
      completedRef.current += 1;
      setDisplayResults((prev) => new Map(prev).set(id, value));
      if (completedRef.current === activeDice.length) {
        addRoll(
          activeDice.map((d) => ({ type: d.type, value: resultsRef.current.get(d.id) ?? 1 }))
        );
      }
    },
    [activeDice, addRoll]
  );

  const lastTapRef = useRef(0);
  const handleDieTap = useCallback(() => {
    if (rollState === 'complete') {
      clearDice();
      return;
    }
    if (rollState !== 'ready') return;
    const now = Date.now();
    const delta = now - lastTapRef.current;
    if (delta < DOUBLE_TAP_DELAY && delta > 0) {
      lastTapRef.current = 0;
      triggerRoll();
    } else {
      lastTapRef.current = now;
    }
  }, [rollState, triggerRoll, clearDice]);

  if (activeDice.length === 0) return null;

  const shouldRoll = rollState === 'rolling' || rollState === 'complete';

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Hint shown in ready state — non-interactive so it doesn't block touches */}
      {rollState === 'ready' && (
        <View style={styles.hintContainer} pointerEvents="none">
          <Text style={styles.hintText}>Double-tap a die to roll</Text>
        </View>
      )}

      {activeDice.map((die, index) => {
        const col = index % 3;
        const row = Math.floor(index / 3);
        const initialX = screenWidth / 2 - (DIE_SIZE + 12) * 1.5 + col * (DIE_SIZE + 12);
        const initialY = screenHeight / 2 - (DIE_SIZE + 12) * 1.5 + row * (DIE_SIZE + 12);

        return (
          <RollingDie
            key={`${die.id}-${rollGen}`}
            die={die}
            initialX={initialX}
            initialY={initialY}
            shouldRoll={shouldRoll}
            screenWidth={screenWidth}
            screenHeight={screenHeight}
            result={displayResults.get(die.id) ?? null}
            onComplete={onDieComplete}
            onTap={handleDieTap}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  dieWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: DIE_SIZE,
    height: DIE_SIZE,
    zIndex: 90,
  },
  diePressable: {
    width: DIE_SIZE,
    height: DIE_SIZE,
  },
  hintContainer: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 90,
  },
  hintText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 15,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: 'hidden',
  },
});
