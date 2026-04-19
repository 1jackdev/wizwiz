import { api } from './client';

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export function login(email: string, password: string): Promise<TokenResponse> {
  return api.post<TokenResponse>('/auth/login', { email, password });
}

export function register(email: string, password: string): Promise<void> {
  return api.post<void>('/user/create', { email, password });
}
