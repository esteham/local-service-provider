import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import RegistrationModal from "../auth/RegistrationModal";
import "../../assets/css/header.css";

const Header = ({ onLoginClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  const isLoggedIn = user && ["admin", "agent", "worker"].includes(user.role);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/backend/api/services.php`
      );
      if (response.data.success) {
        setServices(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getDashboardPath = () => {
    if (!user) return "/";
    switch (user.role) {
      case "admin":
        return "/AdminDashboard";
      case "agent":
        return "/AgentDashboard";
      case "worker":
        return "/WorkerDashboard";
      default:
        return "/";
    }
  };

  const handleServiceSelect = (serviceId) => {
    navigate(`/services?service=${serviceId}`);
  };

  return (
    <Navbar className="header" variant="dark" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          HyperLocal Services
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="me-auto align-items-center">
            <Nav.Link as={Link} to="/">Home</Nav.Link>

            {/* Mega Menu Services */}
            <li className="nav-item dropdown mega-dropdown">
              <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                Services
              </a>
              <div className="dropdown-menu mega-menu p-4">
                <div className="container-fluid">
                  {loading ? (
                    <div>Loading services...</div>
                  ) : services.length > 0 ? (
                    <div className="row">
                      {services.map((category) => (
                        <div key={category.id} className="col-md-4">
                          <h6 className="text-primary fw-bold">{category.name}</h6>
                          <ul className="list-unstyled">
                            {category.services.map((service) => (
                              <li key={service.id}>
                                <button
                                  onClick={() => handleServiceSelect(service.id)}
                                  className="btn btn-link text-start w-100 px-0"
                                >
                                  {service.name}{" "}
                                  <small className="text-muted">
                                    (${service.base_price}/{service.unit})
                                  </small>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div>No services available.</div>
                  )}
                </div>
              </div>
            </li>

            <Nav.Link as={Link} to="/contact">Contact</Nav.Link>
            <Nav.Link as={Link} to="/about">About</Nav.Link>
          </Nav>

          <Nav className="ms-auto gap-2 align-items-center">
            {!isLoggedIn ? (
              <>
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={onLoginClick}
                >
                  Login
                </Button>
                <Button 
                  variant="light" 
                  size="sm"
                  onClick={() => setShowRegistrationModal(true)}
                >
                  Register
                </Button>
              </>
            ) : (
              <div className="dropdown">
                <Button
                  variant="light"
                  size="sm"
                  className="dropdown-toggle"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {user.username}
                </Button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <Link className="dropdown-item" to={getDashboardPath()}>
                      Profile
                    </Link>
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={handleLogout}>
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
      
      {/* Registration Modal */}
      <RegistrationModal 
        show={showRegistrationModal} 
        onHide={() => setShowRegistrationModal(false)} 
      />
    </Navbar>
  );
};

export default Header;
