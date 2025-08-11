import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Container, Row, Col, Card, Badge, Button, 
  Tab, Tabs, Modal, Form, Spinner, Alert 
} from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion as MotionDiv } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import LoginFetchModal from '../Auth/LoginFetch';
import ProfessionalTeam from "../../assets/images/many-different-professions-collage-happy-600nw-2453357543.webp";

const Services = () => {
  // State organization
  const [state, setState] = useState({
    services: [],
    loading: true,
    error: null,
    selectedService: null,
    showServiceModal: false,
    showBookingModal: false,
    showLoginPromptModal: false,
    showLoginModal: false,
    activeTab: 'all',
    searchQuery: '',
    selectedCategory: '',
    showDropdown: false,
    zones: [],
    areas: [],
    bookingData: {
      name: '',
      email: '',
      phone: '',
      address: '',
      preferred_date: '',
      preferred_time: '',
      notes: '',
      zone_id: '',
      area_id: ''
    }
  });

  const location = useLocation();
  const navigate = useNavigate();

  // Memoized derived values
  const searchResults = useMemo(() => {
    if (state.searchQuery.trim() === '') return [];

    const query = state.searchQuery.toLowerCase();
    const matchedServices = [];

    // Ensure services is an array and has proper structure
    if (Array.isArray(state.services)) {
      state.services.forEach(category => {
        if (category && Array.isArray(category.services)) {
          category.services.forEach(service => {
            if (
              service.name?.toLowerCase().includes(query) ||
              service.description?.toLowerCase().includes(query) ||
              category.name?.toLowerCase().includes(query)
            ) {
              matchedServices.push({ 
                service, 
                category: category.name 
              });
            }
          });
        }
      });
    }

    return matchedServices;
  }, [state.searchQuery, state.services]);

  const filteredServices = useMemo(() => {
    // Ensure services is an array and has proper structure
    if (!Array.isArray(state.services)) {
      return [];
    }

    // If there's a search query, return only matching services
    if (state.searchQuery.trim() !== '') {
      return searchResults.map(result => ({
        id: result.service.id,
        name: result.category,
        services: [result.service]
      }));
    }

    // If a category is selected, filter by category
    if (state.selectedCategory) {
      return state.services
        .filter(category => category && category.name === state.selectedCategory)
        .map(category => ({
          ...category,
          services: (category.services || []).filter(service => {
            if (state.activeTab === 'popular') return service.base_price < 100;
            if (state.activeTab === 'emergency') {
              return service.name.toLowerCase().includes('emergency') ||
                     service.name.toLowerCase().includes('urgent') ||
                     service.description?.toLowerCase().includes('24/7');
            }
            return true;
          })
        }))
        .filter(category => category.services && category.services.length > 0);
    }

    // Default case - apply activeTab filter
    return state.services
      .filter(category => category && category.services) // Ensure category and services exist
      .map(category => ({
        ...category,
        services: category.services.filter(service => {
          if (state.activeTab === 'popular') return service.base_price < 100;
          if (state.activeTab === 'emergency') {
            return service.name.toLowerCase().includes('emergency') ||
                   service.name.toLowerCase().includes('urgent') ||
                   service.description?.toLowerCase().includes('24/7');
          }
          return true;
        })
      }))
      .filter(category => category.services && category.services.length > 0);
  }, [state.services, state.activeTab, state.searchQuery, state.selectedCategory, searchResults]);

  // API calls
  const fetchServices = useCallback(async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/backend/api/public_services.php?action=services`);
      
      if (response.data.success) {
        // Transform flat array to nested structure
        const servicesData = response.data.data;
        const groupedServices = {};
        
        servicesData.forEach(service => {
          const categoryName = service.category_name;
          if (!groupedServices[categoryName]) {
            groupedServices[categoryName] = {
              id: service.category_id || categoryName,
              name: categoryName,
              icon: service.category_icon,
              services: []
            };
          }
          groupedServices[categoryName].services.push(service);
        });
        
        const nestedServices = Object.values(groupedServices);
        setState(prev => ({ ...prev, services: nestedServices, loading: false }));
      } else {
        setState(prev => ({ ...prev, error: response.data.message, loading: false }));
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setState(prev => ({ ...prev, error: 'Failed to load services', loading: false }));
    }
  }, []);

  const fetchZones = useCallback(async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/backend/api/admin/locations.php?type=zones`);
      if (response.data.success) {
        setState(prev => ({ ...prev, zones: response.data.data }));
      }
    } catch (error) {
      console.error('Error fetching zones:', error);
    }
  }, []);

  const fetchAreas = useCallback(async (zoneId) => {
    if (!zoneId) {
      setState(prev => ({ ...prev, areas: [] }));
      return;
    }
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/backend/api/admin/locations.php?type=areas`);
      if (response.data.success) {
        // Filter areas by zone_id
        const filteredAreas = response.data.data.filter(area => area.zone_id == zoneId);
        setState(prev => ({ ...prev, areas: filteredAreas }));
      }
    } catch (error) {
      console.error('Error fetching areas:', error);
    }
  }, []);

  const fetchServiceDetails = useCallback(async (serviceId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/backend/api/public_services.php?action=service&id=${serviceId}`
      );
      if (response.data.success) {
        setState(prev => ({
          ...prev,
          selectedService: response.data.data,
          showServiceModal: true,
          loading: false
        }));
      }
    } catch (error) {
      console.error('Error fetching service details:', error);
      toast.error('Failed to load service details');
    }
  }, []);

  // Event handlers
  const handleLearnMore = useCallback((service) => {
    setState(prev => ({
      ...prev,
      selectedService: service,
      showServiceModal: true
    }));
  }, []);

  const handleBookService = useCallback((service) => {
    const isLoggedIn = !!localStorage.getItem('user');
    
    if (!isLoggedIn) {
      setState(prev => ({
        ...prev,
        showLoginPromptModal: true,
        selectedService: service
      }));
      return;
    }
    
    setState(prev => ({
      ...prev,
      selectedService: service,
      showBookingModal: true
    }));
  }, []);

  const handleBookingSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!state.selectedService) {
      toast.error('Please select a service first');
      return;
    }

    // Validate required fields
    const { name, email, phone, address, preferred_date, zone_id, area_id } = state.bookingData;
    if (!name || !email || !phone || !address || !preferred_date || !zone_id || !area_id) {
      toast.error('Please fill in all required fields including zone and area');
      return;
    }

    try {
      const bookingPayload = {
        service_id: state.selectedService.id,
        title: `${state.selectedService.name} Service Request`,
        description: state.bookingData.notes || `Service request for ${state.selectedService.name}`,
        contact_name: state.bookingData.name,
        contact_phone: state.bookingData.phone,
        contact_email: state.bookingData.email,
        address: state.bookingData.address,
        zone_id: state.bookingData.zone_id,
        area_id: state.bookingData.area_id,
        scheduled_at: `${state.bookingData.preferred_date} ${state.bookingData.preferred_time || '09:00'}`,
        urgency: 'normal'
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/backend/api/user/request_service.php`,
        bookingPayload,
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Service request submitted successfully!');
        setState(prev => ({
          ...prev,
          showBookingModal: false,
          bookingData: {
            name: '',
            email: '',
            phone: '',
            address: '',
            preferred_date: '',
            preferred_time: '',
            notes: '',
            zone_id: '',
            area_id: ''
          }
        }));
      } else {
        toast.error(response.data.message || 'Failed to submit service request');
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      toast.error('Failed to submit service request. Please try again.');
    }
  }, [state.selectedService, state.bookingData]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setState(prev => ({
      ...prev,
      bookingData: {
        ...prev.bookingData,
        [name]: value
      }
    }));

    // If zone is changed, fetch areas for that zone
    if (name === 'zone_id') {
      fetchAreas(value);
      // Reset area selection when zone changes
      setState(prev => ({
        ...prev,
        bookingData: {
          ...prev.bookingData,
          zone_id: value,
          area_id: ''
        }
      }));
    }
  }, [fetchAreas]);

  const handleTabChange = useCallback((tab) => {
    setState(prev => ({ 
      ...prev, 
      activeTab: tab,
      searchQuery: '',
      selectedCategory: ''
    }));
  }, []);

  const handleSearchChange = useCallback((e) => {
    setState(prev => ({ 
      ...prev, 
      searchQuery: e.target.value,
      selectedCategory: ''
    }));
  }, []);

  const handleCategoryChange = useCallback((e) => {
    setState(prev => ({ 
      ...prev, 
      selectedCategory: e.target.value,
      searchQuery: ''
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      searchQuery: '',
      selectedCategory: '',
      showDropdown: false
    }));
  }, []);

  // Effects
  useEffect(() => {
    fetchServices();
    fetchZones();
  }, [fetchServices, fetchZones]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const serviceId = urlParams.get('service');
    const categoryName = urlParams.get('category');
    
    if (serviceId) {
      fetchServiceDetails(serviceId);
    } else if (categoryName && state.services.length > 0) {
      setState(prev => ({
        ...prev,
        selectedCategory: categoryName,
        searchQuery: '',
        activeTab: 'all'
      }));
    }
  }, [location, fetchServices, fetchServiceDetails, state.services]);

  if (state.loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" className="text-primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading services...</p>
      </Container>
    );
  }

  if (state.error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Error loading services</Alert.Heading>
          <p>{state.error}</p>
          <Button variant="primary" onClick={fetchServices}>
            Retry
          </Button>
        </Alert>
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
      <Container className="py-3">
        <Container className="py-4">
          {/* Services Section */}
          <section id="services-section" aria-labelledby="services-heading">
            <h1
              id="services-heading"
              className="text-center mb-4 text-3xl font-bold tracking-tight text-gray-800"
            >
              🚀 Our Services
            </h1>
            <p className="text-center text-muted mb-3">
              Comprehensive solutions for all your service needs
            </p>
            
            {/* Search and Filter */}
            <div className="mb-5 position-relative">
              <div className="d-flex flex-column flex-md-row gap-3 align-items-start mb-4">
                <Form.Control
                  type="text"
                  placeholder="Search services or categories..."
                  value={state.searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setState(prev => ({ ...prev, showDropdown: true }))}
                  onBlur={() => setTimeout(() => setState(prev => ({ ...prev, showDropdown: false })), 200)}
                  className="flex-grow-1"
                  aria-label="Search services"
                />

                <Form.Select
                  value={state.selectedCategory}
                  onChange={handleCategoryChange}
                  className="w-100 w-md-25"
                  aria-label="Filter by category"
                >
                  <option value="">All Categories</option>
                  {state.services.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </Form.Select>

                {(state.searchQuery || state.selectedCategory) && (
                  <Button 
                    variant="outline-secondary" 
                    size="sm" 
                    onClick={clearFilters}
                    className="w-100 w-md-auto"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
              
              {state.showDropdown && state.searchQuery.trim() !== '' && (
                <div 
                  className="position-absolute w-100 bg-white shadow-sm border rounded mt-1 z-3" 
                  style={{ maxHeight: '300px', overflowY: 'auto' }}
                  role="listbox"
                >
                  {searchResults.length > 0 ? (
                    searchResults.map(({ service, category }) => (
                      <div
                        key={service.id}
                        className="px-3 py-2 search-result-item hover-bg-light"
                        onClick={() => {
                          setState(prev => ({
                            ...prev,
                            searchQuery: service.name,
                            showDropdown: false,
                            selectedCategory: ''
                          }));
                        }}
                        style={{ cursor: 'pointer' }}
                        role="option"
                        aria-selected="false"
                      >
                        <strong>{service.name}</strong> <br />
                        <small className="text-muted">Category: {category}</small>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-muted">No matching services or categories found.</div>
                  )}
                </div>
              )}
            </div>
            
            {/* Services Tabs */}
            <Tabs
              activeKey={state.activeTab}
              onSelect={handleTabChange}
              id="services-tabs"
              className="mb-4 justify-content-center"
              fill
            >
              <Tab
                eventKey="all"
                title={
                  <span
                    style={{
                      color: state.activeTab === 'all' ? 'white' : 'black',
                      backgroundColor: state.activeTab === 'all' ? 'black' : 'transparent',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      display: 'inline-block',
                    }}
                  >
                    All Services
                  </span>
                }
              />
              <Tab
                eventKey="popular"
                title={
                  <span
                    style={{
                      color: state.activeTab === 'popular' ? 'white' : 'black',
                      backgroundColor: state.activeTab === 'popular' ? 'black' : 'transparent',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      display: 'inline-block',
                    }}
                  >
                    Most Popular
                  </span>
                }
              />
              <Tab
                eventKey="emergency"
                title={
                  <span
                    style={{
                      color: state.activeTab === 'emergency' ? 'white' : 'black',
                      backgroundColor: state.activeTab === 'emergency' ? 'black' : 'transparent',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      display: 'inline-block',
                    }}
                  >
                    Emergency Services
                  </span>
                }
              />
            </Tabs>
            {/* Services List */}
            {filteredServices.length > 0 ? (
              filteredServices.map((category) => (
                <div key={category.id} className="mb-5">
                  {!state.searchQuery && ( // Only show category header if not in search mode
                    <>
                      <h3 className="mb-4 text-primary">
                        {category.icon && <i className={`${category.icon} me-2`} aria-hidden="true"></i>}
                        {category.name}
                      </h3>
                      {category.description && <p className="text-muted mb-4">{category.description}</p>}
                    </>
                  )}
                  
                  <Row>
                    {category.services.map((service) => (
                      <Col lg={4} md={6} className="mb-4" key={service.id}>
                        <MotionDiv.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
                          <Card className="h-100 shadow-sm border-0">
                            {service.image && (
                              <Card.Img 
                                variant="top" 
                                src={`${import.meta.env.VITE_API_URL}/backend/${service.image}`}
                                alt={service.name}
                                style={{  height: '150px', objectFit: 'cover', padding: '0 45px'}}
                              />
                            )}
                            <Card.Body className="d-flex flex-column">
                              <div className="d-flex justify-content-between align-items-start mb-3">
                                <Card.Title as="h3" className="h5">{service.name}</Card.Title>
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
                                  aria-label={`Learn more about ${service.name}`}
                                >
                                  Learn More
                                </Button>
                                <Button 
                                  variant="primary" 
                                  size="sm"
                                  onClick={() => handleBookService(service)}
                                  aria-label={`Book ${service.name} service`}
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
              ))
            ) : (
              <div className="text-center py-5">
                <h4>No services found</h4>
                <p className="text-muted">Try selecting a different category or check back later.</p>
                <Button 
                  variant="outline-primary"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </section>
          {/* Hero Section */}
          <Row className="align-items-center mb-5">
            <Col lg={6}>
              <Badge bg="primary" className="mb-3" aria-label="Years of service">
                Quality Services Since 2023
              </Badge>
              <h1 className="display-5 fw-bold mb-4">
                Professional Services for Your Home & Business
              </h1>
              <p className="lead mb-4">
                We deliver exceptional service with certified professionals, transparent pricing, 
                and a 100% satisfaction guarantee.
              </p>
              <Button 
                variant="primary" 
                size="lg" 
                className="me-3" 
                onClick={() => document.getElementById('services-section').scrollIntoView({ behavior: 'smooth' })}
              >
                Browse Services
              </Button>
              <Button variant="outline-primary" size="lg" onClick={() => navigate('/contact')}>
                Request Estimate
              </Button>
            </Col>
            <Col lg={6}>
              <img 
                src={ProfessionalTeam} 
                alt="Our professional team providing various services" 
                className="img-fluid rounded shadow"
                loading="lazy"
              />
            </Col>
          </Row>
        </Container>

        {/* Service Details Modal */}
        <Modal 
          show={state.showServiceModal} 
          onHide={() => setState(prev => ({ ...prev, showServiceModal: false }))} 
          size="lg"
          aria-labelledby="service-details-modal-title"
        >
          <Modal.Header closeButton>
            <Modal.Title id="service-details-modal-title">
              {state.selectedService?.name}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {state.selectedService && (
              <>
                <div className="mb-3">
                  <strong>Category:</strong> {state.selectedService.category_name}
                </div>
                <div className="mb-3">
                  <strong>Price:</strong> ${state.selectedService.base_price}/{state.selectedService.unit}
                </div>
                <div className="mb-3">
                  <strong>Description:</strong>
                  <p className="mt-2">
                    {state.selectedService.description || 'Professional service with quality guarantee and certified technicians.'}
                  </p>
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
            <Button 
              variant="secondary" 
              onClick={() => setState(prev => ({ ...prev, showServiceModal: false }))}
            >
              Close
            </Button>
            <Button 
              variant="primary" 
              onClick={() => {
                setState(prev => ({ ...prev, showServiceModal: false }));
                handleBookService(state.selectedService);
              }}
            >
              Book This Service
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Booking Modal */}
        <Modal 
          show={state.showBookingModal} 
          onHide={() => setState(prev => ({ ...prev, showBookingModal: false }))} 
          size="lg"
          aria-labelledby="booking-modal-title"
        >
          <Modal.Header closeButton>
            <Modal.Title id="booking-modal-title">
              Book Service: {state.selectedService?.name}
            </Modal.Title>
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
                      value={state.bookingData.name}
                      onChange={handleInputChange}
                      required
                      aria-required="true"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email *</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={state.bookingData.email}
                      onChange={handleInputChange}
                      required
                      aria-required="true"
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
                      value={state.bookingData.phone}
                      onChange={handleInputChange}
                      required
                      aria-required="true"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Preferred Date *</Form.Label>
                    <Form.Control
                      type="date"
                      name="preferred_date"
                      value={state.bookingData.preferred_date}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
                      aria-required="true"
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Zone and Area Selection */}
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Zone *</Form.Label>
                    <Form.Select
                      name="zone_id"
                      value={state.bookingData.zone_id}
                      onChange={handleInputChange}
                      required
                      aria-required="true"
                    >
                      <option value="">Select Zone</option>
                      {state.zones.map(zone => (
                        <option key={zone.id} value={zone.id}>
                          {zone.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Area *</Form.Label>
                    <Form.Select
                      name="area_id"
                      value={state.bookingData.area_id}
                      onChange={handleInputChange}
                      required
                      aria-required="true"
                      disabled={!state.bookingData.zone_id}
                    >
                      <option value="">Select Area</option>
                      {state.areas.map(area => (
                        <option key={area.id} value={area.id}>
                          {area.name}
                        </option>
                      ))}
                    </Form.Select>
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
                      value={state.bookingData.preferred_time}
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
                  value={state.bookingData.address}
                  onChange={handleInputChange}
                  placeholder="Enter your complete address"
                  required
                  aria-required="true"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Additional Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="notes"
                  value={state.bookingData.notes}
                  onChange={handleInputChange}
                  placeholder="Any specific requirements or additional information"
                />
              </Form.Group>

              {state.selectedService && (
                <div className="bg-light p-3 rounded">
                  <h6>Service Summary:</h6>
                  <p className="mb-1"><strong>{state.selectedService.name}</strong></p>
                  <p className="mb-0 text-muted">
                    Starting from ${state.selectedService.base_price}/{state.selectedService.unit}
                  </p>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button 
                variant="secondary" 
                onClick={() => setState(prev => ({ ...prev, showBookingModal: false }))}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Submit Request
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Login Prompt Modal */}
        <Modal 
          show={state.showLoginPromptModal} 
          onHide={() => setState(prev => ({ ...prev, showLoginPromptModal: false }))} 
          centered
          aria-labelledby="login-prompt-modal-title"
        >
          <Modal.Header closeButton>
            <Modal.Title id="login-prompt-modal-title">Login Required</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Please login first to book this service.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => setState(prev => ({ ...prev, showLoginPromptModal: false }))}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setState(prev => ({
                  ...prev,
                  showLoginPromptModal: false,
                  showLoginModal: true
                }));
              }}
            >
              Login Now
            </Button>
          </Modal.Footer>
        </Modal>
        
        {/* Login Modal */}
        <LoginFetchModal
          show={state.showLoginModal}
          onHide={() => setState(prev => ({ ...prev, showLoginModal: false }))}
        />
      </Container>
    </MotionDiv.div>
  );
};

export default Services;