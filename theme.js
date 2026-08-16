// theme.js
// Centralized design system: palette, spacing, radius, typography,
// glass tokens + theme provider.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useEffect, useMemo, useState } from 'react';
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

export const ThemeContext = createContext();

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
export const palette = {
  primary: '#7C6FF0', // soft periwinkle-violet
  primaryDark: '#4834D4',
  primarySoft: '#EDEBFF',
  secondary: '#5EEAD4', // mint accent
  accent: '#F472B6', // rose accent for likes / highlights
  danger: '#FB7185',
  warning: '#FBBF24',
  success: '#34D399',

  gradientPrimary: ['#8B7FFA', '#6C5CE7', '#4834D4'],
  gradientAccent: ['#5EEAD4', '#7C6FF0'],
  gradientSunset: ['#F472B6', '#8B7FFA'],

  // Full-screen ambient wash sat behind glass surfaces.
  ambient: {
    light: ['#F3F1FF', '#FAF9FF', '#FFFFFF'],
    dark: ['#181428', '#0D0B14', '#08070D'],
  },

  light: {
    background: '#F7F6FC',
    surface: '#FFFFFF',
    surfaceAlt: '#F1EFFB',
    border: '#E9E7F5',
    text: '#16151F',
    textMuted: '#6E6E82',
    textFaint: '#9C9CB0',
  },
  dark: {
    background: '#0A0910',
    surface: '#15131F',
    surfaceAlt: '#1C1A2A',
    border: 'rgba(255,255,255,0.10)',
    text: '#F6F5FB',
    textMuted: '#A7A6BE',
    textFaint: '#716F8C',
  },
};

// Glassmorphism surface tokens â€” a translucent fill + soft border, meant to
// sit above a BlurView so content behind it shows through, frosted.
export const glass = {
  light: {
    bg: 'rgba(255,255,255,0.55)',
    strongBg: 'rgba(255,255,255,0.78)',
    border: 'rgba(255,255,255,0.75)',
    tint: 'light',
  },
  dark: {
    bg: 'rgba(255,255,255,0.06)',
    strongBg: 'rgba(30,26,46,0.55)',
    border: 'rgba(255,255,255,0.12)',
    tint: 'dark',
  },
};

export const radius = { xs: 10, sm: 14, md: 18, lg: 24, xl: 30, pill: 999 };

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };

export const typography = {
  display: { fontSize: 30, fontWeight: '700', letterSpacing: 0.2 },
  h1: { fontSize: 23, fontWeight: '700', letterSpacing: 0.1 },
  h2: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 15, fontWeight: '400' },
  bodyStrong: { fontSize: 15, fontWeight: '600' },
  caption: { fontSize: 12, fontWeight: '500', letterSpacing: 0.4 },
};

export const shadow = {
  soft: {
    shadowColor: '#1A1330',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  glow: {
    shadowColor: '#4834D4',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 22,
    elevation: 8,
  },
};

// ---------------------------------------------------------------------------
// React Native Paper theme mapping
// ---------------------------------------------------------------------------
const CustomLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: palette.primary,
    background: palette.light.background,
    surface: palette.light.surface,
    surfaceVariant: palette.light.surfaceAlt,
    outline: palette.light.border,
    onBackground: palette.light.text,
    onSurface: palette.light.text,
  },
};

const CustomDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: palette.secondary,
    background: palette.dark.background,
    surface: palette.dark.surface,
    surfaceVariant: palette.dark.surfaceAlt,
    outline: palette.dark.border,
    onBackground: palette.dark.text,
    onSurface: palette.dark.text,
  },
};

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function ThemeProvider({ children }) {
  const [themeMode, setThemeMode] = useState('light');

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('theme');
      if (stored) setThemeMode(stored);
    })();
  }, []);

  const toggleTheme = async () => {
    const next = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(next);
    await AsyncStorage.setItem('theme', next);
  };

  const theme = useMemo(
    () => (themeMode === 'light' ? CustomLightTheme : CustomDarkTheme),
    [themeMode]
  );

  // Convenience bag of raw tokens matching the active mode, so screens don't
  // need to branch on themeMode everywhere.
  const tokens = useMemo(
    () => ({
      ...palette[themeMode === 'light' ? 'light' : 'dark'],
      glass: themeMode === 'light' ? glass.light : glass.dark,
      ambient: themeMode === 'light' ? palette.ambient.light : palette.ambient.dark,
      isDark: themeMode === 'dark',
    }),
    [themeMode]
  );

  const contextValue = useMemo(
    () => ({ themeMode, toggleTheme, tokens }),
    [themeMode, tokens]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children(theme)}
    </ThemeContext.Provider>
  );
}