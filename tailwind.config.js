/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Dark backgrounds
        'cyber-black': '#0B0B1E',
        'cyber-dark': '#12123D',
        
        // Neon accents
        'cyber-blue': '#00F0FF',
        'cyber-purple': '#B026FF',
        'cyber-pink': '#FF2E9A',
        'cyber-orange': '#FF6B2B',
        
        // Glowing effects
        'glow-blue': '#4DFFFF',
        'glow-purple': '#D15FFF',
        
        // UI elements
        'ui-dark': '#1A1A3A',
        'ui-light': '#2A2A5A',
        'ui-highlight': '#3A3A7A'
      },
      backgroundImage: {
        'cyber-gradient': 'linear-gradient(45deg, #0B0B1E 0%, #12123D 100%)',
        'glow-gradient': 'linear-gradient(90deg, #00F0FF 0%, #B026FF 100%)'
      },
      boxShadow: {
        'neon-blue': '0 0 10px #00F0FF',
        'neon-purple': '0 0 10px #B026FF',
        'neon-glow': '0 0 20px rgba(0, 240, 255, 0.5)'
      }
    },
  },
  plugins: [],
};
