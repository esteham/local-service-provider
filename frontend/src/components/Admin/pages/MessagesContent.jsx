import React, { useState, useEffect } from 'react';
import { 
  FaEnvelope, 
  FaInbox, 
  FaPaperPlane, 
  FaTrash,
  FaReply,
  FaSearch,
  FaFilter,
  FaCircle,
  FaUser,
  FaClock
} from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const MessagesContent = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCompose, setShowCompose] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    loadMessages();
  }, [filter]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost';
      const statusParam = filter === 'all' ? '' : `&status=${filter}`;
      const response = await axios.get(`${apiUrl}/backend/api/admin/messages.php?limit=50${statusParam}`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        const messages = response.data.data || [];
        setMessages(messages.map(message => ({
          id: message.id,
          from: message.sender_name,
          fromRole: 'user',
          subject: message.subject,
          message: message.message,
          timestamp: message.created_at,
          isRead: message.is_read,
          priority: 'medium', // Default priority since our API doesn't have this
          type: message.type
        })));
      } else {
        throw new Error(response.data.message || 'Failed to load messages');
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast.error('Failed to load messages. Please check your connection and try again.');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await axios.post(`${BASE_URL}backend/api/admin/messages/mark-read.php`, {
        messageId
      }, { withCredentials: true });
      
      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, isRead: true } : msg
      ));
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  };

  const deleteMessage = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await axios.delete(`${BASE_URL}backend/api/admin/messages.php`, {
          data: { messageId },
          withCredentials: true
        });
        
        setMessages(messages.filter(msg => msg.id !== messageId));
        setSelectedMessage(null);
        toast.success('Message deleted successfully');
      } catch (error) {
        console.error('Failed to delete message:', error);
        toast.error('Failed to delete message');
      }
    }
  };

  const filteredMessages = messages.filter(message => {
    const matchesFilter = filter === 'all' || 
      (filter === 'unread' && !message.isRead) ||
      (filter === 'read' && message.isRead) ||
      (filter === message.priority);
    
    const matchesSearch = message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'worker': return FaUser;
      case 'agent': return FaUser;
      case 'system': return FaEnvelope;
      default: return FaUser;
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="messages-content">
      <div className="content-header">
        <h2><FaEnvelope /> Message Center</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCompose(true)}
        >
          <FaPaperPlane /> Compose
        </button>
      </div>

      <div className="messages-layout">
        {/* Sidebar */}
        <div className="messages-sidebar">
          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-tabs">
            <button 
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              <FaInbox /> All Messages
            </button>
            <button 
              className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              <FaCircle /> Unread
            </button>
            <button 
              className={`filter-tab ${filter === 'high' ? 'active' : ''}`}
              onClick={() => setFilter('high')}
            >
              <FaFilter /> High Priority
            </button>
          </div>

          <div className="messages-list">
            {filteredMessages.map((message) => {
              const RoleIcon = getRoleIcon(message.fromRole);
              return (
                <div
                  key={message.id}
                  className={`message-item ${selectedMessage?.id === message.id ? 'selected' : ''} ${!message.isRead ? 'unread' : ''}`}
                  onClick={() => {
                    setSelectedMessage(message);
                    if (!message.isRead) {
                      markAsRead(message.id);
                    }
                  }}
                >
                  <div className="message-header">
                    <div className="sender-info">
                      <RoleIcon className="role-icon" />
                      <span className="sender-name">{message.from}</span>
                    </div>
                    <div className="message-meta">
                      <span 
                        className="priority-dot"
                        style={{ color: getPriorityColor(message.priority) }}
                      >
                        <FaCircle />
                      </span>
                      <span className="timestamp">{formatTimestamp(message.timestamp)}</span>
                    </div>
                  </div>
                  <div className="message-preview">
                    <h4>{message.subject}</h4>
                    <p>{message.message ? message.message.substring(0, 80) + '...' : 'No message content'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Message View */}
        <div className="message-view">
          {selectedMessage ? (
            <div className="message-detail">
              <div className="message-detail-header">
                <div className="message-info">
                  <h3>{selectedMessage.subject}</h3>
                  <div className="message-meta-detail">
                    <span>From: {selectedMessage.from}</span>
                    <span>Priority: {selectedMessage.priority}</span>
                    <span>
                      <FaClock /> {new Date(selectedMessage.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="message-actions">
                  <button className="btn btn-outline">
                    <FaReply /> Reply
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => deleteMessage(selectedMessage.id)}
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
              
              <div className="message-body">
                <p>{selectedMessage.message}</p>
              </div>
            </div>
          ) : (
            <div className="no-message-selected">
              <FaEnvelope size={64} color="#e5e7eb" />
              <h3>Select a message to view</h3>
              <p>Choose a message from the list to read its contents</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .messages-content {
          max-width: 1400px;
          height: calc(100vh - 200px);
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          min-height: 300px;
          gap: 1rem;
        }

        .content-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .content-header h2 {
          margin: 0;
          color: #1f2937;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .messages-layout {
          display: grid;
          grid-template-columns: 400px 1fr;
          gap: 1.5rem;
          height: 100%;
        }

        .messages-sidebar {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .search-box {
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #6b7280;
        }

        .search-box input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 0.9rem;
        }

        .filter-tabs {
          display: flex;
          flex-direction: column;
          border-bottom: 1px solid #e5e7eb;
        }

        .filter-tab {
          padding: 0.75rem 1rem;
          border: none;
          background: none;
          text-align: left;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: background-color 0.2s ease;
        }

        .filter-tab:hover {
          background: #f8fafc;
        }

        .filter-tab.active {
          background: #dc2626;
          color: white;
        }

        .messages-list {
          flex: 1;
          overflow-y: auto;
        }

        .message-item {
          padding: 1rem;
          border-bottom: 1px solid #f3f4f6;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .message-item:hover {
          background: #f8fafc;
        }

        .message-item.selected {
          background: #fef2f2;
          border-left: 4px solid #dc2626;
        }

        .message-item.unread {
          background: #f0f9ff;
          font-weight: 600;
        }

        .message-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .sender-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .role-icon {
          font-size: 0.8rem;
          color: #6b7280;
        }

        .sender-name {
          font-size: 0.875rem;
          color: #1f2937;
        }

        .message-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .priority-dot {
          font-size: 0.5rem;
        }

        .timestamp {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .message-preview h4 {
          margin: 0 0 0.25rem 0;
          font-size: 0.9rem;
          color: #1f2937;
        }

        .message-preview p {
          margin: 0;
          font-size: 0.8rem;
          color: #6b7280;
          line-height: 1.4;
        }

        .message-view {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          overflow: hidden;
        }

        .message-detail {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .message-detail-header {
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .message-info h3 {
          margin: 0 0 0.5rem 0;
          color: #1f2937;
        }

        .message-meta-detail {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .message-meta-detail span {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .message-actions {
          display: flex;
          gap: 0.5rem;
        }

        .message-body {
          padding: 1.5rem;
          flex: 1;
          overflow-y: auto;
        }

        .message-body p {
          margin: 0;
          line-height: 1.6;
          color: #374151;
        }

        .no-message-selected {
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          gap: 1rem;
        }

        .no-message-selected h3 {
          margin: 0;
          color: #6b7280;
        }

        .no-message-selected p {
          margin: 0;
          color: #9ca3af;
        }

        .btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          font-size: 0.875rem;
        }

        .btn-primary { background: #dc2626; color: white; }
        .btn-outline { 
          background: transparent; 
          color: #6b7280; 
          border: 1px solid #e5e7eb; 
        }
        .btn-danger { background: #ef4444; color: white; }

        .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        @media (max-width: 768px) {
          .messages-layout {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .content-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .message-detail-header {
            flex-direction: column;
            gap: 1rem;
          }

          .message-actions {
            width: 100%;
            justify-content: flex-end;
          }
        }
      `}</style>
    </div>
  );
};

export default MessagesContent;
