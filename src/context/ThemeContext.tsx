import { createContext, useState, useContext, useEffect, ReactNode } from 'react';

type ThemeType = 'blue' | 'purple';

interface ThemeContextType {
  theme: ThemeType;
  toggleTheme: () => void;
}

const defaultContext: ThemeContextType = {
  theme: 'blue',
  toggleTheme: () => {}
};

export const ThemeContext = createContext<ThemeContextType>(defaultContext);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // Force blue theme as default
  const [theme, setTheme] = useState<ThemeType>(() => {
    // Set blue as default and save to localStorage
    localStorage.setItem('celflicks-theme', 'blue');
    return 'blue';
  });

  // Toggle between the blue and retro themes
  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'blue' ? 'purple' : 'blue';
      localStorage.setItem('celflicks-theme', newTheme);
      return newTheme;
    });
  };

  // Apply theme to HTML element so we can access it from CSS
  useEffect(() => {
    // Remove both theme classes first
    document.documentElement.classList.remove('theme-blue');
    document.documentElement.classList.remove('theme-purple');
    
    // Add the current theme class
    document.documentElement.classList.add(`theme-${theme}`);
    
    // Also set data-theme attribute for compatibility with any existing styles
    document.documentElement.setAttribute('data-theme', theme);
    
    console.log(`Theme changed to: ${theme}`);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
