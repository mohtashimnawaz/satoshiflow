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

// Utility: Convert principal (string or Principal) to text
function principalToText(p) {
  if (!p) return '';
  if (typeof p === 'string') return p;
  if (typeof p.toText === 'function') return p.toText();
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
          console.log('Outgoing filter:', principalToText(sender), userText, match);
          return match;
        });
      } else if (typeFilter === 'incoming') {
        filtered = filtered.filter(stream => {
          const recipient = Array.isArray(stream.recipient) ? stream.recipient[0] : stream.recipient;
          const match = principalToText(recipient) === userText;
          console.log('Incoming filter:', principalToText(recipient), userText, match);
          return match;
        });
      }
    }

    // Also update the main filter for user streams (not just type filter)
    filtered = filtered.filter(stream => {
      const sender = stream.sender;
      const recipient = stream.recipient;
      const senderText = sender && typeof sender.toText === 'function' ? sender.toText() : String(sender);
      const recipientText = recipient && typeof recipient.toText === 'function' ? recipient.toText() : String(recipient);
      const userText = user && typeof user.toText === 'function' ? user.toText() : String(user);
      const senderMatch = senderText === userText;
      const recipientMatch = recipientText === userText;
      console.log('User stream filter:', { senderText, recipientText, userText, senderMatch, recipientMatch });
      return senderMatch || recipientMatch;
    });

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

    console.log('Filtered streams:', filtered);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Streams</h1>
          <p className="text-gray-600 mt-1">
            {filteredStreams.length} of {streams.length} streams
          </p>
        </div>
        <Link
          to="/create"
          className="mt-4 md:mt-0 inline-flex items-center space-x-2 btn-primary"
        >
          <Plus size={20} />
          <span>Create Stream</span>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search streams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 input-field"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 btn-secondary"
            >
              <Filter size={16} />
              <span>Filters</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field min-w-0"
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
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input-field"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="input-field"
                >
                  <option value="all">All ({getTypeCount('all')})</option>
                  <option value="outgoing">Outgoing ({getTypeCount('outgoing')})</option>
                  <option value="incoming">Incoming ({getTypeCount('incoming')})</option>
                </select>
              </div>

              {/* Quick Stats */}
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <DollarSign size={14} />
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
      <div className="flex space-x-2 overflow-x-auto">
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
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              statusFilter === tab.key
                ? 'bg-orange-100 text-orange-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Streams List */}
      <div className="space-y-4">
        {filteredStreams.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No streams found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters or search terms'
                : 'Get started by creating your first stream'
              }
            </p>
            {streams.length === 0 && (
              <Link to="/create" className="btn-primary">
                <Plus size={20} className="mr-2" />
                Create Your First Stream
              </Link>
            )}
          </div>
        ) : (
          filteredStreams.map((stream) => (
            <StreamCard
              key={stream.id}
              stream={stream}
              currentUser={user}
            />
          ))
        )}
      </div>

      {/* Load More / Pagination could be added here */}
      {filteredStreams.length > 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">
            Showing {filteredStreams.length} streams
          </p>
        </div>
      )}
    </div>
  );
};

export default StreamList;
