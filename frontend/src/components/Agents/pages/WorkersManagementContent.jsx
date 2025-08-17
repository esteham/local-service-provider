import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert, InputGroup, Form } from 'react-bootstrap';
import { FaUser, FaUserCheck, FaUserTimes, FaSearch, FaSync, FaInfoCircle } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const WorkersManagementContent = () => {
  const [state, setState] = useState({
    workers: [],
    loading: true,
    updatingWorkerId: null,
    filterStatus: 'all',
    searchQuery: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  useEffect(() => {
    loadWorkers();
  }, []);

  const loadWorkers = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/backend/api/agents/workers.php`,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setState(prev => ({ ...prev, workers: response.data.data, loading: false }));
      } else {
        toast.error('Failed to load workers');
        setState(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('Error loading workers:', error);
      toast.error('Failed to load workers');
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleStatusChange = async (workerId, newStatus) => {
    try {
      setState(prev => ({ ...prev, updatingWorkerId: workerId }));
      
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/backend/api/agents/worker_status.php`,
        {
          worker_id: workerId,
          status: newStatus
        },
        { withCredentials: true }
      );
      
      if (response.data.success) {
        toast.success(response.data.message);
        
        // Update worker status in state
        setState(prev => ({
          ...prev,
          workers: prev.workers.map(worker => 
            worker.id === workerId ? { ...worker, status: newStatus } : worker
          ),
          updatingWorkerId: null
        }));
      } else {
        toast.error(response.data.message || 'Failed to update worker status');
        setState(prev => ({ ...prev, updatingWorkerId: null }));
      }
    } catch (error) {
      console.error('Error updating worker status:', error);
      toast.error('Failed to update worker status');
      setState(prev => ({ ...prev, updatingWorkerId: null }));
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { variant: 'success', text: 'Active' },
      inactive: { variant: 'danger', text: 'Inactive' },
      pending: { variant: 'warning', text: 'Pending' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const filteredWorkers = state.workers.filter(worker => {
    const matchesStatus = state.filterStatus === 'all' || worker.status === state.filterStatus;
    const matchesSearch = !state.searchQuery || 
      worker.first_name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      worker.last_name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      worker.username.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      worker.email.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      worker.phone.includes(state.searchQuery);
    
    return matchesStatus && matchesSearch;
  });

  if (state.loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" className="text-primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading workers...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="mb-0">Worker Management</h2>
          <p className="text-muted">Manage worker accounts in your zone/area</p>
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
              placeholder="Search workers..."
              value={state.searchQuery}
              onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
            />
          </InputGroup>
        </Col>
        <Col md={3}>
          <Form.Select
            value={state.filterStatus}
            onChange={(e) => setState(prev => ({ ...prev, filterStatus: e.target.value }))}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </Form.Select>
        </Col>
        <Col md={3}>
          <Button variant="primary" onClick={loadWorkers}>
            <FaSync className="me-2" />
            Refresh
          </Button>
        </Col>
      </Row>

      {/* Workers Table */}
      <Row>
        <Col>
          <Card>
            <Card.Body>
              {filteredWorkers.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Worker</th>
                        <th>Contact</th>
                        <th>Location</th>
                        <th>Skills</th>
                        <th>Rating</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredWorkers.map((worker) => (
                        <tr key={worker.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="me-3">
                                <FaUser size={24} className="text-muted" />
                              </div>
                              <div>
                                <strong>{worker.first_name} {worker.last_name}</strong>
                                <br />
                                <small className="text-muted">@{worker.username}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div>
                              <div>
                                <small>
                                  <FaInfoCircle className="me-1" />
                                  {worker.email}
                                </small>
                              </div>
                              <div>
                                <small>{worker.phone}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div>
                              <div><strong>{worker.area_name || worker.zone_name || 'N/A'}</strong></div>
                              <small className="text-muted">
                                {worker.area_name ? `(${worker.zone_name})` : 'Zone'}
                              </small>
                            </div>
                          </td>
                          <td>
                            <small>{worker.skills || 'N/A'}</small>
                          </td>
                          <td>
                            <div>
                              <strong>{worker.rating || 'N/A'}</strong>
                              <br />
                              <small className="text-muted">{worker.completed_jobs || 0} jobs</small>
                            </div>
                          </td>
                          <td>
                            {getStatusBadge(worker.status)}
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              {worker.status === 'active' ? (
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  disabled={state.updatingWorkerId === worker.id}
                                  onClick={() => handleStatusChange(worker.id, 'inactive')}
                                >
                                  {state.updatingWorkerId === worker.id ? (
                                    <Spinner animation="border" size="sm" />
                                  ) : (
                                    <>
                                      <FaUserTimes className="me-1" />
                                      Deactivate
                                    </>
                                  )}
                                </Button>
                              ) : (
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  disabled={state.updatingWorkerId === worker.id}
                                  onClick={() => handleStatusChange(worker.id, 'active')}
                                >
                                  {state.updatingWorkerId === worker.id ? (
                                    <Spinner animation="border" size="sm" />
                                  ) : (
                                    <>
                                      <FaUserCheck className="me-1" />
                                      Activate
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <FaUser size={48} className="text-muted mb-3" />
                  <h5>No Workers Found</h5>
                  <p className="text-muted">
                    {state.filterStatus !== 'all' || state.searchQuery 
                      ? 'No workers match your current filters.'
                      : 'No workers have been registered in your zone/area yet.'
                    }
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default WorkersManagementContent;