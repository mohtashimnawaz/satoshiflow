import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  Filter,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Play,
  Pause,
  Square
} from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

function principalToText(p) {
  if (!p) return '';
  if (typeof p === 'string') return p;
  if (typeof p.toText === 'function') return p.toText();
  if (typeof p.toString === 'function') return p.toString();
  return String(p);
}

const Notifications = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    fetchNotifications
  } = useNotifications();
  
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [typeFilter, setTypeFilter] = useState('all'); // all, StreamCreated, StreamClaimed, etc.
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread' && notification.read) return false;
    if (filter === 'read' && !notification.read) return false;
    if (typeFilter !== 'all' && notification.notification_type !== typeFilter) return false;
    return true;
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'StreamCreated':
        return <Play className="h-5 w-5 text-green-500" />;
      case 'StreamClaimed':
        return <DollarSign className="h-5 w-5 text-blue-500" />;
      case 'StreamTopUp':
        return <DollarSign className="h-5 w-5 text-orange-500" />;
      case 'StreamCancelled':
        return <Square className="h-5 w-5 text-red-500" />;
      case 'StreamCompleted':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'LowBalance':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'ClaimReminder':
        return <Clock className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'StreamCreated':
        return 'bg-green-50 border-green-200';
      case 'StreamClaimed':
        return 'bg-blue-50 border-blue-200';
      case 'StreamTopUp':
        return 'bg-orange-50 border-orange-200';
      case 'StreamCancelled':
        return 'bg-red-50 border-red-200';
      case 'StreamCompleted':
        return 'bg-green-50 border-green-200';
      case 'LowBalance':
        return 'bg-yellow-50 border-yellow-200';
      case 'ClaimReminder':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatNotificationType = (type) => {
    switch (type) {
      case 'StreamCreated':
        return 'Stream Created';
      case 'StreamClaimed':
        return 'Stream Claimed';
      case 'StreamTopUp':
        return 'Stream Top Up';
      case 'StreamCancelled':
        return 'Stream Cancelled';
      case 'StreamCompleted':
        return 'Stream Completed';
      case 'LowBalance':
        return 'Low Balance';
      case 'ClaimReminder':
        return 'Claim Reminder';
      default:
        return type;
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    setLoading(true);
    markAllAsRead();
    setLoading(false);
  };

  const getTypeCount = (type) => {
    if (type === 'all') return notifications.length;
    return notifications.filter(n => n.notification_type === type).length;
  };

  const notificationTypes = [
    'StreamCreated',
    'StreamClaimed',
    'StreamTopUp',
    'StreamCancelled',
    'StreamCompleted',
    'LowBalance',
    'ClaimReminder'
  ];

  if (notifications.length === 0) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
        {/* 3D Background Elements */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-red-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
          </div>
          
          {/* Floating notification icons */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                left: `${15 + i * 12}%`,
                top: `${20 + (i % 2) * 40}%`,
                width: `${80 + i * 10}px`,
                height: `${80 + i * 10}px`,
                background: `linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(249, 115, 22, 0.05))`,
                borderRadius: '50%',
                border: '1px solid rgba(251, 191, 36, 0.2)',
                backdropFilter: 'blur(10px)',
                animationDelay: `${i * 0.7}s`,
                animationDuration: `${9 + i}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent mb-4">
              Notifications
            </h1>
            <p className="text-slate-300 text-lg md:text-xl font-medium mb-12">
              Stay updated with your stream activities
            </p>
          </div>

          <div className="flex justify-center">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-16 max-w-lg">
              <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-8 rounded-2xl shadow-lg mx-auto w-32 h-32 flex items-center justify-center mb-8">
                <Bell className="h-16 w-16 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 text-center">No notifications yet</h3>
              <p className="text-slate-300 text-center text-lg">
                You'll see notifications here when you create or receive streams
              </p>
            </div>
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
          <div className="absolute top-0 -left-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-red-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
        
        {/* Floating notification icons */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${8 + i * 11}%`,
              top: `${15 + (i % 3) * 25}%`,
              width: `${70 + i * 8}px`,
              height: `${70 + i * 8}px`,
              background: `linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(249, 115, 22, 0.05))`,
              borderRadius: i % 3 === 0 ? '50%' : i % 3 === 1 ? '25%' : '15%',
              border: '1px solid rgba(251, 191, 36, 0.2)',
              backdropFilter: 'blur(10px)',
              animationDelay: `${i * 0.6}s`,
              animationDuration: `${8 + i}s`,
            }}
          />
        ))}

        {/* 3D Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `linear-gradient(rgba(251, 191, 36, 0.1) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(251, 191, 36, 0.1) 1px, transparent 1px)`,
              backgroundSize: '80px 80px',
              transform: 'perspective(800px) rotateX(20deg)',
            }}
          />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent mb-4">
            Notifications
          </h1>
          <p className="text-slate-300 text-lg md:text-xl font-medium mb-6">
            {unreadCount > 0 && `${unreadCount} unread • `}
            {filteredNotifications.length} total
          </p>
          
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={loading}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
            >
              <CheckCheck size={20} />
              <span>Mark All Read</span>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-orange-400" />
                <span className="text-sm font-medium text-slate-300">Filter:</span>
              </div>
              
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
              >
                <option value="all">All ({notifications.length})</option>
                <option value="unread">Unread ({unreadCount})</option>
                <option value="read">Read ({notifications.length - unreadCount})</option>
              </select>
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
            >
              <option value="all">All Types</option>
              {notificationTypes.map(type => (
                <option key={type} value={type}>
                  {formatNotificationType(type)} ({getTypeCount(type)})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Filter Tabs */}
        <div className="flex space-x-3 overflow-x-auto mb-8">
          {[
            { key: 'all', label: 'All', count: notifications.length },
            { key: 'unread', label: 'Unread', count: unreadCount },
            { key: 'read', label: 'Read', count: notifications.length - unreadCount },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300 transform hover:scale-105 ${
                filter === tab.key
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                  : 'bg-white/10 backdrop-blur-sm text-slate-300 hover:bg-white/20 border border-white/20'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-16 text-center">
              <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-6 rounded-2xl shadow-lg mx-auto w-24 h-24 flex items-center justify-center mb-6">
                <Bell className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">No notifications found</h3>
              <p className="text-slate-300 text-lg">
                Try adjusting your filters to see more notifications
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification, index) => (
              <div
                key={notification.id}
                className={`bg-white/10 backdrop-blur-xl rounded-2xl border transition-all duration-300 p-6 hover:bg-white/15 hover:scale-[1.02] animate-fadeInUp ${
                  notification.read 
                    ? 'border-white/20' 
                    : 'border-orange-500/50 shadow-lg shadow-orange-500/20'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`p-3 rounded-xl ${
                      notification.read 
                        ? 'bg-white/10' 
                        : 'bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg'
                    }`}>
                      {React.cloneElement(getNotificationIcon(notification.notification_type), {
                        className: `h-6 w-6 ${notification.read ? 'text-slate-400' : 'text-white'}`
                      })}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-lg font-bold text-white">
                          {formatNotificationType(notification.notification_type)}
                        </p>
                        <p className="text-slate-300 mt-1">
                          {notification.message}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-slate-400">
                          {formatDistanceToNow(new Date(notification.timestamp * 1000), { 
                            addSuffix: true 
                          })}
                        </span>
                        
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-2 hover:bg-white/20 rounded-lg transition-all duration-300 transform hover:scale-110"
                            title="Mark as read"
                          >
                            <Check className="h-5 w-5 text-orange-400" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                      <div className="flex items-center space-x-3 text-sm text-slate-400">
                        <span className="bg-orange-500/20 px-3 py-1 rounded-full text-orange-300">
                          Stream #{notification.stream_id}
                        </span>
                        <span className="font-mono bg-white/10 px-3 py-1 rounded-full">
                          {principalToText(notification.user).slice(0, 8)}...
                        </span>
                      </div>
                      
                      {!notification.read && (
                        <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse shadow-lg shadow-orange-500/50"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load More / Pagination */}
        {filteredNotifications.length > 0 && (
          <div className="text-center py-8">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
              <p className="text-slate-300 text-lg">
                Showing {filteredNotifications.length} notifications
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
