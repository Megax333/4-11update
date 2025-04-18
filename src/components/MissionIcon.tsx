// No need to import React with modern JSX transform
import { useAuth } from '../hooks/useAuth';

const MissionIcon = ({ className = '' }: { className?: string }) => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="relative cursor-pointer">
      {/* Animated Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-blue-600/20 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500" />
      
      {/* Icon Container */}
      <button className="relative p-2 bg-[#2A2A3A] rounded-lg transition-all duration-300 group hover:bg-[#3A3A4A]">
        <div className="relative flex items-center justify-center">
          {/* Ultra-futuristic PlayStation-inspired icon */}
          <svg 
            width="30" 
            height="30" 
            viewBox="0 0 30 30" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className={`${className} text-cyan-400 group-hover:text-purple-300 transition-all duration-300`}
          >
            {/* Outer hexagon frame */}
            <path 
              d="M15 2L25.9 9.5L25.9 20.5L15 28L4.1 20.5V9.5L15 2Z" 
              stroke="currentColor" 
              strokeWidth="0.75" 
              strokeOpacity="0.5"
              className="animate-pulse"
            />

            {/* Inner connecting lines */}
            <path d="M15 2L15 28" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 2" strokeOpacity="0.3" />
            <path d="M4.1 9.5L25.9 20.5" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 2" strokeOpacity="0.3" />
            <path d="M25.9 9.5L4.1 20.5" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 2" strokeOpacity="0.3" />
            
            {/* Circle - Top */}
            <circle 
              cx="15" 
              cy="7" 
              r="3" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              className="animate-pulse"
            />
            
            {/* X - Left - Properly designed X */}
            <g>
              <path 
                d="M6.5 12L9.5 18" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
              />
              <path 
                d="M9.5 12L6.5 18" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
              />
            </g>
            
            {/* Triangle - Bottom */}
            <path 
              d="M11 23L15 19L19 23H11Z" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinejoin="round"
            />
            
            {/* Square - Right */}
            <rect 
              x="20" 
              y="12" 
              width="5" 
              height="5" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              rx="1"
            />
            
            {/* Glow effect dots at intersections */}
            <circle cx="15" cy="7" r="1" fill="currentColor" className="animate-ping" style={{ animationDuration: '3s' }} />
            <circle cx="8" cy="15" r="1" fill="currentColor" className="animate-ping" style={{ animationDuration: '4s' }} />
            <circle cx="15" cy="23" r="1" fill="currentColor" className="animate-ping" style={{ animationDuration: '3.5s' }} />
            <circle cx="22.5" cy="15" r="1" fill="currentColor" className="animate-ping" style={{ animationDuration: '2.5s' }} />
          </svg>
        </div>
      </button>
    </div>
  );
};

export default MissionIcon;