import React from 'react';
import { useTheme } from '../../hooks/useTheme';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      onClick={toggleTheme}
      style={{
        background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
        color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
        transition: 'color 0.2s'
      }}
      title="Toggle Dark Mode"
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
