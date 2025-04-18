import { Sparkles, Atom } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeSwitcherIconProps {
  className?: string;
}

const ThemeSwitcherIcon = ({ className = '' }: ThemeSwitcherIconProps) => {
  const { theme, toggleTheme } = useTheme();
  
  const handleThemeToggle = () => {
    console.log(`Switching theme from ${theme} to ${theme === 'blue' ? 'purple' : 'blue'}`);
    toggleTheme();
    // Add a short delay and then verify the theme was applied
    setTimeout(() => {
      console.log(`Current theme after toggle: ${document.documentElement.classList.contains('theme-blue') ? 'blue' : 'purple'}`);
      console.log(`HTML classes: ${document.documentElement.className}`);
    }, 100);
  };

  return (
    <div className="relative cursor-pointer">
      {/* Animated Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-blue-600/20 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500" />
      
      {/* Icon Container */}
      <button 
        onClick={handleThemeToggle}
        className="relative p-2 bg-ui-dark rounded-lg transition-all duration-300 group hover:bg-ui-highlight overflow-hidden"
        title={`Switch to ${theme === 'blue' ? 'purple' : 'blue'} theme`}
      >
        {/* Holographic ring effect */}
        <div className="absolute inset-0 rounded-lg opacity-40 animate-spin-slow" 
          style={{
            background: `conic-gradient(from 0deg, transparent, ${theme === 'blue' ? 'var(--cyber-blue)' : 'var(--cyber-pink)'}, transparent)`,
            filter: 'blur(1px)',
          }}
        />
        
        <div className="relative flex items-center justify-center">
          {/* Main icon that rotates between themes */}
          <div className="relative transition-transform duration-500 transform hover:scale-110">
            {theme === 'blue' ? (
              <Atom 
                className={`${className} text-cyber-blue transition-all duration-300 group-hover:text-glow-blue filter group-hover:drop-shadow-neon`} 
                size={24}
              />
            ) : (
              <Sparkles 
                className={`${className} text-cyber-pink transition-all duration-300 group-hover:text-glow-purple filter group-hover:drop-shadow-neon`} 
                size={24}
              />
            )}
          </div>
          
          {/* Small indicator glowing effect */}
          <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full animate-pulse shadow-lg ${theme === 'blue' ? 'bg-cyber-blue shadow-cyber-blue' : 'bg-cyber-pink shadow-cyber-pink'}`} />
          
          {/* Secondary particle effect */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-60 transition-opacity duration-300">  
            <div className={`w-full h-full absolute animate-ping-slow rounded-full scale-50 ${theme === 'blue' ? 'bg-cyber-blue/20' : 'bg-cyber-pink/20'}`}></div>
          </div>
        </div>
      </button>
    </div>
  );
};

export default ThemeSwitcherIcon;
