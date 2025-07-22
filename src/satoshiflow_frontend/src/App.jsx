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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-8 border-orange-500/30 border-t-orange-500 shadow-2xl shadow-orange-500/30 mx-auto mb-6" style={{ filter: 'drop-shadow(0 0 20px orange)' }}></div>
            <div className="absolute inset-0 animate-pulse rounded-full h-20 w-20 bg-orange-500/20 mx-auto blur-xl"></div>
          </div>
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-600 bg-clip-text text-transparent mb-2 drop-shadow-lg">
            SatoshiFlow
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg backdrop-blur-xl px-4 py-2 rounded-xl bg-white/30 shadow-md inline-block">
            Loading your <span className="font-bold text-orange-500">Bitcoin</span> streaming platform...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 flex flex-col relative">
            {/* 3D Glassmorphism Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              <div className="w-full h-full">
                <div className="absolute top-10 left-10 w-80 h-80 bg-gradient-to-tr from-orange-400 via-yellow-300 to-orange-600 opacity-30 blur-3xl rounded-full shadow-2xl animate-pulse" style={{ filter: 'drop-shadow(0 0 60px orange)' }}></div>
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-br from-slate-300 via-orange-200 to-yellow-100 opacity-20 blur-2xl rounded-full shadow-2xl animate-pulse" style={{ filter: 'drop-shadow(0 0 40px orange)' }}></div>
              </div>
            </div>
            <div className="relative z-10">
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
          </div>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
