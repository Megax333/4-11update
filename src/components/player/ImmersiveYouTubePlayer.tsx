import React, { useState, useRef, useEffect } from 'react';

// Extend Window interface to include YouTube API
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface ImmersiveYouTubePlayerProps {
  videoId: string;
  onTogglePlay?: () => void;
  isPlaying?: boolean;
}

const ImmersiveYouTubePlayer: React.FC<ImmersiveYouTubePlayerProps> = ({ 
  videoId, 
  onTogglePlay,
  isPlaying = false 
}) => {
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [player, setPlayer] = useState<any>(null);
  
  // Initialize YouTube player API
  useEffect(() => {
    // Add YouTube API script if it doesn't exist
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      
      // Initialize player when API is ready
      window.onYouTubeIframeAPIReady = initializePlayer;
    } else {
      initializePlayer();
    }
    
    return () => {
      // Clean up
      if (player) {
        try {
          player.destroy();
        } catch (error) {
          console.error('Error destroying YouTube player:', error);
        }
      }
    };
  }, [videoId]);
  
  // Handle play/pause via props
  useEffect(() => {
    if (player && playerReady) {
      try {
        if (isPlaying) {
          player.playVideo();
        } else {
          player.pauseVideo();
        }
      } catch (error) {
        console.error('Error controlling YouTube player:', error);
      }
    }
  }, [isPlaying, player, playerReady]);
  
  // Initialize the player
  const initializePlayer = () => {
    if (!window.YT || !window.YT.Player) {
      console.log('YouTube API not loaded yet, will retry');
      setTimeout(initializePlayer, 100);
      return;
    }
    
    try {
      // Create a div for the player
      const playerElement = document.createElement('div');
      playerElement.id = `youtube-player-${videoId}`;
      
      // Add it to our container
      if (playerContainerRef.current) {
        playerContainerRef.current.innerHTML = '';
        playerContainerRef.current.appendChild(playerElement);
        
        // Create the player with all possible UI elements disabled
        new window.YT.Player(playerElement.id, {
          videoId: videoId,
          playerVars: {
            autoplay: isPlaying ? 1 : 0,
            controls: 0,        // Hide controls
            rel: 0,             // Don't show related videos
            showinfo: 0,        // Hide video info
            modestbranding: 1,  // Hide YouTube logo
            iv_load_policy: 3,  // Hide annotations
            fs: 0,              // Hide fullscreen button
            disablekb: 1,       // Disable keyboard controls
            playsinline: 1,     // Play inline on mobile
            cc_load_policy: 0,  // Hide closed captions
            origin: window.location.origin, // Set origin for security
            enablejsapi: 1,     // Enable JavaScript API
            ecver: 2            // Use embedded creator version
          },
          host: 'https://www.youtube-nocookie.com', // Privacy-enhanced mode
          events: {
            onReady: (event: any) => {
              setPlayerReady(true);
              setPlayer(event.target);
              
              if (isPlaying) {
                event.target.playVideo();
              }
            },
            onStateChange: (event: any) => {
              // Handle state changes if needed
              console.log('Player state changed:', event.data);
            },
            onError: (event: any) => {
              console.error('YouTube player error:', event.data);
            }
          }
        });
      }
    } catch (error) {
      console.error('Error initializing YouTube player:', error);
    }
  };
  
  // Handle click to toggle play/pause
  const handleClick = () => {
    if (onTogglePlay) {
      onTogglePlay();
    }
  };
  
  return (
    <div 
      className="relative w-full h-full bg-black cursor-pointer overflow-hidden"
      style={{ aspectRatio: '16/9' }}
    >
      {/* Container for YouTube Player with overflow hidden */}
      <div 
        ref={playerContainerRef}
        onClick={handleClick}
        className="absolute inset-0 scale-105" // Scale slightly to avoid borders but not cut content
        style={{ 
          transformOrigin: 'center center',
          pointerEvents: 'none' // Prevent hover effects
        }}
      />
      
      {/* Overlays to hide YouTube UI elements - higher z-indices and better coverage */}
      <div className="absolute top-0 left-0 w-full h-16 bg-black z-50" style={{zIndex: 100}} />
      <div className="absolute bottom-0 left-0 w-full h-16 bg-black z-50" style={{zIndex: 100}} />
      <div className="absolute top-0 right-0 h-full w-16 bg-black z-50" style={{zIndex: 100}} />
      <div className="absolute top-0 left-0 h-full w-16 bg-black z-50" style={{zIndex: 100}} />
      
      {/* Extra overlay specifically for YouTube logo in top-left */}
      <div className="absolute top-0 left-0 w-28 h-28 bg-black z-50" style={{zIndex: 110}} />
      
      {/* Extra overlay for top-right to prevent missing chunk */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-black z-50" style={{zIndex: 110}} />
      
      {/* Click capture layer */}
      <div className="absolute inset-0 z-20" onClick={handleClick} />
    </div>
  );
};

export default ImmersiveYouTubePlayer;
