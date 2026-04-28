import React, { createContext, useContext, useEffect, useState } from 'react';
import { getUserPreferences, updateUserPreferences } from '../lib/api';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function initTheme() {
      // 1. Fallback to localStorage immediately for fast load to avoid flicker
      const cached = localStorage.getItem('app-theme') || 'light';
      applyTheme(cached);

      // 2. Fetch from API (backend sync)
      try {
        const prefs = await getUserPreferences();
        if (prefs && prefs.theme) {
          applyTheme(prefs.theme);
        }
      } catch (err) {
        console.error('Failed to sync theme from backend', err);
      }
      setIsLoaded(true);
    }
    initTheme();
  }, []);

  const applyTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('app-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    
    // Update UI instantly
    applyTheme(newTheme);

    // Sync with backend
    try {
      await updateUserPreferences({ theme: newTheme });
    } catch (err) {
      console.error('Failed to save theme to backend', err);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isLoaded }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
