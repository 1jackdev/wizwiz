import { api } from './client';

export interface CharacterSummary {
  id: string;
  name: string;
  character_class: string;
  species: string;
  level: number;
  experience_points: number;
}

export interface CharacterDetail extends CharacterSummary {
  description: {
    height: number | null;
    weight: number | null;
    eye_color: string | null;
    hair_color: string | null;
    backstory: string | null;
    general_appearance: string | null;
  } | null;
  abilities: { name: string; score: number; modifier: number }[];
  skills: { name: string; ability: string; proficiency: string; passive_score: number; modifier: number }[];
  proficiency_bonus: number;
  saving_throws: { ability: string; value: number }[];
}

export function listCharacters(userId: string): Promise<CharacterSummary[]> {
  return api.get<CharacterSummary[]>(`/character/user/${userId}`);
}

export function getCharacter(characterId: string): Promise<CharacterDetail> {
  return api.get<CharacterDetail>(`/character/${characterId}/details`);
}

export async function updateCharacter(
  characterId: string,
  data: {
    name?: string;
    character_class?: string;
    species?: string;
    level?: number;
    experience_points?: number;
  }
): Promise<boolean> {
  const status = await api.putStatus(`/character/${characterId}/update`, data);
  return status !== 204;
}

export function createCharacter(data: {
  name: string;
  character_class: string;
  species: string;
  user_id: string;
}): Promise<void> {
  return api.post<void>('/character/create', data);
}
