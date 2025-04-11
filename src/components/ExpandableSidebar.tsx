import React, { useState } from 'react';
import { Menu, Compass, Users2, Headphones, Users, Bookmark, MessageCircle, UserCircle2, ChevronRight } from 'lucide-react';
import { cn } from '../utils/cn';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { useMissionStore } from '../stores/missionStore';
import { useProfile as useProfileContext } from '../context/ProfileContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMessageStore } from '../stores/messageStore';

interface SidebarItem {
  id: string;
  path: string;
  icon: React.ReactNode;
  label: string;
}

const ExpandableSidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const { user } = useAuth();
  const { profile, loading } = useProfile(user?.id);
  const { currentTier, userXP } = useMissionStore();
  const { showProfile } = useProfileContext();
  const navigate = useNavigate();
  const location = useLocation();
  const { getTotalUnreadCount } = useMessageStore();
  const unreadCount = getTotalUnreadCount();

  const handleMouseEnter = () => {
    if (!isLocked) {
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isLocked) {
      setIsExpanded(false);
    }
  };

  const handleToggleClick = () => {
    setIsLocked(!isLocked);
    setIsExpanded(!isExpanded);
  };

  const handleViewProfile = () => {
    if (profile?.username) {
      showProfile(profile.username);
    }
  };

  const items: SidebarItem[] = [
    { id: 'discover', path: '/', icon: <Compass size={24} />, label: 'Discover' },
    { id: 'community', path: '/community', icon: <Users2 size={24} />, label: 'Community' },
    { id: 'messages', path: '/messages', icon: <MessageCircle size={24} />, label: 'Messages' },
    { id: 'audio', path: '/audio', icon: <Headphones size={24} />, label: 'Audio Rooms' },
    { id: 'watch-together', path: '/watch-together', icon: <Users size={24} />, label: 'Watch Together' },
    { id: 'saved', path: '/saved', icon: <Bookmark size={24} />, label: 'Saved' }
  ];

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/') return 'discover';
    return path.slice(1).split('/')[0]; // Remove leading slash and get first segment
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={handleToggleClick}
        className={cn(
          "fixed left-0 top-0 z-50 w-16 h-16 bg-cyber-dark flex items-center justify-center",
          "hover:bg-ui-dark transition-colors group",
          isLocked && "bg-ui-dark"
        )}
      >
        <Menu 
          size={24} 
          className={cn(
            "transition-colors",
            isLocked ? "text-cyber-blue" : "text-cyber-blue/50 group-hover:text-cyber-blue"
          )} 
        />
      </button>

      {/* Sidebar */}
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "fixed left-0 top-0 h-full bg-cyber-dark flex flex-col pt-20 z-40 border-r border-cyber-blue/30",
          "transition-all duration-300 ease-in-out",
          isExpanded ? "w-64" : "w-16"
        )}
      >
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={cn(
              "flex items-center gap-4 py-4 px-6 transition-all duration-200",
              "hover:bg-ui-dark hover:shadow-neon-blue",
              getActiveTab() === item.id ? "text-cyber-black bg-cyber-blue shadow-neon-blue" : "text-cyber-blue/50 hover:text-cyber-blue",
              !isExpanded && "justify-center"
            )}
          >
            <div className="relative">
              {item.icon}
              {item.id === 'messages' && unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
              )}
            </div>
            <span
              className={cn(
                "whitespace-nowrap transition-all duration-300",
                isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
              )}
            >
              {item.label}
              {item.id === 'messages' && unreadCount > 0 && (
                <span className="ml-2 text-xs bg-cyber-pink px-1.5 py-0.5 rounded-full shadow-neon-purple">
                  {unreadCount}
                </span>
              )}
            </span>
          </button>
        ))}
        
        {/* User Profile */}
        {user && (
          <div className={cn(
            "hover:bg-ui-dark hover:shadow-neon-purple transition-all duration-200 mt-auto",
            isExpanded ? "px-6 py-4" : "p-4"
          )}>
            <div className={cn(
              "flex items-center gap-3",
              !isExpanded && "justify-center"
            )}>
              {loading ? (
                <div className="w-10 h-10 rounded-full bg-cyber-purple/20 animate-pulse shadow-neon-purple" />
              ) : (
                <img
                  src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.username || 'User'}`}
                  alt={profile?.username || 'User avatar'}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-cyber-purple/50 shadow-neon-purple"
                />
              )}
              {isExpanded ? (
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{profile?.username || 'User'}</span>
                    <button
                      onClick={handleViewProfile}
                      className="flex items-center gap-1.5 ml-auto px-2 py-0.5 rounded-md bg-ui-light hover:bg-ui-highlight text-cyber-blue/70 hover:text-cyber-blue text-sm transition-colors group hover:shadow-neon-purple"
                    >
                      <UserCircle2 size={16} className="text-cyber-blue/50 group-hover:text-cyber-purple transition-colors" />
                      Profile
                      <ChevronRight size={14} className="text-cyber-blue/50 group-hover:text-cyber-blue transition-colors" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-cyber-blue/70 pl-0.5">
                    <span className="text-xs bg-gradient-to-r from-cyber-blue to-cyber-purple bg-clip-text text-transparent">{currentTier?.name || 'Bronze'} • {userXP} XP</span>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ExpandableSidebar;