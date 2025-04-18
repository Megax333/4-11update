import React from 'react';
import AudioRooms from '../components/AudioRooms';
import { useAuth } from '../hooks/useAuth';

const AudioRoomsPage = () => {
  const { user, setShowAuthModal } = useAuth();

  if (!user) {
    return (
      <div className="p-6 pt-20">
        <div className="text-center py-12 bg-[#1E1E2A] rounded-xl">
          <h2 className="text-2xl font-bold mb-4">Join the Conversation</h2>
          <p className="text-gray-400 mb-6">Sign in to access audio rooms</p>
          <button
            onClick={() => setShowAuthModal(true, 'login')}
            className="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-full"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 pt-20">
      <AudioRooms />
    </div>
  );
};

export default AudioRoomsPage;