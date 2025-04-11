import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import { AuthModal } from '../components/auth/AuthModal';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean, mode?: 'login' | 'signup') => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  showAuthModal: false,
  setShowAuthModal: () => {}
});

// useAuth is now imported from '../hooks/useAuth'

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [initialMode, setInitialMode] = useState<'login' | 'signup'>('login');

  const handleAuthStateChange = async (event: string, session: Session | null) => {
    try {
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
      } else if (session?.user && event === 'SIGNED_IN') {
        setUser(session.user);
      }
    } catch (error) {
      console.error('Auth state change error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Session fetch error:', error);
          setUser(null);
          return;
        }

        await handleAuthStateChange('INITIAL', session);
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0A0A0F] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      showAuthModal, 
      setShowAuthModal: (show: boolean, mode?: 'login' | 'signup') => {
        if (mode) setInitialMode(mode);
        setShowAuthModal(show);
      }
    }}>
      {children}
      {showAuthModal && <AuthModal initialMode={initialMode} onClose={() => setShowAuthModal(false)} />}
    </AuthContext.Provider>
  );
};