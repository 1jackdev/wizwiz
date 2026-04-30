import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ColorScheme, ThemeName, themes } from '../theme';

interface ThemeContextValue {
  colors: ColorScheme;
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: themes.dark,
  themeName: 'dark',
  setTheme: () => {},
});

const STORAGE_KEY = '@wizwiz_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>('dark');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(stored => {
      if (stored && stored in themes) setThemeName(stored as ThemeName);
    });
  }, []);

  function setTheme(name: ThemeName) {
    setThemeName(name);
    AsyncStorage.setItem(STORAGE_KEY, name);
  }

  const value = useMemo<ThemeContextValue>(
    () => ({ colors: themes[themeName], themeName, setTheme }),
    [themeName],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
