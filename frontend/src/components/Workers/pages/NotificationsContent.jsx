import React, { useState, useEffect } from 'react';
import { FaBell, FaCheck, FaTrash, FaFilter, FaEye } from 'react-icons/fa';

const NotificationsContent = ({ notifications: initialNotifications }) => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/backend/api/workers/notifications.php`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications(initialNotifications || []);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/backend/api/workers/notifications.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: notificationId, action: 'mark_read' })
      });
      
      setNotifications(notifications.map(notif => 
        notif.id === notificationId ? { ...notif, is_read: true } : notif
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/backend/api/workers/notifications.php`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: notificationId })
      });
      
      setNotifications(notifications.filter(notif => notif.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/backend/api/workers/notifications.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'mark_all_read' })
      });
      
      setNotifications(notifications.map(notif => ({ ...notif, is_read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.is_read;
    if (filter === 'read') return notif.is_read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return <div className="loading">Loading notifications...</div>;
  }

  return (
    <div className="notifications-content">
      <div className="notifications-header">
        <h3><FaBell className="page-icon" /> Notifications</h3>
        <div className="notification-controls">
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({notifications.length})
            </button>
            <button 
              className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </button>
            <button 
              className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
              onClick={() => setFilter('read')}
            >
              Read ({notifications.length - unreadCount})
            </button>
          </div>
          {unreadCount > 0 && (
            <button className="mark-all-btn" onClick={markAllAsRead}>
              <FaCheck /> Mark All Read
            </button>
          )}
        </div>
      </div>

      <div className="notifications-list">
        {filteredNotifications.map((notification, index) => (
          <div key={notification.id || index} className={`notification-item ${notification.is_read ? 'read' : 'unread'}`}>
            <div className="notification-content">
              <div className="notification-header">
                <h4>{notification.title || 'Notification'}</h4>
                <div className="notification-actions">
                  {!notification.is_read && (
                    <button 
                      className="action-btn read-btn"
                      onClick={() => markAsRead(notification.id)}
                      title="Mark as read"
                    >
                      <FaEye />
                    </button>
                  )}
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => deleteNotification(notification.id)}
                    title="Delete notification"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              <p>{notification.message}</p>
              <div className="notification-meta">
                <span className="notification-time">
                  {new Date(notification.created_at).toLocaleString()}
                </span>
                <span className={`notification-type ${notification.type || 'info'}`}>
                  {notification.type || 'info'}
                </span>
              </div>
            </div>
          </div>
        ))}
        
        {filteredNotifications.length === 0 && notifications.length > 0 && (
          <div className="no-results">
            <p>No notifications found for the selected filter.</p>
          </div>
        )}
        
        {notifications.length === 0 && (
          <div className="no-notifications">
            <FaBell className="no-notifications-icon" />
            <p>No notifications yet.</p>
            <p>You'll receive notifications about task assignments, updates, and important announcements here.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .notifications-content {
          max-width: auto;
          padding: 0 7rem;
        }

        .page-icon {
          margin-right: 0.5rem;
          color: #3b82f6;
        }

        .notifications-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .notifications-header h3 {
          margin: 0;
          color: #1f2937;
          font-size: 1.5rem;
          font-weight: 600;
          display: flex;
          align-items: center;
        }

        .notification-controls {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .filter-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .filter-btn {
          padding: 0.5rem 1rem;
          border: 1px solid #e5e7eb;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
          font-weight: 500;
          color: #374151;
        }

        .filter-btn:hover {
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .filter-btn.active {
          background: #3b82f6;
          border-color: #3b82f6;
          color: white;
        }

        .mark-all-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
          font-size: 0.9rem;
        }

        .mark-all-btn:hover {
          background: #059669;
          transform: translateY(-1px);
        }

        .loading {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
          font-size: 1.1rem;
        }

        .notifications-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .notification-item {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          border-left: 4px solid transparent;
          transition: all 0.2s ease;
        }

        .notification-item:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.15);
        }

        .notification-item.unread {
          border-left-color: #3b82f6;
          background: #f8fafc;
        }

        .notification-item.read {
          border-left-color: #e5e7eb;
        }

        .notification-content {
          padding: 1.5rem;
        }

        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .notification-header h4 {
          margin: 0;
          color: #1f2937;
          font-weight: 600;
          font-size: 1rem;
        }

        .notification-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          padding: 0.25rem;
          border: none;
          background: none;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.2s ease;
          color: #6b7280;
        }

        .action-btn:hover {
          background: #f3f4f6;
        }

        .read-btn:hover {
          color: #3b82f6;
        }

        .delete-btn:hover {
          color: #ef4444;
        }

        .notification-item p {
          margin: 0 0 1rem 0;
          color: #6b7280;
          line-height: 1.5;
        }

        .notification-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .notification-time {
          color: #9ca3af;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .notification-type {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .notification-type.info {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .notification-type.success {
          background: #d1fae5;
          color: #059669;
        }

        .notification-type.warning {
          background: #fef3c7;
          color: #d97706;
        }

        .notification-type.error {
          background: #fee2e2;
          color: #dc2626;
        }

        .no-results,
        .no-notifications {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          border: 2px dashed #d1d5db;
        }

        .no-notifications-icon {
          font-size: 3rem;
          color: #d1d5db;
          margin-bottom: 1rem;
        }

        .no-results p,
        .no-notifications p {
          margin: 0.5rem 0;
          font-size: 1rem;
        }

        @media (max-width: 768px) {
          .notifications-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .notification-controls {
            flex-direction: column;
            width: 100%;
            gap: 0.5rem;
          }

          .filter-buttons {
            width: 100%;
          }

          .filter-btn {
            flex: 1;
          }

          .notification-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .notification-meta {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationsContent;
