import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '../context/AuthContext';
import AppNavigator from './AppNavigator';
import AuthNavigator from './AuthNavigator';
import DmAppNavigator from './DmAppNavigator';

export default function RootNavigator() {
  const { token, isLoading, isDm, viewMode } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!token) return <AuthNavigator />;
  return isDm && viewMode === 'dm' ? <DmAppNavigator /> : <AppNavigator />;
}
