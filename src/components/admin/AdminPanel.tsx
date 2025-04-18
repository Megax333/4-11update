{/* Update the AdminPanel component to include the AdManager */}
import { useState, useEffect } from 'react';
import { Settings, Film, Upload, X, LayoutGrid, Users, Tv, PlaySquare, Youtube } from 'lucide-react';
import MovieEditor from './MovieEditor';
import PreviewEditor from './PreviewEditor';
import EpisodeEditor from './EpisodeEditor';
import CategoryEditor from './CategoryEditor';
import CreatorEditor from './CreatorEditor';
import LiveTVEditor from './LiveTVEditor';
import AdManager from './AdManager';
import VideoManager from './VideoManager';
import FeaturedVideosManager from './FeaturedVideosManager';
import { useMovieStore } from '../../stores/movieStore';
import AdminPortal from './AdminPortal';

const AdminPanel = ({ onClose }: { onClose: () => void }) => {
  const [activeTab, setActiveTab] = useState('movies');
  const movies = useMovieStore((state) => state.movies);
  const fetchMovies = useMovieStore((state) => state.fetchMovies);
  const updateMovie = useMovieStore((state) => state.updateMovie);
  const addMovie = useMovieStore((state) => state.addMovie);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  return (
    <AdminPortal>
      <div className="fixed inset-0 z-[100] bg-[#0A0A0F]">
        <div className="w-full h-full flex">
          {/* Sidebar */}
          <div className="w-64 bg-[#12121A] p-6 border-r border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Admin Panel</h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-2">
              <button
                key="previews-tab"
                onClick={() => setActiveTab('previews')}
                className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg ${
                  activeTab === 'previews' ? 'bg-purple-600' : 'hover:bg-white/5'
                }`}
              >
                <Film size={20} />
                <span>Previews</span>
              </button>
              <button
                key="movies-tab"
                onClick={() => setActiveTab('movies')}
                className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg ${
                  activeTab === 'movies' ? 'bg-purple-600' : 'hover:bg-white/5'
                }`}
              >
                <Film size={20} />
                <span>Movies</span>
              </button>
              <button
                key="episodes-tab"
                onClick={() => setActiveTab('episodes')}
                className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg ${
                  activeTab === 'episodes' ? 'bg-purple-600' : 'hover:bg-white/5'
                }`}
              >
                <Film size={20} />
                <span>Episodes</span>
              </button>
              <button
                key="livetv-tab"
                onClick={() => setActiveTab('livetv')}
                className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg ${
                  activeTab === 'livetv' ? 'bg-purple-600' : 'hover:bg-white/5'
                }`}
              >
                <Tv size={20} />
                <span>Live TV</span>
              </button>
              <button
                key="ads-tab"
                onClick={() => setActiveTab('ads')}
                className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg ${
                  activeTab === 'ads' ? 'bg-purple-600' : 'hover:bg-white/5'
                }`}
              >
                <PlaySquare size={20} />
                <span>Advertisements</span>
              </button>
              <button
                key="videos-tab"
                onClick={() => setActiveTab('videos')}
                className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg ${
                  activeTab === 'videos' ? 'bg-purple-600' : 'hover:bg-white/5'
                }`}
              >
                <Youtube size={20} />
                <span>Videos</span>
              </button>
              <button
                key="categories-tab"
                onClick={() => setActiveTab('categories')}
                className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg ${
                  activeTab === 'categories' ? 'bg-purple-600' : 'hover:bg-white/5'
                }`}
              >
                <LayoutGrid size={20} />
                <span>Categories</span>
              </button>
              <button
                key="creators-tab"
                onClick={() => setActiveTab('creators')}
                className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg ${
                  activeTab === 'creators' ? 'bg-purple-600' : 'hover:bg-white/5'
                }`}
              >
                <Users size={20} />
                <span>Creators</span>
              </button>
              <button
                key="settings-tab"
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg ${
                  activeTab === 'settings' ? 'bg-purple-600' : 'hover:bg-white/5'
                }`}
              >
                <Settings size={20} />
                <span>Settings</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-8">
            {activeTab === 'previews' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Preview Management</h2>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  {movies.map((movie) => (
                    <PreviewEditor key={movie.id} movie={movie} onSave={updateMovie} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'movies' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold">Movie Management</h2>
                  </div>
                  <div>
                    <button 
                      onClick={() => {
                        addMovie({
                          title: "New Movie",
                          description: "Add description here",
                          thumbnail: "https://images.unsplash.com/photo-1642427749670-f20e2e76ed8c?w=300&h=400&fit=crop",
                          preview: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                          tags: ["#new"],
                          order: movies.length
                        });
                      }}
                      className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <Upload size={20} />
                      Add New Movie
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-6">
                  {movies.map((movie, index) => (
                    <MovieEditor 
                      key={movie.id} 
                      movie={movie} 
                      index={index}
                      totalMovies={movies.length}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'episodes' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Episode Management</h2>
                </div>
                <EpisodeEditor movies={movies} />
              </div>
            )}

            {activeTab === 'livetv' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Live TV Management</h2>
                </div>
                <LiveTVEditor />
              </div>
            )}

            {activeTab === 'ads' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Advertisement Management</h2>
                </div>
                <AdManager />
              </div>
            )}
            
            {activeTab === 'categories' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Category Management</h2>
                </div>
                <CategoryEditor />
              </div>
            )}

            {activeTab === 'creators' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Creator Management</h2>
                </div>
                <CreatorEditor />
              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Settings</h2>
                {/* Add settings content */}
              </div>
            )}

            {activeTab === 'videos' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Video Management</h2>
                </div>
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-cyber-blue mb-3">Video Library</h3>
                  <p className="text-cyber-blue/70 mb-4">Add, edit, or remove videos from various platforms.</p>
                  <VideoManager />
                </div>
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-cyber-blue mb-3">Featured Videos Manager</h3>
                  <p className="text-cyber-blue/70 mb-4">Control which videos appear in each section of your homepage.</p>
                  <FeaturedVideosManager />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminPortal>
  );
};

export default AdminPanel;