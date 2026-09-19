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
  textPlaceholder: string;
  accent: string;
  accentSoft: string;
  danger: string;
  success: string;
}

export const palettes: Record<'dark' | 'light', Palette> = {
  dark: {
    background: '#000000',
    surface: '#111113',
    surfaceRaised: '#1A1A1E',
    border: 'rgba(40,42,49,0.70)',
    inputBackground: '#111113',
    textPrimary: '#F4F4F5',
    textSecondary: '#92959F',
    textTertiary: '#656873',
    textPlaceholder: '#777B87',
    accent: '#A56BFF',
    accentSoft: 'rgba(165,107,255,0.08)',
    danger: '#FF5C68',
    success: '#27C76F',
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
    textPlaceholder: '#9B9BA6',
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
  xl2: 24,
  xxl: 28,
  xxl2: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const type: Record<
  | 'title'
  | 'heading'
  | 'body'
  | 'label'
  | 'caption'
  | 'cardTitle'
  | 'subtitle'
  | 'count'
  | 'category'
  | 'button'
  | 'searchPlaceholder',
  TextStyle
> = {
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
  cardTitle: {
    fontSize: 19,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  count: {
    fontSize: 16,
    lineHeight: 22,
  },
  category: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
  },
  button: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
  },
  searchPlaceholder: {
    fontSize: 16,
    lineHeight: 22,
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
  '#A56BFF',
  '#20D889',
  '#22B5E8',
  '#F5C21A',
  '#8890FF',
  '#FF5C68',
  '#E85CFF',
] as const;