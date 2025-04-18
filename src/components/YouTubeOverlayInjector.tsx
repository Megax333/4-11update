import { useEffect } from 'react';

/**
 * Component that automatically injects black overlay elements to hide YouTube branding
 * This component doesn't render anything visible but adds overlay elements to the DOM
 */
const YouTubeOverlayInjector: React.FC = () => {
  useEffect(() => {
    // Function to add overlay elements to all YouTube iframe containers
    const addBrandingCoverElements = () => {
      // Find all iframes that might be YouTube videos
      const iframes = document.querySelectorAll('iframe[src*="youtube.com"], iframe[src*="youtu.be"]');
      
      // Process each iframe
      iframes.forEach((iframe) => {
        const parent = iframe.parentElement;
        if (!parent) return;
        
        // Make sure parent has position relative for absolute positioning
        if (window.getComputedStyle(parent).position === 'static') {
          parent.style.position = 'relative';
        }
        
        // Add the wrapper class to ensure overflow is hidden
        parent.classList.add('youtube-video-wrapper');
        
        // Check if overlays already exist
        if (parent.querySelector('.youtube-branding-overlay-top')) return;
        
        // Create top overlay
        const topOverlay = document.createElement('div');
        topOverlay.className = 'youtube-branding-overlay-top';
        parent.appendChild(topOverlay);
        
        // Create bottom overlay
        const bottomOverlay = document.createElement('div');
        bottomOverlay.className = 'youtube-branding-overlay-bottom';
        parent.appendChild(bottomOverlay);
        
        // Create left overlay
        const leftOverlay = document.createElement('div');
        leftOverlay.className = 'youtube-branding-overlay-left';
        parent.appendChild(leftOverlay);
        
        // Create right overlay
        const rightOverlay = document.createElement('div');
        rightOverlay.className = 'youtube-branding-overlay-right';
        parent.appendChild(rightOverlay);
        
        // Special logo blocker for top-left corner
        const logoBlocker = document.createElement('div');
        logoBlocker.className = 'youtube-logo-blocker';
        parent.appendChild(logoBlocker);
      });
    };

    // Initial run
    addBrandingCoverElements();
    
    // Set a interval to periodically check for new YouTube iframes
    const intervalId = setInterval(addBrandingCoverElements, 1000);
    
    // Create a mutation observer to watch for DOM changes that might add YouTube iframes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          addBrandingCoverElements();
        }
      });
    });
    
    // Start observing the document with the configured parameters
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Clean up on component unmount
    return () => {
      clearInterval(intervalId);
      observer.disconnect();
    };
  }, []);

  // This component doesn't render anything
  return null;
};

export default YouTubeOverlayInjector;
