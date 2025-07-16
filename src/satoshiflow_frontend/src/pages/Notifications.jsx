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
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-1">Stay updated with your stream activities</p>
          </div>
        </div>

        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
          <p className="text-gray-500">
            You'll see notifications here when you create or receive streams
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            {unreadCount > 0 && `${unreadCount} unread • `}
            {filteredNotifications.length} total
          </p>
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={loading}
            className="mt-4 md:mt-0 inline-flex items-center space-x-2 btn-primary disabled:opacity-50"
          >
            <CheckCheck size={16} />
            <span>Mark All Read</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filter:</span>
            </div>
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input-field min-w-0"
            >
              <option value="all">All ({notifications.length})</option>
              <option value="unread">Unread ({unreadCount})</option>
              <option value="read">Read ({notifications.length - unreadCount})</option>
            </select>
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="input-field min-w-0"
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
      <div className="flex space-x-2 overflow-x-auto">
        {[
          { key: 'all', label: 'All', count: notifications.length },
          { key: 'unread', label: 'Unread', count: unreadCount },
          { key: 'read', label: 'Read', count: notifications.length - unreadCount },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === tab.key
                ? 'bg-orange-100 text-orange-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Bell className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
            <p className="text-gray-500">
              Try adjusting your filters to see more notifications
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`border rounded-lg p-4 transition-all ${
                notification.read 
                  ? 'bg-white border-gray-200' 
                  : `${getNotificationColor(notification.notification_type)} border-2`
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.notification_type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatNotificationType(notification.notification_type)}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(notification.timestamp * 1000), { 
                          addSuffix: true 
                        })}
                      </span>
                      
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4 text-gray-500" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>Stream #{notification.stream_id}</span>
                      <span>•</span>
                      <span className="font-mono">
                        {notification.user.toString().slice(0, 8)}...
                      </span>
                    </div>
                    
                    {!notification.read && (
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More / Pagination could be added here */}
      {filteredNotifications.length > 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">
            Showing {filteredNotifications.length} notifications
          </p>
        </div>
      )}
    </div>
  );
};

export default Notifications;
