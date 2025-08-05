import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Modal, Alert, Spinner, Form, Row, Col } from 'react-bootstrap';
import { FaCheck, FaTimes, FaEye, FaUser, FaHammer, FaUserTie, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const PendingUsersContent = () => {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [filter, setFilter] = useState('all'); // all, worker, agent

    const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost';

    useEffect(() => {
        fetchPendingUsers();
    }, []);

    const fetchPendingUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URL}/backend/api/admin/users.php?status=pending`, {
                withCredentials: true
            });

            if (response.data.success) {
                setPendingUsers(response.data.data || []);
            } else {
                toast.error('Failed to fetch pending users');
            }
        } catch (error) {
            console.error('Error fetching pending users:', error);
            toast.error('Failed to fetch pending users');
        } finally {
            setLoading(false);
        }
    };

    const handleApproveUser = async (userId) => {
        try {
            setActionLoading(userId);
            const response = await axios.post(`${BASE_URL}/backend/api/admin/approve_user.php`, {
                user_id: userId
            }, {
                withCredentials: true
            });

            if (response.data.success) {
                toast.success('User approved successfully');
                fetchPendingUsers(); // Refresh the list
            } else {
                toast.error(response.data.message || 'Failed to approve user');
            }
        } catch (error) {
            console.error('Error approving user:', error);
            toast.error('Failed to approve user');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRejectUser = async (userId) => {
        const reason = window.prompt('Please provide a reason for rejection (optional):');
        if (reason === null) { // User clicked cancel
            return;
        }
        
        if (!window.confirm('Are you sure you want to reject this user? This action cannot be undone.')) {
            return;
        }

        try {
            setActionLoading(userId);
            const response = await axios.post(`${BASE_URL}/backend/api/admin/reject_user.php`, {
                user_id: userId,
                reason: reason || 'No reason provided'
            }, {
                withCredentials: true
            });

            if (response.data.success) {
                toast.success('User rejected successfully');
                fetchPendingUsers(); // Refresh the list
            } else {
                toast.error(response.data.message || 'Failed to reject user');
            }
        } catch (error) {
            console.error('Error rejecting user:', error);
            toast.error('Failed to reject user');
        } finally {
            setActionLoading(null);
        }
    };

    const handleViewDetails = (user) => {
        setSelectedUser(user);
        setShowDetailsModal(true);
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'worker': return <FaHammer className="text-success" />;
            case 'agent': return <FaUserTie className="text-primary" />;
            default: return <FaUser className="text-secondary" />;
        }
    };

    const getRoleBadge = (role) => {
        const variants = {
            worker: 'success',
            agent: 'primary',
            user: 'secondary'
        };
        return <Badge bg={variants[role] || 'secondary'}>{role.charAt(0).toUpperCase() + role.slice(1)}</Badge>;
    };

    const filteredUsers = pendingUsers.filter(user => {
        if (filter === 'all') return true;
        return user.role === filter;
    });

    const getStatusBadge = (user) => {
        if (!user.email_verified) {
            return <Badge bg="warning">Email Pending</Badge>;
        }
        return <Badge bg="info">Pending Approval</Badge>;
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    return (
        <div className="pending-users-content">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0">Pending User Approvals</h4>
                <div className="d-flex gap-2">
                    <Form.Select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        style={{ width: 'auto' }}
                    >
                        <option value="all">All Roles</option>
                        <option value="worker">Workers</option>
                        <option value="agent">Agents</option>
                    </Form.Select>
                    <Button variant="outline-primary" onClick={fetchPendingUsers}>
                        Refresh
                    </Button>
                </div>
            </div>

            {filteredUsers.length === 0 ? (
                <Card>
                    <Card.Body className="text-center py-5">
                        <FaUser size={48} className="text-muted mb-3" />
                        <h5>No Pending Users</h5>
                        <p className="text-muted">All users have been processed or no new registrations.</p>
                    </Card.Body>
                </Card>
            ) : (
                <Card>
                    <Card.Body className="p-0">
                        <Table responsive hover className="mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th>User</th>
                                    <th>Role</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Status</th>
                                    <th>Registered</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                {getRoleIcon(user.role)}
                                                <div className="ms-2">
                                                    <div className="fw-bold">{user.username}</div>
                                                    <small className="text-muted">ID: {user.id}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{getRoleBadge(user.role)}</td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <FaEnvelope className="text-muted me-1" size={12} />
                                                {user.email}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <FaPhone className="text-muted me-1" size={12} />
                                                {user.phone || 'N/A'}
                                            </div>
                                        </td>
                                        <td>{getStatusBadge(user)}</td>
                                        <td>
                                            <small className="text-muted">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </small>
                                        </td>
                                        <td>
                                            <div className="d-flex gap-1">
                                                <Button
                                                    variant="outline-info"
                                                    size="sm"
                                                    onClick={() => handleViewDetails(user)}
                                                >
                                                    <FaEye />
                                                </Button>
                                                {user.email_verified && (
                                                    <>
                                                        <Button
                                                            variant="outline-success"
                                                            size="sm"
                                                            onClick={() => handleApproveUser(user.id)}
                                                            disabled={actionLoading === user.id}
                                                        >
                                                            {actionLoading === user.id ? (
                                                                <Spinner size="sm" />
                                                            ) : (
                                                                <FaCheck />
                                                            )}
                                                        </Button>
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            onClick={() => handleRejectUser(user.id)}
                                                            disabled={actionLoading === user.id}
                                                        >
                                                            <FaTimes />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            )}

            {/* User Details Modal */}
            <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {getRoleIcon(selectedUser?.role)} User Details - {selectedUser?.username}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedUser && (
                        <Row>
                            <Col md={6}>
                                <h6>Basic Information</h6>
                                <table className="table table-sm">
                                    <tbody>
                                        <tr>
                                            <td><strong>Username:</strong></td>
                                            <td>{selectedUser.username}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Email:</strong></td>
                                            <td>{selectedUser.email}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Phone:</strong></td>
                                            <td>{selectedUser.phone || 'N/A'}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Role:</strong></td>
                                            <td>{getRoleBadge(selectedUser.role)}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Status:</strong></td>
                                            <td>{getStatusBadge(selectedUser)}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Email Verified:</strong></td>
                                            <td>
                                                <Badge bg={selectedUser.email_verified ? 'success' : 'danger'}>
                                                    {selectedUser.email_verified ? 'Yes' : 'No'}
                                                </Badge>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td><strong>Registered:</strong></td>
                                            <td>{new Date(selectedUser.created_at).toLocaleString()}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </Col>
                            <Col md={6}>
                                <h6>Additional Information</h6>
                                {selectedUser.role === 'worker' && (
                                    <Alert variant="info">
                                        <strong>Worker Profile:</strong><br />
                                        This user has registered as a service worker and will be able to accept and complete service requests once approved.
                                    </Alert>
                                )}
                                {selectedUser.role === 'agent' && (
                                    <Alert variant="primary">
                                        <strong>Agent Profile:</strong><br />
                                        This user has registered as an agent and will be able to manage workers and service requests in their assigned area once approved.
                                    </Alert>
                                )}
                                {!selectedUser.email_verified && (
                                    <Alert variant="warning">
                                        <strong>Email Not Verified:</strong><br />
                                        This user has not yet verified their email address. They must complete email verification before approval.
                                    </Alert>
                                )}
                            </Col>
                        </Row>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    {selectedUser?.email_verified && (
                        <>
                            <Button
                                variant="success"
                                onClick={() => {
                                    handleApproveUser(selectedUser.id);
                                    setShowDetailsModal(false);
                                }}
                                disabled={actionLoading === selectedUser?.id}
                            >
                                <FaCheck className="me-1" />
                                Approve User
                            </Button>
                            <Button
                                variant="danger"
                                onClick={() => {
                                    handleRejectUser(selectedUser.id);
                                    setShowDetailsModal(false);
                                }}
                                disabled={actionLoading === selectedUser?.id}
                            >
                                <FaTimes className="me-1" />
                                Reject User
                            </Button>
                        </>
                    )}
                    <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default PendingUsersContent;
