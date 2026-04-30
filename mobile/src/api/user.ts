import { api } from './client';

export interface UserInfo {
  id: string;
  email: string;
  is_dm: boolean;
  theme: string;
}

export function getUser(userId: string): Promise<UserInfo> {
  return api.get<UserInfo>(`/user/${userId}/details`);
}

export function promoteToDm(userId: string): Promise<UserInfo> {
  return api.post<UserInfo>(`/user/${userId}/promote_dm`, {});
}

export function patchUserTheme(userId: string, theme: string): Promise<UserInfo> {
  return api.patch<UserInfo>(`/user/${userId}/theme`, { theme });
}
