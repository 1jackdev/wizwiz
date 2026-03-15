import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'http://localhost:8054/api';

async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync('access_token');
}

async function execute(path: string, options: RequestInit = {}): Promise<Response> {
  const token = await getToken();
  const method = options.method ?? 'GET';

  console.log(`[API] ${method} ${path}`);

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const detail = error.details;
    const message =
      typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
          ? detail.map((d: any) => d.msg).join(', ')
          : `Request failed: ${response.status}`;
    throw new Error(message);
  }

  console.log(`[API] ${method} ${path} → ${response.status}`);
  return response;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await execute(path, options);
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return undefined as T;
  }
  return response.json();
}

async function requestStatus(path: string, options: RequestInit = {}): Promise<number> {
  const response = await execute(path, options);
  return response.status;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  putStatus: (path: string, body: unknown) =>
    requestStatus(path, { method: 'PUT', body: JSON.stringify(body) }),
};
