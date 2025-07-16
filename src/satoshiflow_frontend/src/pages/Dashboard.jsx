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
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch recent streams
      const userStreams = await satoshiflow_backend.list_streams_for_user(user);
      
      // Sort by creation time and take the 5 most recent
      const sortedStreams = userStreams.sort((a, b) => b.start_time - a.start_time);
      setRecentStreams(sortedStreams.slice(0, 5));
      
      // Calculate stats
      const sentStreams = userStreams.filter(s => s.sender.toString() === user?.toString());
      const receivedStreams = userStreams.filter(s => s.recipient.toString() === user?.toString());
      const activeStreams = userStreams.filter(s => s.status === 'Active');
      
      setStats({
        totalSent: sentStreams.reduce((sum, s) => sum + Number(s.total_locked), 0),
        totalReceived: receivedStreams.reduce((sum, s) => sum + Number(s.total_released), 0),
        activeStreams: activeStreams.length,
        totalStreams: userStreams.length,
      });
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back to SatoshiFlow</p>
        </div>
        <Link
          to="/create"
          className="mt-4 md:mt-0 inline-flex items-center space-x-2 btn-primary"
        >
          <Plus size={20} />
          <span>Create Stream</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Sent"
          value={`${formatSats(stats.totalSent)} sats`}
          icon={ArrowUpRight}
          color="text-red-500"
          bgColor="bg-red-50"
        />
        <StatCard
          title="Total Received"
          value={`${formatSats(stats.totalReceived)} sats`}
          icon={ArrowDownRight}
          color="text-green-500"
          bgColor="bg-green-50"
        />
        <StatCard
          title="Active Streams"
          value={stats.activeStreams.toString()}
          icon={Activity}
          color="text-blue-500"
          bgColor="bg-blue-50"
        />
        <StatCard
          title="Total Streams"
          value={stats.totalStreams.toString()}
          icon={Users}
          color="text-purple-500"
          bgColor="bg-purple-50"
        />
      </div>

      {/* Recent Streams */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Streams</h2>
          <Link
            to="/streams"
            className="text-orange-500 hover:text-orange-600 font-medium"
          >
            View All
          </Link>
        </div>
        
        {recentStreams.length === 0 ? (
          <div className="text-center py-12">
            <Wallet className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No streams yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first stream.
            </p>
            <div className="mt-6">
              <Link
                to="/create"
                className="btn-primary"
              >
                <Plus size={20} className="mr-2" />
                Create Stream
              </Link>
            </div>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          to="/create"
          className="card hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <div className="bg-orange-50 p-3 rounded-lg">
              <Plus className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Create Stream</h3>
              <p className="text-sm text-gray-500">Start streaming Bitcoin payments</p>
            </div>
          </div>
        </Link>

        <Link
          to="/templates"
          className="card hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <div className="bg-blue-50 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Templates</h3>
              <p className="text-sm text-gray-500">Use predefined stream templates</p>
            </div>
          </div>
        </Link>

        <Link
          to="/analytics"
          className="card hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <div className="bg-green-50 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Analytics</h3>
              <p className="text-sm text-gray-500">View detailed statistics</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
