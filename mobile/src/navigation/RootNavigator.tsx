import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '../context/AuthContext';
import AppNavigator from './AppNavigator';
import AuthNavigator from './AuthNavigator';

export default function RootNavigator() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return token ? <AppNavigator /> : <AuthNavigator />;
}
