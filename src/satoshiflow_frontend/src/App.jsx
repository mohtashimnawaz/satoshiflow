import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { satoshiflow_backend } from 'declarations/satoshiflow_backend';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import CreateStream from './pages/CreateStream';
import StreamList from './pages/StreamList';
import Templates from './pages/Templates';
import Analytics from './pages/Analytics';
import Notifications from './pages/Notifications';
import StreamDetails from './pages/StreamDetails';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize the app
    const initializeApp = async () => {
      try {
        // Add any initialization logic here
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500/20 border-t-orange-500 mx-auto mb-6"></div>
            <div className="absolute inset-0 animate-pulse rounded-full h-16 w-16 bg-orange-500/10 mx-auto"></div>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent mb-2">
            SatoshiFlow
          </h2>
          <p className="text-slate-600">Loading your Bitcoin streaming platform...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <Navbar />
            <main className="container mx-auto px-4 py-8 max-w-7xl">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/create" element={<CreateStream />} />
                <Route path="/streams" element={<StreamList />} />
                <Route path="/streams/:id" element={<StreamDetails />} />
                <Route path="/templates" element={<Templates />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/notifications" element={<Notifications />} />
              </Routes>
            </main>
          </div>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
