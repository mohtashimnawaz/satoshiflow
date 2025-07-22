import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock,
  TrendingUp,
  Wallet,
  Activity,
  Users
} from 'lucide-react';
import { satoshiflow_backend } from 'declarations/satoshiflow_backend';
import { useAuth } from '../contexts/AuthContext';
import StreamCard from '../components/StreamCard';
import StatCard from '../components/StatCard';
import QuickActionCard from '../components/QuickActionCard';

function principalToText(p) {
  if (!p) return '';
  if (typeof p === 'string') return p;
  if (typeof p.toText === 'function') return p.toText();
  if (typeof p.toString === 'function') return p.toString();
  return String(p);
}

// Utility: Deeply convert all BigInt fields to Number
function deepBigIntToNumber(obj) {
  if (typeof obj === 'bigint') return Number(obj);
  if (Array.isArray(obj)) return obj.map(deepBigIntToNumber);
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const k in obj) {
      out[k] = deepBigIntToNumber(obj[k]);
    }
    return out;
  }
  return obj;
}

const Dashboard = () => {
  const [recentStreams, setRecentStreams] = useState([]);
  const [stats, setStats] = useState({
    totalSent: 0,
    totalReceived: 0,
    activeStreams: 0,
    totalStreams: 0,
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    } else {
      // Reset states if no user
      setRecentStreams([]);
      setStats({
        totalSent: 0,
        totalReceived: 0,
        activeStreams: 0,
        totalStreams: 0,
      });
      setLoading(false);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      if (!user) {
        console.log('No user authenticated, skipping data fetch');
        return;
      }
      
      // Fetch recent streams with proper error handling
      const userStreams = await satoshiflow_backend.list_streams_for_user(user);
      
      // Deep convert BigInt fields to Number
      const safeStreams = Array.isArray(userStreams) ? userStreams.map(deepBigIntToNumber) : [];
      
      // Sort by creation time and take the 5 most recent
      const sortedStreams = safeStreams.sort((a, b) => b.start_time - a.start_time);
      setRecentStreams(sortedStreams.slice(0, 5));
      
      // Calculate stats
      const sentStreams = safeStreams.filter(s => principalToText(s.sender) === user?.toText());
      const receivedStreams = safeStreams.filter(s => principalToText(s.recipient) === user?.toText());
      const activeStreams = safeStreams.filter(s => s.status === 'Active');
      
      setStats({
        totalSent: sentStreams.reduce((sum, s) => sum + (typeof s.total_locked === 'number' ? s.total_locked : 0), 0),
        totalReceived: receivedStreams.reduce((sum, s) => sum + (typeof s.total_released === 'number' ? s.total_released : 0), 0),
        activeStreams: activeStreams.length,
        totalStreams: safeStreams.length,
      });
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Set empty states on error
      setRecentStreams([]);
      setStats({
        totalSent: 0,
        totalReceived: 0,
        activeStreams: 0,
        totalStreams: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatSats = (sats) => {
    return new Intl.NumberFormat().format(sats);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Enhanced 3D Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
        {/* Floating 3D Bitcoin Icons - Static Positions */}
        {[
          { size: 80, left: 10, top: 20, delay: 0, duration: 12 },
          { size: 60, left: 85, top: 15, delay: 2, duration: 15 },
          { size: 100, left: 15, top: 70, delay: 4, duration: 10 },
          { size: 70, left: 90, top: 80, delay: 1, duration: 14 },
          { size: 50, left: 50, top: 10, delay: 3, duration: 16 },
          { size: 90, left: 75, top: 50, delay: 5, duration: 11 },
          { size: 65, left: 5, top: 45, delay: 1.5, duration: 13 },
          { size: 55, left: 95, top: 35, delay: 3.5, duration: 17 },
          { size: 75, left: 30, top: 85, delay: 2.5, duration: 9 },
          { size: 85, left: 65, top: 25, delay: 4.5, duration: 12 },
        ].map((bitcoin, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${bitcoin.left}%`,
              top: `${bitcoin.top}%`,
              width: `${bitcoin.size}px`,
              height: `${bitcoin.size}px`,
              opacity: 0.15,
              zIndex: 0,
              animationDelay: `${bitcoin.delay}s`,
              animationDuration: `${bitcoin.duration}s`,
            }}
          >
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <defs>
                <radialGradient id={`bitcoin3d${i}`} cx="30%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#FFD700" />
                  <stop offset="40%" stopColor="#FFA500" />
                  <stop offset="80%" stopColor="#FF8C00" />
                  <stop offset="100%" stopColor="#FF6B00" />
                </radialGradient>
              </defs>
              <circle cx="32" cy="32" r="28" fill={`url(#bitcoin3d${i})`} stroke="#F7931A" strokeWidth="2" />
              <circle cx="32" cy="32" r="24" fill="none" stroke="#fff" strokeWidth="1" opacity="0.3" />
              <text x="32" y="38" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#fff" style={{fontFamily:'Arial, sans-serif'}}>₿</text>
              <ellipse cx="32" cy="20" rx="20" ry="8" fill="#fff" opacity="0.15" />
            </svg>
          </div>
        ))}
        
        {/* Simple Geometric Shapes */}
        {[
          { left: 20, top: 30, size: 80, delay: 0 },
          { left: 70, top: 60, size: 60, delay: 2 },
          { left: 85, top: 20, size: 70, delay: 4 },
          { left: 10, top: 80, size: 50, delay: 1 },
          { left: 60, top: 15, size: 65, delay: 3 },
        ].map((shape, i) => (
          <div
            key={`geo${i}`}
            className="absolute animate-pulse"
            style={{
              left: `${shape.left}%`,
              top: `${shape.top}%`,
              width: `${shape.size}px`,
              height: `${shape.size}px`,
              background: `linear-gradient(135deg, rgba(255, 165, 0, 0.1), rgba(255, 215, 0, 0.05))`,
              borderRadius: i % 2 === 0 ? '50%' : '20%',
              border: '1px solid rgba(255, 165, 0, 0.2)',
              backdropFilter: 'blur(10px)',
              animationDelay: `${shape.delay}s`,
              animationDuration: '3s',
            }}
          />
        ))}
        
        {/* Enhanced Keyframes */}
        <style>{`
          @keyframes float {
            0% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
            100% { transform: translateY(0px) rotate(360deg); }
          }
          .animate-float {
            animation: float 8s ease-in-out infinite;
          }
          @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
        `}</style>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-yellow-400 via-orange-500 to-orange-600 bg-clip-text text-transparent mb-4">
            SatoshiFlow Dashboard
          </h1>
          <p className="text-slate-300 text-lg md:text-xl font-medium mb-6">Welcome back to your Bitcoin streaming platform</p>
          <Link
            to="/create"
            className="inline-flex items-center space-x-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
            <span>Create Stream</span>
          </Link>
        </div>

        {/* 3D Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="transform hover:scale-105 transition-all duration-300">
            <StatCard
              title="Total Sent"
              value={`${formatSats(stats.totalSent)} sats`}
              icon={ArrowUpRight}
              color="text-red-400"
              bgColor="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20"
            />
          </div>
          <div className="transform hover:scale-105 transition-all duration-300">
            <StatCard
              title="Total Received"
              value={`${formatSats(stats.totalReceived)} sats`}
              icon={ArrowDownRight}
              color="text-green-400"
              bgColor="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20"
            />
          </div>
          <div className="transform hover:scale-105 transition-all duration-300">
            <StatCard
              title="Active Streams"
              value={stats.activeStreams.toString()}
              icon={Activity}
              color="text-blue-400"
              bgColor="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20"
            />
          </div>
          <div className="transform hover:scale-105 transition-all duration-300">
            <StatCard
              title="Total Streams"
              value={stats.totalStreams.toString()}
              icon={Users}
              color="text-purple-400"
              bgColor="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20"
            />
          </div>
        </div>

        {/* Recent Streams Section */}
        <div className="mb-8">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white">Recent Streams</h2>
              <Link
                to="/streams"
                className="text-orange-400 hover:text-orange-300 font-semibold hover:scale-105 transition-all duration-300"
              >
                View All
              </Link>
            </div>
            {recentStreams.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-white/10 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <Wallet className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">No streams yet</h3>
                <p className="text-slate-400 mb-6 max-w-md mx-auto">
                  Get started by creating your first Bitcoin stream.
                </p>
                <Link
                  to="/create"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300"
                >
                  <Plus size={20} />
                  <span>Create Your First Stream</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentStreams.map((stream, index) => (
                  <div key={stream.id} className="transform hover:scale-102 transition-all duration-300">
                    <StreamCard
                      stream={stream}
                      currentUser={user}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickActionCard
            to="/create"
            icon={Plus}
            iconBg="bg-gradient-to-br from-orange-500 to-orange-600"
            title="Create Stream"
            description="Start streaming Bitcoin payments"
            ariaLabel="Create a new Bitcoin stream"
          />
          <QuickActionCard
            to="/templates"
            icon={Clock}
            iconBg="bg-gradient-to-br from-blue-500 to-blue-600"
            title="Templates"
            description="Use predefined stream templates"
            ariaLabel="View stream templates"
          />
          <QuickActionCard
            to="/analytics"
            icon={TrendingUp}
            iconBg="bg-gradient-to-br from-green-500 to-green-600"
            title="Analytics"
            description="View detailed statistics"
            ariaLabel="View analytics"
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
