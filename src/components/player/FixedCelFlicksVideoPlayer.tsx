import React from 'react';
import { X } from 'lucide-react';
import { YouTubeVideoData } from '../YouTubeVideo';
import SimpleYouTubePlayer from './SimpleYouTubePlayer';

interface CelFlicksVideoPlayerProps {
  video: YouTubeVideoData;
  onClose: () => void;
}

const CelFlicksVideoPlayer: React.FC<CelFlicksVideoPlayerProps> = ({ video, onClose }) => {
  // Get the YouTube video ID
  const getYouTubeId = (url: string): string => {
    if (!url) return '';
    
    if (url.includes('v=')) {
      return url.split('v=')[1]?.split('&')[0] || '';
    } else if (url.includes('youtu.be/')) {
      return url.split('youtu.be/')[1]?.split('?')[0] || '';
    } else if (url.includes('embed/')) {
      return url.split('embed/')[1]?.split('?')[0] || '';
    }
    return '';
  };

  const videoId = video.youtubeId || video.youtube_id || getYouTubeId(video.videoUrl || video.video_url || '');

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
      {/* Close button */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-white bg-black/50 p-2 rounded-full hover:bg-black/80 transition"
      >
        <X size={24} />
      </button>
      
      {/* Video container */}
      <div className="w-full h-full max-w-5xl max-h-[80vh] relative">
        <SimpleYouTubePlayer videoId={videoId} className="w-full h-full" />
        
        {/* Video info overlay at bottom */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 to-transparent p-4">
          <h2 className="text-white text-xl font-bold">{video.title}</h2>
        </div>
      </div>
    </div>
  );
};

export default CelFlicksVideoPlayer;
