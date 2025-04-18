import { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, Trash2, PlusCircle } from 'lucide-react';
import { useYoutubeStore, VideoCategory } from '../../stores/youtubeStore';
import { YouTubeVideoData } from '../YouTubeVideo';

// Category definitions for the UI
const CATEGORIES: {id: VideoCategory, name: string}[] = [
  { id: 'trending', name: 'Trending Now' },
  { id: 'new', name: 'Emotional' },
  { id: 'action', name: 'Action & Adventure' },
  { id: 'comedy', name: 'Comedy Picks' },
  { id: 'documentary', name: 'Documentaries' },
  { id: 'music', name: 'Music Videos' },
  { id: 'original', name: 'Original Content' }
];

const FeaturedVideosManager: React.FC = () => {
  const { videos, featuredVideos, featureVideo, unfeatureVideo, getFeaturedVideos, moveFeaturedVideo } = useYoutubeStore();
  const [activeCategory, setActiveCategory] = useState<VideoCategory>('trending');
  const [selectedVideo, setSelectedVideo] = useState<string>('');
  const [categoryVideos, setCategoryVideos] = useState<YouTubeVideoData[]>([]);
  
  // Load featured videos for the selected category
  useEffect(() => {
    setCategoryVideos(getFeaturedVideos(activeCategory));
  }, [activeCategory, featuredVideos, getFeaturedVideos]);

  // Filter out videos that are already featured in this category
  const availableVideos = videos.filter(video => 
    !featuredVideos[activeCategory].some((featuredVideo: YouTubeVideoData) => 
      featuredVideo.id === video.id
    )
  );

  const handleAddVideo = () => {
    if (!selectedVideo) return;
    
    // Add to category
    featureVideo(selectedVideo, activeCategory);
    setSelectedVideo('');
  };
  
  const handleRemoveVideo = (videoId: string) => {
    unfeatureVideo(videoId, activeCategory);
  };
  
  const handleMoveVideo = (videoId: string, direction: 'up' | 'down') => {
    // The store takes care of the position logic
    moveFeaturedVideo(videoId, activeCategory, direction);
  };

  return (
    <div className="bg-cyber-dark p-6 rounded-xl">
      <h2 className="text-2xl font-semibold text-cyber-blue mb-6">
        Featured Videos Manager
      </h2>
      <p className="text-cyber-blue/70 mb-6">
        Control which videos appear in each section of your homepage. Videos can be from YouTube, Vimeo, or other sources.
      </p>
      
      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map(category => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
              activeCategory === category.id
                ? 'bg-cyber-blue text-cyber-black font-medium'
                : 'bg-ui-dark border border-cyber-blue/20 text-cyber-blue/70 hover:bg-ui-light'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
      
      {/* Add video to category */}
      <div className="flex gap-3 mb-6">
        <select
          value={selectedVideo}
          onChange={(e) => setSelectedVideo(e.target.value)}
          className="flex-1 bg-ui-dark border border-cyber-blue/30 rounded-md px-3 py-2 text-white focus:outline-none focus:border-cyber-blue"
        >
          <option value="">-- Select a video to add --</option>
          {availableVideos.map(video => (
            <option key={video.id} value={video.id}>
              {video.title}
            </option>
          ))}
        </select>
        <button
          onClick={handleAddVideo}
          disabled={!selectedVideo}
          className="px-4 py-2 flex items-center gap-2 bg-cyber-blue text-cyber-black font-medium rounded-md hover:bg-cyber-purple transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PlusCircle size={16} />
          Add to {CATEGORIES.find(c => c.id === activeCategory)?.name}
        </button>
      </div>
      
      {/* Featured videos list */}
      <div>
        <h3 className="text-xl font-medium text-cyber-blue mb-4">
          {CATEGORIES.find(c => c.id === activeCategory)?.name} Videos
        </h3>
        
        {categoryVideos.length === 0 ? (
          <p className="text-cyber-blue/50 bg-ui-dark p-8 rounded-md text-center">
            No videos added to this category yet. Select a video above to add it.
          </p>
        ) : (
          <div className="space-y-3">
            {categoryVideos.map((video, index) => (
              <div 
                key={video.id} 
                className="flex items-center bg-ui-dark rounded-md overflow-hidden"
              >
                <img 
                  src={video.thumbnail || 
                    (video.platform === 'youtube' && video.youtubeId ? 
                      `https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg` : 
                      'https://placehold.co/480x360/1E1E2A/00e0ff?text=Video')
                  } 
                  alt={video.title}
                  className="w-20 h-12 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/480x360/1E1E2A/00e0ff?text=Video';
                  }}
                />
                <div className="flex-1 px-4 py-2 truncate">
                  <h4 className="font-medium text-white truncate">{video.title}</h4>
                  <p className="text-xs text-cyber-blue/70 truncate">
                    {video.platform || 'Video'} • Position: {index + 1}
                  </p>
                </div>
                <div className="flex space-x-1 px-2">
                  <button
                    onClick={() => handleMoveVideo(video.id, 'up')}
                    disabled={index === 0}
                    className="p-1.5 text-cyber-blue hover:text-cyber-purple transition-colors disabled:opacity-50 disabled:text-cyber-blue/30"
                    title="Move up"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    onClick={() => handleMoveVideo(video.id, 'down')}
                    disabled={index === categoryVideos.length - 1}
                    className="p-1.5 text-cyber-blue hover:text-cyber-purple transition-colors disabled:opacity-50 disabled:text-cyber-blue/30"
                    title="Move down"
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button
                    onClick={() => handleRemoveVideo(video.id)}
                    className="p-1.5 text-cyber-pink hover:text-red-400 transition-colors"
                    title="Remove from category"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-ui-dark/50 rounded-md">
        <h4 className="text-lg font-medium text-cyber-blue mb-2">How does this work?</h4>
        <p className="text-cyber-blue/70 text-sm leading-relaxed">
          Featured videos control which videos are shown in each section of your homepage. You can add the same video to multiple categories if needed. 
          Use the tabs above to switch between categories, then add videos and arrange them in the order you want them to appear.
        </p>
      </div>
    </div>
  );
};

export default FeaturedVideosManager;
