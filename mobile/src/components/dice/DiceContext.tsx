import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type DieType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';

export const DIE_SIDES: Record<DieType, number> = {
  d4: 4,
  d6: 6,
  d8: 8,
  d10: 10,
  d12: 12,
  d20: 20,
};

export interface DieSelection {
  type: DieType;
  count: number;
}

export interface ActiveDie {
  id: string;
  type: DieType;
  sides: number;
}

export interface DieRollResult {
  type: DieType;
  value: number;
}

export interface RollModifier {
  label: string;
  value: number;
}

export interface RollRecord {
  id: string;
  dice: DieRollResult[];
  total: number;
  timestamp: number;
  modifier?: RollModifier;
  passive?: boolean;
}

export type RollState = 'idle' | 'ready' | 'rolling' | 'complete';

export type HistoryStep = 'hidden' | 'thin' | 'peek' | 'full';

interface DiceContextValue {
  isFabVisible: boolean;
  hideFab: () => void;
  showFab: () => void;
  activeDice: ActiveDie[];
  rollState: RollState;
  rollHistory: RollRecord[];
  historyStep: HistoryStep;
  setHistoryStep: (step: HistoryStep) => void;
  pendingModifier: RollModifier | null;
  setPendingModifier: (m: RollModifier | null) => void;
  placeDice: (selections: DieSelection[]) => void;
  triggerRoll: () => void;
  addRoll: (dice: DieRollResult[]) => void;
  logPassive: (label: string, score: number) => void;
  clearDice: () => void;
}

const FAB_KEY = '@wizwiz_dice_fab_visible';
const HISTORY_KEY = '@wizwiz_dice_history';
const MAX_HISTORY = 50;

const DiceContext = createContext<DiceContextValue | null>(null);

export function DiceProvider({ children }: { children: React.ReactNode }) {
  const [isFabVisible, setIsFabVisible] = useState(true);
  const [activeDice, setActiveDice] = useState<ActiveDie[]>([]);
  const [rollState, setRollState] = useState<RollState>('idle');
  const [rollHistory, setRollHistory] = useState<RollRecord[]>([]);
  const [historyStep, setHistoryStep] = useState<HistoryStep>('thin');
  const [pendingModifier, setPendingModifier] = useState<RollModifier | null>(null);

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(FAB_KEY), AsyncStorage.getItem(HISTORY_KEY)]).then(
      ([fabVal, histVal]) => {
        if (fabVal !== null) setIsFabVisible(fabVal === 'true');
        if (histVal) {
          try {
            setRollHistory(JSON.parse(histVal) as RollRecord[]);
          } catch {
            // ignore malformed stored data
          }
        }
      }
    );
  }, []);

  const hideFab = useCallback(() => {
    setIsFabVisible(false);
    AsyncStorage.setItem(FAB_KEY, 'false');
  }, []);

  const showFab = useCallback(() => {
    setIsFabVisible(true);
    AsyncStorage.setItem(FAB_KEY, 'true');
  }, []);

  const placeDice = useCallback((selections: DieSelection[]) => {
    const dice: ActiveDie[] = [];
    selections.forEach((sel) => {
      for (let i = 0; i < sel.count; i++) {
        dice.push({
          id: `${sel.type}-${i}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          type: sel.type,
          sides: DIE_SIDES[sel.type],
        });
      }
    });
    setActiveDice(dice);
    setRollState('ready');
  }, []);

  const triggerRoll = useCallback(() => setRollState('rolling'), []);

  const addRoll = useCallback(
    (dice: DieRollResult[]) => {
      const total = dice.reduce((sum, d) => sum + d.value, 0);
      const record: RollRecord = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        dice,
        total,
        timestamp: Date.now(),
        modifier: pendingModifier ?? undefined,
      };
      setPendingModifier(null);
      setHistoryStep('peek');
      setRollHistory((prev) => {
        const next = [record, ...prev].slice(0, MAX_HISTORY);
        AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
        return next;
      });
      setRollState('complete');
    },
    [pendingModifier],
  );

  const logPassive = useCallback((label: string, score: number) => {
    const record: RollRecord = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      dice: [],
      total: score,
      timestamp: Date.now(),
      modifier: { label, value: score },
      passive: true,
    };
    setHistoryStep('peek');
    setRollHistory((prev) => {
      const next = [record, ...prev].slice(0, MAX_HISTORY);
      AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearDice = useCallback(() => {
    setActiveDice([]);
    setRollState('idle');
  }, []);

  return (
    <DiceContext.Provider
      value={{
        isFabVisible,
        hideFab,
        showFab,
        activeDice,
        rollState,
        rollHistory,
        historyStep,
        setHistoryStep,
        pendingModifier,
        setPendingModifier,
        placeDice,
        triggerRoll,
        addRoll,
        logPassive,
        clearDice,
      }}
    >
      {children}
    </DiceContext.Provider>
  );
}

export function useDice(): DiceContextValue {
  const ctx = useContext(DiceContext);
  if (!ctx) throw new Error('useDice must be used within DiceProvider');
  return ctx;
}
