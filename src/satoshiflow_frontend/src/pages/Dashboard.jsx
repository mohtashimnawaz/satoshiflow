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
    <div className="relative min-h-screen bg-gradient-to-br from-[#0f1114] via-[#1a1f2e] to-[#0f1114] overflow-hidden">
      {/* Enhanced 3D Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Floating 3D Bitcoin Icons */}
        {[...Array(15)].map((_, i) => {
          const size = 40 + Math.random() * 120;
          const left = Math.random() * 100;
          const top = Math.random() * 100;
          const duration = 8 + Math.random() * 12;
          const delay = Math.random() * 8;
          const rotationSpeed = 20 + Math.random() * 40;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${left}%`,
                top: `${top}%`,
                width: `${size}px`,
                height: `${size}px`,
                opacity: 0.12 + Math.random() * 0.25,
                zIndex: 0,
                animation: `float3D ${duration}s ease-in-out infinite, rotate3D ${rotationSpeed}s linear infinite`,
                animationDelay: `${delay}s`,
                filter: 'drop-shadow(0 0 40px rgba(255, 165, 0, 0.6))',
                transform: `perspective(1000px) rotateX(${Math.random() * 60}deg) rotateY(${Math.random() * 60}deg)`,
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
                  <filter id={`shadow${i}`}>
                    <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.3"/>
                  </filter>
                </defs>
                <circle cx="32" cy="32" r="28" fill={`url(#bitcoin3d${i})`} stroke="#F7931A" strokeWidth="2" filter={`url(#shadow${i})`} />
                <circle cx="32" cy="32" r="24" fill="none" stroke="#fff" strokeWidth="1" opacity="0.3" />
                <text x="32" y="38" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#fff" style={{fontFamily:'Arial, sans-serif'}}>₿</text>
                <ellipse cx="32" cy="20" rx="20" ry="8" fill="#fff" opacity="0.15" />
              </svg>
            </div>
          );
        })}
        
        {/* 3D Geometric Shapes */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`geo${i}`}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${60 + Math.random() * 80}px`,
              height: `${60 + Math.random() * 80}px`,
              background: `linear-gradient(135deg, rgba(255, 165, 0, 0.1), rgba(255, 215, 0, 0.05))`,
              borderRadius: i % 2 === 0 ? '50%' : '20%',
              border: '1px solid rgba(255, 165, 0, 0.2)',
              backdropFilter: 'blur(10px)',
              animation: `geometricFloat ${12 + Math.random() * 8}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
              transform: `perspective(1000px) rotateX(${Math.random() * 45}deg) rotateY(${Math.random() * 45}deg)`,
            }}
          />
        ))}
        
        {/* Enhanced Keyframes */}
        <style>{`
          @keyframes float3D {
            0% { transform: perspective(1000px) translateY(0px) translateX(0px) rotateX(0deg) rotateY(0deg) scale(1); }
            25% { transform: perspective(1000px) translateY(-20px) translateX(10px) rotateX(15deg) rotateY(15deg) scale(1.05); }
            50% { transform: perspective(1000px) translateY(-40px) translateX(-10px) rotateX(30deg) rotateY(30deg) scale(1.1); }
            75% { transform: perspective(1000px) translateY(-20px) translateX(15px) rotateX(15deg) rotateY(15deg) scale(1.05); }
            100% { transform: perspective(1000px) translateY(0px) translateX(0px) rotateX(0deg) rotateY(0deg) scale(1); }
          }
          @keyframes rotate3D {
            0% { transform: perspective(1000px) rotateZ(0deg); }
            100% { transform: perspective(1000px) rotateZ(360deg); }
          }
          @keyframes geometricFloat {
            0% { transform: perspective(1000px) translateY(0px) rotateX(0deg) rotateY(0deg); opacity: 0.1; }
            50% { transform: perspective(1000px) translateY(-30px) rotateX(180deg) rotateY(180deg); opacity: 0.2; }
            100% { transform: perspective(1000px) translateY(0px) rotateX(360deg) rotateY(360deg); opacity: 0.1; }
          }
        `}</style>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-6">
        {/* 3D Header Section */}
        <div className="text-center mb-8 transform-gpu perspective-1000">
          <div className="relative inline-block transform hover:scale-105 transition-all duration-500 hover:rotateX-3 hover:rotateY-3" style={{transformStyle: 'preserve-3d'}}>
            <h1 className="text-6xl font-extrabold bg-gradient-to-r from-yellow-400 via-orange-500 to-orange-600 bg-clip-text text-transparent drop-shadow-2xl mb-4 relative z-10">
              SatoshiFlow Dashboard
            </h1>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-orange-600 opacity-20 blur-xl transform translate-z-minus-10"></div>
          </div>
          <p className="text-slate-300 text-xl font-medium drop-shadow-md mb-6">Welcome back to your Bitcoin streaming platform</p>
          <div className="relative inline-block transform hover:scale-110 transition-all duration-300" style={{transformStyle: 'preserve-3d'}}>
            <Link
              to="/create"
              className="inline-flex items-center space-x-3 bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-600 hover:from-orange-600 hover:via-yellow-500 hover:to-orange-700 text-white font-bold px-12 py-6 rounded-full shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 border-2 border-orange-300/30 backdrop-blur-xl text-xl relative overflow-hidden group"
              style={{
                boxShadow: '0 20px 40px rgba(255, 165, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                transform: 'translateZ(20px)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <Plus size={32} className="group-hover:rotate-90 transition-transform duration-300 relative z-10" />
              <span className="relative z-10">Create Stream</span>
            </Link>
          </div>
        </div>

        {/* 3D Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 perspective-1000">
          <div className="transform hover:scale-105 hover:rotateY-5 transition-all duration-500" style={{transformStyle: 'preserve-3d'}}>
            <StatCard
              title="Total Sent"
              value={`${formatSats(stats.totalSent)} sats`}
              icon={ArrowUpRight}
              color="text-red-400"
              bgColor="bg-gradient-to-br from-red-900/30 via-red-800/20 to-red-900/30 border-2 border-red-400/30 shadow-2xl backdrop-blur-xl"
            />
          </div>
          <div className="transform hover:scale-105 hover:rotateY-5 transition-all duration-500" style={{transformStyle: 'preserve-3d'}}>
            <StatCard
              title="Total Received"
              value={`${formatSats(stats.totalReceived)} sats`}
              icon={ArrowDownRight}
              color="text-green-400"
              bgColor="bg-gradient-to-br from-green-900/30 via-green-800/20 to-green-900/30 border-2 border-green-400/30 shadow-2xl backdrop-blur-xl"
            />
          </div>
          <div className="transform hover:scale-105 hover:rotateY-5 transition-all duration-500" style={{transformStyle: 'preserve-3d'}}>
            <StatCard
              title="Active Streams"
              value={stats.activeStreams.toString()}
              icon={Activity}
              color="text-blue-400"
              bgColor="bg-gradient-to-br from-blue-900/30 via-blue-800/20 to-blue-900/30 border-2 border-blue-400/30 shadow-2xl backdrop-blur-xl"
            />
          </div>
          <div className="transform hover:scale-105 hover:rotateY-5 transition-all duration-500" style={{transformStyle: 'preserve-3d'}}>
            <StatCard
              title="Total Streams"
              value={stats.totalStreams.toString()}
              icon={Users}
              color="text-purple-400"
              bgColor="bg-gradient-to-br from-purple-900/30 via-purple-800/20 to-purple-900/30 border-2 border-purple-400/30 shadow-2xl backdrop-blur-xl"
            />
          </div>
        </div>

        {/* 3D Recent Streams Section */}
        <div className="relative mb-12 transform hover:scale-102 transition-all duration-500" style={{transformStyle: 'preserve-3d'}}>
          <div className="bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl border-2 border-slate-200/20 p-8 relative overflow-hidden"
               style={{
                 boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                 transform: 'translateZ(10px)',
               }}>
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-yellow-500/5 pointer-events-none"></div>
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h2 className="text-4xl font-bold text-slate-100 drop-shadow-lg">Recent Streams</h2>
              <Link
                to="/streams"
                className="text-orange-400 hover:text-orange-300 font-bold text-xl drop-shadow-md hover:scale-110 transition-all duration-300"
              >
                View All
              </Link>
            </div>
            {recentStreams.length === 0 ? (
              <div className="text-center py-16 relative z-10">
                <div className="bg-slate-100/20 rounded-full p-8 w-36 h-36 mx-auto mb-8 shadow-2xl flex items-center justify-center transform hover:scale-110 hover:rotateY-12 transition-all duration-500" style={{transformStyle: 'preserve-3d'}}>
                  <Wallet className="w-20 h-20 text-slate-400" />
                </div>
                <h3 className="text-3xl font-semibold text-slate-100 mb-4">No streams yet</h3>
                <p className="text-slate-400 mb-8 max-w-md mx-auto text-lg">
                  Get started by creating your first Bitcoin stream and begin your decentralized finance journey.
                </p>
                <div className="relative inline-block transform hover:scale-110 transition-all duration-300">
                  <Link
                    to="/create"
                    className="inline-flex items-center space-x-3 bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-600 hover:from-orange-600 hover:via-yellow-500 hover:to-orange-700 text-white font-bold px-12 py-6 rounded-full shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 border-2 border-orange-300/30 backdrop-blur-xl text-xl relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    <Plus size={32} className="relative z-10" />
                    <span className="relative z-10">Create Your First Stream</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6 relative z-10">
                {recentStreams.map((stream, index) => (
                  <div key={stream.id} className="transform hover:scale-102 hover:translateZ-5 transition-all duration-300" style={{transformStyle: 'preserve-3d'}}>
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

        {/* 3D Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 perspective-1000">
          <div className="transform hover:scale-110 hover:rotateY-8 hover:translateZ-10 transition-all duration-500" style={{transformStyle: 'preserve-3d'}}>
            <QuickActionCard
              to="/create"
              icon={Plus}
              iconBg="bg-gradient-to-br from-orange-500 via-yellow-400 to-orange-600 shadow-2xl border-2 border-orange-200/30 backdrop-blur-xl"
              title="Create Stream"
              description="Start streaming Bitcoin payments"
              ariaLabel="Create a new Bitcoin stream"
            />
          </div>
          <div className="transform hover:scale-110 hover:rotateY-8 hover:translateZ-10 transition-all duration-500" style={{transformStyle: 'preserve-3d'}}>
            <QuickActionCard
              to="/templates"
              icon={Clock}
              iconBg="bg-gradient-to-br from-blue-500 via-cyan-400 to-blue-600 shadow-2xl border-2 border-blue-200/30 backdrop-blur-xl"
              title="Templates"
              description="Use predefined stream templates"
              ariaLabel="View stream templates"
            />
          </div>
          <div className="transform hover:scale-110 hover:rotateY-8 hover:translateZ-10 transition-all duration-500" style={{transformStyle: 'preserve-3d'}}>
            <QuickActionCard
              to="/analytics"
              icon={TrendingUp}
              iconBg="bg-gradient-to-br from-green-500 via-emerald-400 to-green-600 shadow-2xl border-2 border-green-200/30 backdrop-blur-xl"
              title="Analytics"
              description="View detailed statistics"
              ariaLabel="View analytics"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
