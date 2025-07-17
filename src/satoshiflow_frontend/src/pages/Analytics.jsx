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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">
            Insights into your streaming activity
          </p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input-field min-w-0"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Sent"
          value={`${formatSats(stats.totalSent)} sats`}
          icon={TrendingUp}
          color="text-red-500"
          bgColor="bg-red-50"
        />
        <StatCard
          title="Total Received"
          value={`${formatSats(stats.totalReceived)} sats`}
          icon={TrendingDown}
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
          title="Completed Streams"
          value={stats.completedStreams.toString()}
          icon={Users}
          color="text-purple-500"
          bgColor="bg-purple-50"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volume Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Volume Over Time</h2>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={formatSats} />
              <Tooltip 
                formatter={(value) => [`${formatSats(value)} sats`, '']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="sent" 
                stroke="#EF4444" 
                strokeWidth={2}
                name="Sent"
              />
              <Line 
                type="monotone" 
                dataKey="received" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Received"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Stream Status Distribution</h2>
            <PieChart className="h-5 w-5 text-gray-400" />
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
              <Tooltip formatter={(value) => [value, 'Streams']} />
            </ReChartsPieChart>
          </ResponsiveContainer>
          
          <div className="mt-4 space-y-2">
            {statusData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Stream Activity</h2>
          <Calendar className="h-5 w-5 text-gray-400" />
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              formatter={(value) => [value, 'Streams']}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Bar dataKey="count" fill="#F97316" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Stream Size</h3>
          <div className="text-3xl font-bold text-gray-900">
            {formatSats(stats.avgStreamSize)} sats
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Based on your sent streams
          </p>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Total Volume</h3>
          <div className="text-3xl font-bold text-gray-900">
            {formatSats(stats.totalVolume)} sats
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Sent + Received
          </p>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Success Rate</h3>
          <div className="text-3xl font-bold text-gray-900">
            {stats.completedStreams > 0 
              ? Math.round((stats.completedStreams / (stats.completedStreams + stats.activeStreams)) * 100)
              : 0}%
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Completed vs Active streams
          </p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
