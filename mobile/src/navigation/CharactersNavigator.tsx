import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AbilitiesScreen from '../screens/main/AbilitiesScreen';
import CharacterDetailScreen from '../screens/main/CharacterDetailScreen';
import CharacterListScreen from '../screens/main/CharacterListScreen';
import CreateCharacterScreen from '../screens/main/CreateCharacterScreen';
import SkillsScreen from '../screens/main/SkillsScreen';

export type CharacterStackParamList = {
  CharacterList: undefined;
  CreateCharacter: undefined;
  CharacterDetail: { characterId: string; name: string };
  Abilities: { characterId: string };
  Skills: { characterId: string };
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
        name="Abilities"
        component={AbilitiesScreen}
        options={{ title: 'Abilities' }}
      />
      <Stack.Screen
        name="Skills"
        component={SkillsScreen}
        options={{ title: 'Skills' }}
      />
    </Stack.Navigator>
  );
}
