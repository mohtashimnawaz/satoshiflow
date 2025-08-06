import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Clock, 
  Play, 
  Pause, 
  CheckCircle, 
  XCircle,
  User
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
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

const StreamCard = ({ stream, currentUser }) => {
  // Defensive: convert all BigInt fields to Number
  const safeStream = deepBigIntToNumber(stream);
  const isOutgoing = principalToText(safeStream.sender) === principalToText(currentUser);
  const progress = safeStream.total_locked > 0 ? (safeStream.total_released / safeStream.total_locked) * 100 : 0;

  const getStatusIcon = (status) => {
    const s = typeof status === 'string' ? status : (Array.isArray(status) ? status[0] : JSON.stringify(status));
    switch (s) {
      case 'Active':
        return <Play className="h-4 w-4 text-green-500" />;
      case 'Paused':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'Completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'Cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    const s = typeof status === 'string' ? status : (Array.isArray(status) ? status[0] : JSON.stringify(status));
    switch (s) {
      case 'Active':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Paused':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Completed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatSats = (sats) => {
    return new Intl.NumberFormat().format(Number(sats));
  };

  const otherParty = isOutgoing ? safeStream.recipient : safeStream.sender;
  const otherPartyDisplay = otherParty && principalToText(otherParty).slice(0, 8) + '...';
  const displayTitle = Array.isArray(safeStream.title) ? safeStream.title[0] : safeStream.title;
  const displayDescription = Array.isArray(safeStream.description) ? safeStream.description[0] : safeStream.description;

  return (
    <Link
      to={`/streams/${safeStream.id}`}
      className="block p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${
            isOutgoing ? 'bg-red-50' : 'bg-green-50'
          }`}>
            {isOutgoing ? (
              <ArrowRight className="h-4 w-4 text-red-500" />
            ) : (
              <ArrowRight className="h-4 w-4 text-green-500 rotate-180" />
            )}
          </div>
          
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">
                {isOutgoing ? 'To' : 'From'}: {otherPartyDisplay}
              </span>
              {displayTitle && (
                <span className="text-sm text-gray-500">• {displayTitle}</span>
              )}
            </div>
            <div className="flex items-center space-x-4 mt-1">
              <span className="text-sm text-gray-500">
                {formatSats(safeStream.sats_per_sec)} sats/sec
              </span>
              <span className="text-sm text-gray-500">
                {safeStream.start_time ? formatDistanceToNow(new Date(safeStream.start_time * 1000), { addSuffix: true }) : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">
              {safeStream.total_released !== undefined && safeStream.total_released !== null ? formatSats(Number(safeStream.total_released)) : 'N/A'} / {safeStream.total_locked !== undefined && safeStream.total_locked !== null ? formatSats(Number(safeStream.total_locked)) : 'N/A'} sats
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <div className="w-20 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">
                {Math.round(progress)}%
              </span>
            </div>
          </div>

          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(safeStream.status)}`}>
            <div className="flex items-center space-x-1">
              {getStatusIcon(safeStream.status)}
              <span>{typeof safeStream.status === 'string' ? safeStream.status : (Array.isArray(safeStream.status) ? safeStream.status[0] : JSON.stringify(safeStream.status))}</span>
            </div>
          </div>
        </div>
      </div>

      {displayDescription && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-600 truncate">{displayDescription}</p>
        </div>
      )}

      {safeStream.tags && safeStream.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {safeStream.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
          {safeStream.tags.length > 3 && (
            <span className="inline-block text-gray-500 text-xs px-2 py-1">
              +{safeStream.tags.length - 3} more
            </span>
          )}
        </div>
      )}
    </Link>
  );
};

export default StreamCard;
