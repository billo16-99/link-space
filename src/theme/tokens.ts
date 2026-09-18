import type { TextStyle } from 'react-native';

import type { AppearanceMode } from '../types';

export interface Palette {
  background: string;
  surface: string;
  surfaceRaised: string;
  border: string;
  inputBackground: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  accent: string;
  accentSoft: string;
  danger: string;
  success: string;
}

export const palettes: Record<'dark' | 'light', Palette> = {
  dark: {
    background: '#0B0B0D',
    surface: '#151519',
    surfaceRaised: '#1D1D23',
    border: '#26262E',
    inputBackground: '#1A1A1F',
    textPrimary: '#FFFFFF',
    textSecondary: '#9B9BA6',
    textTertiary: '#6E6E78',
    accent: '#7C5CFF',
    accentSoft: 'rgba(124, 92, 255, 0.16)',
    danger: '#FF5A5F',
    success: '#30C48B',
  },
  light: {
    background: '#F7F7F8',
    surface: '#FFFFFF',
    surfaceRaised: '#FFFFFF',
    border: '#E4E4EA',
    inputBackground: '#EDEDF1',
    textPrimary: '#111114',
    textSecondary: '#6E6E78',
    textTertiary: '#9B9BA6',
    accent: '#7C5CFF',
    accentSoft: 'rgba(124, 92, 255, 0.12)',
    danger: '#E5484D',
    success: '#1E9E66',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const type: Record<'title' | 'heading' | 'body' | 'label' | 'caption', TextStyle> = {
  title: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
    letterSpacing: -0.4,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
    letterSpacing: -0.3,
  },
  body: {
    fontSize: 15,
    lineHeight: 21,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
  },
};

export function resolveAppearance(
  mode: AppearanceMode,
  systemMode: 'dark' | 'light'
): 'dark' | 'light' {
  if (mode === 'system') {
    return systemMode;
  }
  return mode;
}

export const SPACE_COLORS = [
  '#7C5CFF',
  '#30B8D4',
  '#FF8A5C',
  '#30C48B',
  '#FF5A5F',
  '#F5B711',
  '#E85CFF',
] as const;