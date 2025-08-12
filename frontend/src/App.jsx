import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from "./context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import 'react-toastify/dist/ReactToastify.css';
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "react-datepicker/dist/react-datepicker.css";

import "./index.css";
import Home from "./components/common/Home/Home";
import Header from "./components/common/Header";
import About from "./components/common/About";
import Contact from "./components/common/Contact";
import Services from "./components/common/Services";
import Footer from "./components/common/Footer";
import BDlaw from "./components/common/Law/BDlaw";
import USlaw from "./components/common/Law/USlaw";
import Demolaw from "./components/common/Law/Demolaw";
import LoginFetch from "./components/Auth/LoginFetch"; 
import AgentDashboard from "./components/Agents/AgentDashboard";
import AdminDashboard from "./components/Admin/AdminDashboard";
import WorkerDashboard from "./components/Workers/WorkerDashboard";
import UserProfile from "./components/User/UserProfile";

// ProtectedRoute Component
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center mt-5"><p>Loading...</p></div>;
  }

  if (!user) {
    return <Navigate to="/" replace />; // 🔁 redirect to home if not logged in
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

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
  const [showLogin, LoginFetchModal] = useState(false); //Control modal visibility

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
      {shouldShowHeader && <Header onLoginClick={() => LoginFetchModal(true)} />}

      <Routes>
        <Route path="/" element={<Home onLoginClick={() => LoginFetchModal(true)} />} />
        <Route path="/About" element={<About />} />
        <Route path="/Contact" element={<Contact />} />
        <Route path="/Services" element={<Services />} />
        <Route path="/law/BDlaw" element={<BDlaw />} />
        <Route path="/law/USlaw" element={<USlaw />} />
        <Route path="/law/Demolaw" element={<Demolaw />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-requests"
          element={
            <ProtectedRoute>
              <UserProfile initialSection="requests" />
            </ProtectedRoute>
          }
        />

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
          path="/dashboard"
          element={
            <ProtectedRoute>
              <RoleDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
      <LoginFetch show={showLogin} onHide={() => LoginFetchModal(false)} />

      {shouldShowFooter && <Footer />}
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
    </AuthProvider>
  );
}

export default App;
