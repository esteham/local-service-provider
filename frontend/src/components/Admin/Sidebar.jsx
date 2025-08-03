import React, { useState, useEffect } from "react";
import { Nav, Col, Tooltip, OverlayTrigger, Badge } from "react-bootstrap";
import {
  GearFill,
  PeopleFill,
  FolderFill,
  HouseFill,
  CashStack,
  Building,
  ArrowRightShort,
  ArrowLeftShort,
  BellFill,
  EnvelopeFill,
  BoxArrowRight,
  MoonFill,
  SunFill,
  Grid3x3GapFill,
  Tools
} from "react-bootstrap-icons";
import { motion as MotionDiv, AnimatePresence } from "framer-motion";
import "../../assets/css/Sidebar.css";

const Sidebar = ({ activeTab, setActiveTab }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [unreadMessages, setUnreadMessages] = useState(1);

  useEffect(() => {
    document.body.className = darkMode ? 'dark-mode' : 'light-mode';
  }, [darkMode]);

  const navItems = [
    { id: "dashboard", icon: HouseFill, label: "Dashboard", badge: 0 },
    { id: "worker", icon: PeopleFill, label: "Worker", badge: 0 },
    { id: "category", icon: FolderFill, label: "Category", badge: 0 },
    { id: "services", icon: Tools, label: "Services", badge: 0 },
    { id: "division", icon: Building, label: "Division", badge: 0 },
    { id: "tasks", icon: Grid3x3GapFill, label: "Tasks", badge: 0 },
    { id: "finance", icon: CashStack, label: "Finance", badge: 0 },
    { id: "messages", icon: EnvelopeFill, label: "Messages", badge: 0 },
    { id: "notifications", icon: BellFill, label: "Notifications", badge: 0 },
    { id: "settings", icon: GearFill, label: "Settings", badge: 0 },
  ];

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  // const toggleDarkMode = () => {
  //   setDarkMode(!darkMode);
  // };

  // const handleLogout = () => {
  //   console.log("User logged out");
  //   // Add your logout logic here
  // };

  const renderTooltip = (label) => (
    <Tooltip id={`tooltip-${label}`} className="sidebar-tooltip">
      {label}
    </Tooltip>
  );

  const itemVariants = {
    open: {
      x: 0,
      opacity: 1,
      transition: {
        x: { stiffness: 1000, velocity: -100 }
      }
    },
    closed: {
      x: -50,
      opacity: 0,
      transition: {
        x: { stiffness: 1000 }
      }
    }
  };

  return (
    <Col
      md={collapsed ? 1 : 3}
      lg={collapsed ? 1 : 2}
      className={`sidebar px-0 ${collapsed ? "collapsed" : ""} ${darkMode ? "dark" : "light"}`}
    >
      <MotionDiv.div 
        className="sidebar-header p-3 d-flex justify-content-between align-items-center"
        initial={false}
        animate={{
          justifyContent: collapsed ? "center" : "space-between"
        }}
      >
        {!collapsed && (
          <MotionDiv.h4 
            className="text-white mb-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Admin Panel
          </MotionDiv.h4>
        )}
        <MotionDiv.button
          onClick={toggleSidebar}
          className="toggle-btn bg-transparent border-0 text-white"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {collapsed ? (
            <ArrowRightShort size={20} />
          ) : (
            <ArrowLeftShort size={20} />
          )}
        </MotionDiv.button>
      </MotionDiv.div>

      <Nav variant="pills" className="flex-column">
        {navItems.map((item) => (
          <Nav.Item key={item.id}>
            <OverlayTrigger
              placement="right"
              overlay={renderTooltip(item.label)}
              show={collapsed && hoveredItem === item.id ? true : false}
            >
              <MotionDiv.div
                variants={itemVariants}
                initial="closed"
                animate="open"
              >
                <Nav.Link
                  active={activeTab === item.id}
                  onClick={() => setActiveTab(item.id)}
                  className="d-flex align-items-center position-relative"
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <item.icon className={`me-2 ${collapsed ? "mx-auto" : ""}`} />
                  {!collapsed && (
                    <>
                      <span>{item.label}</span>
                      {item.badge > 0 && (
                        <Badge pill bg="danger" className="ms-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                  {activeTab === item.id && (
                    <MotionDiv.span 
                      className="active-indicator"
                      layoutId="activeIndicator"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Nav.Link>
              </MotionDiv.div>
            </OverlayTrigger>
          </Nav.Item>
        ))}
      </Nav>

      {/* <div className="sidebar-actions mt-auto">
        <Nav variant="pills" className="flex-column">
          <Nav.Item>
            <Nav.Link
              onClick={toggleDarkMode}
              className="d-flex align-items-center"
            >
              {darkMode ? (
                <SunFill className={`me-2 ${collapsed ? "mx-auto" : ""}`} />
              ) : (
                <MoonFill className={`me-2 ${collapsed ? "mx-auto" : ""}`} />
              )}
              {!collapsed && (darkMode ? "Light Mode" : "Dark Mode")}
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              onClick={handleLogout}
              className="d-flex align-items-center text-danger"
            >
              <BoxArrowRight className={`me-2 ${collapsed ? "mx-auto" : ""}`} />
              {!collapsed && "Logout"}
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </div> */}

      {!collapsed && (
        <MotionDiv.div 
          className="sidebar-footer p-3 text-center text-muted small"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div>v2.4.1 • {new Date().getFullYear()}</div>
          <div className="mt-1"> Xethub</div>
        </MotionDiv.div>
      )}
    </Col>
  );
};

export default Sidebar;