import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import AccountScreen from '../screens/main/AccountScreen';
import CombatScreen from '../screens/main/CombatScreen';
import CharactersNavigator from './CharactersNavigator';

export type AppTabParamList = {
  Characters: undefined;
  Combat: undefined;
  Account: undefined;
};

const Tab = createBottomTabNavigator<AppTabParamList>();

export default function AppNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Characters" component={CharactersNavigator} />
      <Tab.Screen name="Combat" component={CombatScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}
