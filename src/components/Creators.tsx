import { useEffect, useState } from 'react';
import CoinIcon from './CoinIcon';
import UserAvatar from './UserAvatar';
import UserName from './UserName';
import { X } from 'lucide-react';
import { useFeaturedCreatorsStore } from '../stores/featuredCreatorsStore';

const Creators = () => {
  const { creators, initializeCreators, loading } = useFeaturedCreatorsStore();
  // Always declare states at the top level, regardless of loading state
  const [visibleCreators, setVisibleCreators] = useState<typeof creators>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  // Initialize creators
  useEffect(() => {
    initializeCreators();
  }, [initializeCreators]);

  // Update visible creators when creators from store change
  useEffect(() => {
    if (creators.length > 0 && !loading) {
      setVisibleCreators(prev => {
        // If we have no visible creators yet, use the initial set
        if (prev.length === 0) {
          return [...creators];
        }
        // Otherwise maintain our current state
        return prev;
      });
    }
  }, [creators, loading]);
  
  useEffect(() => {
    // Update visible creators when the source creators change
    if (creators.length > 0) {
      setVisibleCreators(prevVisible => {
        // Keep existing visible creators
        const existingIds = new Set(prevVisible.map(c => c.id));
        
        // Add new creators that aren't dismissed to fill in any gaps
        const newCreators = creators
          .filter(c => !existingIds.has(c.id) && !dismissedIds.includes(c.id))
          .slice(0, 9 - prevVisible.length); // Only add enough to fill the grid
        
        return [...prevVisible, ...newCreators].slice(0, 9); // Limit to 9 total creators
      });
    }
  }, [creators, dismissedIds]);
  
  const handleDismiss = (id: string) => {
    setDismissedIds(prev => [...prev, id]);
    setVisibleCreators(prev => {
      // Remove the dismissed creator
      const filtered = prev.filter(creator => creator.id !== id);
      
      // Find a replacement creator that isn't already visible or dismissed
      const visibleIds = new Set(filtered.map(c => c.id));
      const replacement = creators.find(c => 
        !visibleIds.has(c.id) && !dismissedIds.includes(c.id)
      );
      
      // Add the replacement if found
      return replacement 
        ? [...filtered, replacement] 
        : filtered;
    });
  };
  
  // Render loading state
  if (loading) {
    return (
      <section>
        <div className="grid grid-cols-5 md:grid-cols-6 lg:grid-cols-9 gap-4 md:gap-6">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="flex flex-col items-center p-4 pt-6 rounded-lg border border-cyber-blue/30 bg-ui-dark/60 animate-pulse">
              <div className="w-16 h-16 rounded-full bg-purple-600/20 mb-2" />
              <div className="w-20 h-4 bg-purple-600/20 rounded mb-2" />
              <div className="w-24 h-8 bg-purple-600/20 rounded-full" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="grid grid-cols-5 md:grid-cols-6 lg:grid-cols-9 gap-4 md:gap-6">
        {visibleCreators.map((creator) => (
          <div
            key={creator.id}
            className="relative flex flex-col items-center p-4 pt-6 rounded-lg border border-cyber-blue/30 bg-ui-dark/60 shadow-sm hover:shadow-cyber-blue/10 transition-all"
          >
            {/* X Button for dismissal */}
            <button 
              onClick={() => handleDismiss(creator.id)}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-ui-dark/60 flex items-center justify-center hover:bg-cyber-blue/20 transition-all z-10"
              aria-label="Dismiss creator"
            >
              <X size={14} className="text-cyber-blue/80" />
            </button>
            
            <UserAvatar
              src={creator.avatar}
              alt={creator.name}
              handle={creator.username}
              size="xl"
              className="mb-2"
            />
            <UserName
              name={creator.name}
              handle={creator.username}
              showHandle={false}
              className="text-sm font-medium text-center mb-2"
            />
            <button className="group relative w-full flex items-center justify-center gap-1.5 bg-cyber-blue text-cyber-black hover:bg-cyber-blue/90 px-4 py-1.5 rounded-full transition-all">
              <div className="relative">
                <CoinIcon size={16} />
                <div className="absolute inset-0 bg-[#00E0FF]/20 rounded-full blur-sm animate-pulse"></div>
              </div>
              <span className="text-sm font-medium">Follow</span>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Creators;