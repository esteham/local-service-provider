/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { 
  FaTachometerAlt,
  FaUsers,
  FaTasks,
  FaChartLine,
  FaCalendarAlt,
  FaBell,
  FaCog,
  FaUserTie,
  FaClipboardList,
  FaHandshake,
  FaMoneyBillWave,
  FaEye
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import DashboardLayout from '../common/DashboardLayout';
import DashboardSidebar from '../common/DashboardSidebar';
import StatCard from '../common/StatCard';
import ServiceRequestCard from '../common/ServiceRequestCard';
import ServiceRequestsContent from './pages/ServiceRequestsContent';

const AgentDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [agentStats, setAgentStats] = useState({});
  const [serviceRequests, setServiceRequests] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load agent-specific data
      const [statsRes, requestsRes, workersRes, notificationsRes] = await Promise.all([
        axios.get('/api/agents/stats.php', { withCredentials: true }),
        axios.get('/api/agents/service-requests.php', { withCredentials: true }),
        axios.get('/api/agents/workers.php', { withCredentials: true }),
        axios.get('/api/agents/notifications.php', { withCredentials: true })
      ]);

      if (statsRes.data.success) {
        setAgentStats(statsRes.data.data);
      }

      if (requestsRes.data.success) {
        setServiceRequests(requestsRes.data.data);
      }

      if (workersRes.data.success) {
        setWorkers(workersRes.data.data);
      }

      if (notificationsRes.data.success) {
        setNotifications(notificationsRes.data.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FaTachometerAlt },
    { id: 'requests', label: 'Service Requests', icon: FaTasks },
    { id: 'workers', label: 'Manage Workers', icon: FaUsers },
    { id: 'assignments', label: 'Assignments', icon: FaClipboardList },
    { id: 'performance', label: 'Performance', icon: FaChartLine },
    { id: 'schedule', label: 'Schedule', icon: FaCalendarAlt },
    { id: 'negotiations', label: 'Negotiations', icon: FaHandshake },
    { id: 'payments', label: 'Payments', icon: FaMoneyBillWave },
    { id: 'notifications', label: 'Notifications', icon: FaBell },
    { id: 'settings', label: 'Settings', icon: FaCog }
  ];

  const renderSidebar = () => (
    <DashboardSidebar
      title="Agent Panel"
      menuItems={menuItems}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onLogout={handleLogout}
      avatarIcon={FaUserTie}
      gradientColors={['#1e3a8a', '#3730a3']}
      statusBadge={{ type: 'online', text: 'Active' }}
    />
  );

  const renderDashboard = () => (
    <div className="dashboard-content">
      <div className="stats-grid">
        <StatCard
          title="Total Requests"
          value={agentStats.totalRequests || 0}
          icon={FaTasks}
          color="primary"
          delay={0.1}
        />

        <StatCard
          title="Active Workers"
          value={agentStats.activeWorkers || 0}
          icon={FaUsers}
          color="success"
          delay={0.2}
        />

        <StatCard
          title="Assignments"
          value={agentStats.assignments || 0}
          icon={FaClipboardList}
          color="warning"
          delay={0.3}
        />

        <StatCard
          title="Commission"
          value={`$${agentStats.commission || 0}`}
          icon={FaMoneyBillWave}
          color="purple"
          delay={0.4}
        />
      </div>

      <div className="recent-activity">
        <h4>Recent Service Requests</h4>
        <div className="activity-list">
          {serviceRequests.slice(0, 5).map((request, index) => (
            <div key={index} className="activity-item">
              <div className="activity-content">
                <h5>{request.service_name}</h5>
                <p>{request.customer_name} - {request.location}</p>
                <small>{new Date(request.created_at).toLocaleString()}</small>
              </div>
              <div className="activity-actions">
                <button className="btn btn-sm btn-primary">
                  <FaEye /> View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRequests = () => (
    <div className="requests-content">
      <div className="requests-header">
        <h3>Service Requests Management</h3>
        <div className="request-filters">
          <button className="filter-btn active">All</button>
          <button className="filter-btn">Pending</button>
          <button className="filter-btn">Assigned</button>
          <button className="filter-btn">Completed</button>
        </div>
      </div>
      
      <div className="requests-grid">
        {serviceRequests.map((request) => (
          <ServiceRequestCard
            key={request.id}
            request={request}
            userRole="agent"
            onAssign={(id) => console.log('Assign request:', id)}
            onReject={(id) => console.log('Reject request:', id)}
            onViewDetails={(req) => console.log('View details:', req)}
          />
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'requests':
        return <ServiceRequestsContent />;
      case 'workers':
        return <div><h3>Worker Management</h3><p>Worker management features coming soon...</p></div>;
      case 'assignments':
        return <div><h3>Assignment Management</h3><p>Assignment features coming soon...</p></div>;
      case 'performance':
        return <div><h3>Performance Analytics</h3><p>Performance metrics coming soon...</p></div>;
      case 'schedule':
        return <div><h3>Schedule Management</h3><p>Schedule features coming soon...</p></div>;
      case 'negotiations':
        return <div><h3>Price Negotiations</h3><p>Negotiation features coming soon...</p></div>;
      case 'payments':
        return <div><h3>Payment Management</h3><p>Payment features coming soon...</p></div>;
      case 'notifications':
        return <div><h3>Notifications</h3><p>Notification management coming soon...</p></div>;
      case 'settings':
        return <div><h3>Settings</h3><p>Settings panel coming soon...</p></div>;
      default:
        return renderDashboard();
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout sidebar={renderSidebar()}>
      {renderContent()}
      
      <style jsx>{`
        .dashboard-content {
          max-width: 1200px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .recent-activity {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .recent-activity h4 {
          margin: 0 0 1rem 0;
          color: #1f2937;
        }

        .activity-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .activity-item:last-child {
          border-bottom: none;
        }

        .activity-content h5 {
          margin: 0 0 0.5rem 0;
          color: #1f2937;
        }

        .activity-content p {
          margin: 0;
          color: #6b7280;
        }

        .requests-content {
          max-width: 1200px;
        }

        .requests-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .requests-header h3 {
          margin: 0;
          color: #1f2937;
        }

        .request-filters {
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

        .requests-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
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
        }

        .btn-primary { background: #3b82f6; color: white; }

        .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .requests-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default AgentDashboard;
