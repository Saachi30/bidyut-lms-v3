import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import axios from 'axios';

const NotificationCenter = ({ onNotificationAction, showAsButton = true }) => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Get user from localStorage on component mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Fetch notifications on component mount and when user changes
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      // Get token from localStorage for authentication
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Include token in the request headers
      const response = await axios.get('/api/quiz-invitations', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setNotifications(response.data.data.map(invite => ({
          id: invite.id,
          title: `Quiz Invitation`,
          message: `You've been invited to take a quiz: ${invite.quiz.title}`,
          status: invite.status,
          time: new Date(invite.createdAt).toLocaleString(),
          type: 'quiz',
          quizId: invite.quiz.id,
          sender: invite.sender?.name || 'Teacher'
        })));
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
      
      // Fallback mock data for development
      if (process.env.NODE_ENV === 'development') {
        setNotifications([
          {
            id: 1,
            title: 'Quiz Invitation',
            message: 'You have been invited to take Introduction to Robotics Quiz',
            status: 'pending',
            time: new Date().toLocaleString(),
            type: 'quiz',
            quizId: 1,
            sender: 'John Doe'
          },
          {
            id: 2,
            title: 'Quiz Invitation',
            message: 'You have been invited to take Advanced Automation Quiz',
            status: 'pending',
            time: new Date(Date.now() - 86400000).toLocaleString(),
            type: 'quiz',
            quizId: 2,
            sender: 'Jane Smith'
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle invitation response (accept/decline)
  const handleInvitationResponse = async (invitationId, action) => {
    try {
      // Get token from localStorage for authentication
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Include token in the request headers
      await axios.put(`/api/quiz-invitations/${invitationId}/${action}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update local notification status
      setNotifications(notifications.map(notif => 
        notif.id === invitationId 
          ? {...notif, status: action === 'accept' ? 'accepted' : 'declined'} 
          : notif
      ));
      
      // Notify parent component
      if (onNotificationAction) {
        onNotificationAction({
          type: action,
          notificationId: invitationId,
          notifications: notifications.map(notif => 
            notif.id === invitationId 
              ? {...notif, status: action === 'accept' ? 'accepted' : 'declined'} 
              : notif
          )
        });
      }
    } catch (err) {
      console.error(`Error ${action}ing invitation:`, err);
      setError(`Failed to ${action} invitation`);
    }
  };

  // Count pending notifications
  const pendingCount = notifications.filter(n => n.status === 'pending').length;

  // Render as button with dropdown
  if (showAsButton) {
    return (
      <div className="relative">
        {/* Notification Bell Button */}
        <button 
          onClick={() => setShowNotifications(!showNotifications)}
          className="p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-all"
          aria-label="Notifications"
        >
          <Bell size={24} className="text-primary-500" />
          {pendingCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {pendingCount}
            </span>
          )}
        </button>
        
        {/* Notification Dropdown */}
        {showNotifications && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-20">
            <div className="p-3 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-semibold">Notifications</h3>
              <button 
                onClick={() => fetchNotifications()}
                className="text-primary-500 text-sm hover:underline"
                disabled={loading}
              >
                Refresh
              </button>
            </div>
            
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto"></div>
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">
                <p>{error}</p>
                <button 
                  onClick={() => fetchNotifications()} 
                  className="mt-2 text-primary-500 text-sm hover:underline"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No notifications</div>
                ) : (
                  notifications.map((notification) => (
                    <div key={notification.id} className="p-3 border-b border-gray-100 hover:bg-gray-50">
                      <div className="flex justify-between">
                        <h4 className="font-medium">{notification.title}</h4>
                        <span className="text-xs text-gray-500">{notification.time}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">From: {notification.sender}</p>
                      
                      {notification.status === 'pending' && notification.type === 'quiz' && (
                        <div className="mt-2 flex gap-2">
                          <button 
                            onClick={() => handleInvitationResponse(notification.id, 'accept')}
                            className="px-3 py-1 bg-primary-500 text-white text-xs rounded hover:bg-primary-600"
                          >
                            Accept
                          </button>
                          <button 
                            onClick={() => handleInvitationResponse(notification.id, 'decline')}
                            className="px-3 py-1 bg-gray-200 text-gray-800 text-xs rounded hover:bg-gray-300"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                      
                      {notification.status !== 'pending' && (
                        <div className="mt-1">
                          <span className={`text-xs px-2 py-1 rounded ${
                            notification.status === 'accepted' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {notification.status === 'accepted' ? 'Accepted' : 'Declined'}
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
            
            <div className="p-2 border-t border-gray-100">
              <button 
                onClick={() => setShowNotifications(false)}
                className="w-full py-2 text-sm text-center text-primary-500 hover:text-primary-600"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // Render as in-page component
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 bg-primary-50 border-b border-primary-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bell size={20} className="text-primary-500" />
          <h3 className="font-semibold text-primary-800">Notifications</h3>
          {pendingCount > 0 && (
            <span className="bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">
              {pendingCount} new
            </span>
          )}
        </div>
        <button 
          onClick={() => fetchNotifications()}
          className="text-primary-500 text-sm hover:underline"
          disabled={loading}
        >
          Refresh
        </button>
      </div>
      
      {loading ? (
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading notifications...</p>
        </div>
      ) : error ? (
        <div className="p-6 text-center text-red-500">
          <p>{error}</p>
          <button 
            onClick={() => fetchNotifications()} 
            className="mt-2 text-primary-500 hover:underline"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No notifications</div>
          ) : (
            notifications.map((notification) => (
              <div key={notification.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                <div className="flex justify-between">
                  <h4 className="font-medium">{notification.title}</h4>
                  <span className="text-xs text-gray-500">{notification.time}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-1">From: {notification.sender}</p>
                
                {notification.status === 'pending' && notification.type === 'quiz' && (
                  <div className="mt-3 flex gap-3">
                    <button 
                      onClick={() => handleInvitationResponse(notification.id, 'accept')}
                      className="px-4 py-2 bg-primary-500 text-white text-sm rounded hover:bg-primary-600 flex-1"
                    >
                      Accept
                    </button>
                    <button 
                      onClick={() => handleInvitationResponse(notification.id, 'decline')}
                      className="px-4 py-2 bg-gray-200 text-gray-800 text-sm rounded hover:bg-gray-300 flex-1"
                    >
                      Decline
                    </button>
                  </div>
                )}
                
                {notification.status !== 'pending' && (
                  <div className="mt-2">
                    <span className={`text-sm px-3 py-1 rounded ${
                      notification.status === 'accepted' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {notification.status === 'accepted' ? 'Accepted' : 'Declined'}
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;