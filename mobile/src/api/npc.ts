import { CharacterSummary } from './character';
import { api } from './client';

export function listNpcs(dmId: string): Promise<CharacterSummary[]> {
  return api.get<CharacterSummary[]>(`/npc/dm/${dmId}`);
}

export function createNpc(data: {
  name: string;
  character_class: string;
  species: string;
  dm_id: string;
}): Promise<void> {
  return api.post<void>('/npc/create', data);
}
