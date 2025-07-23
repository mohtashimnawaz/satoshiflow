import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  Users, 
  Clock,
  BarChart3,
  PieChart,
  Calendar
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as ReChartsPieChart,
  Pie,
  Cell
} from 'recharts';
import { satoshiflow_backend } from 'declarations/satoshiflow_backend';
import { useAuth } from '../contexts/AuthContext';
import StatCard from '../components/StatCard';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

function principalToText(p) {
  if (!p) return '';
  if (typeof p === 'string') return p;
  if (typeof p.toText === 'function') return p.toText();
  if (typeof p.toString === 'function') return p.toString();
  return String(p);
}

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [stats, setStats] = useState({
    totalSent: 0,
    totalReceived: 0,
    activeStreams: 0,
    completedStreams: 0,
    totalVolume: 0,
    avgStreamSize: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();

  useEffect(() => {
    fetchAnalytics();
  }, [user, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch user streams
      const userStreams = await satoshiflow_backend.list_streams_for_user(user);

      // Calculate basic stats
      const sentStreams = userStreams.filter(s => principalToText(s.sender) === user?.toText());
      const receivedStreams = userStreams.filter(s => principalToText(s.recipient) === user?.toText());
      
      const totalSent = sentStreams.reduce((sum, s) => sum + Number(s.total_locked), 0);
      const totalReceived = receivedStreams.reduce((sum, s) => sum + Number(s.total_released), 0);
      const activeStreams = userStreams.filter(s => s.status === 'Active').length;
      const completedStreams = userStreams.filter(s => s.status === 'Completed').length;
      
      setStats({
        totalSent,
        totalReceived,
        activeStreams,
        completedStreams,
        totalVolume: totalSent + totalReceived,
        avgStreamSize: userStreams.length > 0 ? totalSent / sentStreams.length : 0,
      });

      // Generate chart data
      const days = timeRange === '30d' ? 30 : 7;
      const chartData = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);
        
        const dayStreams = userStreams.filter(stream => {
          const streamDate = new Date(stream.start_time * 1000);
          return streamDate >= dayStart && streamDate <= dayEnd;
        });
        
        const sent = dayStreams
          .filter(s => principalToText(s.sender) === user?.toText())
          .reduce((sum, s) => sum + Number(s.total_locked), 0);
        
        const received = dayStreams
          .filter(s => principalToText(s.recipient) === user?.toText())
          .reduce((sum, s) => sum + Number(s.total_released), 0);
        
        chartData.push({
          date: format(date, 'MMM dd'),
          sent,
          received,
          total: sent + received,
          count: dayStreams.length,
        });
      }
      
      setChartData(chartData);

      // Status distribution
      const statusCounts = {};
      userStreams.forEach(stream => {
        statusCounts[stream.status] = (statusCounts[stream.status] || 0) + 1;
      });
      
      const statusData = Object.entries(statusCounts).map(([status, count]) => ({
        name: status,
        value: count,
        color: getStatusColor(status),
      }));
      
      setStatusData(statusData);
      
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return '#10B981';
      case 'Completed': return '#3B82F6';
      case 'Paused': return '#F59E0B';
      case 'Cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const formatSats = (sats) => {
    const n = Number(sats);
    if (n >= 1000000) {
      return `${(n / 1000000).toFixed(1)}M`;
    } else if (n >= 1000) {
      return `${(n / 1000).toFixed(1)}K`;
    }
    return n !== undefined && n !== null ? n.toLocaleString() : 'N/A';
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-200 rounded-lg h-64"></div>
            <div className="bg-gray-200 rounded-lg h-64"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Enhanced 3D Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
        
        {/* Floating 3D Chart Elements */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${12 + i * 11}%`,
              top: `${18 + (i % 3) * 25}%`,
              width: `${55 + i * 8}px`,
              height: `${55 + i * 8}px`,
              background: `linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.05))`,
              borderRadius: i % 3 === 0 ? '50%' : i % 3 === 1 ? '20%' : '10%',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              backdropFilter: 'blur(10px)',
              animationDelay: `${i * 0.6}s`,
              animationDuration: `${9 + i}s`,
            }}
          />
        ))}

        {/* 3D Data Grid */}
        <div className="absolute inset-0 opacity-5">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)`,
              backgroundSize: '80px 80px',
              transform: 'perspective(800px) rotateX(20deg)',
            }}
          />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-4">
            Analytics Dashboard
          </h1>
          <p className="text-slate-300 text-lg md:text-xl font-medium mb-6">
            Insights into your streaming activity
          </p>
          
          <div className="flex items-center justify-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
          </div>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="transform hover:scale-105 transition-all duration-300">
          <StatCard
            title="Total Sent"
            value={`${formatSats(stats.totalSent)} sats`}
            icon={TrendingUp}
            color="text-red-400"
            bgColor="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20"
          />
        </div>
        <div className="transform hover:scale-105 transition-all duration-300">
          <StatCard
            title="Total Received"
            value={`${formatSats(stats.totalReceived)} sats`}
            icon={TrendingDown}
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
            title="Completed Streams"
            value={stats.completedStreams.toString()}
            icon={Users}
            color="text-purple-400"
            bgColor="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20"
          />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Volume Chart */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white">Volume Over Time</h2>
            <BarChart3 className="h-6 w-6 text-green-400" />
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
              <XAxis dataKey="date" stroke="#94A3B8" />
              <YAxis tickFormatter={formatSats} stroke="#94A3B8" />
              <Tooltip 
                formatter={(value) => [`${formatSats(value)} sats`, '']}
                labelFormatter={(label) => `Date: ${label}`}
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  color: '#fff'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="sent" 
                stroke="#EF4444" 
                strokeWidth={3}
                name="Sent"
                dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="received" 
                stroke="#10B981" 
                strokeWidth={3}
                name="Received"
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white">Stream Status Distribution</h2>
            <PieChart className="h-6 w-6 text-blue-400" />
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <ReChartsPieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [value, 'Streams']}
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  color: '#fff'
                }}
              />
            </ReChartsPieChart>
          </ResponsiveContainer>
          
          <div className="mt-6 space-y-3">
            {statusData.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-slate-300">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Chart */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 mb-8 hover:bg-white/15 transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-white">Stream Activity</h2>
          <Calendar className="h-6 w-6 text-purple-400" />
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
            <XAxis dataKey="date" stroke="#94A3B8" />
            <YAxis stroke="#94A3B8" />
            <Tooltip 
              formatter={(value) => [value, 'Streams']}
              labelFormatter={(label) => `Date: ${label}`}
              contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                color: '#fff'
              }}
            />
            <Bar dataKey="count" fill="url(#orangeGradient)" radius={[4, 4, 0, 0]} />
            <defs>
              <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F97316" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#EA580C" stopOpacity={0.8}/>
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-orange-500/20 to-red-600/20 backdrop-blur-xl rounded-2xl border border-orange-400/30 p-6 hover:scale-105 transition-all duration-300">
          <h3 className="text-xl font-semibold text-orange-300 mb-4">Average Stream Size</h3>
          <div className="text-4xl font-bold text-white mb-2">
            {formatSats(stats.avgStreamSize)} sats
          </div>
          <p className="text-sm text-orange-200">
            Based on your sent streams
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-xl rounded-2xl border border-green-400/30 p-6 hover:scale-105 transition-all duration-300">
          <h3 className="text-xl font-semibold text-green-300 mb-4">Total Volume</h3>
          <div className="text-4xl font-bold text-white mb-2">
            {formatSats(stats.totalVolume)} sats
          </div>
          <p className="text-sm text-green-200">
            Sent + Received
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-xl rounded-2xl border border-blue-400/30 p-6 hover:scale-105 transition-all duration-300">
          <h3 className="text-xl font-semibold text-blue-300 mb-4">Success Rate</h3>
          <div className="text-4xl font-bold text-white mb-2">
            {stats.completedStreams > 0 
              ? Math.round((stats.completedStreams / (stats.completedStreams + stats.activeStreams)) * 100)
              : 0}%
          </div>
          <p className="text-sm text-blue-200">
            Completed vs Active streams
          </p>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Analytics;
