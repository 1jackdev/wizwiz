import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

import { login as apiLogin, register as apiRegister } from '../api/auth';
import {
  getUser,
  promoteToDm as apiPromoteToDm,
  UserInfo,
} from '../api/user';
import { ThemeName, themes } from '../theme';
import { useTheme } from './ThemeContext';

export type ViewMode = 'player' | 'dm';

const VIEW_MODE_KEY = '@wizwiz_view_mode';

interface AuthContextValue {
  token: string | null;
  userId: string | null;
  email: string | null;
  isDm: boolean;
  viewMode: ViewMode;
  setViewMode: (m: ViewMode) => Promise<void>;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  promoteToDm: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function decodeJwtPayload(token: string): { sub: string; email: string } {
  const payload = token.split('.')[1];
  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(base64));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setTheme } = useTheme();
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isDm, setIsDm] = useState(false);
  const [viewMode, setViewModeState] = useState<ViewMode>('player');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await SecureStore.getItemAsync('access_token');
      const savedMode = (await AsyncStorage.getItem(VIEW_MODE_KEY)) as ViewMode | null;
      if (savedMode === 'dm' || savedMode === 'player') {
        setViewModeState(savedMode);
      }
      await applyToken(stored);
      setIsLoading(false);
    })();
  }, []);

  async function applyToken(t: string | null) {
    if (t) {
      const payload = decodeJwtPayload(t);
      setUserId(payload.sub);
      setEmail(payload.email);
      setToken(t);
      try {
        const info = await getUser(payload.sub);
        setIsDm(info.is_dm);
        if (info.theme && info.theme in themes) {
          setTheme(info.theme as ThemeName);
        }
      } catch {
        setIsDm(false);
      }
    } else {
      setUserId(null);
      setEmail(null);
      setIsDm(false);
      setToken(null);
      setViewModeState('player');
    }
  }

  async function login(emailVal: string, password: string) {
    const { access_token } = await apiLogin(emailVal, password);
    await SecureStore.setItemAsync('access_token', access_token);
    await applyToken(access_token);
  }

  async function register(emailVal: string, password: string) {
    await apiRegister(emailVal, password);
    await login(emailVal, password);
  }

  async function logout() {
    await SecureStore.deleteItemAsync('access_token');
    await AsyncStorage.removeItem(VIEW_MODE_KEY);
    await applyToken(null);
  }

  async function setViewMode(m: ViewMode) {
    setViewModeState(m);
    await AsyncStorage.setItem(VIEW_MODE_KEY, m);
  }

  async function promoteToDm() {
    if (!userId) return;
    const info: UserInfo = await apiPromoteToDm(userId);
    setIsDm(info.is_dm);
  }

  async function refreshUser() {
    if (!userId) return;
    const info = await getUser(userId);
    setIsDm(info.is_dm);
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        userId,
        email,
        isDm,
        viewMode,
        setViewMode,
        isLoading,
        login,
        register,
        logout,
        promoteToDm,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
