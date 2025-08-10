import React from 'react';
import { FaCheckCircle, FaClock, FaDollarSign, FaStar } from 'react-icons/fa';
import StatCard from '../../common/StatCard';

const DashboardOverview = ({ 
  workerStats, 
  availability, 
  setAvailability,
  notifications 
}) => {
  return (
    <div className="worker-dashboard-content">
      <div className="stats-grid">
        <StatCard
          title="Completed Tasks"
          value={workerStats.completed_requests || 0}
          icon={FaCheckCircle}
          color="success"
          delay={0.1}
        />

        <StatCard
          title="Pending Tasks"
          value={workerStats.pending_requests || 0}
          icon={FaClock}
          color="warning"
          delay={0.2}
        />

        <StatCard
          title="Total Earnings"
          value={`$${workerStats.total_earnings || 0}`}
          icon={FaDollarSign}
          color="primary"
          delay={0.3}
        />

        <StatCard
          title="Average Rating"
          value={`${workerStats.average_rating || 0}/5`}
          icon={FaStar}
          color="warning"
          subtitle={`${workerStats.total_reviews || 0} reviews`}
          delay={0.4}
        />
      </div>

      <div className="availability-section">
        <h4>Availability Status</h4>
        <div className="availability-controls">
          <button 
            className={`availability-btn ${availability === 'available' ? 'active' : ''}`}
            onClick={() => setAvailability('available')}
          >
            Available
          </button>
          <button 
            className={`availability-btn ${availability === 'busy' ? 'active' : ''}`}
            onClick={() => setAvailability('busy')}
          >
            Busy
          </button>
          <button 
            className={`availability-btn ${availability === 'offline' ? 'active' : ''}`}
            onClick={() => setAvailability('offline')}
          >
            Offline
          </button>
        </div>
      </div>

      <div className="recent-notifications">
        <h4>Recent Notifications</h4>
        <div className="notifications-list">
          {notifications.slice(0, 5).map((notification, index) => (
            <div key={index} className="notification-item">
              <div className="notification-content">
                <p>{notification.message}</p>
                <small>{new Date(notification.created_at).toLocaleString()}</small>
              </div>
            </div>
          ))}
          {notifications.length === 0 && (
            <p className="no-notifications">No recent notifications</p>
          )}
        </div>
      </div>

      <style jsx>{`
        .worker-dashboard-content {
          max-width: 1200px;
          padding: 1rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .availability-section {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          margin-bottom: 2rem;
        }

        .availability-section h4 {
          margin: 0 0 1rem 0;
          color: #1f2937;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .availability-controls {
          display: flex;
          gap: 1rem;
        }

        .availability-btn {
          padding: 0.75rem 1.5rem;
          border: 2px solid #e5e7eb;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
          color: #374151;
        }

        .availability-btn:hover {
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .availability-btn.active {
          background: #3b82f6;
          border-color: #3b82f6;
          color: white;
        }

        .recent-notifications {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .recent-notifications h4 {
          margin: 0 0 1rem 0;
          color: #1f2937;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .notifications-list {
          max-height: 300px;
          overflow-y: auto;
        }

        .notification-item {
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
          transition: background-color 0.2s ease;
        }

        .notification-item:hover {
          background: #f9fafb;
        }

        .notification-item:last-child {
          border-bottom: none;
        }

        .notification-content p {
          margin: 0 0 0.25rem 0;
          color: #374151;
          line-height: 1.4;
        }

        .notification-content small {
          color: #6b7280;
          font-size: 0.8rem;
        }

        .no-notifications {
          text-align: center;
          color: #6b7280;
          font-style: italic;
          padding: 2rem;
        }

        @media (max-width: 768px) {
          .availability-controls {
            flex-direction: column;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardOverview;
