import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

import { useAuth } from './AuthContext';

const ID_KEY = '@wizwiz_current_character_id';
const NAME_KEY = '@wizwiz_current_character_name';

interface CurrentCharacterContextValue {
  currentCharacterId: string | null;
  currentCharacterName: string | null;
  setCurrentCharacter: (id: string, name: string) => Promise<void>;
  clearCurrentCharacter: () => Promise<void>;
}

const CurrentCharacterContext = createContext<CurrentCharacterContextValue | null>(null);

export function CurrentCharacterProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [currentCharacterId, setId] = useState<string | null>(null);
  const [currentCharacterName, setName] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [id, name] = await Promise.all([
        AsyncStorage.getItem(ID_KEY),
        AsyncStorage.getItem(NAME_KEY),
      ]);
      if (id) setId(id);
      if (name) setName(name);
    })();
  }, []);

  useEffect(() => {
    if (!token) {
      setId(null);
      setName(null);
      AsyncStorage.multiRemove([ID_KEY, NAME_KEY]).catch(() => {});
    }
  }, [token]);

  async function setCurrentCharacter(id: string, name: string) {
    setId(id);
    setName(name);
    await AsyncStorage.multiSet([
      [ID_KEY, id],
      [NAME_KEY, name],
    ]);
  }

  async function clearCurrentCharacter() {
    setId(null);
    setName(null);
    await AsyncStorage.multiRemove([ID_KEY, NAME_KEY]);
  }

  return (
    <CurrentCharacterContext.Provider
      value={{
        currentCharacterId,
        currentCharacterName,
        setCurrentCharacter,
        clearCurrentCharacter,
      }}
    >
      {children}
    </CurrentCharacterContext.Provider>
  );
}

export function useCurrentCharacter(): CurrentCharacterContextValue {
  const ctx = useContext(CurrentCharacterContext);
  if (!ctx) throw new Error('useCurrentCharacter must be used within CurrentCharacterProvider');
  return ctx;
}
