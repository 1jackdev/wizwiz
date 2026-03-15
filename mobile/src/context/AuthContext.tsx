import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useState } from 'react';

import { login as apiLogin, register as apiRegister } from '../api/auth';

interface AuthContextValue {
  token: string | null;
  userId: string | null;
  username: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function decodeJwtPayload(token: string): { sub: string; username: string } {
  const payload = token.split('.')[1];
  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(base64));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    SecureStore.getItemAsync('access_token').then((stored) => {
      applyToken(stored);
      setIsLoading(false);
    });
  }, []);

  function applyToken(t: string | null) {
    if (t) {
      const payload = decodeJwtPayload(t);
      setUserId(payload.sub);
      setUsername(payload.username);
    } else {
      setUserId(null);
      setUsername(null);
    }
    setToken(t);
  }

  async function login(user: string, password: string) {
    const { access_token } = await apiLogin(user, password);
    await SecureStore.setItemAsync('access_token', access_token);
    applyToken(access_token);
  }

  async function register(user: string, password: string) {
    await apiRegister(user, password);
    await login(user, password);
  }

  async function logout() {
    await SecureStore.deleteItemAsync('access_token');
    applyToken(null);
  }

  return (
    <AuthContext.Provider value={{ token, userId, username, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
