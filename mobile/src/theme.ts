export type ThemeName = 'dark' | 'nature' | 'bloodmoon';

export type ColorScheme = typeof darkTheme;

const darkTheme = {
  bg: '#0d1117',
  bgCard: '#161b22',
  bgInput: '#21262d',
  bgModal: '#1c2128',
  text: '#e6edf3',
  textSecondary: '#8b949e',
  textMuted: '#6e7681',
  border: '#30363d',
  accent: '#6366f1',
  accentDisabled: '#3730a3',
  error: '#f87171',
  errorBg: '#2d0a0a',
  success: '#4ade80',
  successBg: '#0d2d1a',
  tabBar: '#161b22',
  header: '#161b22',
};

const natureTheme: ColorScheme = {
  bg: '#f5f0e8',
  bgCard: '#ede8da',
  bgInput: '#e0dace',
  bgModal: '#e8e2d4',
  text: '#2d2417',
  textSecondary: '#5a4a35',
  textMuted: '#8a7a65',
  border: '#c8b89a',
  accent: '#2d6a4f',
  accentDisabled: '#95c4ae',
  error: '#c1440e',
  errorBg: '#faeae0',
  success: '#1b4332',
  successBg: '#d8f3dc',
  tabBar: '#ede8da',
  header: '#ede8da',
};

const bloodmoonTheme: ColorScheme = {
  bg: '#0a0a0a',
  bgCard: '#111111',
  bgInput: '#1a1a1a',
  bgModal: '#141414',
  text: '#f0f0f0',
  textSecondary: '#aaaaaa',
  textMuted: '#666666',
  border: '#3a0a0a',
  accent: '#dc2626',
  accentDisabled: '#7f1d1d',
  error: '#f87171',
  errorBg: '#1a0000',
  success: '#4ade80',
  successBg: '#0d2d1a',
  tabBar: '#111111',
  header: '#111111',
};

export const themes: Record<ThemeName, ColorScheme> = {
  dark: darkTheme,
  nature: natureTheme,
  bloodmoon: bloodmoonTheme,
};

export const themeLabels: Record<ThemeName, string> = {
  dark: 'Dark',
  nature: 'Nature',
  bloodmoon: 'Blood Moon',
};
