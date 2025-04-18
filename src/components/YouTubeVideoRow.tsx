import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import YouTubeVideo, { YouTubeVideoData } from './YouTubeVideo';
import YouTubeModal from './YouTubeModal';

interface YouTubeVideoRowProps {
  title: string;
  videos: YouTubeVideoData[];
  showNavigationArrows?: boolean;
}

const YouTubeVideoRow: React.FC<YouTubeVideoRowProps> = ({ 
  title, 
  videos, 
  showNavigationArrows = true 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeVideo, setActiveVideo] = useState<YouTubeVideoData | null>(null);
  
  // Number of items visible at once
  const itemsPerView = 4;
  
  // Calculate maximum index based on total videos and items per view
  const maxIndex = Math.max(0, videos.length - itemsPerView);

  const handleVideoPlay = (video: YouTubeVideoData) => {
    setActiveVideo(video);
  };

  const nextSlide = () => {
    setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  // Skip rendering if no videos
  if (videos.length === 0) return null;

  return (
    <div className="my-8 relative">
      {/* Row title and navigation */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-medium text-cyber-blue">{title}</h2>
        {showNavigationArrows && videos.length > itemsPerView && (
          <div className="flex gap-2">
            <button
              onClick={prevSlide}
              className="p-1.5 bg-ui-dark hover:bg-cyber-blue rounded-full backdrop-blur-sm transition-all transform hover:scale-110 border border-cyber-blue/20 flex items-center justify-center w-8 h-8 disabled:opacity-50 disabled:hover:scale-100"
              disabled={currentIndex === 0}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={nextSlide}
              className="p-1.5 bg-ui-dark hover:bg-cyber-blue rounded-full backdrop-blur-sm transition-all transform hover:scale-110 border border-cyber-blue/20 flex items-center justify-center w-8 h-8 disabled:opacity-50 disabled:hover:scale-100"
              disabled={currentIndex >= maxIndex}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Video row */}
      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out" 
          style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
        >
          {videos.map((video) => (
            <div 
              key={video.id} 
              className="group relative flex-shrink-0 w-[calc(100%/4-16px)] mr-4"
            >
              <YouTubeVideo 
                video={video} 
                onPlay={handleVideoPlay}
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* YouTube Modal */}
      {activeVideo && (
        <YouTubeModal
          video={activeVideo}
          onClose={() => setActiveVideo(null)}
        />
      )}
    </div>
  );
};

export default YouTubeVideoRow;
