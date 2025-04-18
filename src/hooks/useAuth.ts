import { useContext } from 'react';
import { User } from '@supabase/supabase-js';
import { AuthContext } from '../context/AuthContext';

// Auth hook to be used in components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Create a mock version with a test user for development and testing
export const useAuthMock = () => {
  // Mock user for testing purposes
  const mockUser: User = {
    id: 'test-user-123',
    app_metadata: {},
    user_metadata: {
      avatar_url: 'https://avatars.githubusercontent.com/u/12345678',
      full_name: 'Test User',
    },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    role: 'authenticated',
    email: 'test@example.com',
  };
  
  return {
    user: mockUser,
    loading: false,
    showAuthModal: false,
    setShowAuthModal: (_show: boolean, _mode?: 'login' | 'signup') => {}
  };
};
