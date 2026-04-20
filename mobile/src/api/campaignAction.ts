import { api } from './client';

export type ActionType = 'action' | 'bonus' | 'reaction';

export interface CampaignAction {
  id: string;
  campaign_id: string;
  character_id: string;
  action_type: ActionType;
  action_name: string | null;
  in_combat: boolean;
  round_number: number | null;
  created_at: string | null;
}

export interface CampaignActionPage {
  items: CampaignAction[];
  page: number;
  page_size: number;
  total: number;
}

export interface LogActionInput {
  character_id: string;
  action_type: ActionType;
  action_name?: string | null;
  in_combat: boolean;
  round_number?: number | null;
}

export function logCampaignAction(
  campaignId: string,
  input: LogActionInput,
): Promise<void> {
  return api.post<void>(`/campaign/${campaignId}/actions`, input);
}

export interface ListActionsFilter {
  page?: number;
  pageSize?: number;
  characterId?: string | null;
  inCombat?: boolean | null;
}

export function listCampaignActions(
  campaignId: string,
  filter: ListActionsFilter = {},
): Promise<CampaignActionPage> {
  const params = new URLSearchParams();
  params.set('page', String(filter.page ?? 1));
  params.set('page_size', String(filter.pageSize ?? 20));
  if (filter.characterId) params.set('character_id', filter.characterId);
  if (filter.inCombat !== undefined && filter.inCombat !== null) {
    params.set('in_combat', String(filter.inCombat));
  }
  return api.get<CampaignActionPage>(
    `/campaign/${campaignId}/actions?${params.toString()}`,
  );
}

export function listCharacterCampaignActions(
  campaignId: string,
  characterId: string,
  page = 1,
  pageSize = 20,
): Promise<CampaignActionPage> {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('page_size', String(pageSize));
  return api.get<CampaignActionPage>(
    `/campaign/${campaignId}/character/${characterId}/actions?${params.toString()}`,
  );
}
