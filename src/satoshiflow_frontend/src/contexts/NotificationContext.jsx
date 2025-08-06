import React, { createContext, useContext, useState, useEffect } from 'react';
import { satoshiflow_backend } from 'declarations/satoshiflow_backend';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Utility: Convert BigInt to Number for notifications
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
  if (typeof p.toString === 'function') return p.toString();
  return String(p);
}

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [previousNotificationCount, setPreviousNotificationCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Set up periodic refresh for real-time notifications
      const interval = setInterval(fetchNotifications, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    } else {
      // Reset when user logs out
      setNotifications([]);
      setUnreadCount(0);
      setPreviousNotificationCount(0);
    }
  }, [user]);

  // Play notification sound when new notifications arrive
  useEffect(() => {
    if (notifications.length > previousNotificationCount && previousNotificationCount > 0) {
      // Only play sound if we have new notifications (not on initial load)
      playNotificationSound();
    }
    setPreviousNotificationCount(notifications.length);
  }, [notifications.length]);

  const playNotificationSound = () => {
    try {
      // Create a simple notification beep
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  };

  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      console.log('Fetching notifications for user:', principalToText(user));
      
      // Fetch all notifications from backend
      const rawNotifications = await satoshiflow_backend.get_notifications();
      console.log('Raw notifications received:', rawNotifications);
      
      // Convert BigInt values and filter for current user
      const userNotifications = rawNotifications
        .map(notification => {
          try {
            const converted = deepBigIntToNumber(notification);
            console.log('Converted notification:', converted);
            return converted;
          } catch (error) {
            console.error('Error converting notification:', notification, error);
            return notification;
          }
        })
        .filter(notification => {
          const notificationUser = principalToText(notification.user);
          const currentUser = principalToText(user);
          const isUserNotification = notificationUser === currentUser;
          if (isUserNotification) {
            console.log('Found user notification:', { id: notification.id, type: notification.notification_type });
          }
          return isUserNotification;
        })
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)); // Sort by timestamp, newest first
      
      console.log('Filtered user notifications:', userNotifications);
      
      setNotifications(userNotifications);
      setUnreadCount(userNotifications.filter(n => !n.read).length);
      
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      console.error('Notification fetch error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      // Fallback to empty state on error
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      console.log('Marking notification as read:', notificationId);
      
      // Call backend to mark as read
      const success = await satoshiflow_backend.mark_notification_read(notificationId);
      
      if (success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, read: true }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        console.log('Notification marked as read successfully');
      } else {
        console.warn('Failed to mark notification as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setLoading(true);
      console.log('Marking all notifications as read');
      
      // Mark each unread notification as read
      const unreadNotifications = notifications.filter(n => !n.read);
      const markPromises = unreadNotifications.map(notification => 
        satoshiflow_backend.mark_notification_read(notification.id)
      );
      
      await Promise.all(markPromises);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
      
      console.log('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    } finally {
      setLoading(false);
    }
  };

  const addNotification = (notification) => {
    console.log('Adding new notification:', notification);
    const convertedNotification = deepBigIntToNumber(notification);
    setNotifications(prev => [convertedNotification, ...prev]);
    if (!convertedNotification.read) {
      setUnreadCount(prev => prev + 1);
    }
  };

  // Real-time notification creation for stream events
  const createStreamNotification = async (streamId, type, message) => {
    try {
      console.log('Creating stream notification:', { streamId, type, message });
      // The backend will automatically create notifications when stream events occur
      // We'll refresh notifications to get the latest
      await fetchNotifications();
    } catch (error) {
      console.error('Error creating stream notification:', error);
    }
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    addNotification,
    fetchNotifications,
    createStreamNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
