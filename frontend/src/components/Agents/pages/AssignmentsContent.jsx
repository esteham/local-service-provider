import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert, InputGroup, Form } from 'react-bootstrap';
import { FaTasks, FaSearch, FaSync, FaUser, FaCalendarAlt, FaInfoCircle } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const AssignmentsContent = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/backend/api/agents/assignments.php`,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setAssignments(response.data.data);
      } else {
        setError('Failed to load assignments');
        toast.error('Failed to load assignments');
      }
    } catch (err) {
      console.error('Error loading assignments:', err);
      setError('Failed to load assignments');
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      assigned: { variant: 'warning', text: 'Assigned' },
      in_progress: { variant: 'primary', text: 'In Progress' },
      completed: { variant: 'success', text: 'Completed' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesStatus = filterStatus === 'all' || assignment.status === filterStatus;
    const matchesSearch = !searchQuery || 
      assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (assignment.worker && assignment.worker.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" className="text-primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading assignments...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <h4>Error Loading Assignments</h4>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadAssignments}>Retry</button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="mb-0">Task Assignments</h2>
          <p className="text-muted">Manage and track your assigned tasks</p>
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
              placeholder="Search assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={3}>
          <Form.Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </Form.Select>
        </Col>
        <Col md={3}>
          <Button variant="primary" onClick={loadAssignments}>
            <FaSync className="me-2" />
            Refresh
          </Button>
        </Col>
      </Row>

      {/* Assignments List */}
      {filteredAssignments.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <FaTasks size={48} className="text-muted mb-3" />
            <h5>No Assignments Found</h5>
            <p className="text-muted">
              {filterStatus !== 'all' || searchQuery 
                ? 'No assignments match your current filters.'
                : 'You have no task assignments at the moment.'}
            </p>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          <Col>
            <Card>
              <Card.Body>
                <div className="assignments-list">
                  {filteredAssignments.map((assignment) => (
                    <div key={assignment.id} className="assignment-item border-bottom pb-3 mb-3">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h5 className="mb-1">{assignment.title}</h5>
                          <p className="text-muted mb-2">{assignment.description}</p>
                          
                          <div className="d-flex flex-wrap gap-3">
                            <div>
                              <small className="text-muted">
                                <FaCalendarAlt className="me-1" />
                                Due: {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'N/A'}
                              </small>
                            </div>
                            
                            {assignment.worker && (
                              <div>
                                <small className="text-muted">
                                  <FaUser className="me-1" />
                                  Worker: {assignment.worker.name}
                                </small>
                              </div>
                            )}
                            
                            <div>
                              {getStatusBadge(assignment.status)}
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <small className="text-muted">
                            Created: {new Date(assignment.created_at).toLocaleDateString()}
                          </small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default AssignmentsContent;