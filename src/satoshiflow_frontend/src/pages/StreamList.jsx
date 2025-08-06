import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Plus,
  ChevronDown,
  Calendar,
  User,
  DollarSign
} from 'lucide-react';
import { satoshiflow_backend } from 'declarations/satoshiflow_backend';
import { useAuth } from '../contexts/AuthContext';
import StreamCard from '../components/StreamCard';
import { Link } from 'react-router-dom';
import { Principal } from '@dfinity/principal';

// Utility: Deeply convert all BigInt fields to Number
function deepBigIntToNumber(obj, seen = new Set()) {
  if (typeof obj === 'bigint') return Number(obj);
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  
  // Avoid circular references
  if (seen.has(obj)) return obj;
  seen.add(obj);
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepBigIntToNumber(item, seen));
  }
  
  // Handle special objects like Principal
  if (obj._isPrincipal || obj.toText || obj._arr) {
    return obj;
  }
  
  const out = {};
  for (const k in obj) {
    if (obj.hasOwnProperty(k)) {
      try {
        out[k] = deepBigIntToNumber(obj[k], seen);
      } catch (error) {
        // If conversion fails, keep original value
        console.warn(`Failed to convert ${k}:`, error);
        out[k] = obj[k];
      }
    }
  }
  return out;
}

// Utility: Convert principal (string or Principal) to text
function principalToText(p) {
  if (!p) return '';
  if (typeof p === 'string') return p;
  if (typeof p.toText === 'function') return p.toText();
  try {
    // If it's a plain object with _arr, reconstruct as Principal
    if (p._arr) {
      const arr = Array.isArray(p._arr) ? p._arr : Array.from(p._arr);
      return Principal.fromUint8Array(Uint8Array.from(arr)).toText();
    }
  } catch (e) {
    console.error('Failed to convert principal:', p, e);
  }
  if (typeof p.toString === 'function') return p.toString();
  return String(p);
}

// Utility to robustly extract status as string
function extractStatus(statusRaw) {
  let status = '';
  if (typeof statusRaw === 'string') {
    status = statusRaw;
  } else if (Array.isArray(statusRaw)) {
    status = statusRaw[0] || '';
  } else if (typeof statusRaw === 'object' && statusRaw !== null) {
    status = Object.keys(statusRaw)[0] || '';
  } else if (statusRaw !== undefined && statusRaw !== null) {
    status = String(statusRaw);
  }
  return status;
}

const StreamList = () => {
  const [streams, setStreams] = useState([]);
  const [filteredStreams, setFilteredStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all'); // all, outgoing, incoming
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  
  const { user } = useAuth();
  // Debug: Log the principal type and value
  useEffect(() => {
    if (user) {
      console.log('Frontend principal object:', user);
      if (typeof user === 'object' && user.toText) {
        console.log('Frontend principal (toText):', user.toText());
      } else if (user && user.toString) {
        console.log('Frontend principal (toString):', user.toString());
      } else {
        console.log('Frontend principal (raw):', user);
      }
    } else {
      console.log('Frontend user is null/undefined:', user);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchStreams();
    }
  }, [user]);

  useEffect(() => {
    filterAndSortStreams();
  }, [streams, searchTerm, statusFilter, typeFilter, sortBy]);

  const fetchStreams = async () => {
    try {
      setLoading(true);
      // Debug: Log the type of user before calling backend
      console.log('Calling list_streams_for_user with:', user, typeof user);
      const userStreams = await satoshiflow_backend.list_streams_for_user(user);
      // Deep convert BigInt fields to Number
      const safeStreams = Array.isArray(userStreams) ? userStreams.map(deepBigIntToNumber) : [];
      console.log('All streams (raw):', userStreams);
      console.log('All streams (after deepBigIntToNumber):', safeStreams);
      if (safeStreams.length > 0) {
        const s = safeStreams[0];
        console.log('First stream sender:', s.sender, typeof s.sender);
        console.log('First stream recipient:', s.recipient, typeof s.recipient);
      }
      setStreams(safeStreams);
      console.log('All streams:', safeStreams);
    } catch (error) {
      console.error('Failed to fetch streams:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortStreams = () => {
    let filtered = [...streams];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(stream => 
        ((Array.isArray(stream.title) ? stream.title[0] : stream.title) && (Array.isArray(stream.title) ? stream.title[0] : stream.title).toLowerCase().includes(searchTerm.toLowerCase())) ||
        ((Array.isArray(stream.description) ? stream.description[0] : stream.description) && (Array.isArray(stream.description) ? stream.description[0] : stream.description).toLowerCase().includes(searchTerm.toLowerCase())) ||
        (Array.isArray(stream.tags) && stream.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) ||
        (stream.sender && principalToText(stream.sender).includes(searchTerm)) ||
        (stream.recipient && principalToText(stream.recipient).includes(searchTerm))
      );
    }

    // Status filter (use extractStatus)
    if (statusFilter !== 'all') {
      filtered = filtered.filter(stream => {
        const status = extractStatus(stream.status);
        if (typeof status === 'string' && status.length > 0) {
          return status.toLowerCase() === statusFilter.toLowerCase();
        }
        return false;
      });
    }

    // Type filter (updated for array-wrapped sender/recipient)
    const userText = principalToText(user);
    if (typeFilter !== 'all') {
      if (typeFilter === 'outgoing') {
        filtered = filtered.filter(stream => {
          const sender = Array.isArray(stream.sender) ? stream.sender[0] : stream.sender;
          const match = principalToText(sender) === userText;
          console.log('[TypeFilter:Outgoing]', {
            senderRaw: stream.sender,
            senderText: principalToText(sender),
            userText,
            match
          });
          return match;
        });
      } else if (typeFilter === 'incoming') {
        filtered = filtered.filter(stream => {
          const recipient = Array.isArray(stream.recipient) ? stream.recipient[0] : stream.recipient;
          const match = principalToText(recipient) === userText;
          console.log('[TypeFilter:Incoming]', {
            recipientRaw: stream.recipient,
            recipientText: principalToText(recipient),
            userText,
            match
          });
          return match;
        });
      }
    }

    // Restore user stream filter with debug logs
    const beforeUserFilter = filtered.length;
    filtered = filtered.filter(stream => {
      const sender = Array.isArray(stream.sender) ? stream.sender[0] : stream.sender;
      const recipient = Array.isArray(stream.recipient) ? stream.recipient[0] : stream.recipient;
      const senderText = principalToText(sender);
      const recipientText = principalToText(recipient);
      const userText = principalToText(user);
      const senderMatch = senderText === userText;
      const recipientMatch = recipientText === userText;
      console.log('[UserFilter]', {
        senderRaw: stream.sender,
        recipientRaw: stream.recipient,
        senderText,
        recipientText,
        userText,
        senderMatch,
        recipientMatch
      });
      return senderMatch || recipientMatch;
    });
    if (filtered.length === 0 && beforeUserFilter > 0) {
      console.warn('No streams matched user principal. Showing all streams as fallback for debugging.');
      filtered = [...streams];
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return Number(b.start_time) - Number(a.start_time);
        case 'oldest':
          return Number(a.start_time) - Number(b.start_time);
        case 'amount_high':
          return Number(b.total_locked) - Number(a.total_locked);
        case 'amount_low':
          return Number(a.total_locked) - Number(b.total_locked);
        case 'rate_high':
          return Number(b.sats_per_sec) - Number(a.sats_per_sec);
        case 'rate_low':
          return Number(a.sats_per_sec) - Number(b.sats_per_sec);
        default:
          return 0;
      }
    });

    setFilteredStreams(filtered);
  };

  const getStatusCount = (status) => {
    return streams.filter(stream => {
      const statusStr = extractStatus(stream.status);
      return status === 'all' ? true : (typeof statusStr === 'string' && statusStr.length > 0 && statusStr.toLowerCase() === status.toLowerCase());
    }).length;
  };

  const getTypeCount = (type) => {
    if (type === 'all') return streams.length;
    if (type === 'outgoing') {
      return streams.filter(stream => principalToText(stream.sender) === principalToText(user)).length;
    }
    if (type === 'incoming') {
      return streams.filter(stream => principalToText(stream.recipient) === principalToText(user)).length;
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-24"></div>
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
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
        
        {/* Floating 3D Stream Icons */}
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${8 + i * 10}%`,
              top: `${15 + (i % 3) * 30}%`,
              width: `${60 + i * 7}px`,
              height: `${60 + i * 7}px`,
              background: `linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.05))`,
              borderRadius: i % 2 === 0 ? '50%' : '20%',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              backdropFilter: 'blur(10px)',
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${7 + i}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 bg-clip-text text-transparent mb-4">
            Stream Library
          </h1>
          <p className="text-slate-300 text-lg font-medium mb-6">
            {filteredStreams.length} of {streams.length} streams
          </p>
          <Link
            to="/create"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Plus size={24} />
            <span>Create Stream</span>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 mb-8 hover:bg-white/15 transition-all duration-300">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search streams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-3 rounded-xl transition-all duration-300"
            >
              <Filter size={16} className="text-blue-400" />
              <span>Filters</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount_high">Highest Amount</option>
              <option value="amount_low">Lowest Amount</option>
              <option value="rate_high">Highest Rate</option>
              <option value="rate_low">Lowest Rate</option>
            </select>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All ({getStatusCount('all')})</option>
                  <option value="active">Active ({getStatusCount('active')})</option>
                  <option value="completed">Completed ({getStatusCount('completed')})</option>
                  <option value="paused">Paused ({getStatusCount('paused')})</option>
                  <option value="cancelled">Cancelled ({getStatusCount('cancelled')})</option>
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All ({getTypeCount('all')})</option>
                  <option value="outgoing">Outgoing ({getTypeCount('outgoing')})</option>
                  <option value="incoming">Incoming ({getTypeCount('incoming')})</option>
                </select>
              </div>

              {/* Quick Stats */}
              <div className="flex items-center space-x-4 text-sm text-slate-300">
                <div className="flex items-center space-x-1">
                  <DollarSign size={14} className="text-orange-400" />
                  <span>
                    {(() => { const total = streams.reduce((sum, s) => sum + Number(s.total_locked), 0); return total !== undefined && total !== null ? Number(total).toLocaleString() : 'N/A'; })()} sats total
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Filter Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2 mb-6">
        {[
          { key: 'all', label: 'All', count: getStatusCount('all') },
          { key: 'active', label: 'Active', count: getStatusCount('active') },
          { key: 'completed', label: 'Completed', count: getStatusCount('completed') },
          { key: 'paused', label: 'Paused', count: getStatusCount('paused') },
          { key: 'cancelled', label: 'Cancelled', count: getStatusCount('cancelled') },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-6 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${
              statusFilter === tab.key
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white backdrop-blur-sm border border-white/20'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Streams List */}
      <div className="space-y-4">
        {filteredStreams.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-12 max-w-md mx-auto">
              <div className="text-slate-400 mb-6">
                <Search className="h-16 w-16 mx-auto text-blue-400" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">No streams found</h3>
              <p className="text-slate-300 mb-8">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your filters or search terms'
                  : 'Get started by creating your first stream'
                }
              </p>
              {streams.length === 0 && (
                <Link 
                  to="/create" 
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Plus size={20} />
                  <span>Create Your First Stream</span>
                </Link>
              )}
            </div>
          </div>
        ) : (
          filteredStreams.map((stream, index) => (
            <div key={stream.id} className="transform hover:scale-102 transition-all duration-300" style={{ animationDelay: `${index * 0.1}s` }}>
              <StreamCard
                stream={stream}
                currentUser={user}
              />
            </div>
          ))
        )}
      </div>

      {/* Load More / Pagination */}
      {filteredStreams.length > 0 && (
        <div className="text-center py-8">
          <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4 inline-block">
            <p className="text-sm text-slate-300">
              Showing <span className="text-blue-400 font-semibold">{filteredStreams.length}</span> streams
            </p>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default StreamList;
