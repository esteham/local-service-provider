import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import ServiceRequestCard from '../../common/ServiceRequestCard';

const TasksContent = ({ 
  serviceRequests, 
  onAcceptRequest,
  onCompleteRequest,
  onRejectRequest 
}) => {
  const [taskFilter, setTaskFilter] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Filter service requests based on status
  const filteredRequests = serviceRequests.filter(request => {
    if (taskFilter === 'all') return true;
    if (taskFilter === 'pending') return request.status === 'assigned';
    if (taskFilter === 'in_progress') return request.status === 'in_progress';
    if (taskFilter === 'completed') return request.status === 'completed';
    return true;
  });

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedRequest(null);
  };

  return (
    <div className="tasks-content">
      <div className="tasks-header">
        <h3>My Tasks</h3>
        <div className="task-filters">
          <button 
            className={`filter-btn ${taskFilter === 'all' ? 'active' : ''}`}
            onClick={() => setTaskFilter('all')}
          >
            All ({serviceRequests.length})
          </button>
          <button 
            className={`filter-btn ${taskFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setTaskFilter('pending')}
          >
            Pending ({serviceRequests.filter(r => r.status === 'assigned').length})
          </button>
          <button 
            className={`filter-btn ${taskFilter === 'in_progress' ? 'active' : ''}`}
            onClick={() => setTaskFilter('in_progress')}
          >
            In Progress ({serviceRequests.filter(r => r.status === 'in_progress').length})
          </button>
          <button 
            className={`filter-btn ${taskFilter === 'completed' ? 'active' : ''}`}
            onClick={() => setTaskFilter('completed')}
          >
            Completed ({serviceRequests.filter(r => r.status === 'completed').length})
          </button>
        </div>
      </div>
      
      <div className="tasks-grid">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((request) => (
            <ServiceRequestCard
              key={request.id}
              request={request}
              userRole="worker"
              onAccept={onAcceptRequest}
              onReject={onRejectRequest}
              onComplete={onCompleteRequest}
              onViewDetails={handleViewDetails}
            />
          ))
        ) : (
          <div className="no-tasks">
            <p>No tasks found for the selected filter.</p>
          </div>
        )}
      </div>

      {/* Task Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="modal-overlay" onClick={closeDetailsModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Task Details</h3>
              <button className="close-btn" onClick={closeDetailsModal}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="request-details-grid">
                <div className="detail-item">
                  <label>Request ID:</label>
                  <span>#{selectedRequest.id}</span>
                </div>
                <div className="detail-item">
                  <label>Service:</label>
                  <span>{selectedRequest.service_name}</span>
                </div>
                <div className="detail-item">
                  <label>Customer:</label>
                  <span>{selectedRequest.customer_name}</span>
                </div>
                <div className="detail-item">
                  <label>Phone:</label>
                  <span>{selectedRequest.customer_phone}</span>
                </div>
                <div className="detail-item">
                  <label>Address:</label>
                  <span>{selectedRequest.address}</span>
                </div>
                <div className="detail-item">
                  <label>Status:</label>
                  <span className={`status-badge status-${selectedRequest.status}`}>
                    {selectedRequest.status}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Price:</label>
                  <span>${selectedRequest.final_price}</span>
                </div>
                <div className="detail-item">
                  <label>Date:</label>
                  <span>{new Date(selectedRequest.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              {selectedRequest.description && (
                <div className="description-section">
                  <label>Description:</label>
                  <p>{selectedRequest.description}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              {selectedRequest.status === 'assigned' && (
                <>
                  <button 
                    className="btn btn-success"
                    onClick={() => {
                      onAcceptRequest(selectedRequest.id);
                      closeDetailsModal();
                    }}
                  >
                    Accept Task
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => {
                      onRejectRequest(selectedRequest.id);
                      closeDetailsModal();
                    }}
                  >
                    Reject Task
                  </button>
                </>
              )}
              {selectedRequest.status === 'in_progress' && (
                <button 
                  className="btn btn-success"
                  onClick={() => {
                    onCompleteRequest(selectedRequest.id);
                    closeDetailsModal();
                  }}
                >
                  Mark Complete
                </button>
              )}
              <button className="btn btn-secondary" onClick={closeDetailsModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .tasks-content {
          max-width: 1200px;
          padding: 1rem;
        }

        .tasks-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .tasks-header h3 {
          margin: 0;
          color: #1f2937;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .task-filters {
          display: flex;
          gap: 0.5rem;
        }

        .filter-btn {
          padding: 0.5rem 1rem;
          border: 1px solid #e5e7eb;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
          font-weight: 500;
          color: #374151;
        }

        .filter-btn:hover {
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .filter-btn.active {
          background: #3b82f6;
          border-color: #3b82f6;
          color: white;
        }

        .tasks-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .no-tasks {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          grid-column: 1 / -1;
        }

        /* Modal Styles */
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
          padding: 1rem;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
          background: #f8fafc;
          border-radius: 12px 12px 0 0;
        }

        .modal-header h3 {
          margin: 0;
          color: #1f2937;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.2rem;
          color: #6b7280;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: #e5e7eb;
          color: #374151;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .request-details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .detail-item label {
          font-weight: 600;
          color: #374151;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .detail-item span {
          color: #6b7280;
          font-size: 1rem;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: capitalize;
          width: fit-content;
        }

        .status-assigned {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .status-in_progress {
          background: #fef3c7;
          color: #d97706;
        }

        .status-completed {
          background: #d1fae5;
          color: #059669;
        }

        .description-section {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .description-section label {
          font-weight: 600;
          color: #374151;
          display: block;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          font-size: 0.9rem;
          letter-spacing: 0.05em;
        }

        .description-section p {
          margin: 0;
          color: #6b7280;
          line-height: 1.6;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 8px;
          border-left: 4px solid #3b82f6;
        }

        .modal-footer {
          display: flex;
          gap: 1rem;
          padding: 1.5rem;
          border-top: 1px solid #e5e7eb;
          justify-content: flex-end;
          background: #f8fafc;
          border-radius: 0 0 12px 12px;
        }

        .btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.9rem;
        }

        .btn-success {
          background: #10b981;
          color: white;
        }

        .btn-success:hover {
          background: #059669;
          transform: translateY(-1px);
        }

        .btn-danger {
          background: #ef4444;
          color: white;
        }

        .btn-danger:hover {
          background: #dc2626;
          transform: translateY(-1px);
        }

        .btn-secondary {
          background: #6b7280;
          color: white;
        }

        .btn-secondary:hover {
          background: #4b5563;
          transform: translateY(-1px);
        }

        @media (max-width: 768px) {
          .tasks-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .task-filters {
            flex-wrap: wrap;
            width: 100%;
          }

          .filter-btn {
            flex: 1;
            min-width: 120px;
          }

          .tasks-grid {
            grid-template-columns: 1fr;
          }

          .request-details-grid {
            grid-template-columns: 1fr;
          }

          .modal-footer {
            flex-direction: column;
          }

          .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default TasksContent;
