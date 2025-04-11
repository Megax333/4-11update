import { useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';

// Define the Auth context type - this should match what's in AuthContext.tsx
interface AuthContextType {
  user: User | null;
  loading: boolean;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean, mode?: 'login' | 'signup') => void;
}

// Import the AuthContext from the context file
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
  const mockUser = {
    id: 'test-user-123',
    email: 'test@example.com',
    user_metadata: {
      avatar_url: 'https://avatars.githubusercontent.com/u/12345678',
      full_name: 'Test User',
    }
  } as User;
  
  // Return values that match the AuthContextType interface
  return {
    user: mockUser, // Provide a mock user instead of null
    loading: false,
    showAuthModal: false,
    setShowAuthModal: (_show: boolean, _mode?: 'login' | 'signup') => {}
  };
};

// For production use
export default useAuth;
