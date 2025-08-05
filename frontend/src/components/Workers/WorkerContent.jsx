/* eslint-disable no-unused-vars */
import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaCheckCircle, 
  FaClock, 
  FaDollarSign, 
  FaStar,
  FaChartLine,
  FaTasks,
  FaCalendarAlt
} from 'react-icons/fa';
import StatCard from '../common/StatCard';
import ServiceRequestCard from '../common/ServiceRequestCard';

const WorkerContent = ({ 
  activeTab, 
  serviceRequests, 
  workerStats, 
  availability, 
  setAvailability,
  notifications,
  onAcceptRequest,
  onCompleteRequest,
  onRejectRequest 
}) => {

  const renderDashboard = () => (
    <div className="worker-dashboard-content">
      <div className="stats-grid">
        <StatCard
          title="Completed Tasks"
          value={workerStats.completed || 0}
          icon={FaCheckCircle}
          color="success"
          delay={0.1}
        />

        <StatCard
          title="Pending Tasks"
          value={workerStats.pending || 0}
          icon={FaClock}
          color="warning"
          delay={0.2}
        />

        <StatCard
          title="Total Earnings"
          value={`$${workerStats.earnings || 0}`}
          icon={FaDollarSign}
          color="primary"
          delay={0.3}
        />

        <StatCard
          title="Average Rating"
          value={`${workerStats.rating || 0}/5`}
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
        </div>
      </div>
    </div>
  );

  const renderTasks = () => (
    <div className="tasks-content">
      <div className="tasks-header">
        <h3>My Tasks</h3>
        <div className="task-filters">
          <button className="filter-btn active">All</button>
          <button className="filter-btn">Pending</button>
          <button className="filter-btn">In Progress</button>
          <button className="filter-btn">Completed</button>
        </div>
      </div>
      
      <div className="tasks-grid">
        {serviceRequests.map((request) => (
          <ServiceRequestCard
            key={request.id}
            request={request}
            userRole="worker"
            onAccept={onAcceptRequest}
            onReject={onRejectRequest}
            onComplete={onCompleteRequest}
            onViewDetails={(req) => console.log('View details:', req)}
          />
        ))}
      </div>
    </div>
  );

  const renderSchedule = () => (
    <div className="schedule-content">
      <h3>My Schedule</h3>
      <div className="calendar-view">
        <p>Calendar integration coming soon...</p>
      </div>
    </div>
  );

  const renderPerformance = () => (
    <div className="performance-content">
      <h3>Performance Metrics</h3>
      <div className="metrics-grid">
        <div className="metric-card">
          <FaChartLine className="metric-icon" />
          <h4>Completion Rate</h4>
          <p>{workerStats.completionRate || 0}%</p>
        </div>
        <div className="metric-card">
          <FaTasks className="metric-icon" />
          <h4>Tasks This Month</h4>
          <p>{workerStats.monthlyTasks || 0}</p>
        </div>
        <div className="metric-card">
          <FaCalendarAlt className="metric-icon" />
          <h4>Response Time</h4>
          <p>{workerStats.responseTime || 0} hrs</p>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="profile-content">
      <h3>My Profile</h3>
      <p>Profile management coming soon...</p>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'tasks':
        return renderTasks();
      case 'schedule':
        return renderSchedule();
      case 'performance':
        return renderPerformance();
      case 'profile':
        return renderProfile();
      case 'services':
        return <div><h3>Services</h3><p>Services management coming soon...</p></div>;
      case 'history':
        return <div><h3>Work History</h3><p>Work history coming soon...</p></div>;
      case 'earnings':
        return <div><h3>Earnings</h3><p>Earnings details coming soon...</p></div>;
      case 'notifications':
        return <div><h3>Notifications</h3><p>Notifications management coming soon...</p></div>;
      case 'help':
        return <div><h3>Help & Support</h3><p>Help center coming soon...</p></div>;
      case 'settings':
        return <div><h3>Settings</h3><p>Settings panel coming soon...</p></div>;
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="worker-content">
      {renderContent()}
      
      <style jsx>{`
        .worker-content {
          width: 100%;
          min-height: 100vh;
        }

        .worker-dashboard-content {
          max-width: 1200px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: white;
        }

        .stat-icon.completed { background: #10b981; }
        .stat-icon.pending { background: #f59e0b; }
        .stat-icon.earnings { background: #3b82f6; }
        .stat-icon.rating { background: #8b5cf6; }

        .stat-info h3 {
          margin: 0;
          font-size: 2rem;
          font-weight: 700;
          color: #1f2937;
        }

        .stat-info p {
          margin: 0;
          color: #6b7280;
          font-weight: 500;
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
        }

        .notification-item {
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .notification-item:last-child {
          border-bottom: none;
        }

        .tasks-content {
          max-width: 1200px;
        }

        .tasks-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .tasks-header h3 {
          margin: 0;
          color: #1f2937;
        }

        .task-filters {
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
        }

        .filter-btn.active {
          background: #3b82f6;
          border-color: #3b82f6;
          color: white;
        }

        .tasks-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .task-card {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .task-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .task-header h4 {
          margin: 0;
          color: #1f2937;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .status-badge.pending { background: #fef3c7; color: #92400e; }
        .status-badge.in_progress { background: #dbeafe; color: #1e40af; }
        .status-badge.completed { background: #d1fae5; color: #065f46; }

        .task-details p {
          margin: 0.5rem 0;
          color: #6b7280;
        }

        .task-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .btn-success { background: #10b981; color: white; }
        .btn-danger { background: #ef4444; color: white; }
        .btn-primary { background: #3b82f6; color: white; }

        .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .performance-content, .schedule-content, .profile-content {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .metric-card {
          text-align: center;
          padding: 1.5rem;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }

        .metric-icon {
          font-size: 2rem;
          color: #3b82f6;
          margin-bottom: 1rem;
        }

        @media (max-width: 768px) {
          .worker-content {
            padding: 0;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .tasks-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default WorkerContent;
