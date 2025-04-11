import React from 'react';
import ContentGrid from '../components/ContentGrid';

const DiscoverPage = () => {
  return (
    <div className="p-4">
      <button className="w-full bg-gradient-to-r from-cyber-purple to-cyber-blue hover:from-cyber-blue hover:to-cyber-purple text-cyber-black font-semibold py-3 rounded-xl mb-8 transition-all duration-300">
        Go Premium
      </button>
      <ContentGrid />
    </div>
  );
};

export default DiscoverPage;