import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, Settings, SkipForward, Rewind, ArrowLeft } from 'lucide-react';
import CoinIcon from '../CoinIcon';
import { supabase } from '../../lib/supabase';
import ImmersiveYouTubePlayer from './ImmersiveYouTubePlayer';

interface CustomVideoPlayerProps {
  videoUrl: string;
  title: string;
  episodeNumber?: number;
  playAd?: boolean;
  onAdEnd?: () => void;
  onClose?: () => void;
  onNextEpisode?: () => void;
  onPreviousEpisode?: () => void;
  hasNextEpisode?: boolean;
  hasPreviousEpisode?: boolean;
}

const CustomVideoPlayer = ({ 
  videoUrl, 
  title, 
  playAd = true,
  onAdEnd,
  episodeNumber, 
  onClose,
  onNextEpisode,
  onPreviousEpisode,
  hasNextEpisode,
  hasPreviousEpisode
}: CustomVideoPlayerProps) => {
  // Detect if this is a YouTube video
  const [isYouTubeVideo, setIsYouTubeVideo] = useState(false);
  const [youtubeVideoId, setYoutubeVideoId] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isAdPlaying, setIsAdPlaying] = useState(playAd);
  const [currentAd, setCurrentAd] = useState<any>(null);
  const [showReward, setShowReward] = useState(false);
  const [adProgress, setAdProgress] = useState(0);
  
  // Preload ad video
  useEffect(() => {
    if (isAdPlaying && adVideoRef.current) {
      adVideoRef.current.preload = 'auto';
      // Force load the video
      adVideoRef.current.load();
    }
  }, [isAdPlaying]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const adVideoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const fetchRandomAd = async () => {
      if (!playAd) {
        setIsAdPlaying(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('ads')
          .select('*')
          .eq('is_active', true)
          .limit(1)
          .single();

        if (error) throw error;
        setCurrentAd(data);

        if (data) {
          await supabase
            .from('ad_impressions')
            .insert([
              { 
                ad_id: data.id,
                user_id: (await supabase.auth.getUser()).data.user?.id
              }
            ]);
        }
      } catch (error) {
        console.error('Error fetching ad:', error);
        setIsAdPlaying(false);
      }
    };

    fetchRandomAd();
  }, [playAd]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isAdPlaying) return; // Disable keyboard controls during ads
      
      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'arrowright':
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.currentTime += 10;
          }
          break;
        case 'arrowleft':
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.currentTime -= 10;
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isAdPlaying]);

  const handleAdTimeUpdate = () => {
    if (adVideoRef.current) {
      const progress = (adVideoRef.current.currentTime / adVideoRef.current.duration) * 100;
      setAdProgress(progress);
    }
  };

  const handleAdEnded = async () => {
    setIsAdPlaying(false);
    setShowReward(true);
    if (onAdEnd) onAdEnd();

    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (userId) {
        await supabase.rpc('handle_ad_watch', {
          target_user_id: userId,
          reward_amount: currentAd?.reward_amount || 0.05
        });
      }
    } catch (error) {
      console.error('Error awarding coins:', error);
    }

    setTimeout(() => {
      setShowReward(false);
    }, 3000);

    // Start playing the main video after ad ends
    if (videoRef.current) {
      try {
        await videoRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Error auto-playing video:', error);
      }
    }
  };

  const togglePlay = () => {
    if (isAdPlaying) return;
    
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
    if (videoRef.current) {
      videoRef.current.volume = value;
    }
  };

  const isFullscreenEnabled = () => {
    return document.fullscreenEnabled || 
           (document as any).webkitFullscreenEnabled || 
           (document as any).mozFullScreenEnabled ||
           (document as any).msFullscreenEnabled;
  };

  const toggleFullscreen = () => {
    if (!playerRef.current) return;
    
    try {
      if (!document.fullscreenElement) {
        // Go fullscreen
        if (playerRef.current.requestFullscreen) {
          playerRef.current.requestFullscreen();
        } else if ((playerRef.current as any).webkitRequestFullscreen) {
          (playerRef.current as any).webkitRequestFullscreen();
        } else if ((playerRef.current as any).msRequestFullscreen) {
          (playerRef.current as any).msRequestFullscreen();
        }
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          (document as any).msExitFullscreen();
        }
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  // Handle mouse movement to show/hide controls
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  // Detect YouTube videos
  useEffect(() => {
    if (!videoUrl) return;
    
    const url = videoUrl.toLowerCase();
    let isYoutube = false;
    let videoId = '';
    
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      isYoutube = true;
      
      if (url.includes('v=')) {
        videoId = url.split('v=')[1]?.split('&')[0] || '';
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
      } else if (url.includes('embed/')) {
        videoId = url.split('embed/')[1]?.split('?')[0] || '';
      }
    }
    
    setIsYouTubeVideo(isYoutube && !!videoId);
    setYoutubeVideoId(videoId);
    
    console.log('Video detection:', {
      isYoutube,
      videoId,
      originalUrl: videoUrl
    });
  }, [videoUrl]);
  
  return (
    <div 
      ref={playerRef}
      className="relative w-full h-full bg-black"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Back Button - Only show when not playing ad */}
      {!isAdPlaying && (
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-30 p-2 bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-sm transition-colors group"
        >
          <ArrowLeft size={24} className="group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* Ad Player */}
      {isAdPlaying && currentAd && (
        <div className="absolute inset-0 z-20 bg-black">
          <video
            preload="auto"
            ref={adVideoRef}
            src={currentAd.video_url}
            className="w-full h-full"
            autoPlay
            playsInline
            muted={false}
            onEnded={handleAdEnded}
            onTimeUpdate={handleAdTimeUpdate}
            onLoadedData={() => {
              if (adVideoRef.current) {
                adVideoRef.current.play().catch(console.error);
              }
            }}
          />
          <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            Ad
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
            <CoinIcon size={20} className="animate-pulse" />
            <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-600 transition-all duration-300"
                style={{ width: `${adProgress}%` }}
              />
            </div>
            <span className="text-sm">Earning {currentAd.reward_amount} XCE</span>
          </div>
        </div>
      )}

      {/* Main Video Player */}
      {!isAdPlaying && !isYouTubeVideo && (
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          onClick={togglePlay}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          playsInline
        />
      )}
      
      {/* YouTube Player */}
      {!isAdPlaying && isYouTubeVideo && youtubeVideoId && (
        <div className="absolute inset-0 w-full h-full bg-black">
          <ImmersiveYouTubePlayer 
            videoId={youtubeVideoId}
            onTogglePlay={togglePlay}
            isPlaying={isPlaying}
          />
        </div>
      )}

      {/* Episode Info - Show only when controls are visible and not playing ad */}
      {showControls && !isAdPlaying && (
        <div className="absolute top-4 left-16 right-4 z-20 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium">{title}</h2>
            {episodeNumber && (
              <p className="text-sm text-gray-300">Episode {episodeNumber}</p>
            )}
          </div>
          {hasNextEpisode && (
            <button
              onClick={onNextEpisode}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <span>Next Episode</span>
              <SkipForward size={18} />
            </button>
          )}
        </div>
      )}

      {/* Reward Notification */}
      {showReward && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-purple-600/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 animate-fade-in-down">
          <CoinIcon size={16} />
          <span className="text-sm font-medium">Earned {currentAd?.reward_amount || 0.05} XCE</span>
        </div>
      )}

      {/* Video Controls */}
      {showControls && !isAdPlaying && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent">
          <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
            {/* Progress Bar */}
            <input
              type="range"
              min={0}
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
            />

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={togglePlay}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>

                {hasPreviousEpisode && (
                  <button 
                    onClick={onPreviousEpisode}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <Rewind size={20} />
                  </button>
                )}

                {hasNextEpisode && (
                  <button 
                    onClick={onNextEpisode}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <SkipForward size={20} />
                  </button>
                )}

                <div className="flex items-center gap-2">
                  <button 
                    onClick={toggleMute}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
                  />
                </div>

                <div className="text-sm">
                  <span>{formatTime(currentTime)}</span>
                  <span className="mx-1">/</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {}}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <Settings size={20} />
                </button>
                {isFullscreenEnabled() && (
                  <button 
                    onClick={toggleFullscreen}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <Maximize2 size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomVideoPlayer;