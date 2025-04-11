import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import SeriesModal from './SeriesModal';
import { useMovieStore } from '../stores/movieStore';

// Define the Movie type interface
interface Movie {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  preview: string;
  tags: string[];
  // Add other properties as needed
}

const MovieGrid = () => {
  const fetchMovies = useMovieStore((state) => state.fetchMovies);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;
  const [activePreview, setActivePreview] = useState<string | null>(null);
  const [previewPosition, setPreviewPosition] = useState<'left' | 'right'>('left');
  const movies = useMovieStore((state) => state.movies);
  const [content, setContent] = useState<Movie[]>(movies);
  const previewTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  useEffect(() => {
    setContent(movies);
  }, [movies]);

  const handlePreviewPosition = (id: string) => {
    const element = document.querySelector(`[data-movie-id="${id}"]`);
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const previewWidth = 400;
    const margin = 20;
    
    // Check if preview would overflow on the right side
    const shouldShowLeft = rect.left + previewWidth + margin > viewportWidth;
    setPreviewPosition(shouldShowLeft ? 'right' : 'left');
  };

  // Reset preview positions when page changes
  const changePage = (newPage: number) => {
    setCurrentPage(newPage);
    setActivePreview(null);
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
    }
  };

  const handleVideoPlay = (id: string) => {
    if (videoRefs.current[id]) {
      videoRefs.current[id]?.play();
    }
  };

  const totalPages = Math.ceil(content.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const visibleContent = content.slice(startIndex, startIndex + itemsPerPage);

  const handleMouseEnter = (id: string) => {
    // Clear any existing timeout
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
    }

    // Set a small delay before showing the preview to prevent flicker
    previewTimeoutRef.current = setTimeout(() => {
      if (activePreview !== id) {
        setActivePreview(id);
        handlePreviewPosition(id);
        handleVideoPlay(id);
      }
    }, 100);
  };

  const [activeMovie, setActiveMovie] = useState<Movie | null>(null);

  const navigateToSeries = (id: string) => {
    setActiveMovie(content.find(movie => movie.id === id) || null);
  };

  const handleMouseLeave = (id: string) => {
    // Clear any pending preview timeout
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
    }

    // Set a small delay before hiding the preview to allow smooth transitions
    previewTimeoutRef.current = setTimeout(() => {
      if (activePreview === id) {
        setActivePreview(null);
        if (videoRefs.current[id]) {
          videoRefs.current[id]?.pause();
          if (videoRefs.current[id]) {
            videoRefs.current[id]!.currentTime = 0;
          }
        }
      }
    }, 100);
  };

  const nextPage = () => {
    changePage((currentPage + 1) % totalPages);
  };

  const prevPage = () => {
    changePage((currentPage - 1 + totalPages) % totalPages);
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      <div className="grid grid-cols-6 gap-4">
        {visibleContent.map((item) => (
          <div 
            key={item.id} 
            className="group relative"
            data-movie-id={item.id}
            onMouseEnter={() => handleMouseEnter(item.id)}
            onMouseLeave={() => handleMouseLeave(item.id)}
          >
            <div className="rounded-xl overflow-hidden">
              <img
                src={item.thumbnail}
                alt=""
                className="w-full aspect-[2/3] object-cover"
              />
            </div>
            
            {activePreview === item.id && (
              <div className={`absolute top-0 w-[400px] bg-ui-dark rounded-xl overflow-hidden z-50 transition-all duration-300 transform scale-95 group-hover:scale-100 ${
                previewPosition === 'right' ? 'right-full' : 'left-0'
              }`}>
                <div className="aspect-video relative">
                  <video
                    ref={el => videoRefs.current[item.id] = el}
                    src={item.preview}
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    playsInline
                  >
                    <source src={item.preview} type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateToSeries(item.id);
                      }}
                      className="relative group/play cursor-pointer transform hover:scale-110 transition-all"
                    >
                      <div className="absolute inset-0 bg-purple-600/30 rounded-full blur-xl scale-150 opacity-0 group-hover/play:opacity-100 transition-all" />
                      <div className="relative bg-black/30 hover:bg-purple-600/50 w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-sm transition-all border border-white/20">
                        <Play size={22} className="text-white ml-1" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-white text-lg font-semibold">{item.title}</h3>
                  <div className="flex gap-2 mt-2">
                    {item.tags.map((tag, index) => (
                      <span key={index} className="text-sm text-gray-400">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {activeMovie && (
        <SeriesModal
          movie={activeMovie}
          onClose={() => setActiveMovie(null)}
        />
      )}

      {/* Navigation Arrows */}
      <div className="flex items-center justify-between mt-8 mb-6">
        <h2 className="text-xl font-medium text-cyber-blue">Featured Creators</h2>
        <div className="flex gap-2">
          <button
            onClick={prevPage}
            className="p-1.5 bg-ui-dark hover:bg-cyber-blue rounded-full backdrop-blur-sm transition-all transform hover:scale-110 border border-cyber-blue/20 flex items-center justify-center w-8 h-8 disabled:opacity-50 disabled:hover:scale-100"
            disabled={currentPage === 0}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={nextPage}
            className="p-1.5 bg-ui-dark hover:bg-cyber-blue rounded-full backdrop-blur-sm transition-all transform hover:scale-110 border border-cyber-blue/20 flex items-center justify-center w-8 h-8 disabled:opacity-50 disabled:hover:scale-100"
            disabled={currentPage === totalPages - 1}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieGrid;