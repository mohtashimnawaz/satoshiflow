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
    <div className="relative min-h-screen flex flex-col items-center justify-start pt-8 pb-16 px-2 md:px-0 overflow-hidden">
      {/* 3D Bitcoin Bubble Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Animated bubbles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full bg-gradient-to-tr from-yellow-400 via-orange-500 to-yellow-300 shadow-2xl animate-bubble${i % 4} flex items-center justify-center`}
            style={{
              width: `${80 + Math.random() * 80}px`,
              height: `${80 + Math.random() * 80}px`,
              left: `${Math.random() * 80}%`,
              top: `${Math.random() * 80}%`,
              opacity: 0.18 + Math.random() * 0.12,
              filter: 'blur(2px) drop-shadow(0 0 30px orange)',
              zIndex: 0,
            }}
          >
            <img src="/logo.png" alt="Bitcoin Bubble" className="w-1/2 h-1/2 object-contain opacity-70" />
          </div>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-yellow-400 via-orange-500 to-orange-600 bg-clip-text text-transparent drop-shadow-lg">
              Dashboard
            </h1>
            <p className="text-slate-300 mt-2 text-lg font-medium drop-shadow-md">Welcome back to your Bitcoin streaming platform</p>
          </div>
          <Link
            to="/create"
            className="mt-6 md:mt-0 inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold px-8 py-4 rounded-2xl shadow-2xl hover:shadow-orange-500/40 transition-all duration-300 transform hover:scale-110 group border border-orange-300/30 backdrop-blur-xl"
          >
            <Plus size={24} className="group-hover:rotate-90 transition-transform duration-200" />
            <span className="text-lg">Create Stream</span>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatCard
            title="Total Sent"
            value={`${formatSats(stats.totalSent)} sats`}
            icon={ArrowUpRight}
            color="text-red-500"
            bgColor="bg-red-50/60 backdrop-blur-xl shadow-2xl border border-red-200/30"
          />
          <StatCard
            title="Total Received"
            value={`${formatSats(stats.totalReceived)} sats`}
            icon={ArrowDownRight}
            color="text-green-500"
            bgColor="bg-green-50/60 backdrop-blur-xl shadow-2xl border border-green-200/30"
          />
          <StatCard
            title="Active Streams"
            value={stats.activeStreams.toString()}
            icon={Activity}
            color="text-blue-500"
            bgColor="bg-blue-50/60 backdrop-blur-xl shadow-2xl border border-blue-200/30"
          />
          <StatCard
            title="Total Streams"
            value={stats.totalStreams.toString()}
            icon={Users}
            color="text-purple-500"
            bgColor="bg-purple-50/60 backdrop-blur-xl shadow-2xl border border-purple-200/30"
          />
        </div>

        {/* Recent Streams */}
        <div className="card bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/30 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-100 drop-shadow-lg">Recent Streams</h2>
            <Link
              to="/streams"
              className="text-orange-400 hover:text-orange-500 font-bold text-lg drop-shadow-md"
            >
              View All
            </Link>
          </div>
          {recentStreams.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-slate-100/30 rounded-full p-6 w-24 h-24 mx-auto mb-6 shadow-lg">
                <Wallet className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-100 mb-2">No streams yet</h3>
              <p className="text-slate-400 mb-8 max-w-md mx-auto">
                Get started by creating your first Bitcoin stream and begin your decentralized finance journey.
              </p>
              <Link
                to="/create"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold px-8 py-4 rounded-2xl shadow-2xl hover:shadow-orange-500/40 transition-all duration-300 transform hover:scale-110 border border-orange-300/30 backdrop-blur-xl"
              >
                <Plus size={24} />
                <span className="text-lg">Create Your First Stream</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          <QuickActionCard
            to="/create"
            icon={Plus}
            iconBg="bg-orange-50/60 backdrop-blur-xl shadow-2xl border border-orange-200/30"
            title="Create Stream"
            description="Start streaming Bitcoin payments"
            ariaLabel="Create a new Bitcoin stream"
          />
          <QuickActionCard
            to="/templates"
            icon={Clock}
            iconBg="bg-blue-50/60 backdrop-blur-xl shadow-2xl border border-blue-200/30"
            title="Templates"
            description="Use predefined stream templates"
            ariaLabel="View stream templates"
          />
          <QuickActionCard
            to="/analytics"
            icon={TrendingUp}
            iconBg="bg-green-50/60 backdrop-blur-xl shadow-2xl border border-green-200/30"
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
