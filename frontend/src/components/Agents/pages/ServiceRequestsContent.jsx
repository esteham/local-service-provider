import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Badge, Button, 
  Modal, Form, Table, Spinner, Alert, InputGroup,
  Dropdown, DropdownButton
} from 'react-bootstrap';
import { 
  FaEye, FaUserPlus, FaFilter, FaSearch, 
  FaClock, FaMapMarkerAlt, FaPhone, FaEnvelope,
  FaTools, FaDollarSign, FaExclamationTriangle
} from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const ServiceRequestsContent = () => {
  const [state, setState] = useState({
    requests: [],
    workers: [],
    availableWorkers: [],
    loading: true,
    selectedRequest: null,
    showDetailsModal: false,
    showAssignModal: false,
    selectedWorker: '',
    assignmentNotes: '',
    filterStatus: 'all',
    searchQuery: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  useEffect(() => {
    loadServiceRequests();
    loadWorkers();
  }, []);

  const loadServiceRequests = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/backend/api/agents/service-requests.php`,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setState(prev => ({ ...prev, requests: response.data.data, loading: false }));
      } else {
        toast.error('Failed to load service requests');
        setState(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('Error loading service requests:', error);
      toast.error('Failed to load service requests');
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const loadWorkers = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/backend/api/agents/workers.php`,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setState(prev => ({ ...prev, workers: response.data.data }));
      }
    } catch (error) {
      console.error('Error loading workers:', error);
    }
  };

  const loadWorkersForZoneArea = async (zoneId, areaId) => {
    try {
      let url = `${import.meta.env.VITE_API_URL}/backend/api/agents/workers.php?status=active`;
      
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
        setState(prev => ({ ...prev, availableWorkers: response.data.data || [] }));
      } else {
        throw new Error(response.data.message || "API returned error");
      }
    } catch (error) {
      console.error("Failed to load workers for zone/area:", error);
      toast.error("Failed to load available workers. Please try again.");
      setState(prev => ({ ...prev, availableWorkers: [] }));
    }
  };

  const handleViewDetails = (request) => {
    setState(prev => ({
      ...prev,
      selectedRequest: request,
      showDetailsModal: true
    }));
  };

  const handleAssignWorker = async (request) => {
    setState(prev => ({
      ...prev,
      selectedRequest: request,
      showAssignModal: true,
      selectedWorker: '',
      assignmentNotes: ''
    }));
    
    // Automatically load workers for the request's zone/area
    if (request && (request.area_id || request.zone_id)) {
      await loadWorkersForZoneArea(request.zone_id, request.area_id);
    } else {
      // Fallback to all active workers if no zone/area info
      await loadWorkersForZoneArea(null, null);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    
    if (!state.selectedWorker) {
      toast.error('Please select a worker');
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/backend/api/agents/assign_worker.php`,
        {
          request_id: state.selectedRequest.id,
          worker_id: state.selectedWorker,
          notes: state.assignmentNotes
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Worker assigned successfully');
        setState(prev => ({
          ...prev,
          showAssignModal: false,
          selectedWorker: '',
          assignmentNotes: ''
        }));
        loadServiceRequests(); // Reload to get updated data
      } else {
        toast.error(response.data.message || 'Failed to assign worker');
      }
    } catch (error) {
      console.error('Error assigning worker:', error);
      toast.error('Failed to assign worker');
    }
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/backend/api/agents/service-requests.php?id=${requestId}`,
        {
          action: 'update_status',
          status: newStatus
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success(`Status updated to ${newStatus}`);
        loadServiceRequests(); // Reload to get updated data
      } else {
        toast.error(response.data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', text: 'Pending' },
      assigned: { variant: 'info', text: 'Assigned' },
      in_progress: { variant: 'primary', text: 'In Progress' },
      completed: { variant: 'success', text: 'Completed' },
      paid: { variant: 'success', text: 'Paid' },
      payment_pending: { variant: 'warning', text: 'Payment Pending' },
      cancelled: { variant: 'danger', text: 'Cancelled' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const getUrgencyBadge = (urgency) => {
    const urgencyConfig = {
      normal: { variant: 'secondary', text: 'Normal' },
      urgent: { variant: 'warning', text: 'Urgent' },
      emergency: { variant: 'danger', text: 'Emergency' }
    };
    
    const config = urgencyConfig[urgency] || { variant: 'secondary', text: urgency };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const filteredRequests = state.requests.filter(request => {
    const matchesStatus = state.filterStatus === 'all' || request.status === state.filterStatus;
    const matchesSearch = !state.searchQuery || 
      request.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      request.service_name?.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      request.area_name?.toLowerCase().includes(state.searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  if (state.loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" className="text-primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading service requests...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="mb-0">Service Requests</h2>
          <p className="text-muted">Manage and assign service requests to workers</p>
        </Col>
      </Row>

      {/* Filters and Search */}
      <Row className="mb-4">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search requests..."
              value={state.searchQuery}
              onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
            />
          </InputGroup>
        </Col>
        <Col md={3}>
          <DropdownButton
            id="status-filter"
            title={`Filter: ${state.filterStatus === 'all' ? 'All Status' : state.filterStatus}`}
            variant="outline-secondary"
          >
            <Dropdown.Item onClick={() => setState(prev => ({ ...prev, filterStatus: 'all' }))}>
              All Status
            </Dropdown.Item>
            <Dropdown.Item onClick={() => setState(prev => ({ ...prev, filterStatus: 'pending' }))}>
              Pending
            </Dropdown.Item>
            <Dropdown.Item onClick={() => setState(prev => ({ ...prev, filterStatus: 'assigned' }))}>
              Assigned
            </Dropdown.Item>
            <Dropdown.Item onClick={() => setState(prev => ({ ...prev, filterStatus: 'in_progress' }))}>
              In Progress
            </Dropdown.Item>
            <Dropdown.Item onClick={() => setState(prev => ({ ...prev, filterStatus: 'completed' }))}>
              Completed
            </Dropdown.Item>
          </DropdownButton>
        </Col>
        <Col md={3}>
          <Button variant="primary" onClick={loadServiceRequests}>
            Refresh
          </Button>
        </Col>
      </Row>

      {/* Service Requests Table */}
      <Row>
        <Col>
          <Card>
            <Card.Body>
              {filteredRequests.length > 0 ? (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Service</th>
                      <th>Customer</th>
                      <th>Location</th>
                      <th>Urgency</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((request) => (
                      <tr key={request.id}>
                        <td>#{request.id}</td>
                        <td>
                          <div>
                            <strong>{request.service_name || 'N/A'}</strong>
                            <br />
                            <small className="text-muted">{request.title}</small>
                          </div>
                        </td>
                        <td>
                          <div>
                            <strong>{request.customer_name || 'N/A'}</strong>
                            <br />
                            <small className="text-muted">
                              <FaPhone className="me-1" />
                              {request.customer_phone || 'N/A'}
                            </small>
                          </div>
                        </td>
                        <td>
                          <div>
                            <FaMapMarkerAlt className="me-1" />
                            {request.area_name || 'N/A'}
                            <br />
                            <small className="text-muted">{request.zone_name || 'N/A'}</small>
                          </div>
                        </td>
                        <td>{getUrgencyBadge(request.urgency)}</td>
                        <td>{getStatusBadge(request.status)}</td>
                        <td>
                          <small>
                            {new Date(request.created_at).toLocaleDateString()}
                            <br />
                            {new Date(request.created_at).toLocaleTimeString()}
                          </small>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleViewDetails(request)}
                            >
                              <FaEye />
                            </Button>
                            {request.status === 'pending' && (
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => handleAssignWorker(request)}
                              >
                                <FaUserPlus />
                              </Button>
                            )}
                            {request.status === 'assigned' && (
                              <Button
                                variant="outline-info"
                                size="sm"
                                onClick={() => handleStatusUpdate(request.id, 'in_progress')}
                              >
                                Start
                              </Button>
                            )}
                            {request.status === 'in_progress' && (
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => handleStatusUpdate(request.id, 'completed')}
                              >
                                Complete
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-5">
                  <FaTools size={48} className="text-muted mb-3" />
                  <h5>No Service Requests Found</h5>
                  <p className="text-muted">
                    {state.filterStatus !== 'all' || state.searchQuery 
                      ? 'No requests match your current filters.'
                      : 'No service requests have been submitted yet.'
                    }
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Request Details Modal */}
      <Modal 
        show={state.showDetailsModal} 
        onHide={() => setState(prev => ({ ...prev, showDetailsModal: false }))}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Service Request Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {state.selectedRequest && (
            <Row>
              <Col md={6}>
                <h6>Request Information</h6>
                <p><strong>ID:</strong> #{state.selectedRequest.id}</p>
                <p><strong>Title:</strong> {state.selectedRequest.title}</p>
                <p><strong>Service:</strong> {state.selectedRequest.service_name}</p>
                <p><strong>Description:</strong> {state.selectedRequest.description}</p>
                <p><strong>Status:</strong> {getStatusBadge(state.selectedRequest.status)}</p>
                <p><strong>Urgency:</strong> {getUrgencyBadge(state.selectedRequest.urgency)}</p>
                <p><strong>Created:</strong> {new Date(state.selectedRequest.created_at).toLocaleString()}</p>
              </Col>
              <Col md={6}>
                <h6>Customer Information</h6>
                <p><strong>Name:</strong> {state.selectedRequest.customer_name}</p>
                <p><strong>Phone:</strong> {state.selectedRequest.customer_phone}</p>
                <p><strong>Email:</strong> {state.selectedRequest.customer_email || 'N/A'}</p>
                
                <h6 className="mt-4">Location</h6>
                <p><strong>Area:</strong> {state.selectedRequest.area_name}</p>
                <p><strong>Zone:</strong> {state.selectedRequest.zone_name}</p>
                <p><strong>Address:</strong> {state.selectedRequest.address}</p>
                
                <h6 className="mt-4">Pricing</h6>
                <p><strong>Base Price:</strong> ${state.selectedRequest.base_price}</p>
                <p><strong>Final Price:</strong> ${state.selectedRequest.final_price}</p>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setState(prev => ({ ...prev, showDetailsModal: false }))}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Worker Assignment Modal */}
      <Modal 
        show={state.showAssignModal} 
        onHide={() => setState(prev => ({ ...prev, showAssignModal: false }))}
      >
        <Modal.Header closeButton>
          <Modal.Title>Assign Worker</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAssignSubmit}>
          <Modal.Body>
            {state.selectedRequest && (
              <>
                <div className="mb-3">
                  <strong>Request:</strong> {state.selectedRequest.title}
                  <br />
                  <strong>Service:</strong> {state.selectedRequest.service_name}
                  <br />
                  <strong>Zone:</strong> {state.selectedRequest.zone_name || 'N/A'}
                  <br />
                  <strong>Area:</strong> {state.selectedRequest.area_name || 'N/A'}
                  <br />
                  <strong>Location:</strong> {state.selectedRequest.address}
                </div>
                
                <Form.Group className="mb-3">
                  <Form.Label>
                    Select Worker {state.selectedRequest.area_name ? `(${state.selectedRequest.area_name} Area)` : state.selectedRequest.zone_name ? `(${state.selectedRequest.zone_name} Zone)` : ''} *
                  </Form.Label>
                  <Form.Select
                    value={state.selectedWorker}
                    onChange={(e) => setState(prev => ({ ...prev, selectedWorker: e.target.value }))}
                    required
                  >
                    <option value="">Choose a worker...</option>
                    {state.availableWorkers.length > 0 ? (
                      state.availableWorkers.map(worker => (
                        <option key={worker.id} value={worker.id}>
                          {worker.first_name} {worker.last_name} - {worker.skills}
                          {worker.area_name && ` (${worker.area_name})`}
                          {!worker.area_name && worker.zone_name && ` (${worker.zone_name})`}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        No workers available in this area/zone
                      </option>
                    )}
                  </Form.Select>
                  {state.availableWorkers.length === 0 && (
                    <Form.Text className="text-muted">
                      No workers found for {state.selectedRequest.area_name || state.selectedRequest.zone_name || 'this location'}. 
                      Consider expanding search to nearby areas.
                    </Form.Text>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Assignment Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={state.assignmentNotes}
                    onChange={(e) => setState(prev => ({ ...prev, assignmentNotes: e.target.value }))}
                    placeholder="Any special instructions or notes for the worker..."
                  />
                </Form.Group>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => setState(prev => ({ 
                ...prev, 
                showAssignModal: false,
                selectedWorker: '',
                assignmentNotes: '',
                availableWorkers: []
              }))}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Assign Worker
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default ServiceRequestsContent;
