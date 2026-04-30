import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { CurrentCharacterProvider } from './src/context/CurrentCharacterContext';
import RootNavigator from './src/navigation/RootNavigator';

function ThemedApp() {
  const { colors, themeName } = useTheme();
  const navTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: colors.bg,
      card: colors.header,
      border: colors.border,
      text: colors.text,
    },
  };
  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={themeName === 'nature' ? 'dark' : 'light'} />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CurrentCharacterProvider>
          <ThemedApp />
        </CurrentCharacterProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
