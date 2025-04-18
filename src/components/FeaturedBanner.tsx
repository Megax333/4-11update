import React, { useRef, useState } from 'react';
import { Play, Info, Volume2, VolumeX } from 'lucide-react';

interface Movie {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  preview: string;
  tags: string[];
}

interface FeaturedBannerProps {
  featured: Movie[];
  onPlay: (id: string) => void;
}

const FeaturedBanner: React.FC<FeaturedBannerProps> = ({ featured, onPlay }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  if (!featured || featured.length === 0) return null;
  const currentMovie = featured[currentIndex];

  const handleToggleMute = () => {
    setIsMuted((prev) => {
      const newMuted = !prev;
      if (videoRef.current) {
        videoRef.current.muted = newMuted;
        if (!newMuted) {
          videoRef.current.volume = 1;
        }
      }
      return newMuted;
    });
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? featured.length - 1 : prev - 1));
  };
  const handleNext = () => {
    setCurrentIndex((prev) => (prev === featured.length - 1 ? 0 : prev + 1));
  };
  const goToIndex = (idx: number) => setCurrentIndex(idx);

  return (
    <div className="relative w-full h-[70vh] mb-8">
      {/* Video or Image Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-cyber-dark via-cyber-dark/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-cyber-dark via-transparent to-transparent z-10" />
        
        {currentMovie.preview ? (
          <video
            ref={videoRef}
            src={currentMovie.preview}
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted={isMuted}
            playsInline
          />
        ) : (
          <img
            src={currentMovie.thumbnail}
            alt={currentMovie.title}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Unmute/Mute Button Overlay - moved to top right */}
      {currentMovie.preview && (
        <button
          onClick={handleToggleMute}
          className="absolute top-8 right-8 z-30 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full shadow-lg transition-all duration-200 flex items-center"
          aria-label={isMuted ? 'Unmute video' : 'Mute video'}
        >
          {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
        </button>
      )}

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold mb-4 text-white drop-shadow-lg">{currentMovie.title}</h1>
          <p className="text-lg text-white/80 mb-6 line-clamp-3">{currentMovie.description}</p>
          
          {/* Tags */}
          <div className="flex items-center gap-3 mb-6">
            {currentMovie.tags.map((tag, index) => (
              <span 
                key={index} 
                className="px-3 py-1 bg-ui-dark/60 backdrop-blur-sm rounded-full text-sm text-cyber-blue"
              >
                {tag}
              </span>
            ))}
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onPlay(currentMovie.id)}
              className="flex items-center gap-2 px-6 py-3 bg-cyber-blue hover:bg-cyber-purple text-cyber-black font-medium rounded-lg transition-all duration-300"
            >
              <Play size={20} />
              Play
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-ui-dark/70 hover:bg-ui-dark backdrop-blur-sm text-white font-medium rounded-lg transition-all duration-300">
              <Info size={20} />
              More Info
            </button>
          </div>

          {/* Carousel Controls */}
          <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center" style={{ bottom: '3.5rem' }}>
            <div className="flex items-center gap-4">
              <button onClick={handlePrev} className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-full shadow transition-all duration-200" aria-label="Previous banner">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
              </button>
              <div className="flex gap-2">
                {featured.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToIndex(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-200 border border-white ${currentIndex === idx ? 'bg-cyber-blue scale-125' : 'bg-white/40'}`}
                    aria-label={`Go to banner ${idx + 1}`}
                  />
                ))}
              </div>
              <button onClick={handleNext} className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-full shadow transition-all duration-200" aria-label="Next banner">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedBanner;
