import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Tab, Tabs, Modal, Form } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion as MotionDiv } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import LoginFetchModal from '../Auth/LoginFetch';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showLoginPromptModal, setShowLoginPromptModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [bookingData, setBookingData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    preferred_date: '',
    preferred_time: '',
    notes: ''
  });

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices();
    const urlParams = new URLSearchParams(location.search);
    const serviceId = urlParams.get('service');
    if (serviceId) {
      fetchServiceDetails(serviceId);
    }
  }, [location]);

  const isUserLoggedIn = () => {
    return !!localStorage.getItem('user_id');
  };

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/backend/api/services.php`);
      if (response.data.success) {
        setServices(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceDetails = async (serviceId) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/backend/api/services.php?action=service&id=${serviceId}`);
      if (response.data.success) {
        setSelectedService(response.data.data);
        setShowServiceModal(true);
      }
    } catch (error) {
      console.error('Error fetching service details:', error);
      toast.error('Failed to load service details');
    }
  };

  const handleLearnMore = (service) => {
    setSelectedService(service);
    setShowServiceModal(true);
  };

  const handleBookService = (service) => {
    if (!isUserLoggedIn()) {
      setShowLoginPromptModal(true);
      return;
    }
    setSelectedService(service);
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/backend/api/user/request_service.php`, {
        service_id: selectedService.id,
        ...bookingData
      });
      if (response.data.success) {
        toast.success('Service request submitted successfully!');
        setShowBookingModal(false);
        setBookingData({
          name: '', email: '', phone: '', address: '',
          preferred_date: '', preferred_time: '', notes: ''
        });
      } else {
        toast.error(response.data.message || 'Failed to submit service request');
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      toast.error('Failed to submit service request');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
  };

  const getFilteredServices = () => {
    if (activeTab === 'all') return services;
    return services.map(category => ({
      ...category,
      services: category.services.filter(service => {
        if (activeTab === 'popular') return service.base_price < 100;
        if (activeTab === 'emergency') {
          return service.name.toLowerCase().includes('emergency') ||
                 service.name.toLowerCase().includes('urgent') ||
                 service.description?.toLowerCase().includes('24/7');
        }
        return true;
      })
    })).filter(category => category.services.length > 0);
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading services...</p>
      </Container>
    );
  }

  return (
    <MotionDiv.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container className="py-5">
        <Container className="py-5">
        {/* Hero Section */}
        <Row className="align-items-center mb-5">
          <Col lg={6}>
            <Badge bg="primary" className="mb-3">Quality Services Since 2023</Badge>
            <h1 className="display-5 fw-bold mb-4">Professional Services for Your Home & Business</h1>
            <p className="lead mb-4">
              We deliver exceptional service with certified professionals, transparent pricing, 
              and a 100% satisfaction guarantee.
            </p>
            <Button variant="primary" size="lg" className="me-3" onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}>
              Browse Services
            </Button>
            <Button variant="outline-primary" size="lg" onClick={() => navigate('/contact')}>
              Request Estimate
            </Button>
          </Col>
          <Col lg={6}>
            <img 
              src="/src/assets/images/many-different-professions-collage-happy-600nw-2453357543.webp" 
              alt="Our services" 
              className="img-fluid rounded shadow"
            />
          </Col>
        </Row>

        {/* Services Tabs */}
        <div className="mb-5">
          <h2 className="text-center mb-4">Our Services</h2>
          <p className="text-center text-muted mb-5">
            Comprehensive solutions for all your service needs
          </p>
          
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            id="services-tabs"
            className="mb-4 justify-content-center"
            fill
          >
            <Tab eventKey="all" title={<span style={{ color: "black" }}>All Services</span>} />
            <Tab eventKey="popular" title={<span style={{ color: "black" }}>Most Popular</span>} />
            <Tab eventKey="emergency" title={<span style={{ color: "black" }}>Emergency Services</span>} />
          </Tabs>

          {/* Dynamic Services Display */}
          {getFilteredServices().map((category) => (
            <div key={category.id} className="mb-5">
              <h3 className="mb-4 text-primary">
                {category.icon && <i className={`${category.icon} me-2`}></i>}
                {category.name}
              </h3>
              <p className="text-muted mb-4">{category.description}</p>
              
              <Row>
                {category.services.map((service) => (
                  <Col lg={4} md={6} className="mb-4" key={service.id}>
                    <MotionDiv.div
                      whileHover={{ y: -5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="h-100 shadow-sm border-0">
                        <Card.Body className="d-flex flex-column">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <Card.Title className="h5">{service.name}</Card.Title>
                            <Badge bg="primary" className="ms-2">
                              ${service.base_price}/{service.unit}
                            </Badge>
                          </div>
                          
                          <Card.Text className="text-muted flex-grow-1">
                            {service.description || 'Professional service with quality guarantee'}
                          </Card.Text>
                          
                          <div className="d-grid gap-2">
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={() => handleLearnMore(service)}
                            >
                              Learn More
                            </Button>
                            <Button 
                              variant="primary" 
                              size="sm"
                              onClick={() => handleBookService(service)}
                            >
                              Book Service
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </MotionDiv.div>
                  </Col>
                ))}
              </Row>
            </div>
          ))}

          {getFilteredServices().length === 0 && (
            <div className="text-center py-5">
              <h4>No services found</h4>
              <p className="text-muted">Try selecting a different category or check back later.</p>
            </div>
          )}
        </div>
      </Container>

      {/* Service Details Modal */}
      <Modal show={showServiceModal} onHide={() => setShowServiceModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedService?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedService && (
            <>
              <div className="mb-3">
                <strong>Category:</strong> {selectedService.category_name}
              </div>
              <div className="mb-3">
                <strong>Price:</strong> ${selectedService.base_price}/{selectedService.unit}
              </div>
              <div className="mb-3">
                <strong>Description:</strong>
                <p className="mt-2">{selectedService.description || 'Professional service with quality guarantee and certified technicians.'}</p>
              </div>
              <div className="mb-3">
                <strong>What's Included:</strong>
                <ul className="mt-2">
                  <li>Professional assessment</li>
                  <li>Quality materials and tools</li>
                  <li>Certified technician</li>
                  <li>Satisfaction guarantee</li>
                  <li>Follow-up support</li>
                </ul>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowServiceModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={() => {
            setShowServiceModal(false);
            handleBookService(selectedService);
          }}>
            Book This Service
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Booking Modal */}
      <Modal show={showBookingModal} onHide={() => setShowBookingModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Book Service: {selectedService?.name}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleBookingSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={bookingData.name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={bookingData.email}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number *</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={bookingData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Preferred Date *</Form.Label>
                  <Form.Control
                    type="date"
                    name="preferred_date"
                    value={bookingData.preferred_date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Preferred Time</Form.Label>
                  <Form.Control
                    type="time"
                    name="preferred_time"
                    value={bookingData.preferred_time}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Service Address *</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="address"
                value={bookingData.address}
                onChange={handleInputChange}
                placeholder="Enter your complete address"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Additional Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                value={bookingData.notes}
                onChange={handleInputChange}
                placeholder="Any specific requirements or additional information"
              />
            </Form.Group>

            {selectedService && (
              <div className="bg-light p-3 rounded">
                <h6>Service Summary:</h6>
                <p className="mb-1"><strong>{selectedService.name}</strong></p>
                <p className="mb-0 text-muted">Starting from ${selectedService.base_price}/{selectedService.unit}</p>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowBookingModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Submit Request
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      </Container>

      {/* Login Prompt Modal */}
      <Modal show={showLoginPromptModal} onHide={() => setShowLoginPromptModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Login Required</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Please login first to book this service.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLoginPromptModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setShowLoginPromptModal(false);
              setShowLoginModal(true);   
            }}
          >
            Login Now
          </Button>
        </Modal.Footer>
      </Modal>
      {/* login modal*/}
      <LoginFetchModal
        show={showLoginModal}
        onHide={() => setShowLoginModal(false)}
      />
    </MotionDiv.div>
  );
};

export default Services;
