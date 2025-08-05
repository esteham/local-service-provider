/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaStar, 
  FaClock, 
  FaMapMarkerAlt, 
  FaUser, 
  FaPhone, 
  FaEnvelope,
  FaTools,
  FaDollarSign
} from 'react-icons/fa';

const ServiceCard = ({ service, onRequestService, onViewDetails }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getUrgencyBadge = (urgency) => {
    const badges = {
      normal: { class: 'bg-success', text: 'Normal' },
      urgent: { class: 'bg-warning', text: 'Urgent' },
      emergency: { class: 'bg-danger', text: 'Emergency' }
    };
    return badges[urgency] || badges.normal;
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'bg-warning', text: 'Pending' },
      assigned: { class: 'bg-info', text: 'Assigned' },
      in_progress: { class: 'bg-primary', text: 'In Progress' },
      completed: { class: 'bg-success', text: 'Completed' },
      cancelled: { class: 'bg-secondary', text: 'Cancelled' }
    };
    return badges[status] || badges.pending;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const urgencyBadge = getUrgencyBadge(service.urgency);
  const statusBadge = getStatusBadge(service.status);

  return (
    <motion.div
      className="card h-100 shadow-sm service-card"
      whileHover={{ y: -5, boxShadow: "0 8px 25px rgba(0,0,0,0.15)" }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      layout
    >
      <div className="card-header bg-white border-bottom">
        <div className="d-flex justify-content-between align-items-start">
          <div className="flex-grow-1">
            <h6 className="card-title mb-1 fw-bold text-primary">
              {service.title}
            </h6>
            <p className="text-muted small mb-0">
              <FaTools className="me-1" />
              {service.service_name || service.category_name}
            </p>
          </div>
          <div className="text-end">
            <span className={`badge ${urgencyBadge.class} mb-1`}>
              {urgencyBadge.text}
            </span>
            <br />
            <span className={`badge ${statusBadge.class}`}>
              {statusBadge.text}
            </span>
          </div>
        </div>
      </div>

      <div className="card-body">
        <p className="card-text text-muted small mb-3">
          {service.description.length > 100 
            ? `${service.description.substring(0, 100)}...` 
            : service.description
          }
        </p>

        <div className="row g-2 mb-3">
          <div className="col-12">
            <div className="d-flex align-items-center text-muted small">
              <FaMapMarkerAlt className="me-2 text-primary" />
              <span className="text-truncate">
                {service.address}
              </span>
            </div>
          </div>
          
          {service.scheduled_at && (
            <div className="col-12">
              <div className="d-flex align-items-center text-muted small">
                <FaClock className="me-2 text-primary" />
                <span>Scheduled: {formatDate(service.scheduled_at)}</span>
              </div>
            </div>
          )}

          {service.worker_name && (
            <div className="col-12">
              <div className="d-flex align-items-center text-muted small">
                <FaUser className="me-2 text-primary" />
                <span>Provider: {service.worker_name}</span>
                {service.worker_rating && (
                  <span className="ms-2">
                    <FaStar className="text-warning me-1" />
                    {service.worker_rating}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {service.final_price && (
          <div className="price-section mb-3">
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-muted small">Total Cost:</span>
              <span className="h5 mb-0 text-success fw-bold">
                <FaDollarSign className="small" />
                {service.final_price}
              </span>
            </div>
            {service.base_price !== service.final_price && (
              <div className="text-end">
                <small className="text-muted text-decoration-line-through">
                  ${service.base_price}
                </small>
              </div>
            )}
          </div>
        )}

        {service.contact_phone && (
          <div className="contact-info mb-3">
            <div className="d-flex align-items-center text-muted small mb-1">
              <FaPhone className="me-2 text-primary" />
              <span>{service.contact_phone}</span>
            </div>
            {service.contact_email && (
              <div className="d-flex align-items-center text-muted small">
                <FaEnvelope className="me-2 text-primary" />
                <span className="text-truncate">{service.contact_email}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card-footer bg-white border-top">
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-primary btn-sm flex-fill"
            onClick={() => onViewDetails && onViewDetails(service)}
          >
            View Details
          </button>
          
          {service.status === 'pending' && onRequestService && (
            <button
              className="btn btn-primary btn-sm flex-fill"
              onClick={() => onRequestService(service)}
            >
              Request Service
            </button>
          )}
          
          {service.status === 'completed' && !service.reviewed && (
            <button
              className="btn btn-success btn-sm flex-fill"
              onClick={() => onViewDetails && onViewDetails(service, 'review')}
            >
              Leave Review
            </button>
          )}
        </div>
        
        <div className="text-center mt-2">
          <small className="text-muted">
            Created: {formatDate(service.created_at)}
          </small>
        </div>
      </div>

      <style jsx>{`
        .service-card {
          transition: all 0.3s ease;
          border: 1px solid #e3e6f0;
        }
        
        .service-card:hover {
          border-color: #4e73df;
        }
        
        .price-section {
          background: linear-gradient(135deg, #f8f9fc 0%, #e3e6f0 100%);
          padding: 0.75rem;
          border-radius: 0.5rem;
          border: 1px solid #e3e6f0;
        }
        
        .contact-info {
          background: #f8f9fc;
          padding: 0.5rem;
          border-radius: 0.375rem;
          border-left: 3px solid #4e73df;
        }
      `}</style>
    </motion.div>
  );
};

export default ServiceCard;
