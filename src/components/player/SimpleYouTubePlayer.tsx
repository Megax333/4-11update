import React, { useEffect, useRef } from 'react';

interface SimpleYouTubePlayerProps {
  videoId: string;
  className?: string;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const SimpleYouTubePlayer: React.FC<SimpleYouTubePlayerProps> = ({ videoId, className }) => {
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    // Load YouTube API if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      
      window.onYouTubeIframeAPIReady = initializePlayer;
      
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    } else {
      initializePlayer();
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoId]);

  const initializePlayer = () => {
    if (!playerContainerRef.current) return;
    
    // Clear any existing content
    playerContainerRef.current.innerHTML = '';

    // Create wrapper for YouTube iframe
    const youtubeWrapper = document.createElement('div');
    youtubeWrapper.className = 'youtube-video-wrapper';
    youtubeWrapper.style.position = 'relative';
    youtubeWrapper.style.width = '100%';
    youtubeWrapper.style.height = '100%';
    playerContainerRef.current.appendChild(youtubeWrapper);

    // Create player element
    const playerElement = document.createElement('div');
    playerElement.id = `youtube-player-${videoId}`;
    youtubeWrapper.appendChild(playerElement);
    
    // Initialize player with basic settings
    try {
      playerRef.current = new window.YT.Player(playerElement.id, {
        videoId,
        playerVars: {
          autoplay: 1,
          controls: 1,          // Show YouTube controls
          rel: 0,               // Hide related videos
          modestbranding: 1,    // Use modest branding when possible
          showinfo: 0,          // Hide video title
          iv_load_policy: 3,    // Hide annotations
          fs: 0,                // Hide fullscreen button
          cc_load_policy: 0,    // Hide closed captions
          disablekb: 0,         // Enable keyboard controls for volume
          start: 0,             // Start from beginning
          enablejsapi: 1,       // Enable JavaScript API
          origin: window.location.origin
        },
        events: {
          onReady: (event: any) => {
            event.target.playVideo();
          },
          onError: (e: any) => console.error('YouTube player error:', e)
        }
      });
    } catch (error) {
      console.error('Error creating YouTube player:', error);
    }
  };

  return (
    <div className={`relative aspect-video bg-black overflow-hidden ${className || ''}`}>
      <div 
        ref={playerContainerRef}
        className="absolute inset-0 w-full h-full"
      />
      {/* Add a bottom black bar to hide any potential video leaking */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-black z-10"></div>
      
      {/* Physical overlay to hide bottom-right YouTube watermark */}
      <div className="absolute bottom-0 right-0 w-[100px] h-[40px] bg-black z-[2147483647]"></div>
    </div>
  );
};

export default SimpleYouTubePlayer;
