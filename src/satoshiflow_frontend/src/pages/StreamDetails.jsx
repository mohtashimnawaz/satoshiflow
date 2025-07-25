import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Square, 
  Download, 
  DollarSign,
  Clock,
  User,
  Calendar,
  Tag,
  AlertCircle,
  CheckCircle,
  Activity
} from 'lucide-react';
import { satoshiflow_backend } from 'declarations/satoshiflow_backend';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow, format } from 'date-fns';

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

function principalToText(p) {
  if (!p) return '';
  if (typeof p === 'string') return p;
  if (typeof p.toText === 'function') return p.toText();
  if (typeof p.toString === 'function') return p.toString();
  return String(p);
}

const StreamDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchStreamDetails();
  }, [id]);

  const fetchStreamDetails = async () => {
    try {
      setLoading(true);
      const streamData = await satoshiflow_backend.get_stream(parseInt(id));
      console.log('Fetched streamData:', streamData);
      // Patch: handle array/tuple return from backend
      let stream = streamData;
      if (Array.isArray(streamData)) {
        stream = streamData[0];
      }
      if (stream) {
        const safeStream = deepBigIntToNumber(stream);
        console.log('Safe stream after conversion:', safeStream);
        setStream(safeStream);
      } else {
        setError('Stream not found');
      }
    } catch (error) {
      console.error('Failed to fetch stream details:', error);
      setError('Failed to load stream details');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimReward = async () => {
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');
      
      const result = await satoshiflow_backend.claim_stream(parseInt(id));
      if (result.ok) {
        setSuccess(`Successfully claimed ${result.ok} sats!`);
        fetchStreamDetails(); // Refresh data
      } else {
        setError(result.err || 'Failed to claim reward');
      }
    } catch (error) {
      console.error('Failed to claim reward:', error);
      setError('Failed to claim reward');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTopUp = async () => {
    const amount = prompt('Enter amount to top up (sats):');
    if (!amount || isNaN(amount)) return;

    try {
      setActionLoading(true);
      setError('');
      setSuccess('');
      
      const result = await satoshiflow_backend.top_up_stream(parseInt(id), parseInt(amount));
      if (result.ok) {
        setSuccess(`Successfully topped up ${amount} sats!`);
        fetchStreamDetails(); // Refresh data
      } else {
        setError(result.err || 'Failed to top up stream');
      }
    } catch (error) {
      console.error('Failed to top up stream:', error);
      setError('Failed to top up stream');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelStream = async () => {
    if (!confirm('Are you sure you want to cancel this stream? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      setSuccess('');
      
      const result = await satoshiflow_backend.cancel_stream(parseInt(id));
      if (result.ok) {
        setSuccess(`Stream cancelled. Refund: ${result.ok.refund} sats, Fee: ${result.ok.fee} sats`);
        fetchStreamDetails(); // Refresh data
      } else {
        setError(result.err || 'Failed to cancel stream');
      }
    } catch (error) {
      console.error('Failed to cancel stream:', error);
      setError('Failed to cancel stream');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePauseStream = async () => {
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');
      
      const result = await satoshiflow_backend.pause_stream(parseInt(id));
      if (result.ok) {
        setSuccess('Stream paused successfully');
        fetchStreamDetails(); // Refresh data
      } else {
        setError(result.err || 'Failed to pause stream');
      }
    } catch (error) {
      console.error('Failed to pause stream:', error);
      setError('Failed to pause stream');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResumeStream = async () => {
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');
      
      const result = await satoshiflow_backend.resume_stream(parseInt(id));
      if (result.ok) {
        setSuccess('Stream resumed successfully');
        fetchStreamDetails(); // Refresh data
      } else {
        setError(result.err || 'Failed to resume stream');
      }
    } catch (error) {
      console.error('Failed to resume stream:', error);
      setError('Failed to resume stream');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gray-200 rounded-lg h-64"></div>
              <div className="bg-gray-200 rounded-lg h-32"></div>
            </div>
            <div className="bg-gray-200 rounded-lg h-96"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !stream) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => navigate('/streams')}
          className="btn-primary"
        >
          Back to Streams
        </button>
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <Activity className="h-12 w-12 mx-auto" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Stream not found</h2>
        <p className="text-gray-600 mb-4">The stream you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/streams')}
          className="btn-primary"
        >
          Back to Streams
        </button>
      </div>
    );
  }

  const isOwner = stream && stream.sender && user ? principalToText(stream.sender) === principalToText(user) : false;
  const isRecipient = stream && stream.recipient && user ? principalToText(stream.recipient) === principalToText(user) : false;
  const progress = stream && Number(stream.total_locked) > 0 ? (Number(stream.total_released) / Number(stream.total_locked)) * 100 : 0;
  const remainingTime = stream && stream.end_time ? Number(stream.end_time) - (Date.now() / 1000) : 0;
  const isActive = stream && stream.status === 'Active';
  const isPaused = stream && stream.status === 'Paused';
  const canClaim = isRecipient && stream && stream.total_released > stream.buffer;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/streams')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {Array.isArray(stream.title) ? stream.title[0] : (stream.title || `Stream #${stream.id}`)}
            </h1>
            <p className="text-gray-600">
              {isOwner ? 'Outgoing' : 'Incoming'} • {typeof stream.status === 'string' ? stream.status : (Array.isArray(stream.status) ? stream.status[0] : JSON.stringify(stream.status))}
            </p>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span className="text-green-700">{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stream Progress */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Progress</h2>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                stream.status === 'Active' ? 'bg-green-100 text-green-700' :
                stream.status === 'Paused' ? 'bg-yellow-100 text-yellow-700' :
                stream.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                'bg-red-100 text-red-700'
              }`}>
                {typeof stream.status === 'string' ? stream.status : (Array.isArray(stream.status) ? stream.status[0] : JSON.stringify(stream.status))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Released</span>
                <span>{progress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-orange-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span>{stream.total_released !== undefined && stream.total_released !== null ? Number(stream.total_released).toLocaleString() : 'N/A'} sats</span>
                <span>{stream.total_locked !== undefined && stream.total_locked !== null ? Number(stream.total_locked).toLocaleString() : 'N/A'} sats</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {stream.sats_per_sec !== undefined && stream.sats_per_sec !== null ? Number(stream.sats_per_sec).toLocaleString() : 'N/A'}
                </div>
                <div className="text-sm text-gray-500">sats/second</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {remainingTime !== undefined && remainingTime !== null ? Math.max(0, Math.floor(remainingTime / 60)).toLocaleString() : 'N/A'}
                </div>
                <div className="text-sm text-gray-500">minutes left</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isRecipient && canClaim && (
                <button
                  onClick={handleClaimReward}
                  disabled={actionLoading}
                  className="btn-primary disabled:opacity-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Claim Reward
                </button>
              )}

              {isOwner && isActive && (
                <button
                  onClick={handlePauseStream}
                  disabled={actionLoading}
                  className="btn-secondary disabled:opacity-50"
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Pause Stream
                </button>
              )}

              {isOwner && isPaused && (
                <button
                  onClick={handleResumeStream}
                  disabled={actionLoading}
                  className="btn-primary disabled:opacity-50"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Resume Stream
                </button>
              )}

              {isOwner && (isActive || isPaused) && (
                <button
                  onClick={handleTopUp}
                  disabled={actionLoading}
                  className="btn-secondary disabled:opacity-50"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Top Up
                </button>
              )}

              {isOwner && (isActive || isPaused) && (
                <button
                  onClick={handleCancelStream}
                  disabled={actionLoading}
                  className="btn-danger disabled:opacity-50"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Cancel Stream
                </button>
              )}
            </div>
          </div>

          {/* Description */}
          {stream.description && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{stream.description}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stream Info */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Stream Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Sender</div>
                  <div className="font-mono text-sm">
                    {stream.sender ? principalToText(stream.sender).slice(0, 16) : 'N/A'}...
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Recipient</div>
                  <div className="font-mono text-sm">
                    {stream.recipient ? principalToText(stream.recipient).slice(0, 16) : 'N/A'}...
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Started</div>
                  <div className="text-sm">
                    {stream.start_time ? format(new Date(stream.start_time * 1000), 'MMM d, yyyy HH:mm') : 'N/A'}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Duration</div>
                  <div className="text-sm">
                    {stream.end_time ? Math.floor((stream.end_time - stream.start_time) / 60) : 'N/A'} minutes
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Buffer</div>
                  <div className="text-sm">
                    {stream.buffer !== undefined && stream.buffer !== null ? Number(stream.buffer).toLocaleString() : 'N/A'} sats
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          {stream.tags && stream.tags.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {stream.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Statistics */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Total Locked</span>
                <span className="text-sm font-medium">
                  {stream.total_locked !== undefined && stream.total_locked !== null ? Number(stream.total_locked).toLocaleString() : 'N/A'} sats
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Total Released</span>
                <span className="text-sm font-medium">
                  {stream.total_released !== undefined && stream.total_released !== null ? Number(stream.total_released).toLocaleString() : 'N/A'} sats
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Available to Claim</span>
                <span className="text-sm font-medium">
                  {stream.total_released !== undefined && stream.buffer !== undefined && stream.total_released !== null && stream.buffer !== null ? Math.max(0, Number(stream.total_released) - Number(stream.buffer)).toLocaleString() : 'N/A'} sats
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Remaining</span>
                <span className="text-sm font-medium">
                  {stream.total_locked !== undefined && stream.total_released !== undefined && stream.total_locked !== null && stream.total_released !== null ? (Number(stream.total_locked) - Number(stream.total_released)).toLocaleString() : 'N/A'} sats
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamDetails;
