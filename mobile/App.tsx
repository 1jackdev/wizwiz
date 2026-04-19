import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

import { colors } from './src/theme';
import { AuthProvider } from './src/context/AuthContext';
import { CurrentCharacterProvider } from './src/context/CurrentCharacterContext';
import RootNavigator from './src/navigation/RootNavigator';

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

export default function App() {
  return (
    <AuthProvider>
      <CurrentCharacterProvider>
        <NavigationContainer theme={navTheme}>
          <StatusBar style="dark" />
          <RootNavigator />
        </NavigationContainer>
      </CurrentCharacterProvider>
    </AuthProvider>
  );
}
