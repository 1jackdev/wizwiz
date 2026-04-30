import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CharacterDetailScreen from '../screens/main/CharacterDetailScreen';
import CharacterListScreen from '../screens/main/CharacterListScreen';
import CreateCharacterScreen from '../screens/main/CreateCharacterScreen';
import JoinCampaignScreen from '../screens/main/JoinCampaignScreen';

export type CharacterStackParamList = {
  CharacterList: undefined;
  CreateCharacter: undefined;
  CharacterDetail: { characterId: string; name: string };
  JoinCampaign: undefined;
};

const Stack = createNativeStackNavigator<CharacterStackParamList>();

export default function CharactersNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="CharacterList"
        component={CharacterListScreen}
        options={{ title: 'Characters' }}
      />
      <Stack.Screen
        name="CreateCharacter"
        component={CreateCharacterScreen}
        options={{ title: 'New Character' }}
      />
      <Stack.Screen
        name="CharacterDetail"
        component={CharacterDetailScreen}
        options={({ route }) => ({ title: route.params.name })}
      />
      <Stack.Screen
        name="JoinCampaign"
        component={JoinCampaignScreen}
        options={{ title: 'Join Campaign' }}
      />
    </Stack.Navigator>
  );
}
