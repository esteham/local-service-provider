/* eslint-disable no-unused-vars */
import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaMapMarkerAlt,
  FaPhone,
  FaUser,
  FaCalendarAlt,
  FaDollarSign,
  FaEye,
  FaCheck,
  FaTimes,
  FaClock,
  FaThumbsUp,
  FaThumbsDown
} from 'react-icons/fa';

const ServiceRequestCard = ({ 
  request, 
  onAccept, 
  onReject, 
  onComplete, 
  onViewDetails, 
  onAssign,
  userRole = 'worker' // 'worker', 'agent', 'admin'
}) => {
  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'bg-warning', text: 'Pending', color: '#fef3c7', textColor: '#92400e' },
      assigned: { class: 'bg-info', text: 'Assigned', color: '#dbeafe', textColor: '#1e40af' },
      in_progress: { class: 'bg-primary', text: 'In Progress', color: '#dbeafe', textColor: '#1e40af' },
      completed: { class: 'bg-success', text: 'Completed', color: '#d1fae5', textColor: '#065f46' },
      cancelled: { class: 'bg-secondary', text: 'Cancelled', color: '#f3f4f6', textColor: '#6b7280' }
    };
    return badges[status] || badges.pending;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'ASAP';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusBadge = getStatusBadge(request.status);

  const renderActions = () => {
    if (userRole === 'worker') {
      return (
        <div className="request-actions">
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => onViewDetails && onViewDetails(request)}
          >
            <FaEye className="me-1" />
            View Details
          </button>
          
          {request.status === 'pending' && (
            <>
              <button
                className="btn btn-success btn-sm"
                onClick={() => onAccept && onAccept(request.id)}
              >
                <FaThumbsUp className="me-1" />
                Accept
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => onReject && onReject(request.id)}
              >
                <FaThumbsDown className="me-1" />
                Decline
              </button>
            </>
          )}
          
          {request.status === 'assigned' && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onAccept && onAccept(request.id)}
            >
              <FaClock className="me-1" />
              Start Work
            </button>
          )}
          
          {request.status === 'in_progress' && (
            <button
              className="btn btn-success btn-sm"
              onClick={() => onComplete && onComplete(request.id)}
            >
              <FaCheck className="me-1" />
              Mark Complete
            </button>
          )}
        </div>
      );
    }

    if (userRole === 'agent') {
      return (
        <div className="request-actions">
          <button
            className="btn btn-success btn-sm"
            onClick={() => onAssign && onAssign(request.id)}
          >
            <FaCheck className="me-1" />
            Assign
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onReject && onReject(request.id)}
          >
            <FaTimes className="me-1" />
            Reject
          </button>
          <button
            className="btn btn-info btn-sm"
            onClick={() => onViewDetails && onViewDetails(request)}
          >
            <FaEye className="me-1" />
            Details
          </button>
        </div>
      );
    }

    if (userRole === 'admin') {
      return (
        <div className="request-actions">
          <button
            className="btn btn-info btn-sm"
            onClick={() => onViewDetails && onViewDetails(request)}
          >
            <FaEye className="me-1" />
            View Details
          </button>
          {request.status === 'pending' && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onAssign && onAssign(request.id)}
            >
              <FaUser className="me-1" />
              Manage
            </button>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <motion.div
      className="service-request-card"
      whileHover={{ y: -2, scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      <div className="card-header">
        <div className="request-title">
          <h4>{request.service_name || request.title}</h4>
          <small className="text-muted">
            <FaMapMarkerAlt className="me-1" />
            {request.zone_name || request.location || request.address}
          </small>
        </div>
        <span 
          className="status-badge"
          style={{ 
            backgroundColor: statusBadge.color, 
            color: statusBadge.textColor 
          }}
        >
          {statusBadge.text}
        </span>
      </div>
      
      <div className="card-body">
        {request.description && (
          <p className="request-description">
            {request.description.length > 150 
              ? `${request.description.substring(0, 150)}...` 
              : request.description
            }
          </p>
        )}
        
        <div className="request-details">
          <div className="detail-row">
            <div className="detail-item">
              <FaUser className="detail-icon" />
              <span>
                <strong>Client:</strong> {request.contact_name || request.customer_name || request.user_name}
              </span>
            </div>
            <div className="detail-item">
              <FaPhone className="detail-icon" />
              <span>{request.contact_phone || request.phone}</span>
            </div>
          </div>
          
          <div className="detail-row">
            <div className="detail-item">
              <FaCalendarAlt className="detail-icon" />
              <span>
                <strong>Schedule:</strong> {formatDate(request.scheduled_at)}
              </span>
            </div>
            <div className="detail-item price">
              <FaDollarSign className="detail-icon" />
              <span className="price-amount">
                ${request.final_price || request.price}
              </span>
            </div>
          </div>
        </div>
        
        {renderActions()}
      </div>
      
      <div className="card-footer">
        <small className="text-muted">
          Created: {formatDate(request.created_at)}
        </small>
        {request.worker_name && (
          <small className="text-muted">
            Worker: {request.worker_name}
          </small>
        )}
      </div>

      <style jsx>{`
        .service-request-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          transition: all 0.3s ease;
          margin-bottom: 1rem;
        }

        .service-request-card:hover {
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }

        .card-header {
          padding: 1.25rem;
          background: #f8fafc;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .request-title h4 {
          margin: 0 0 0.5rem 0;
          color: #1f2937;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .request-title small {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .status-badge {
          padding: 0.375rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: capitalize;
          white-space: nowrap;
        }

        .card-body {
          padding: 1.25rem;
        }

        .request-description {
          color: #6b7280;
          margin-bottom: 1rem;
          line-height: 1.5;
        }

        .request-details {
          margin-bottom: 1.25rem;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }

        .detail-row:last-child {
          margin-bottom: 0;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
        }

        .detail-item.price {
          justify-content: flex-end;
        }

        .detail-icon {
          color: #6b7280;
          font-size: 0.875rem;
          min-width: 16px;
        }

        .detail-item span {
          color: #374151;
          font-size: 0.875rem;
        }

        .price-amount {
          color: #059669 !important;
          font-weight: 600 !important;
          font-size: 1rem !important;
        }

        .request-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          font-size: 0.875rem;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.375rem;
          text-decoration: none;
        }

        .btn-sm {
          padding: 0.375rem 0.75rem;
          font-size: 0.8125rem;
        }

        .btn-success { 
          background: #10b981; 
          color: white; 
        }

        .btn-danger { 
          background: #ef4444; 
          color: white; 
        }

        .btn-primary { 
          background: #3b82f6; 
          color: white; 
        }

        .btn-info { 
          background: #06b6d4; 
          color: white; 
        }

        .btn-outline-primary {
          background: transparent;
          border: 1px solid #3b82f6;
          color: #3b82f6;
        }

        .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .btn-outline-primary:hover {
          background: #3b82f6;
          color: white;
        }

        .card-footer {
          padding: 1rem 1.25rem;
          background: #f9fafb;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-footer small {
          color: #6b7280;
          font-size: 0.8125rem;
        }

        @media (max-width: 768px) {
          .detail-row {
            flex-direction: column;
            gap: 0.5rem;
          }

          .detail-item.price {
            justify-content: flex-start;
          }

          .request-actions {
            flex-direction: column;
          }

          .btn {
            justify-content: center;
          }

          .card-footer {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default ServiceRequestCard;
