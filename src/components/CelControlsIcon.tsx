// Epic futuristic PlayStation-inspired icon for CelFlicks TV
import React from 'react';

interface CelControlsIconProps {
  className?: string;
  size?: number;
}

const CelControlsIcon: React.FC<CelControlsIconProps> = ({ className = '', size = 34 }) => (
  <div className={`inline-block relative ${className}`} style={{ width: size, height: size }}>
    {/* Main SVG with futuristic PlayStation-inspired shapes */}
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0"
    >
      {/* Connecting Lines - subtle cyber grid effect */}
      <path 
        d="M20 10L10 20L20 30L30 20L20 10Z" 
        stroke="rgba(99, 102, 241, 0.15)" 
        strokeWidth="0.5" 
        strokeDasharray="1 1.5"
      />
      <line x1="20" y1="2" x2="20" y2="38" stroke="rgba(56, 189, 248, 0.12)" strokeWidth="0.5" strokeDasharray="1 2" />
      <line x1="2" y1="20" x2="38" y2="20" stroke="rgba(99, 102, 241, 0.12)" strokeWidth="0.5" strokeDasharray="1 2" />
      
      {/* X - Top Left with epic glow - ENLARGED to match other shapes */}
      <g className="group-hover:opacity-100">
        <line 
          x1="8" y1="8" x2="17" y2="17" 
          stroke="#00F0FF" 
          strokeWidth="2.4" 
          strokeLinecap="round"
          className="drop-shadow-[0_0_3px_rgba(0,240,255,0.9)]"
        />
        <line 
          x1="17" y1="8" x2="8" y2="17" 
          stroke="#00F0FF" 
          strokeWidth="2.4" 
          strokeLinecap="round" 
          className="drop-shadow-[0_0_3px_rgba(0,240,255,0.9)]"
        />
        {/* X pulse animation */}
        <circle cx="12.5" cy="12.5" r="6.5" fill="url(#blue-pulse)" className="animate-ping-slow opacity-70">
          <animate attributeName="opacity" values="0.4;0.1;0.4" dur="4s" repeatCount="indefinite" />
        </circle>
      </g>
      
      {/* Circle - Top Right with blue glow */}
      <g className="group-hover:opacity-100">
        <circle 
          cx="27.75" cy="12.25" r="4.5" 
          stroke="#00F0FF" 
          strokeWidth="2.2" 
          fill="none"
          className="drop-shadow-[0_0_3px_rgba(0,240,255,0.9)]"
        />
        {/* Circle pulse animation */}
        <circle cx="27.75" cy="12.25" r="6" fill="url(#blue-pulse)" className="animate-ping-slow opacity-70">
          <animate attributeName="opacity" values="0.2;0.5;0.2" dur="3.5s" repeatCount="indefinite" />
        </circle>
      </g>
      
      {/* Square - Bottom Left with blue glow */}
      <g className="group-hover:opacity-100">
        <rect 
          x="8" y="25.5" width="8.5" height="8.5" 
          rx="1.5" 
          stroke="#00F0FF" 
          strokeWidth="2" 
          fill="none"
          className="drop-shadow-[0_0_3px_rgba(0,240,255,0.9)]"
        />
        {/* Square pulse animation */}
        <rect x="7" y="24.5" width="10.5" height="10.5" rx="2" fill="url(#blue-pulse)" className="animate-ping-slow opacity-70">
          <animate attributeName="opacity" values="0.3;0.1;0.3" dur="4.5s" repeatCount="indefinite" />
        </rect>
      </g>
      
      {/* Triangle - Bottom Right with blue glow */}
      <g className="group-hover:opacity-100">
        <path 
          d="M27.75 25.5L33 34L22.5 34L27.75 25.5Z" 
          stroke="#00F0FF" 
          strokeWidth="2" 
          strokeLinejoin="round" 
          fill="none"
          className="drop-shadow-[0_0_3px_rgba(0,240,255,0.9)]"
        />
        {/* Triangle pulse animation */}
        <path d="M27.75 24L34 34.5L21.5 34.5L27.75 24Z" fill="url(#blue-pulse)" className="animate-ping-slow opacity-70">
          <animate attributeName="opacity" values="0.4;0.2;0.4" dur="5s" repeatCount="indefinite" />
        </path>
      </g>
      
      {/* Pulse gradient definition - single blue color */}
      <defs>
        <radialGradient id="blue-pulse" cx="0.5" cy="0.5" r="0.5" fx="0.5" fy="0.5">
          <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#00F0FF" stopOpacity="0"/>
        </radialGradient>
      </defs>
    </svg>
    
    {/* Additional subtle rotating outer energy ring - pure CSS */}
    <div 
      className="absolute inset-0 rounded-full opacity-40 animate-spin-slow pointer-events-none"
      style={{
        background: 'conic-gradient(from 0deg, transparent, rgba(0, 240, 255, 0.3), transparent)',
        filter: 'blur(1px)',
      }}
    />
  </div>
);

export default CelControlsIcon;
