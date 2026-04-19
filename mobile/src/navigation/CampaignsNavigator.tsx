import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CampaignDetailScreen from '../screens/main/CampaignDetailScreen';
import CampaignListScreen from '../screens/main/CampaignListScreen';
import CreateCampaignScreen from '../screens/main/CreateCampaignScreen';

export type CampaignStackParamList = {
  CampaignList: undefined;
  CreateCampaign: undefined;
  CampaignDetail: { campaignId: string; name: string };
};

const Stack = createNativeStackNavigator<CampaignStackParamList>();

export default function CampaignsNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="CampaignList"
        component={CampaignListScreen}
        options={{ title: 'Campaigns' }}
      />
      <Stack.Screen
        name="CreateCampaign"
        component={CreateCampaignScreen}
        options={{ title: 'New Campaign' }}
      />
      <Stack.Screen
        name="CampaignDetail"
        component={CampaignDetailScreen}
        options={({ route }) => ({ title: route.params.name })}
      />
    </Stack.Navigator>
  );
}
