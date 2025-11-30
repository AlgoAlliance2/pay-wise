import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/src/constants/Colors';

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeType;
  colors: typeof Colors.light;
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useColorScheme(); // 'light' or 'dark' from phone settings
  const [theme, setTheme] = useState<ThemeType>(systemScheme === 'dark' ? 'dark' : 'light');

  // 1. Load saved theme on startup
  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem('user-theme');
      if (savedTheme) {
        setTheme(savedTheme as ThemeType);
      }
    };
    loadTheme();
  }, []);

  // 2. Function to toggle and save
  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    await AsyncStorage.setItem('user-theme', newTheme);
  };

  const currentColors = Colors[theme];

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        colors: currentColors, 
        toggleTheme, 
        isDarkMode: theme === 'dark' 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Custom Hook to use the theme easily
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};