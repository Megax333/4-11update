import React, { useEffect, useState } from 'react';
import VideoRow from './VideoRow';
import YouTubeVideoRow from './YouTubeVideoRow';
import FeaturedBanner from './FeaturedBanner';
import SeriesModal from './SeriesModal';
import Creators from './Creators';
import { useMovieStore } from '../stores/movieStore';
import { useYoutubeStore } from '../stores/youtubeStore';

const HomePage = () => {
  const fetchMovies = useMovieStore((state) => state.fetchMovies);
  const fetchYoutubeVideos = useYoutubeStore((state) => state.fetchVideos);
  const movies = useMovieStore((state) => state.movies);
  const [activeMovie, setActiveMovie] = useState<any>(null);
  const categories = [
    { id: 'trending', name: 'Trending Now' },
    { id: 'popular', name: 'Popular on CelFlicks' },
    { id: 'new', name: 'Emotional' },
    { id: 'action', name: 'Action & Adventure' },
    { id: 'comedy', name: 'Comedy Picks' },
    { id: 'sci-fi', name: 'Sci-Fi Thrills' }
  ];

  useEffect(() => {
    fetchMovies();
    fetchYoutubeVideos();
  }, [fetchMovies, fetchYoutubeVideos]);

  // Function to get movie covers for the trending section
  const getTrendingMovies = () => {
    return movies.slice(0, 10);
  };
  
  // Function to get YouTube videos for each category
  const getYouTubeVideos = (categoryId: string) => {
    // First check for featured videos in admin panel
    let categoryToUse = categoryId;
    
    // Map 'popular' to 'trending' since the admin panel uses 'trending' for Popular section
    if (categoryId === 'popular') {
      categoryToUse = 'trending';
    }
    
    // Strictly use the videos selected in the admin panel
    // This ensures NO OVERLAP between sections unless explicitly chosen
    const featuredForCategory = useYoutubeStore.getState().getFeaturedVideos(categoryToUse as any);
    
    // Always return what's in the admin panel - if it's empty, show nothing
    // This prevents fallback behavior that was causing duplicates
    return featuredForCategory;
  };

  const handlePlayFeatured = (id: string) => {
    setActiveMovie(movies.find(movie => movie.id === id) || null);
  };

  return (
    <div className="-mt-4">
      {/* Featured Banner */}
      <FeaturedBanner 
        featured={movies} 
        onPlay={handlePlayFeatured} 
      />
      
      {/* Video Rows - Special handling for Trending section */}
      <VideoRow 
        key={categories[0].id}
        title={categories[0].name}
        items={getTrendingMovies()}
        useFullSizedCovers={true}
      />
      
      {/* First video row - Popular on CelFlicks */}
      <YouTubeVideoRow
        title={categories[1].name}
        videos={getYouTubeVideos(categories[1].id)}
      />

      {/* Suggested Creators - Now positioned right before Emotional */}
      <div className="mb-8 mt-4">
        <h2 className="text-xl font-medium text-cyber-blue mb-6">Suggested Creators</h2>
        <Creators />
      </div>
      
      {/* Emotional and remaining video rows */}
      {categories.slice(2).map((category) => {
        return (
          <React.Fragment key={category.id}>
            <YouTubeVideoRow
              title={category.name.replace('New Releases', 'Emotional')}
              videos={getYouTubeVideos(category.id)}
            />
          </React.Fragment>
        );
      })}
      
      {/* Series Modal */}
      {activeMovie && (
        <SeriesModal
          movie={activeMovie}
          onClose={() => setActiveMovie(null)}
        />
      )}
    </div>
  );
};

export default HomePage;