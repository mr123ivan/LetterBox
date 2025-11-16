import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import SideBar from '../components/SideBar';

const NotificationPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [senderNames, setSenderNames] = useState({});
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');

    try {
      if (!user || !user.token) {
        throw new Error('Authentication required');
      }

      // Fetch all received letters as notifications
      const response = await axios.get('/api/letters/getallreceived', {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      // Get trashed and permanently deleted letters from localStorage
      const trashedIds = JSON.parse(localStorage.getItem('trashedLetters') || '[]');
      const permanentlyDeletedIds = JSON.parse(localStorage.getItem('permanentlyDeletedLetters') || '[]');

      // Filter out trashed and permanently deleted letters
      const nonTrashedLetters = response.data.filter(letter => 
        !trashedIds.includes(letter.letterId.toString()) &&
        !permanentlyDeletedIds.includes(letter.letterId.toString())
      );

      // Add a 'read' status to each notification (you can store this in localStorage)
      const storedReadStatus = JSON.parse(localStorage.getItem('readNotifications') || '{}');
      const notificationsWithStatus = nonTrashedLetters.map(letter => ({
        ...letter,
        isRead: storedReadStatus[letter.letterId] || false
      }));

      setNotifications(notificationsWithStatus);
      
      // Fetch sender names
      if (response.data.length > 0) {
        fetchSenderNames(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to load notifications. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSenderNames = async (letters) => {
    try {
      if (!user || !user.token) return;

      const response = await axios.get('/api/users/getusers', {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      const userMap = {};
      response.data.forEach(u => {
        userMap[u.userId] = u.userName;
      });

      setSenderNames(userMap);
    } catch (err) {
      console.error('Failed to fetch sender names:', err);
    }
  };

  const markAsRead = (letterId) => {
    // Update local state
    setNotifications(prev => 
      prev.map(notif => 
        notif.letterId === letterId ? { ...notif, isRead: true } : notif
      )
    );

    // Store in localStorage
    const storedReadStatus = JSON.parse(localStorage.getItem('readNotifications') || '{}');
    storedReadStatus[letterId] = true;
    localStorage.setItem('readNotifications', JSON.stringify(storedReadStatus));
  };

  const markAllAsRead = () => {
    const storedReadStatus = {};
    notifications.forEach(notif => {
      storedReadStatus[notif.letterId] = true;
    });
    localStorage.setItem('readNotifications', JSON.stringify(storedReadStatus));
    
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    
    if (name.includes(' ')) {
      return name.split(' ')
        .map(part => part.charAt(0).toUpperCase())
        .join('')
        .substring(0, 2);
    }
    
    return name.charAt(0).toUpperCase() + (name.length > 1 ? name.charAt(1) : '');
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.isRead;
    if (filter === 'read') return notif.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <SideBar className="sticky top-0 z-10" />

      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  Notifications
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                </p>
              </div>
              
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
            <button
              className={`py-2 px-4 font-medium text-sm ${filter === 'all' 
                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
              onClick={() => setFilter('all')}
            >
              All ({notifications.length})
            </button>
            <button
              className={`py-2 px-4 font-medium text-sm ${filter === 'unread' 
                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </button>
            <button
              className={`py-2 px-4 font-medium text-sm ${filter === 'read' 
                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
              onClick={() => setFilter('read')}
            >
              Read ({notifications.length - unreadCount})
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-8">
              <div className="flex items-center space-x-2">
                <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-gray-700 dark:text-gray-300">Loading notifications...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredNotifications.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No notifications
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {filter === 'unread' 
                  ? "You don't have any unread notifications" 
                  : filter === 'read'
                  ? "You don't have any read notifications"
                  : "You haven't received any letters yet"}
              </p>
            </div>
          )}

          {/* Notifications List */}
          {!loading && !error && filteredNotifications.length > 0 && (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <Link
                  key={notification.letterId}
                  to={`/letter-received/${notification.letterId}`}
                  state={{ from: '/notifications' }}
                  onClick={() => markAsRead(notification.letterId)}
                  className={`block p-4 rounded-lg transition-colors ${
                    notification.isRead 
                      ? 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750' 
                      : 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                  }`}
                >
                  <div className="p-4 flex items-start space-x-4">
                    {/* Avatar */}
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${
                      !notification.isRead ? 'bg-blue-500' : 'bg-gray-400'
                    }`}>
                      {getInitials(senderNames[notification.sender_id] || 'U')}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {senderNames[notification.sender_id] || `User ${notification.sender_id}`}
                            <span className="font-normal text-gray-600 dark:text-gray-400"> sent you a letter</span>
                          </p>
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-1">
                            {notification.letterTitle}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {notification.letterContent}
                          </p>
                        </div>
                        
                        {!notification.isRead && (
                          <div className="ml-2 flex-shrink-0">
                            <span className="inline-block h-2 w-2 rounded-full bg-blue-500"></span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        {formatDate(notification.created_at)}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default NotificationPage;