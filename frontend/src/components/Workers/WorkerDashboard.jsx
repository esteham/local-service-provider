/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import WorkerSidebar from './WorkerSidebar';
import WorkerContent from './WorkerContent';
import DashboardLayout from '../common/DashboardLayout';
import { set } from 'react-hook-form';

const WorkerDashboard = () => {
  const { user, logout } = useAuth();
  const [serviceRequests, setServiceRequests] = useState([]);
  const [workerStats, setWorkerStats] = useState({});
  const [availability, setAvailability] = useState('available');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);

  //Load active tab from localStorage or default to dashboard
  const [activeTab, setActiveTab] = useState(
    localStorage.getItem("workerActiveTab") || "dashboard"
  );

  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost';

  //Handel tab change and persist to localStorage
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    localStorage.setItem("workerActiveTab", tab);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Real-time updates listener for worker dashboard
  useEffect(() => {
    const handleServiceRequestUpdate = (event) => {
      console.log('Service request updated - Worker Dashboard:', event.detail);
      // Refresh dashboard data when service requests are updated
      loadDashboardData();
    };

    const handleServiceRequestCreated = (event) => {
      console.log('New service request created - Worker Dashboard:', event.detail);
      // Refresh dashboard data when new service requests are created
      loadDashboardData();
    };

    // Listen for real-time updates
    window.addEventListener('serviceRequestUpdate', handleServiceRequestUpdate);
    window.addEventListener('serviceRequestCreated', handleServiceRequestCreated);

    // Auto-refresh every 30 seconds for worker tasks
    const interval = setInterval(() => {
      if (activeTab === 'dashboard' || activeTab === 'tasks') {
        loadDashboardData();
      }
    }, 20000);

    return () => {
      window.removeEventListener('serviceRequestUpdate', handleServiceRequestUpdate);
      window.removeEventListener('serviceRequestCreated', handleServiceRequestCreated);
      clearInterval(interval);
    };
  }, [activeTab]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [requestsRes, statsRes, notificationsRes] = await Promise.all([
        axios.get(`${BASE_URL}/backend/api/workers/show_task.php`, { withCredentials: true }),
        axios.get(`${BASE_URL}/backend/api/workers/stats.php`, { withCredentials: true }),
        axios.get(`${BASE_URL}/backend/api/workers/notifications.php`, { withCredentials: true })
      ]);

      if (requestsRes.data.success) {
        setServiceRequests(requestsRes.data.data);
      }

      if (statsRes.data.success) {
        setWorkerStats(statsRes.data.data);
        setAvailability(statsRes.data.data.availability || 'available');
      }

      if (notificationsRes.data.success) {
        setNotifications(notificationsRes.data.data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAvailabilityChange = async (newAvailability) => {
    try {
      const response = await axios.post(`${BASE_URL}/backend/api/workers/availability.php`, {
        availability: newAvailability
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        setAvailability(newAvailability);
        toast.success('Availability updated successfully');
      } else {
        toast.error(response.data.message || 'Failed to update availability');
      }
    } catch (error) {
      toast.error('Failed to update availability');
      console.error('Availability update error:', error);
    }
  };

  const handleRequestAction = async (requestId, action) => {
    try {
      const response = await axios.post(`${BASE_URL}/backend/api/workers/request_action.php`, {
        request_id: requestId,
        action: action
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        toast.success(`Request ${action}ed successfully`);
        loadDashboardData(); // Refresh data
        
        // Trigger real-time update event for other components
        window.dispatchEvent(new CustomEvent('serviceRequestUpdate', {
          detail: {
            requestId: requestId,
            action: action,
            workerAction: true,
            timestamp: new Date().toISOString()
          }
        }));
      } else {
        toast.error(response.data.message || `Failed to ${action} request`);
      }
    } catch (error) {
      toast.error(`Failed to ${action} request`);
      console.error('Request action error:', error);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleAcceptRequest = (requestId) => {
    handleRequestAction(requestId, 'accept');
  };

  const handleCompleteRequest = (requestId) => {
    handleRequestAction(requestId, 'complete');
  };

  const handleRejectRequest = (requestId) => {
    handleRequestAction(requestId, 'reject');
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
    <DashboardLayout
      sidebar={
        <WorkerSidebar 
          activeTab={activeTab} 
          setActiveTab={handleTabChange} 
          onLogout={handleLogout}
        />
      }
    >
      <WorkerContent 
        activeTab={activeTab}
        serviceRequests={serviceRequests}
        workerStats={workerStats}
        availability={availability}
        setAvailability={setAvailability}
        notifications={notifications}
        onAcceptRequest={handleAcceptRequest}
        onCompleteRequest={handleCompleteRequest}
        onRejectRequest={handleRejectRequest}
      />
    </DashboardLayout>
  );
};

export default WorkerDashboard;
