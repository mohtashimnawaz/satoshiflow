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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading SatoshiFlow...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
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
