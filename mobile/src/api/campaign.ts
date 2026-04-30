import { CharacterSummary } from './character';
import { api } from './client';

export interface CampaignSummary {
  id: string;
  name: string;
  level: number;
  description: string | null;
  dm_id: string;
  invite_code: string;
  status: string;
}

export interface CampaignDetail extends CampaignSummary {
  characters: CharacterSummary[];
}

export function listDmCampaigns(dmId: string): Promise<CampaignSummary[]> {
  return api.get<CampaignSummary[]>(`/campaign/dm/${dmId}`);
}

export function listCharacterCampaigns(
  characterId: string,
): Promise<CampaignSummary[]> {
  return api.get<CampaignSummary[]>(`/campaign/character/${characterId}`);
}

export function getCampaign(campaignId: string): Promise<CampaignDetail> {
  return api.get<CampaignDetail>(`/campaign/${campaignId}/details`);
}

export function createCampaign(
  dmId: string,
  data: { name: string; level?: number; description?: string | null },
): Promise<CampaignSummary> {
  return api.post<CampaignSummary>(
    `/campaign/create?dm_id=${dmId}`,
    data,
  );
}

export async function updateCampaign(
  campaignId: string,
  data: { name?: string; level?: number; description?: string | null },
): Promise<boolean> {
  const status = await api.putStatus(`/campaign/${campaignId}/update`, data);
  return status !== 204;
}

export function deleteCampaign(campaignId: string): Promise<void> {
  return api.delete(`/campaign/${campaignId}/delete`);
}

export function regenerateInvite(
  campaignId: string,
): Promise<CampaignSummary> {
  return api.post<CampaignSummary>(
    `/campaign/${campaignId}/regenerate_invite`,
    {},
  );
}

export function joinCampaign(
  inviteCode: string,
  characterId: string,
): Promise<CampaignSummary> {
  return api.post<CampaignSummary>('/campaign/join', {
    invite_code: inviteCode,
    character_id: characterId,
  });
}

export function removeCharacterFromCampaign(
  campaignId: string,
  characterId: string,
): Promise<void> {
  return api.delete(`/campaign/${campaignId}/character/${characterId}`);
}
