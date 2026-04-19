import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import AccountScreen from '../screens/main/AccountScreen';
import CampaignsNavigator from './CampaignsNavigator';
import NpcsNavigator from './NpcsNavigator';

export type DmTabParamList = {
  Campaigns: undefined;
  NPCs: undefined;
  Account: undefined;
};

const Tab = createBottomTabNavigator<DmTabParamList>();

export default function DmAppNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="NPCs" component={NpcsNavigator} />
      <Tab.Screen name="Campaigns" component={CampaignsNavigator} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}
