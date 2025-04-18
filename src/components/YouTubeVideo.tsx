import React, { useState } from 'react';
import { Play } from 'lucide-react';

export interface YouTubeVideoData {
  id: string;
  title: string;
  videoUrl: string;   // Frontend property
  video_url?: string; // Matches Supabase column name
  platform?: string;
  youtubeId?: string;  // Frontend property
  youtube_id?: string; // Matches Supabase column name
  description?: string;
  tags?: string[];
  thumbnail?: string;
}

interface YouTubeVideoProps {
  video: YouTubeVideoData;
  className?: string;
  onPlay?: (video: YouTubeVideoData) => void;
}

const YouTubeVideo: React.FC<YouTubeVideoProps> = ({ video, className = '', onPlay }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Determine video platform and ID from URL
  const getPlatformInfo = (url: string) => {
    if (!url) return { platform: 'other', id: '' };
    
    // YouTube URL patterns
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let id = '';
      if (url.includes('v=')) {
        id = url.split('v=')[1]?.split('&')[0] || '';
      } else if (url.includes('youtu.be/')) {
        id = url.split('youtu.be/')[1]?.split('?')[0] || '';
      } else if (url.includes('embed/')) {
        id = url.split('embed/')[1]?.split('?')[0] || '';
      }
      return { platform: 'youtube', id };
    }
    
    // Vimeo URL patterns
    if (url.includes('vimeo.com')) {
      const id = url.split('vimeo.com/')[1]?.split('?')[0] || '';
      return { platform: 'vimeo', id };
    }
    
    return { platform: 'other', id: '' };
  };

  const { platform, id } = video.platform && video.youtubeId ? 
    { platform: video.platform, id: video.youtubeId } : 
    getPlatformInfo(video.videoUrl);
  
  // Generate appropriate thumbnail URL based on platform
  const [thumbnailError, setThumbnailError] = useState(false);
  const fallbackImage = 'https://placehold.co/480x360/1E1E2A/00e0ff?text=Video+Unavailable';
  
  let generatedThumbnail = '';
  if (platform === 'youtube' && id) {
    generatedThumbnail = `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
  } else if (platform === 'vimeo' && id) {
    // Vimeo doesn't have a simple thumbnail URL pattern like YouTube,
    // we'd need to use their API in a real app, but for now we'll use the fallback
    generatedThumbnail = fallbackImage;
  } else {
    generatedThumbnail = fallbackImage;
  }
  
  const thumbnailUrl = thumbnailError ? fallbackImage : 
                      (video.thumbnail || generatedThumbnail);
  
  const handlePlay = () => {
    if (onPlay) {
      onPlay(video);
    }
  };

  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden rounded-lg">
        <img 
          src={thumbnailUrl} 
          alt={video.title}
          className="w-full aspect-video object-cover transition-transform duration-300 transform group-hover:scale-105"
          onError={() => setThumbnailError(true)}
        />
        
        {/* Play button overlay */}
        <div 
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div 
            onClick={handlePlay}
            className="relative cursor-pointer transform hover:scale-110 transition-all duration-200"
          >
            <div className="absolute inset-0 bg-purple-600/30 rounded-full blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-all" />
            <div className="relative bg-black/30 hover:bg-purple-600/50 w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-sm transition-all border border-white/20">
              <Play size={22} className="text-white ml-1" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Video title */}
      <h3 className="mt-2 text-sm font-medium text-cyber-blue truncate">{video.title}</h3>
    </div>
  );
};

export default YouTubeVideo;
