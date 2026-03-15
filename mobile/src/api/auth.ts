import { api } from './client';

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export function login(username: string, password: string): Promise<TokenResponse> {
  return api.post<TokenResponse>('/auth/login', { username, password });
}

export function register(username: string, password: string): Promise<void> {
  return api.post<void>('/user/create', { username, password });
}
