import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import AccountScreen from '../screens/main/AccountScreen';
import ActionsScreen from '../screens/main/ActionsScreen';
import CharactersNavigator from './CharactersNavigator';

export type AppTabParamList = {
  Characters: undefined;
  Actions: undefined;
  Account: undefined;
};

const Tab = createBottomTabNavigator<AppTabParamList>();

export default function AppNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Characters" component={CharactersNavigator} />
      <Tab.Screen name="Actions" component={ActionsScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}
