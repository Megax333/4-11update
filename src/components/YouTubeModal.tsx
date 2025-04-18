import React from 'react';
import { X } from 'lucide-react';
import { YouTubeVideoData } from './YouTubeVideo';
import CelFlicksVideoPlayer from './player/CelFlicksVideoPlayer';

interface YouTubeModalProps {
  video: YouTubeVideoData | null;
  onClose: () => void;
}

const YouTubeModal: React.FC<YouTubeModalProps> = ({ video, onClose }) => {
  if (!video) return null;

  // For YouTube, Vimeo, and other streaming videos, use our custom player
  const isStreamingVideo = video.videoUrl?.match(/youtube|youtu\.be|vimeo/i);
  
  // For direct video files like .mp4, use the native player
  const isDirectVideoFile = video.videoUrl?.match(/\.(mp4|webm|ogg)$/i);

  if (isStreamingVideo) {
    return <CelFlicksVideoPlayer video={video} onClose={onClose} />;
  }
  
  // Fall back to the simple player for direct video files
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="absolute inset-0 z-0" onClick={onClose} />
      <div className="relative w-full max-w-5xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-cyber-black/50 rounded-full hover:bg-cyber-purple/50 transition-colors duration-300"
        >
          <X size={20} className="text-white" />
        </button>
        
        <div className="aspect-video w-full">
          {isDirectVideoFile && (
            <video 
              src={video.videoUrl}
              title={video.title}
              className="w-full h-full object-contain rounded-lg overflow-hidden"
              controls
              autoPlay
            />
          )}
        </div>
        
        <div className="p-4 bg-cyber-dark rounded-b-lg">
          <h2 className="text-xl font-semibold text-white">{video.title}</h2>
          {video.description && (
            <p className="text-cyber-blue/80 text-sm mt-2">{video.description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default YouTubeModal;
