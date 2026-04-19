import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CreateNpcScreen from '../screens/main/CreateNpcScreen';
import NpcDetailScreen from '../screens/main/NpcDetailScreen';
import NpcListScreen from '../screens/main/NpcListScreen';

export type NpcStackParamList = {
  NpcList: undefined;
  CreateNpc: undefined;
  NpcDetail: { characterId: string; name: string };
};

const Stack = createNativeStackNavigator<NpcStackParamList>();

export default function NpcsNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="NpcList"
        component={NpcListScreen}
        options={{ title: 'NPCs' }}
      />
      <Stack.Screen
        name="CreateNpc"
        component={CreateNpcScreen}
        options={{ title: 'New NPC' }}
      />
      <Stack.Screen
        name="NpcDetail"
        component={NpcDetailScreen}
        options={({ route }) => ({ title: route.params.name })}
      />
    </Stack.Navigator>
  );
}
