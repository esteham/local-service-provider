/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  FaTachometerAlt,
  FaUsers,
  FaTasks,
  FaChartLine,
  FaCalendarAlt,
  FaBell,
  FaCog,
  FaUserShield,
  FaClipboardList,
  FaMoneyBillWave,
  FaBuilding,
  FaEnvelope,
  FaTools,
  FaUserTie,
  FaEye,
  FaPlus,
  FaEdit,
  FaTrash,
  FaFilter,
  FaSearch,
  FaTimes,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import DashboardLayout from "../common/DashboardLayout";
import DashboardSidebar from "../common/DashboardSidebar";
import StatCard from "../common/StatCard";
import ServiceRequestCard from "../common/ServiceRequestCard";
import WorkerRegistrationModal from "../../pages/Workers/WorkerRegistrationModal";
import CategoryCreateModal from "../../pages/Categories/CategoryCreateModal";
import CategoryEditModal from "../../pages/Categories/CategoryEditModal";
import CreateDivisionModal from "../../pages/Division/CreateDivisionModal";
import EditDivisionModal from "../../pages/Division/EditDivisionModal";
import UserModal from "./modals/UserModal";
import DivisionContent from "./pages/DivisionContent";
import LocationContent from "./pages/LocationContent";
import ErrorBoundary from "../common/ErrorBoundary";
import FinanceContent from "./pages/FinanceContent";
import MessagesContent from "./pages/MessagesContent";
import NotificationsContent from "./pages/NotificationsContent";
import SettingsContent from "./pages/SettingsContent";
import ServicesContent from "./pages/ServicesContent";
import PendingUsersContent from "./pages/PendingUsersContent";

const ModernAdminDashboard = () => {
  const { user, logout } = useAuth();

  //Load active tab from localStorage or default to dashboard
  const [activeTab, setActiveTab] = useState(
    localStorage.getItem("adminActiveTab") || "dashboard"
  );
  const [adminStats, setAdminStats] = useState({});
  const [serviceRequests, setServiceRequests] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [divisions, setDivisions] = useState([]);

  // Modal states
  const [showWorkerModal, setShowWorkerModal] = useState(false);
  const [showCategoryCreateModal, setShowCategoryCreateModal] = useState(false);
  const [showCategoryEditModal, setShowCategoryEditModal] = useState(false);
  const [showDivisionCreateModal, setShowDivisionCreateModal] = useState(false);
  const [showDivisionEditModal, setShowDivisionEditModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showUserEditModal, setShowUserEditModal] = useState(false);
  const [showRequestDetailsModal, setShowRequestDetailsModal] = useState(false);
  const [showWorkerAssignModal, setShowWorkerAssignModal] = useState(false);

  // Edit states
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingDivision, setEditingDivision] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editingWorker, setEditingWorker] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState("");
  const [assignmentNotes, setAssignmentNotes] = useState("");
  const [availableWorkers, setAvailableWorkers] = useState([]);

  // Filter states
  const [requestFilter, setRequestFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [workerFilter, setWorkerFilter] = useState("all");

  // Search states
  const [searchTerm, setSearchTerm] = useState("");

  const BASE_URL = import.meta.env.VITE_API_URL;

  //Handel tab change and persist to localStorage
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    localStorage.setItem("adminActiveTab", tab);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    // Reload data when active tab changes to ensure fresh data
    if (activeTab !== "dashboard") {
      loadTabData(activeTab);
    }
  }, [activeTab]);

  // Real-time updates listener
  useEffect(() => {
    const handleServiceRequestCreated = (event) => {
      console.log('New service request created - Admin Dashboard:', event.detail);
      // Refresh service requests and stats
      loadServiceRequests();
      loadStats();
    };

    const handleServiceRequestUpdate = (event) => {
      console.log('Service request updated - Admin Dashboard:', event.detail);
      // Refresh service requests and stats
      loadServiceRequests();
      loadStats();
    };

    // Listen for real-time updates
    window.addEventListener('serviceRequestCreated', handleServiceRequestCreated);
    window.addEventListener('serviceRequestUpdate', handleServiceRequestUpdate);

    // Auto-refresh every 30 seconds for admin dashboard
    const interval = setInterval(() => {
      if (activeTab === 'dashboard' || activeTab === 'requests') {
        loadServiceRequests();
        loadStats();
      }
    }, 5000);

    return () => {
      window.removeEventListener('serviceRequestCreated', handleServiceRequestCreated);
      window.removeEventListener('serviceRequestUpdate', handleServiceRequestUpdate);
      clearInterval(interval);
    };
  }, [activeTab]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadStats(),
        loadServiceRequests(),
        loadWorkers(),
        loadCategories(),
        loadUsers(),
        loadDivisions(),
        loadNotifications(),
      ]);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const loadTabData = async (tab) => {
    switch (tab) {
      case "users":
        await loadUsers();
        break;
      case "workers":
        await loadWorkers();
        break;
      case "requests":
        await loadServiceRequests();
        break;
      case "categories":
        await loadCategories();
        break;
      case "divisions":
        await loadDivisions();
        break;
      default:
        break;
    }
  };

  const loadStats = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/backend/api/admin/stats.php`,
        {
          withCredentials: true,
        }
      );
      if (response.data.success) {
        setAdminStats(response.data.data || {});
      } else {
        throw new Error("API returned error");
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
      // Fallback stats for demo
      setAdminStats({
        totalUsers: 156,
        activeWorkers: 45,
        totalRequests: 234,
        totalRevenue: 45600,
        pendingApprovals: 12,
        activeSessions: 23,
      });
    }
  };

  const loadServiceRequests = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost";
      const response = await axios.get(
        `${apiUrl}/backend/api/admin/service-requests.php?limit=10`,
        {
          withCredentials: true,
        }
      );
      if (response.data.success) {
        setServiceRequests(response.data.data || []);
      } else {
        throw new Error(response.data.message || "API returned error");
      }
    } catch (error) {
      console.error("Failed to load service requests:", error);
      toast.error(
        "Failed to load service requests. Please check your connection and try again."
      );
      setServiceRequests([]);
    }
  };

  const loadWorkers = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/backend/api/admin/workers.php`,
        {
          withCredentials: true,
        }
      );
      if (response.data.success) {
        setWorkers(response.data.data || []);
      } else {
        throw new Error("API returned error");
      }
    } catch (error) {
      console.error("Failed to load workers:", error);
      // Fallback data for demo
      setWorkers([
        {
          id: 1,
          name: "Alice Wilson",
          email: "alice@example.com",
          phone: "+1234567890",
          specialization: "Plumbing",
          status: "active",
          rating: 4.8,
          completedJobs: 45,
          created_at: "2024-01-10",
        },
        {
          id: 2,
          name: "Bob Brown",
          email: "bob@example.com",
          phone: "+1234567891",
          specialization: "Electrical",
          status: "active",
          rating: 4.6,
          completedJobs: 32,
          created_at: "2024-01-12",
        },
        {
          id: 3,
          name: "Carol Davis",
          email: "carol@example.com",
          phone: "+1234567892",
          specialization: "Cleaning",
          status: "active",
          rating: 4.9,
          completedJobs: 67,
          created_at: "2024-01-14",
        },
      ]);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/backend/api/admin/users.php`,
        {
          withCredentials: true,
        }
      );
      if (response.data.success) {
        setUsers(response.data.data || []);
      } else {
        throw new Error("API returned error");
      }
    } catch (error) {
      console.error("Failed to load users:", error);
      // Fallback data for demo
      setUsers([
        {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          role: "customer",
          status: "active",
          created_at: "2024-01-15",
        },
        {
          id: 2,
          name: "Jane Smith",
          email: "jane@example.com",
          role: "worker",
          status: "active",
          created_at: "2024-01-20",
        },
        {
          id: 3,
          name: "Mike Johnson",
          email: "mike@example.com",
          role: "agent",
          status: "active",
          created_at: "2024-01-25",
        },
      ]);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/backend/api/admin/categories.php`,
        {
          withCredentials: true,
        }
      );
      if (response.data.success) {
        setCategories(response.data.data || []);
      } else {
        throw new Error("API returned error");
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
      // Fallback data for demo
      setCategories([
        {
          id: 1,
          name: "Plumbing",
          description: "Plumbing services",
          active: true,
        },
        {
          id: 2,
          name: "Electrical",
          description: "Electrical services",
          active: true,
        },
        {
          id: 3,
          name: "Cleaning",
          description: "Cleaning services",
          active: true,
        },
        {
          id: 4,
          name: "Gardening",
          description: "Garden maintenance",
          active: true,
        },
      ]);
    }
  };

  const loadDivisions = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/backend/api/admin/divisions.php`,
        {
          withCredentials: true,
        }
      );
      if (response.data.success) {
        setDivisions(response.data.data || []);
      } else {
        throw new Error("API returned error");
      }
    } catch (error) {
      console.error("Failed to load divisions:", error);
      // Fallback data for demo
      setDivisions([
        {
          id: 1,
          name: "North Division",
          description: "Covers northern areas of the city",
          manager: "John Smith",
          workers_count: 15,
          active_requests: 8,
        },
        {
          id: 2,
          name: "South Division",
          description: "Covers southern areas of the city",
          manager: "Sarah Johnson",
          workers_count: 12,
          active_requests: 5,
        },
        {
          id: 3,
          name: "East Division",
          description: "Covers eastern areas of the city",
          manager: "Mike Wilson",
          workers_count: 18,
          active_requests: 12,
        },
      ]);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/backend/api/admin/notifications.php`,
        {
          withCredentials: true,
        }
      );
      if (response.data.success) {
        setNotifications(response.data.data || []);
      } else {
        throw new Error("API returned error");
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
      // Fallback data for demo
      setNotifications([
        {
          id: 1,
          title: "New Service Request",
          message: "A new plumbing request has been submitted",
          type: "info",
          priority: "medium",
          read: false,
          created_at: "2024-01-15T10:30:00Z",
        },
        {
          id: 2,
          title: "Worker Registration",
          message: "New worker Alice Wilson has registered",
          type: "success",
          priority: "low",
          read: false,
          created_at: "2024-01-16T14:20:00Z",
        },
      ]);
    }
  };

  const loadWorkersForZoneArea = async (zoneId, areaId) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost";
      let url = `${apiUrl}/backend/api/admin/workers.php?status=active`;

      // Add zone/area filtering parameters
      if (areaId) {
        url += `&area_id=${areaId}`;
      } else if (zoneId) {
        url += `&zone_id=${zoneId}`;
      }

      const response = await axios.get(url, {
        withCredentials: true,
      });

      if (response.data.success) {
        setAvailableWorkers(response.data.data || []);
      } else {
        throw new Error(response.data.message || "API returned error");
      }
    } catch (error) {
      console.error("Failed to load workers for zone/area:", error);
      toast.error("Failed to load available workers. Please try again.");
      setAvailableWorkers([]);
    }
  };

  const handleLogout = () => {
    logout();
  };

  // CRUD Operations for Users
  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await axios.delete(
          `${BASE_URL}/backend/api/admin/users.php`,
          {
            data: { id: userId },
            withCredentials: true,
          }
        );
        if (response.data.success) {
          toast.success("User deleted successfully");
          loadUsers();
        } else {
          toast.error(response.data.message || "Failed to delete user");
        }
      } catch (error) {
        console.error("Failed to delete user:", error);
        toast.error("Failed to delete user");
      }
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowUserEditModal(true);
  };

  // CRUD Operations for Workers
  const handleDeleteWorker = async (workerId) => {
    if (window.confirm("Are you sure you want to delete this worker?")) {
      try {
        const response = await axios.delete(
          `${BASE_URL}/backend/api/admin/workers.php`,
          {
            data: { id: workerId },
            withCredentials: true,
          }
        );
        if (response.data.success) {
          toast.success("Worker deleted successfully");
          loadWorkers();
        } else {
          toast.error(response.data.message || "Failed to delete worker");
        }
      } catch (error) {
        console.error("Failed to delete worker:", error);
        toast.error("Failed to delete worker");
      }
    }
  };

  const handleEditWorker = (worker) => {
    setEditingWorker(worker);
    // You can create a WorkerEditModal similar to other edit modals
    toast.info("Worker editing functionality can be implemented");
  };

  const handleViewWorker = (worker) => {
    // Navigate to worker details or show worker details modal
    toast.info(`Viewing details for ${worker.name}`);
  };

  // CRUD Operations for Categories
  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        const response = await axios.post(
          `${BASE_URL}/backend/api/categories/delete.php`,
          {
            id: categoryId,
          },
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        if (response.data.success) {
          toast.success("Category deleted successfully");
          loadCategories();
        } else {
          toast.error(response.data.message || "Failed to delete category");
        }
      } catch (error) {
        console.error("Failed to delete category:", error);
        toast.error("Failed to delete category");
      }
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setShowCategoryEditModal(true);
  };

  // CRUD Operations for Divisions
  const handleDeleteDivision = async (divisionId) => {
    if (window.confirm("Are you sure you want to delete this division?")) {
      try {
        const response = await axios.delete(
          `${BASE_URL}/backend/api/admin/divisions.php`,
          {
            data: { id: divisionId },
            withCredentials: true,
          }
        );
        if (response.data.success) {
          toast.success("Division deleted successfully");
          loadDivisions();
        } else {
          toast.error(response.data.message || "Failed to delete division");
        }
      } catch (error) {
        console.error("Failed to delete division:", error);
        toast.error("Failed to delete division");
      }
    }
  };

  const handleEditDivision = (division) => {
    setEditingDivision(division);
    setShowDivisionEditModal(true);
  };

  // Service Request Operations
  const handleViewRequestDetails = (request) => {
    setSelectedRequest(request);
    setShowRequestDetailsModal(true);
  };

  const handleManageRequest = async (requestId, action) => {
    try {
      let response;

      if (action === "assign") {
        // For assign action, we need to show worker assignment modal
        const request = serviceRequests.find((r) => r.id === requestId);
        setSelectedRequest(request);

        // Automatically load workers for the request's zone/area
        if (request && (request.area_id || request.zone_id)) {
          await loadWorkersForZoneArea(request.zone_id, request.area_id);
        } else {
          // Fallback to all active workers if no zone/area info
          await loadWorkersForZoneArea(null, null);
        }

        setShowWorkerAssignModal(true);
        return;
      }

      // For other actions, update the status
      const statusMap = {
        reject: "cancelled",
        complete: "completed",
        approve: "assigned",
      };

      const newStatus = statusMap[action] || action;

      response = await axios.put(
        `${BASE_URL}/backend/api/admin/service-requests.php?id=${requestId}`,
        {
          action: "update_status",
          status: newStatus,
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success(`Request ${action}ed successfully`);
        loadServiceRequests();
        
        // Trigger real-time update event
        window.dispatchEvent(new CustomEvent('serviceRequestUpdate', {
          detail: {
            requestId: requestId,
            action: action,
            newStatus: newStatus,
            timestamp: new Date().toISOString()
          }
        }));
      } else {
        toast.error(response.data.message || `Failed to ${action} request`);
      }
    } catch (error) {
      console.error(`Failed to ${action} request:`, error);
      toast.error(`Failed to ${action} request`);
    }
  };

  const handleAssignWorker = async () => {
    if (!selectedWorker) {
      toast.error("Please select a worker");
      return;
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/backend/api/admin/assign_worker.php`,
        {
          request_id: selectedRequest.id,
          worker_id: selectedWorker,
          notes: assignmentNotes,
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success("Worker assigned successfully");
        setShowWorkerAssignModal(false);
        setSelectedWorker("");
        setAssignmentNotes("");
        setSelectedRequest(null);
        setAvailableWorkers([]);
        loadServiceRequests();
      } else {
        toast.error(response.data.message || "Failed to assign worker");
      }
    } catch (error) {
      console.error("Failed to assign worker:", error);
      toast.error("Failed to assign worker");
    }
  };

  // Modal close handlers
  const handleCloseWorkerModal = () => {
    setShowWorkerModal(false);
    setEditingWorker(null);
  };

  const handleCloseRequestDetailsModal = () => {
    setShowRequestDetailsModal(false);
    setSelectedRequest(null);
  };

  const handleCloseWorkerAssignModal = () => {
    setShowWorkerAssignModal(false);
    setSelectedRequest(null);
    setSelectedWorker("");
    setAssignmentNotes("");
    setAvailableWorkers([]);
  };

  const handleCloseCategoryModal = () => {
    setShowCategoryCreateModal(false);
    loadCategories(); // Refresh categories list
  };

  const handleCloseCategoryEditModal = () => {
    setShowCategoryEditModal(false);
    setEditingCategory(null);
    loadCategories(); // Refresh categories list
  };

  const handleCloseDivisionModal = () => {
    setShowDivisionCreateModal(false);
    loadDivisions(); // Refresh divisions list
  };

  const handleCloseDivisionEditModal = () => {
    setShowDivisionEditModal(false);
    setEditingDivision(null);
    loadDivisions(); // Refresh divisions list
  };

  // Filter functions
  const getFilteredServiceRequests = () => {
    let filtered = serviceRequests;

    if (requestFilter !== "all") {
      filtered = filtered.filter((request) => request.status === requestFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (request) =>
          request.service_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          request.customer_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          request.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const getFilteredUsers = () => {
    let filtered = users;

    if (userFilter !== "all") {
      filtered = filtered.filter((user) => user.role === userFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const getFilteredWorkers = () => {
    let filtered = workers;

    if (workerFilter !== "all") {
      filtered = filtered.filter((worker) => worker.status === workerFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (worker) =>
          worker.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          worker.specialization
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: FaTachometerAlt },
    { id: "users", label: "User Management", icon: FaUsers },
    { id: "pending-users", label: "Pending Users", icon: FaUserShield },
    { id: "workers", label: "Worker Management", icon: FaUserTie },
    { id: "requests", label: "Service Requests", icon: FaTasks },
    // { id: "categories", label: "Categories", icon: FaClipboardList },
    { id: "services", label: "Services", icon: FaTools },
    { id: "locations", label: "Locations", icon: FaBuilding },
    { id: "analytics", label: "Analytics", icon: FaChartLine },
    { id: "finances", label: "Finances", icon: FaMoneyBillWave },
    { id: "schedule", label: "Schedule", icon: FaCalendarAlt },
    { id: "messages", label: "Messages", icon: FaEnvelope },
    { id: "notifications", label: "Notifications", icon: FaBell },
    { id: "settings", label: "Settings", icon: FaCog },
  ];

  const renderSidebar = () => (
    <DashboardSidebar
      title="Admin Panel"
      menuItems={menuItems}
      activeTab={activeTab}
      setActiveTab={handleTabChange}
      onLogout={handleLogout}
      avatarIcon={FaUserShield}
      gradientColors={["#3f7567ff", "#292c0eff"]}
      statusBadge={{ type: "online", text: "Administrator" }}
      userInfo={{ name: user?.username }}
    />
  );

  const renderDashboard = () => (
    <div className="admin-dashboard-content">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back, {user?.username}! Here's your system overview.</p>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Users"
          value={users.length || 0}
          icon={FaUsers}
          color="primary"
          delay={0.1}
          onClick={() => setActiveTab("users")}
        />

        <StatCard
          title="Active Workers"
          value={workers.filter((w) => w.status === "active").length || 0}
          icon={FaUserTie}
          color="success"
          delay={0.2}
          onClick={() => setActiveTab("workers")}
        />

        <StatCard
          title="Service Requests"
          value={serviceRequests.length || 0}
          icon={FaTasks}
          color="warning"
          delay={0.3}
          onClick={() => setActiveTab("requests")}
        />

        <StatCard
          title="Total Revenue"
          value={`$${
            adminStats.totalRevenue ||
            serviceRequests.reduce((sum, req) => sum + (parseFloat(req.price) || 0), 0).toFixed(2)
          }`}
          icon={FaMoneyBillWave}
          color="purple"
          delay={0.4}
          onClick={() => setActiveTab("finances")}
        />
      </div>

      <div className="dashboard-grid">
        <div className="recent-requests">
          <div className="section-header">
            <h3>Recent Service Requests</h3>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setActiveTab("requests")}
            >
              <FaEye /> View All ({serviceRequests.length})
            </button>
          </div>
          <div className="requests-list">
            {serviceRequests.slice(0, 3).map((request) => (
              <ServiceRequestCard
                key={request.id}
                request={request}
                userRole="admin"
                onViewDetails={handleViewRequestDetails}
                onAssign={(id) => handleManageRequest(id, "assign")}
              />
            ))}
            {serviceRequests.length === 0 && (
              <div className="no-data">
                <p>No service requests found</p>
              </div>
            )}
          </div>
        </div>

        <div className="system-overview">
          <h3>System Overview</h3>
          <div className="overview-stats">
            <div
              className="overview-item"
              onClick={() => setActiveTab("categories")}
            >
              <span className="overview-label">Categories</span>
              <span className="overview-value">{categories.length}</span>
            </div>
            <div
              className="overview-item"
              onClick={() => setActiveTab("divisions")}
            >
              <span className="overview-label">Divisions</span>
              <span className="overview-value">{divisions.length}</span>
            </div>
            <div className="overview-item">
              <span className="overview-label">Pending Requests</span>
              <span className="overview-value">
                {serviceRequests.filter((r) => r.status === "pending").length}
              </span>
            </div>
            <div className="overview-item">
              <span className="overview-label">Notifications</span>
              <span className="overview-value">
                {notifications.filter((n) => !n.isRead).length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => {
    const filteredUsers = getFilteredUsers();

    return (
      <div className="users-content">
        <div className="content-header">
          <h2>User Management ({users.length})</h2>
          <button
            className="btn btn-primary"
            onClick={() => setShowUserModal(true)}
          >
            <FaPlus /> Add New User
          </button>
        </div>

        <div className="filters-section">
          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="clear-search"
                onClick={() => setSearchTerm("")}
              >
                <FaTimes />
              </button>
            )}
          </div>

          <div className="filter-tabs">
            <button
              className={`filter-tab ${userFilter === "all" ? "active" : ""}`}
              onClick={() => setUserFilter("all")}
            >
              All ({users.length})
            </button>
            <button
              className={`filter-tab ${userFilter === "admin" ? "active" : ""}`}
              onClick={() => setUserFilter("admin")}
            >
              Admins ({users.filter((u) => u.role === "admin").length})
            </button>
            <button
              className={`filter-tab ${
                userFilter === "worker" ? "active" : ""
              }`}
              onClick={() => setUserFilter("worker")}
            >
              Workers ({users.filter((u) => u.role === "worker").length})
            </button>
            <button
              className={`filter-tab ${
                userFilter === "customer" ? "active" : ""
              }`}
              onClick={() => setUserFilter("customer")}
            >
              Customers ({users.filter((u) => u.role === "customer").length})
            </button>
          </div>
        </div>

        <div className="users-grid">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div key={user.id} className="user-card">
                <div className="user-info d-flex justify-content-between align-items-center">
                  <h4 className="mb-0">
                    {user.name || user.first_name + " " + user.last_name}
                  </h4>
                  <p className={`role-badge ${user.role} mb-0`}>{user.role}</p>
                </div>
                <br/>
                {user.created_at && (
                  <small>
                    Joined: &nbsp;{new Date(user.created_at).toLocaleDateString()}
                  </small>
                )}
                <p>{user.email}</p>
                <div className="user-actions">
                  <button
                    className="btn btn-sm btn-info"
                    onClick={() => handleEditUser(user)}
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-data">
              <FaUsers size={48} color="#e5e7eb" />
              <h3>No users found</h3>
              <p>
                {searchTerm
                  ? "Try adjusting your search criteria"
                  : "No users available"}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderWorkers = () => {
    const filteredWorkers = getFilteredWorkers();

    return (
      <div className="workers-content">
        <div className="content-header">
          <h2>Worker Management ({workers.length})</h2>
          <button
            className="btn btn-primary"
            onClick={() => setShowWorkerModal(true)}
          >
            <FaPlus /> Add New Worker
          </button>
        </div>

        <div className="filters-section">
          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search workers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="clear-search"
                onClick={() => setSearchTerm("")}
              >
                <FaTimes />
              </button>
            )}
          </div>

          <div className="filter-tabs">
            <button
              className={`filter-tab ${workerFilter === "all" ? "active" : ""}`}
              onClick={() => setWorkerFilter("all")}
            >
              All ({workers.length})
            </button>
            <button
              className={`filter-tab ${
                workerFilter === "active" ? "active" : ""
              }`}
              onClick={() => setWorkerFilter("active")}
            >
              Active ({workers.filter((w) => w.status === "active").length})
            </button>
            <button
              className={`filter-tab ${
                workerFilter === "inactive" ? "active" : ""
              }`}
              onClick={() => setWorkerFilter("inactive")}
            >
              Inactive ({workers.filter((w) => w.status === "inactive").length})
            </button>
            <button
              className={`filter-tab ${
                workerFilter === "busy" ? "active" : ""
              }`}
              onClick={() => setWorkerFilter("busy")}
            >
              Busy ({workers.filter((w) => w.status === "busy").length})
            </button>
          </div>
        </div>

        <div className="workers-grid">
          {filteredWorkers.length > 0 ? (
            filteredWorkers.map((worker) => (
              <div key={worker.id} className="worker-card">
                <div className="worker-info">
                  <h4>
                    {worker.name || worker.first_name + " " + worker.last_name}
                  </h4>
                  <p>{worker.specialization || worker.category_name}</p>
                  <span className={`status-badge ${worker.status || "active"}`}>
                    {worker.status || "active"}
                  </span>
                </div>
                <div className="worker-stats">
                  <span>Rating: {worker.rating || "4.0"}/5</span>
                  <span>
                    Jobs: {worker.completedJobs || worker.completed_jobs || 0}
                  </span>
                  {worker.phone && <span>Phone: {worker.phone}</span>}
                </div>
                <div className="worker-actions">
                  <button
                    className="btn btn-sm btn-info"
                    onClick={() => handleViewWorker(worker)}
                  >
                    <FaEye /> View
                  </button>
                  <button
                    className="btn btn-sm btn-warning"
                    onClick={() => handleEditWorker(worker)}
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteWorker(worker.id)}
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-data">
              <FaUserTie size={48} color="#e5e7eb" />
              <h3>No workers found</h3>
              <p>
                {searchTerm
                  ? "Try adjusting your search criteria"
                  : "No workers available"}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderRequests = () => {
    const filteredRequests = getFilteredServiceRequests();

    return (
      <div className="requests-content">
        <div className="content-header">
          <h2>Service Requests Management ({serviceRequests.length})</h2>
          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="clear-search"
                onClick={() => setSearchTerm("")}
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>

        <div className="request-filters">
          <button
            className={`filter-btn ${requestFilter === "all" ? "active" : ""}`}
            onClick={() => setRequestFilter("all")}
          >
            All ({serviceRequests.length})
          </button>
          <button
            className={`filter-btn ${
              requestFilter === "pending" ? "active" : ""
            }`}
            onClick={() => setRequestFilter("pending")}
          >
            Pending (
            {serviceRequests.filter((r) => r.status === "pending").length})
          </button>
          <button
            className={`filter-btn ${
              requestFilter === "assigned" ? "active" : ""
            }`}
            onClick={() => setRequestFilter("assigned")}
          >
            Assigned (
            {serviceRequests.filter((r) => r.status === "assigned").length})
          </button>
          <button
            className={`filter-btn ${
              requestFilter === "completed" ? "active" : ""
            }`}
            onClick={() => setRequestFilter("completed")}
          >
            Completed (
            {serviceRequests.filter((r) => r.status === "completed").length})
          </button>
          <button
            className={`filter-btn ${
              requestFilter === "cancelled" ? "active" : ""
            }`}
            onClick={() => setRequestFilter("cancelled")}
          >
            Cancelled (
            {serviceRequests.filter((r) => r.status === "cancelled").length})
          </button>
        </div>

        <div className="requests-grid">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((request) => (
              <ServiceRequestCard
                key={request.id}
                request={request}
                userRole="admin"
                onViewDetails={handleViewRequestDetails}
                onAssign={(id) => handleManageRequest(id, "assign")}
                onReject={(id) => handleManageRequest(id, "reject")}
                onComplete={(id) => handleManageRequest(id, "complete")}
              />
            ))
          ) : (
            <div className="no-data">
              <FaTasks size={48} color="#e5e7eb" />
              <h3>No service requests found</h3>
              <p>
                {searchTerm
                  ? "Try adjusting your search criteria"
                  : "No service requests available"}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCategories = () => (
    <div className="categories-content">
      <div className="content-header">
        <h2>Categories Management ({categories.length})</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowCategoryCreateModal(true)}
        >
          <FaPlus /> Add Category
        </button>
      </div>
      <div className="categories-grid">
        {categories.length > 0 ? (
          categories.map((category) => (
            <div key={category.id} className="category-card">
              <div className="category-info">
                <h4>{category.name}</h4>
                <p>{category.description}</p>
                {category.created_at && (
                  <small>
                    Created:{" "}
                    {new Date(category.created_at).toLocaleDateString()}
                  </small>
                )}
              </div>
              <div className="category-actions">
                <button
                  className="btn btn-sm btn-info"
                  onClick={() => handleEditCategory(category)}
                >
                  <FaEdit /> Edit
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDeleteCategory(category.id)}
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-data">
            <FaClipboardList size={48} color="#e5e7eb" />
            <h3>No categories found</h3>
            <p>Create your first service category</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboard();
      case "users":
        return renderUsers();
      case "pending-users":
        return <PendingUsersContent />;
      case "workers":
        return renderWorkers();
      case "requests":
        return renderRequests();
      case "categories":
        return renderCategories();
      case "services":
        return <ServicesContent />;
      case "divisions":
        return <DivisionContent />;
      case "locations":
        return (
          <ErrorBoundary>
            <LocationContent />
          </ErrorBoundary>
        );
      case "analytics":
        return (
          <div className="placeholder-content">
            <h2>Analytics Dashboard</h2>
            <p>Advanced analytics and reporting features coming soon...</p>
          </div>
        );
      case "finances":
        return <FinanceContent />;
      case "schedule":
        return (
          <div className="placeholder-content">
            <h2>Schedule Management</h2>
            <p>Advanced scheduling features coming soon...</p>
          </div>
        );
      case "messages":
        return <MessagesContent />;
      case "notifications":
        return <NotificationsContent />;
      case "settings":
        return <SettingsContent />;
      default:
        return renderDashboard();
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <DashboardLayout sidebar={renderSidebar()}>
      {renderContent()}

      {showCategoryCreateModal && (
        <CategoryCreateModal
          show={showCategoryCreateModal}
          onHide={() => setShowCategoryCreateModal(false)}
          onCategoryCreated={() => {
            setShowCategoryCreateModal(false);
            loadCategories();
            toast.success("Category created successfully!");
          }}
        />
      )}

      {showCategoryEditModal && editingCategory && (
        <CategoryEditModal
          show={showCategoryEditModal}
          onHide={() => {
            setShowCategoryEditModal(false);
            setEditingCategory(null);
          }}
          category={editingCategory}
          onCategoryUpdated={() => {
            setShowCategoryEditModal(false);
            setEditingCategory(null);
            loadCategories();
            toast.success("Category updated successfully!");
          }}
        />
      )}

      {showDivisionCreateModal && (
        <CreateDivisionModal
          show={showDivisionCreateModal}
          onHide={() => setShowDivisionCreateModal(false)}
          onDivisionCreated={() => {
            setShowDivisionCreateModal(false);
            loadDivisions();
            toast.success("Division created successfully!");
          }}
        />
      )}

      {showDivisionEditModal && editingDivision && (
        <EditDivisionModal
          show={showDivisionEditModal}
          onHide={() => {
            setShowDivisionEditModal(false);
            setEditingDivision(null);
          }}
          division={editingDivision}
          onDivisionUpdated={() => {
            setShowDivisionEditModal(false);
            setEditingDivision(null);
            loadDivisions();
            toast.success("Division updated successfully!");
          }}
        />
      )}

      {/* Worker Registration Modal */}
      <WorkerRegistrationModal
        show={showWorkerModal}
        handleClose={handleCloseWorkerModal}
      />

      {/* User Modal */}
      <UserModal
        show={showUserModal}
        handleClose={() => {
          setShowUserModal(false);
          loadUsers();
        }}
      />

      {/* User Edit Modal */}
      <UserModal
        show={showUserEditModal}
        handleClose={() => {
          setShowUserEditModal(false);
          setEditingUser(null);
          loadUsers();
        }}
        user={editingUser}
      />

      {/* Service Request Details Modal */}
      {showRequestDetailsModal && selectedRequest && (
        <div className="modal-overlay" onClick={handleCloseRequestDetailsModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Service Request Details</h3>
              <button
                className="close-btn"
                onClick={handleCloseRequestDetailsModal}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="request-details-grid">
                <div className="detail-group">
                  <label>Request ID:</label>
                  <span>#{selectedRequest.id}</span>
                </div>
                <div className="detail-group">
                  <label>Service:</label>
                  <span>{selectedRequest.service_name}</span>
                </div>
                <div className="detail-group">
                  <label>Customer:</label>
                  <span>{selectedRequest.customer_name}</span>
                </div>
                <div className="detail-group">
                  <label>Phone:</label>
                  <span>{selectedRequest.phone}</span>
                </div>
                <div className="detail-group">
                  <label>Address:</label>
                  <span>{selectedRequest.address}</span>
                </div>
                <div className="detail-group">
                  <label>Status:</label>
                  <span
                    className={`status-badge status-${selectedRequest.status}`}
                  >
                    {selectedRequest.status}
                  </span>
                </div>
                <div className="detail-group">
                  <label>Price:</label>
                  <span className="price-amount">${selectedRequest.price}</span>
                </div>
                <div className="detail-group">
                  <label>Requested Date:</label>
                  <span>
                    {new Date(
                      selectedRequest.requested_date
                    ).toLocaleDateString()}
                  </span>
                </div>
                {selectedRequest.description && (
                  <div className="detail-group full-width">
                    <label>Description:</label>
                    <p>{selectedRequest.description}</p>
                  </div>
                )}
                {selectedRequest.worker_name && (
                  <div className="detail-group">
                    <label>Assigned Worker:</label>
                    <span>{selectedRequest.worker_name}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={handleCloseRequestDetailsModal}
              >
                Close
              </button>
              {selectedRequest.status === "pending" && (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    handleCloseRequestDetailsModal();
                    handleManageRequest(selectedRequest.id, "assign");
                  }}
                >
                  Assign Worker
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Worker Assignment Modal */}
      {showWorkerAssignModal && selectedRequest && (
        <div className="modal-overlay" onClick={handleCloseWorkerAssignModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Assign Worker to Request #{selectedRequest.id}</h3>
              <button
                className="close-btn"
                onClick={handleCloseWorkerAssignModal}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="request-summary">
                <h4>{selectedRequest.service_name}</h4>
                <p>
                  <strong>Customer:</strong> {selectedRequest.customer_name}
                </p>
                <p>
                  <strong>Address:</strong> {selectedRequest.address}
                </p>
                <p>
                  <strong>Zone:</strong> {selectedRequest.zone_name || "N/A"}
                </p>
                <p>
                  <strong>Area:</strong> {selectedRequest.area_name || "N/A"}
                </p>
                <p>
                  <strong>Price:</strong> ${selectedRequest.price}
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="worker-select">
                  Select Worker{" "}
                  {selectedRequest.area_name
                    ? `(${selectedRequest.area_name} Area)`
                    : selectedRequest.zone_name
                    ? `(${selectedRequest.zone_name} Zone)`
                    : ""}
                  :
                </label>
                <select
                  id="worker-select"
                  value={selectedWorker}
                  onChange={(e) => setSelectedWorker(e.target.value)}
                  className="form-control"
                >
                  <option value="">Choose a worker...</option>
                  {availableWorkers.length > 0 ? (
                    availableWorkers.map((worker) => (
                      <option key={worker.id} value={worker.id}>
                        {worker.name} - {worker.specialization}
                        {worker.area_name && ` (${worker.area_name})`}
                        {!worker.area_name &&
                          worker.zone_name &&
                          ` (${worker.zone_name})`}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      No workers available in this area/zone
                    </option>
                  )}
                </select>
                {availableWorkers.length === 0 && (
                  <small className="text-muted">
                    No workers found for{" "}
                    {selectedRequest.area_name ||
                      selectedRequest.zone_name ||
                      "this location"}
                    . Consider expanding search to nearby areas.
                  </small>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="assignment-notes">
                  Assignment Notes (Optional):
                </label>
                <textarea
                  id="assignment-notes"
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
                  className="form-control"
                  rows="3"
                  placeholder="Add any special instructions or notes for the worker..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={handleCloseWorkerAssignModal}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleAssignWorker}
                disabled={!selectedWorker}
              >
                Assign Worker
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-dashboard-content {
          max-width: 1400px;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          gap: 1rem;
        }

        .dashboard-header {
          margin-bottom: 2rem;
        }

        .dashboard-header h1 {
          margin: 0;
          color: #1f2937;
          font-size: 2.5rem;
          font-weight: 700;
        }

        .dashboard-header p {
          margin: 0.5rem 0 0 0;
          color: #6b7280;
          font-size: 1.1rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .recent-requests,
        .system-overview {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .section-header h3 {
          margin: 0;
          color: #1f2937;
        }

        .overview-stats {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .overview-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: #f8fafc;
          border-radius: 8px;
        }

        .overview-label {
          color: #6b7280;
          font-weight: 500;
        }

        .overview-value {
          color: #1f2937;
          font-weight: 700;
          font-size: 1.1rem;
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
        }

        .users-grid,
        .workers-grid,
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .user-card,
        .worker-card,
        .category-card {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .user-card:hover,
        .worker-card:hover,
        .category-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }

        .user-info h4,
        .worker-info h4,
        .category-info h4 {
          margin: 0 0 0.5rem 0;
          color: #1f2937;
        }

        .user-info p,
        .worker-info p,
        .category-info p {
          margin: 0 0 1rem 0;
          color: #6b7280;
        }

        .role-badge,
        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .role-badge.admin {
          background: #fee2e2;
          color: #dc2626;
        }
        .role-badge.worker {
          background: #dbeafe;
          color: #2563eb;
        }
        .role-badge.user {
          background: #d1fae5;
          color: #059669;
        }

        .status-badge.active {
          background: #d1fae5;
          color: #059669;
        }
        .status-badge.inactive {
          background: #fee2e2;
          color: #dc2626;
        }
        .status-badge.busy {
          background: #fef3c7;
          color: #d97706;
        }

        .worker-stats {
          display: flex;
          gap: 1rem;
          margin: 1rem 0;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .user-actions,
        .worker-actions,
        .category-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .requests-content {
          max-width: 1200px;
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
          background: #dc2626;
          border-color: #dc2626;
          color: white;
        }

        .requests-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .placeholder-content {
          background: white;
          padding: 3rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          text-align: center;
        }

        .placeholder-content h2 {
          color: #1f2937;
          margin-bottom: 1rem;
        }

        .placeholder-content p {
          color: #6b7280;
          font-size: 1.1rem;
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
        }

        .btn-sm {
          padding: 0.375rem 0.75rem;
          font-size: 0.875rem;
        }

        .btn-primary {
          background: #dc2626;
          color: white;
        }
        .btn-info {
          background: #06b6d4;
          color: white;
        }
        .btn-warning {
          background: #f59e0b;
          color: white;
        }
        .btn-danger {
          background: #ef4444;
          color: white;
        }

        .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        @media (max-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .users-grid,
          .workers-grid,
          .categories-grid,
          .requests-grid {
            grid-template-columns: 1fr;
          }

          .content-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .request-filters {
            flex-wrap: wrap;
          }
        }

        .filters-section {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .search-box {
          display: flex;
          align-items: center;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 0.5rem 1rem;
          gap: 0.5rem;
          min-width: 300px;
        }

        .search-box input {
          border: none;
          outline: none;
          flex: 1;
          font-size: 0.9rem;
        }

        .clear-search {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 0.25rem;
        }

        .filter-tabs {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .filter-tab {
          padding: 0.5rem 1rem;
          border: 1px solid #e5e7eb;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.875rem;
        }

        .filter-tab.active {
          background: #dc2626;
          border-color: #dc2626;
          color: white;
        }

        .filter-tab:hover:not(.active) {
          background: #f8fafc;
        }

        .no-data {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          text-align: center;
          gap: 1rem;
          grid-column: 1 / -1;
        }

        .no-data h3 {
          margin: 0;
          color: #6b7280;
        }

        .no-data p {
          margin: 0;
          color: #9ca3af;
        }

        .user-info small,
        .category-info small {
          display: block;
          color: #6b7280;
          font-size: 0.75rem;
          margin-top: 0.5rem;
        }

        .worker-stats {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          margin: 1rem 0;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .overview-item {
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .overview-item:hover {
          background: #f1f5f9;
        }

        @media (max-width: 768px) {
          .filters-section {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box {
            min-width: auto;
          }

          .filter-tabs {
            justify-content: center;
          }
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          max-width: auto;
          max-height: auto;
          overflow-y: auto;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-header h3 {
          margin: 0;
          color: #1f2937;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .close-btn {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .close-btn:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          padding: 1.5rem;
          border-top: 1px solid #e5e7eb;
        }

        .request-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .detail-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .detail-group.full-width {
          grid-column: 1 / -1;
        }

        .detail-group label {
          font-weight: 600;
          color: #374151;
          font-size: 0.875rem;
        }

        .detail-group span,
        .detail-group p {
          color: #6b7280;
          margin: 0;
        }

        .price-amount {
          color: #059669 !important;
          font-weight: 600 !important;
          font-size: 1.1rem !important;
        }

        .request-summary {
          background: #f8fafc;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }

        .request-summary h4 {
          margin: 0 0 0.5rem 0;
          color: #1f2937;
        }

        .request-summary p {
          margin: 0.25rem 0;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #374151;
        }

        .form-control {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
          transition: border-color 0.2s ease;
        }

        .form-control:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .btn-secondary {
          background: #6b7280;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .btn-secondary:hover {
          background: #4b5563;
        }

        .btn-primary:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .btn-primary:disabled:hover {
          background: #9ca3af;
          transform: none;
        }

        .status-pending {
          background: #fef3c7;
          color: #92400e;
        }

        .status-assigned {
          background: #dbeafe;
          color: #1e40af;
        }

        .status-in_progress {
          background: #dbeafe;
          color: #1e40af;
        }

        .status-completed {
          background: #d1fae5;
          color: #065f46;
        }

        .status-cancelled {
          background: #f3f4f6;
          color: #6b7280;
        }

        .text-muted {
          color: #6b7280 !important;
          font-size: 0.875rem;
          margin-top: 0.5rem;
          display: block;
        }

        @media (max-width: 768px) {
          .modal-content {
            width: 95%;
            margin: 1rem;
          }

          .request-details-grid {
            grid-template-columns: 1fr;
          }

          .modal-footer {
            flex-direction: column;
          }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default ModernAdminDashboard;
