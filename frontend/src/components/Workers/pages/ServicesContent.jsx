import React, { useState, useEffect } from 'react';
import { FaTools, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const ServicesContent = ({ serviceRequests }) => {
  const [workerServices, setWorkerServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [availableServices, setAvailableServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchWorkerServices();
    fetchAvailableServices();
  }, []);

  const fetchWorkerServices = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/backend/api/workers/services.php`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setWorkerServices(data.data);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setWorkerServices([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableServices = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/backend/api/services.php`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setAvailableServices(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching available services:', error);
    }
  };

  const handleAddService = async () => {
    if (!selectedService) {
      alert('Please select a service');
      return;
    }

    try {
      const method = isEditing ? 'PUT' : 'POST';
      const response = await fetch(`${import.meta.env.VITE_API_URL}/backend/api/workers/services.php`, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          service_id: selectedService,
          price_override: customPrice || null,
          is_active: isActive ? 1 : 0
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(isEditing ? 'Service updated successfully!' : 'Service added successfully!');
        setShowAddModal(false);
        setSelectedService('');
        setCustomPrice('');
        setIsActive(true);
        setIsEditing(false);
        fetchWorkerServices(); // Refresh the list
      } else {
        alert(`Error ${isEditing ? 'updating' : 'adding'} service: ` + data.message);
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'adding'} service:`, error);
      alert(`Error ${isEditing ? 'updating' : 'adding'} service`);
    }
  };

  const handleEditService = (service) => {
    setSelectedService(service.id);
    setCustomPrice(service.price_override || '');
    setIsActive(service.is_active === 1);
    setIsEditing(true);
    setShowAddModal(true);
  };

  const handleDeleteService = async (serviceId) => {
    if (!confirm('Are you sure you want to remove this service from your profile?')) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/backend/api/workers/services.php`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          service_id: serviceId
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Service removed successfully!');
        fetchWorkerServices(); // Refresh the list
      } else {
        alert('Error removing service: ' + data.message);
      }
    } catch (error) {
      console.error('Error removing service:', error);
      alert('Error removing service');
    }
  };

  const handleToggleStatus = async (serviceId, currentStatus) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/backend/api/workers/services.php`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          service_id: serviceId,
          is_active: currentStatus === 1 ? 0 : 1
        })
      });

      const data = await response.json();
      if (data.success) {
        fetchWorkerServices(); // Refresh the list
      } else {
        alert('Error updating service status: ' + data.message);
      }
    } catch (error) {
      console.error('Error updating service status:', error);
      alert('Error updating service status');
    }
  };

  if (loading) {
    return <div className="loading">Loading services...</div>;
  }

  return (
    <div className="services-content">
      <div className="services-header">
        <h3><FaTools className="page-icon" /> My Services</h3>
        <button className="add-service-btn" onClick={() => {
          setIsEditing(false);
          setSelectedService('');
          setCustomPrice('');
          setIsActive(true);
          setShowAddModal(true);
        }}>
          <FaPlus /> Add Service
        </button>
      </div>

      <div className="services-grid">
        {workerServices.map(service => (
          <div key={service.id} className="service-card">
            <div className="service-header">
              <h4>{service.name}</h4>
              <div className="service-actions">
                <button className="action-btn edit" onClick={() => handleEditService(service)}>
                  <FaEdit />
                </button>
                <button className="action-btn delete" onClick={() => handleDeleteService(service.id)}>
                  <FaTrash />
                </button>
              </div>
            </div>
            <p>{service.description}</p>
            <div className="service-stats">
              <div className="stat-item">
                <span className="stat-label">Completed:</span>
                <span className="stat-value">{service.completed_count || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total:</span>
                <span className="stat-value">{service.total_count || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Success Rate:</span>
                <span className="stat-value">
                  {service.total_count ? Math.round((service.completed_count / service.total_count) * 100) : 0}%
                </span>
              </div>
            </div>
            <div className="service-status">
              <span 
                className={`status-indicator ${service.is_active ? 'active' : 'inactive'} clickable`}
                onClick={() => handleToggleStatus(service.id, service.is_active)}
                title="Click to toggle status"
              >
                {service.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
        
        {workerServices.length === 0 && (
          <div className="no-services">
            <p>No services configured yet.</p>
            <button className="btn btn-primary" onClick={() => {
              setIsEditing(false);
              setSelectedService('');
              setCustomPrice('');
              setIsActive(true);
              setShowAddModal(true);
            }}>
              <FaPlus /> Add Your First Service
            </button>
          </div>
        )}
      </div>

      {/* Add Service Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{isEditing ? 'Edit Service' : 'Add New Service'}</h3>
              <button className="close-btn" onClick={() => {
                setShowAddModal(false);
                setIsEditing(false);
                setSelectedService('');
                setCustomPrice('');
                setIsActive(true);
              }}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Select Service:</label>
                <select 
                  value={selectedService} 
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="form-control"
                  disabled={isEditing}
                >
                  <option value="">Choose a service...</option>
                  {availableServices
                    .filter(service => 
                      isEditing || !workerServices.some(ws => ws.id === service.id)
                    )
                    .map(service => (
                      <option key={service.id} value={service.id}>
                        {service.name} - {service.category_name}
                      </option>
                    ))
                  }
                </select>
                {isEditing && (
                  <small className="form-text">Service cannot be changed when editing</small>
                )}
              </div>
              <div className="form-group">
                <label>Custom Price (optional):</label>
                <input
                  type="number"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  placeholder="Leave empty to use default price"
                  className="form-control"
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  Active (available for booking)
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => {
                setShowAddModal(false);
                setIsEditing(false);
                setSelectedService('');
                setCustomPrice('');
                setIsActive(true);
              }}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleAddService}>
                {isEditing ? 'Update Service' : 'Add Service'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .services-content {
          max-width: 1200px;
          padding: 1rem;
        }

        .page-icon {
          margin-right: 0.5rem;
          color: #3b82f6;
        }

        .services-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .services-header h3 {
          margin: 0;
          color: #1f2937;
          font-size: 1.5rem;
          font-weight: 600;
          display: flex;
          align-items: center;
        }

        .add-service-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .add-service-btn:hover {
          background: #2563eb;
          transform: translateY(-1px);
        }

        .loading {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
          font-size: 1.1rem;
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .service-card {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          border-left: 4px solid #3b82f6;
          transition: transform 0.2s ease;
        }

        .service-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }

        .service-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .service-header h4 {
          margin: 0;
          color: #1f2937;
          font-weight: 600;
        }

        .service-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          padding: 0.25rem;
          border: none;
          background: none;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.2s ease;
          color: #6b7280;
        }

        .action-btn:hover {
          background: #f3f4f6;
        }

        .action-btn.edit:hover {
          color: #3b82f6;
        }

        .action-btn.delete:hover {
          color: #ef4444;
        }

        .service-card p {
          margin: 0 0 1rem 0;
          color: #6b7280;
          line-height: 1.5;
        }

        .service-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .stat-item {
          text-align: center;
          padding: 0.5rem;
          background: #f8fafc;
          border-radius: 6px;
        }

        .stat-label {
          display: block;
          font-size: 0.8rem;
          color: #6b7280;
          font-weight: 500;
          margin-bottom: 0.25rem;
        }

        .stat-value {
          display: block;
          font-size: 1.1rem;
          font-weight: 700;
          color: #1f2937;
        }

        .service-status {
          text-align: center;
        }

        .status-indicator {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .status-indicator.active {
          background: #d1fae5;
          color: #059669;
        }

        .status-indicator.inactive {
          background: #fee2e2;
          color: #dc2626;
        }

        .status-indicator.clickable {
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .status-indicator.clickable:hover {
          transform: scale(1.05);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .no-services {
          grid-column: 1 / -1;
          text-align: center;
          padding: 3rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          border: 2px dashed #d1d5db;
        }

        .no-services p {
          margin: 0 0 1rem 0;
          color: #6b7280;
          font-size: 1.1rem;
        }

        .btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-primary {
          background: #3b82f6;
          color: white;
        }

        .btn-primary:hover {
          background: #2563eb;
          transform: translateY(-1px);
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-header h3 {
          margin: 0;
          color: #1f2937;
          font-weight: 600;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #6b7280;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }

        .close-btn:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #374151;
        }

        .form-control {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 1rem;
          transition: border-color 0.2s ease;
        }

        .form-control:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-control:disabled {
          background-color: #f9fafb;
          color: #6b7280;
          cursor: not-allowed;
        }

        .form-text {
          font-size: 0.875rem;
          color: #6b7280;
          margin-top: 0.25rem;
          display: block;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .checkbox-label input[type="checkbox"] {
          width: auto;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding: 1.5rem;
          border-top: 1px solid #e5e7eb;
        }

        .btn-secondary {
          background: #6b7280;
          color: white;
        }

        .btn-secondary:hover {
          background: #4b5563;
        }

        @media (max-width: 768px) {
          .services-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .services-grid {
            grid-template-columns: 1fr;
          }

          .service-stats {
            grid-template-columns: 1fr;
          }

          .modal-content {
            width: 95%;
            margin: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ServicesContent;
