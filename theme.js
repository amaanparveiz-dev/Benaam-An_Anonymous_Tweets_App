// theme.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useEffect, useMemo, useState } from 'react';
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

export const ThemeContext = createContext();

const CustomLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1e88e5',
    background: '#ffffff',
    surface: '#f5f5f5',
    onBackground: '#000000',
  },
};

const CustomDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#90caf9',
    background: '#121212',
    surface: '#1e1e1e',
    onBackground: '#ffffff',
  },
};

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

  const contextValue = useMemo(() => ({ themeMode, toggleTheme }), [themeMode]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children(theme)}
    </ThemeContext.Provider>
  );
}
