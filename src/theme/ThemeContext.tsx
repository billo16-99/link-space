import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import Storage from 'expo-sqlite/kv-store';

import type { AppearanceMode } from '../types';
import { palettes, resolveAppearance, type Palette } from './tokens';

const MODE_KEY = 'appearance_mode';

export interface ThemeContextValue {
  mode: AppearanceMode;
  setMode: (mode: AppearanceMode) => void;
  resolvedMode: 'dark' | 'light';
  palette: Palette;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredMode(): AppearanceMode {
  try {
    const raw = Storage.getItemSync(MODE_KEY);
    if (raw === 'dark' || raw === 'light' || raw === 'system') {
      return raw;
    }
  } catch {
    // Storage not ready yet; fall back to dark (the primary design).
  }
  return 'dark';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme() ?? 'light';
  const [mode, setModeState] = useState<AppearanceMode>(readStoredMode);

  const setMode = useCallback((next: AppearanceMode) => {
    setModeState(next);
    try {
      Storage.setItemSync(MODE_KEY, next);
    } catch {
      // Persisting the preference is best-effort; the in-memory value still applies.
    }
  }, []);

  const value = useMemo<ThemeContextValue>(() => {
    const resolvedMode = resolveAppearance(mode, systemScheme);
    return {
      mode,
      setMode,
      resolvedMode,
      palette: palettes[resolvedMode],
    };
  }, [mode, systemScheme, setMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}