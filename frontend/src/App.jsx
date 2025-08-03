import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import "./index.css";
import Home from "./components/common/Home/Home";
import Header from "./components/common/Header";
import About from "./components/common/About";
import Contact from "./components/common/Contact";
import Services from "./components/common/Services"
import Footer from "./components/common/Footer";
import LoginFetch from "./components/Auth/LoginFetch";
import AgentDashboard from "./components/Agents/AgentDashboard";
import AdminDashboard from "./components/Admin/AdminDashboard";
import WorkerDashboard from "./components/Workers/WorkerDashboard";

// ProtectedRoute Component with loading check
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="text-center mt-5">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/LoginFetch" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Role-based dynamic redirect
const RoleDashboard = () => {
  const { user } = useAuth();

  switch (user?.role) {
    case "admin":
      return <AdminDashboard />;
    case "agent":
      return <AgentDashboard />;
    case "worker":
      return <WorkerDashboard />;
    default:
      return <Navigate to="/" replace />;
  }
};

function App() {
  const location = useLocation();
  const hiddenFooterRoutes = [
    "/AdminDashboard",
    "/AgentDashboard",
    "/WorkerDashboard",
  ];
  const shouldShowFooter = !hiddenFooterRoutes.includes(location.pathname);

  const hiddenHeaderRoutes = [
    "/AdminDashboard",
    "/AgentDashboard",
    "/WorkerDashboard",
  ];
  const shouldShowHeader = !hiddenHeaderRoutes.includes(location.pathname);

  return (
    <AuthProvider>
      {shouldShowHeader && < Header /> }

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/About" element={<About />} />
        <Route path="/Contact" element={<Contact />} />
        <Route path="/Services" element={<Services />} />
        <Route path="/LoginFetch" element={<LoginFetch />} />

        {/* Protected Routes */}
        <Route
          path="/AgentDashboard"
          element={
            <ProtectedRoute roles={["agent"]}>
              <AgentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/AdminDashboard"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/WorkerDashboard"
          element={
            <ProtectedRoute roles={["worker"]}>
              <WorkerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <RoleDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
      {shouldShowFooter && <Footer />}
    </AuthProvider>
  );
}


export default App;
