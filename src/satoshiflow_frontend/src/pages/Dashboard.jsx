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
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#181c24] via-[#23283a] to-[#181c24] overflow-hidden">
      {/* Animated 3D Bitcoin SVGs floating around */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {[...Array(12)].map((_, i) => {
          const size = 60 + Math.random() * 100;
          const left = Math.random() * 90;
          const top = Math.random() * 90;
          const duration = 12 + Math.random() * 8;
          const delay = Math.random() * 6;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${left}%`,
                top: `${top}%`,
                width: `${size}px`,
                height: `${size}px`,
                opacity: 0.18 + Math.random() * 0.18,
                zIndex: 0,
                animation: `floatY ${duration}s ease-in-out infinite`,
                animationDelay: `${delay}s`,
                filter: 'drop-shadow(0 0 30px orange)',
              }}
            >
              {/* 3D Bitcoin SVG */}
              <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <defs>
                  <radialGradient id={`bitcoin3d${i}`} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" stopColor="#FFD700" />
                    <stop offset="60%" stopColor="#FFA500" />
                    <stop offset="100%" stopColor="#FF8C00" />
                  </radialGradient>
                </defs>
                <circle cx="32" cy="32" r="30" fill={`url(#bitcoin3d${i})`} stroke="#F7931A" strokeWidth="3" />
                <text x="32" y="40" textAnchor="middle" fontSize="32" fontWeight="bold" fill="#fff" filter="url(#shadow)" style={{fontFamily:'monospace'}}>₿</text>
                <ellipse cx="32" cy="32" rx="28" ry="12" fill="#fff" opacity="0.08" />
              </svg>
            </div>
          );
        })}
        {/* Keyframes for floating animation */}
        <style>{`
          @keyframes floatY {
            0% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-30px) scale(1.08); }
            100% { transform: translateY(0px) scale(1); }
          }
        `}</style>
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex flex-col items-center justify-center mb-12">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-yellow-400 via-orange-500 to-orange-600 bg-clip-text text-transparent drop-shadow-2xl mb-2 text-center">
            SatoshiFlow Dashboard
          </h1>
          <p className="text-slate-300 text-xl font-medium drop-shadow-md text-center mb-4">Welcome back to your Bitcoin streaming platform</p>
          <Link
            to="/create"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-yellow-400 hover:from-orange-600 hover:to-yellow-500 text-white font-bold px-10 py-5 rounded-3xl shadow-2xl hover:shadow-orange-500/40 transition-all duration-300 transform hover:scale-110 border border-orange-300/30 backdrop-blur-xl text-xl"
          >
            <Plus size={28} className="group-hover:rotate-90 transition-transform duration-200" />
            <span>Create Stream</span>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <StatCard
            title="Total Sent"
            value={`${formatSats(stats.totalSent)} sats`}
            icon={ArrowUpRight}
            color="text-red-500"
            bgColor="bg-gradient-to-br from-[#2c2f3a] to-[#23283a] border border-red-200/30 shadow-2xl backdrop-blur-xl"
          />
          <StatCard
            title="Total Received"
            value={`${formatSats(stats.totalReceived)} sats`}
            icon={ArrowDownRight}
            color="text-green-500"
            bgColor="bg-gradient-to-br from-[#2c3a2c] to-[#23283a] border border-green-200/30 shadow-2xl backdrop-blur-xl"
          />
          <StatCard
            title="Active Streams"
            value={stats.activeStreams.toString()}
            icon={Activity}
            color="text-blue-500"
            bgColor="bg-gradient-to-br from-[#2c2c3a] to-[#23283a] border border-blue-200/30 shadow-2xl backdrop-blur-xl"
          />
          <StatCard
            title="Total Streams"
            value={stats.totalStreams.toString()}
            icon={Users}
            color="text-purple-500"
            bgColor="bg-gradient-to-br from-[#3a2c3a] to-[#23283a] border border-purple-200/30 shadow-2xl backdrop-blur-xl"
          />
        </div>

        {/* Recent Streams */}
        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200/20 p-8 mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-slate-100 drop-shadow-lg">Recent Streams</h2>
            <Link
              to="/streams"
              className="text-orange-400 hover:text-orange-500 font-bold text-lg drop-shadow-md"
            >
              View All
            </Link>
          </div>
          {recentStreams.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-slate-100/20 rounded-full p-8 w-32 h-32 mx-auto mb-8 shadow-lg flex items-center justify-center">
                <Wallet className="w-16 h-16 text-slate-400" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-100 mb-4">No streams yet</h3>
              <p className="text-slate-400 mb-8 max-w-md mx-auto text-lg">
                Get started by creating your first Bitcoin stream and begin your decentralized finance journey.
              </p>
              <Link
                to="/create"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-yellow-400 hover:from-orange-600 hover:to-yellow-500 text-white font-bold px-10 py-5 rounded-3xl shadow-2xl hover:shadow-orange-500/40 transition-all duration-300 transform hover:scale-110 border border-orange-300/30 backdrop-blur-xl text-xl"
              >
                <Plus size={28} />
                <span>Create Your First Stream</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {recentStreams.map((stream) => (
                <StreamCard
                  key={stream.id}
                  stream={stream}
                  currentUser={user}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <QuickActionCard
            to="/create"
            icon={Plus}
            iconBg="bg-gradient-to-br from-orange-500 to-yellow-400 shadow-2xl border border-orange-200/30 backdrop-blur-xl"
            title="Create Stream"
            description="Start streaming Bitcoin payments"
            ariaLabel="Create a new Bitcoin stream"
          />
          <QuickActionCard
            to="/templates"
            icon={Clock}
            iconBg="bg-gradient-to-br from-blue-500 to-blue-300 shadow-2xl border border-blue-200/30 backdrop-blur-xl"
            title="Templates"
            description="Use predefined stream templates"
            ariaLabel="View stream templates"
          />
          <QuickActionCard
            to="/analytics"
            icon={TrendingUp}
            iconBg="bg-gradient-to-br from-green-500 to-green-300 shadow-2xl border border-green-200/30 backdrop-blur-xl"
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
