import React from 'react';
import { Play } from 'lucide-react';

const IntroSection = () => {
  return (
    <div className="mt-12 mb-12">
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-ui-dark group">
        {/* Video Thumbnail */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920&h=1080&fit=crop"
            alt="Celflicks Intro"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-cyber-dark/50" />
        </div>

        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button className="bg-cyber-blue hover:bg-cyber-purple p-6 rounded-full transform transition-all duration-300 group-hover:scale-110">
            <Play size={32} fill="white" />
          </button>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-8 left-8">
          <h2 className="text-3xl font-bold mb-2 text-cyber-blue">Welcome to Celflicks</h2>
          <p className="text-cyber-blue/70">Discover the future of creative collaboration</p>
        </div>

        {/* Video Element (Hidden by default) */}
        <video
          className="w-full h-full object-cover hidden"
          poster="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920&h=1080&fit=crop"
          controls
        >
          <source src="https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" type="video/mp4" />
        </video>
      </div>
    </div>
  );
};

export default IntroSection;