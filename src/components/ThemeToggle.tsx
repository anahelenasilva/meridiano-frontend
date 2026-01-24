'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/src/hooks/useTheme';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const getIcon = () => {
    if (theme === 'light') {
      return <Sun className="h-5 w-5" />;
    }
    if (theme === 'dark') {
      return <Moon className="h-5 w-5" />;
    }
    return <Monitor className="h-5 w-5" />;
  };

  const getLabel = () => {
    if (theme === 'light') {
      return 'Switch to dark theme';
    }
    if (theme === 'dark') {
      return 'Switch to system theme';
    }
    return 'Switch to light theme';
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleTheme();
    }
  };

  return (
    <button
      onClick={toggleTheme}
      onKeyDown={handleKeyDown}
      aria-label={getLabel()}
      className="flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
      type="button"
    >
      {getIcon()}
    </button>
  );
}
