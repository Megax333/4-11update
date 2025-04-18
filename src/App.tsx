import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProfileProvider } from './context/ProfileContext';
import { AuthProvider } from './context/AuthContext';
import { AudioRoomProvider } from './context/AudioRoomContext';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
// Stripe is handled directly within the StripePaymentForm component
import Navbar from './components/Navbar';
import ExpandableSidebar from './components/ExpandableSidebar';
import DiscoverPage from './pages/DiscoverPage';
import CommunityPage from './pages/CommunityPage';
import AudioRoomsPage from './pages/AudioRoomsPage';
import MessagesPage from './pages/MessagesPage';
import WatchTogetherPage from './pages/WatchTogetherPage';
import SavedPage from './pages/SavedPage';
import HistoryPage from './pages/HistoryPage';
import TempProfileModal from './components/TempProfileModal';
import PaymentPage from './components/wallet/PaymentPage';
import AvatarDebugger from './components/debug/AvatarDebugger';
import AdminPage from './pages/AdminPage';
import { useEffect } from 'react';

// PayPal configuration options
const paypalOptions = {
  clientId: "ASLheV064vTrn0Y-FIgA3scv7IvmcX5hF0NGHmJEg5_1TE-cuHly4oAKxfgsRkN5GwaDZHa1c1s1LXsO", // PayPal sandbox client ID
  currency: "USD",
  intent: "capture",
  // Disable specific funding sources (Pay Later, Venmo)
  disableFunding: "paylater,venmo"
};

// Stripe configuration is handled within the StripePaymentForm component

function App() {
  useEffect(() => {
    // Make supabase URL available globally for avatar URL generation
    (window as any).supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wdbcwawakmyijhbwbdkt.supabase.co';
  }, []);

  return (
    <PayPalScriptProvider options={paypalOptions}>
      <Router>
        <AuthProvider>
          <ProfileProvider>
            <AudioRoomProvider>
              <div className="min-h-screen bg-cyber-dark text-cyber-blue">
                <Navbar />
                <ExpandableSidebar />
                <div className="ml-16">
                  <Routes>
                    <Route path="/" element={<DiscoverPage />} />
                    <Route path="/community" element={<CommunityPage />} />
                    <Route path="/messages" element={<MessagesPage />} />
                    <Route path="/messages/:username" element={<MessagesPage />} />
                    <Route path="/audio" element={<AudioRoomsPage />} />
                    <Route path="/watch-together" element={<WatchTogetherPage />} />
                    <Route path="/saved" element={<SavedPage />} />
                    <Route path="/history" element={<HistoryPage />} />
                    <Route path="/payment" element={<PaymentPage />} />
                    <Route path="/debug/avatars" element={<AvatarDebugger />} />
                    <Route path="/admin" element={<AdminPage />} />
                  </Routes>
                </div>
                <TempProfileModal />
              </div>
            </AudioRoomProvider>
          </ProfileProvider>
        </AuthProvider>
      </Router>
    </PayPalScriptProvider>
  );
}

export default App;