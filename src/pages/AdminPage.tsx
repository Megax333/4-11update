import React, { useState } from 'react';
import YoutubeVideoManager from '../components/admin/YoutubeVideoManager';
import FeaturedVideosManager from '../components/admin/FeaturedVideosManager';

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'videos' | 'featured'>('videos');

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-cyber-blue mb-8">Admin Dashboard</h1>
      
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('videos')}
          className={`px-5 py-2.5 rounded-lg transition-all ${
            activeTab === 'videos' 
              ? 'bg-cyber-blue text-cyber-black font-medium' 
              : 'bg-ui-dark text-cyber-blue/70 hover:bg-ui-light'
          }`}
        >
          YouTube Videos
        </button>
        <button
          onClick={() => setActiveTab('featured')}
          className={`px-5 py-2.5 rounded-lg transition-all ${
            activeTab === 'featured' 
              ? 'bg-cyber-blue text-cyber-black font-medium' 
              : 'bg-ui-dark text-cyber-blue/70 hover:bg-ui-light'
          }`}
        >
          Featured Videos
        </button>
      </div>
      
      <div className="mb-8">
        {activeTab === 'videos' ? (
          <>
            <h2 className="text-2xl font-semibold text-cyber-purple mb-2">YouTube Video Management</h2>
            <p className="text-cyber-blue/70 mb-6">
              Add, edit, or remove YouTube videos from your library.
            </p>
            <YoutubeVideoManager />
          </>
        ) : (
          <>
            <h2 className="text-2xl font-semibold text-cyber-purple mb-2">Featured Videos Management</h2>
            <p className="text-cyber-blue/70 mb-6">
              Control which videos appear in each section of your homepage.
            </p>
            <FeaturedVideosManager />
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
