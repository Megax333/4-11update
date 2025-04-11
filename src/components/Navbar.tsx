import { useState } from 'react';
import { Link } from 'react-router-dom';
import CoinIcon from './CoinIcon';
import MissionIcon from './MissionIcon';
import WalletPortal from './wallet/WalletPortal';
import NotificationBell from './NotificationBell';
import { useBalance } from '../hooks/useBalance';
import SearchBar from './search/SearchBar';
import SettingsMenu from './SettingsMenu';
import { useAuth } from '../context/AuthContext';
import MissionBoardPortal from './MissionBoardPortal';

const Navbar = () => {
  const [showWallet, setShowWallet] = useState(false);
  const [showMissions, setShowMissions] = useState(false);
  const { user, setShowAuthModal } = useAuth();
  const { balance, loading } = useBalance();

  return (
    <nav className="fixed top-0 left-16 right-0 h-16 bg-cyber-dark z-40 px-6 flex items-center justify-between border-b border-cyber-blue/30">
      <div className="flex-1 flex items-center">
        <Link to="/">
          <img 
            src="https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/6e7f2a4c-b927-4623-b650-6cedaaab8364/dj1riiq-c56fe035-4762-4a53-8c3b-563b28b1c900.png/v1/fill/w_483,h_131/8bf988985cbd1890eb0d6179b3b2618c_by_prydley_studios_dj1riiq-fullview.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTMxIiwicGF0aCI6IlwvZlwvNmU3ZjJhNGMtYjkyNy00NjIzLWI2NTAtNmNlZGFhYWI4MzY0XC9kajFyaWlxLWM1NmZlMDM1LTQ3NjItNGE1My04YzNiLTU2M2IyOGIxYzkwMC5wbmciLCJ3aWR0aCI6Ijw9NDgzIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLm9wZXJhdGlvbnMiXX0.2AtmvydvYifo29XXlYXiPIAyE1Hyj7Jup20EIcr713I"
            alt="Celflicks"
            className="h-[34px] w-auto mt-0.5 -translate-x-3 object-contain mr-6 cursor-pointer hover:opacity-80 transition-opacity" 
          />
        </Link>
        <div className="mr-12" onClick={() => setShowMissions(true)}>
          <MissionIcon />
        </div>
        <div className="ml-20">
          <SearchBar />
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        {user ? (
          <>
            <button 
              onClick={() => setShowWallet(true)}
              className="flex items-center gap-3 bg-ui-dark/80 px-4 py-2 rounded-full backdrop-blur-sm border border-cyber-blue/20 hover:border-cyber-purple/50 hover:shadow-neon-purple transition-all duration-300 group"
            >
              <div className="relative">
                <CoinIcon size={20} />
                <div className="absolute inset-0 bg-cyber-purple/30 rounded-full blur-sm group-hover:blur-md transition-all"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-cyber-blue/70">Balance</span>
                <span className="font-medium bg-glow-gradient bg-clip-text text-transparent">
                  {loading ? (
                    <div className="h-4 w-16 bg-purple-600/20 animate-pulse rounded" />
                  ) : (
                    `${balance.toLocaleString()} XCE`
                  )}
                </span>
              </div>
            </button>
            <NotificationBell />
            <SettingsMenu />
          </>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setShowAuthModal(true, 'login');
              }}
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-glow-gradient rounded-full blur opacity-60 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
              <div className="relative px-6 py-2 bg-ui-dark rounded-full leading-none flex items-center">
                <span className="text-cyber-blue group-hover:text-glow-blue transition duration-200">Sign In</span>
              </div>
            </button>
            
            <button
              onClick={() => {
                setShowAuthModal(true, 'signup');
              }}
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-glow-gradient rounded-full opacity-60 group-hover:opacity-100 blur transition duration-1000 group-hover:duration-200"></div>
              <div className="relative px-6 py-2 bg-glow-gradient rounded-full leading-none flex items-center">
                <span className="font-medium text-cyber-black">Sign Up</span>
              </div>
            </button>
          </div>
        )}
        {showWallet && <WalletPortal onClose={() => setShowWallet(false)} />}
        {showMissions && <MissionBoardPortal onClose={() => setShowMissions(false)} />}
      </div>
    </nav>
  );
};

export default Navbar;