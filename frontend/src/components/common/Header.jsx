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
  const [scrolled, setScrolled] = useState(false);

  const isLoggedIn = !!user;

  useEffect(() => {
    fetchServices();
    
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const fetchServices = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/backend/api/public_services.php?action=categories`
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

  return (
    <>
    {/* Subheader */}
      <div className={`subheader ${scrolled ? 'subheader-hidden' : ''}`}>
        <Container>
          <div className="subheader-text">
              Local Service Provider - Connecting You to Quality Professional &nbsp; 
              <span className="subheader-contact">Call us: +880 123-456-7890</span>         
          </div>
        </Container>
      </div>

      {/* Main Header */}
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
                          <div key={category.id} className="col-md-4 mb-3">
                            <button
                              className="btn btn-link text-start fw-bold text-primary px-0"
                              onClick={() => navigate(`/services?category=${category.name}`)}
                            >
                              {category.name}
                            </button>
                          </div>
                        ))}
                        <div className="col-12 mt-3 text-center border-top pt-3">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => navigate("/services")}
                          >
                            View All Services
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>No services available.</div>
                    )}
                  </div>
                </div>
            </li>

            <Nav.Link as={Link} to="/contact">Contact</Nav.Link>
            <Nav.Link as={Link} to="/about">About</Nav.Link>
            <li className="nav-item dropdown mega-dropdown">
              <a 
                className="nav-link dropdown-toggle" 
                href="#" 
                role="button" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
              >
                Labour Law
              </a>
              <ul className="dropdown-menu">
                <li><a className="dropdown-item" href="/law/BDlaw">Bangladesh Labour Law</a></li>
                <li><a className="dropdown-item" href="/law/USlaw">Workplace Safety</a></li>
                <li><a className="dropdown-item" href="/law/Demolaw">Dispute Resolution</a></li>
              </ul>
            </li>
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
                  {["admin", "agent", "worker"].includes(user.role) ? (
                    <li>
                      <Link className="dropdown-item" to={getDashboardPath()}>
                        Profile
                      </Link>
                    </li>
                  ) : (
                    <>
                      <li>
                        <Link className="dropdown-item" to="/profile">
                          My Account
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/my-requests">
                          My Requests
                        </Link>
                      </li>
                    </>
                  )}
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
    </>
  );
};


export default Header;
