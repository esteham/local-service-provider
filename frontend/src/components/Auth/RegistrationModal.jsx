import React, { useState } from 'react';
import { Modal, Button, Card, Row, Col } from 'react-bootstrap';
import { FaUser, FaHammer, FaUserTie } from 'react-icons/fa';
import UserRegistrationForm from './UserRegistrationForm';
import WorkerRegistrationForm from './WorkerRegistrationForm';
import AgentRegistrationForm from './AgentRegistrationForm';
import '../../assets/css/registration.css';

const RegistrationModal = ({ show, onHide }) => {
  const [selectedType, setSelectedType] = useState(null);

  const handleClose = () => {
    setSelectedType(null);
    onHide();
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
  };

  const handleBackToSelection = () => {
    setSelectedType(null);
  };

  const registrationTypes = [
    {
      type: 'user',
      title: 'User',
      description: 'Register as a customer to book services',
      icon: <FaUser size={40} />,
      color: 'primary'
    },
    {
      type: 'worker',
      title: 'Worker',
      description: 'Register as a service provider to offer your skills',
      icon: <FaHammer size={40} />,
      color: 'success'
    },
    {
      type: 'agent',
      title: 'Agent',
      description: 'Register as an agent to manage service operations',
      icon: <FaUserTie size={40} />,
      color: 'warning'
    }
  ];

  const renderRegistrationForm = () => {
    switch (selectedType) {
      case 'user':
        return <UserRegistrationForm onClose={handleClose} onBack={handleBackToSelection} />;
      case 'worker':
        return <WorkerRegistrationForm onClose={handleClose} onBack={handleBackToSelection} />;
      case 'agent':
        return <AgentRegistrationForm onClose={handleClose} onBack={handleBackToSelection} />;
      default:
        return null;
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      size="lg" 
      centered
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {selectedType ? `${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Registration` : 'Choose Registration Type'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {!selectedType ? (
          <div className="registration-type-selection">
            <Row className="g-3">
              {registrationTypes.map((regType) => (
                <Col md={4} key={regType.type}>
                  <Card 
                    className={`h-100 text-center registration-card border-${regType.color}`}
                    style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                    onClick={() => handleTypeSelect(regType.type)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <Card.Body className="p-4">
                      <div className={`text-${regType.color} mb-3`}>
                        {regType.icon}
                      </div>
                      <Card.Title className={`text-${regType.color}`}>
                        {regType.title}
                      </Card.Title>
                      <Card.Text className="text-muted small">
                        {regType.description}
                      </Card.Text>
                      <Button 
                        variant={`outline-${regType.color}`} 
                        size="sm"
                        className="mt-2"
                      >
                        Select
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
            <div className="text-center mt-4">
              <small className="text-muted">
                Click on any option above to start your registration process
              </small>
            </div>
          </div>
        ) : (
          renderRegistrationForm()
        )}
      </Modal.Body>
    </Modal>
  );
};

export default RegistrationModal;
