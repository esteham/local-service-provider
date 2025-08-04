/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  FaMapMarkerAlt, 
  FaClock, 
  FaExclamationTriangle, 
  FaCalculator,
  FaUser,
  FaPhone,
  FaEnvelope
} from 'react-icons/fa';

const ServiceRequestForm = ({ serviceId, onClose, onSuccess }) => {
  const [services, setServices] = useState([]);
  const [zones, setZones] = useState([]);
  const [priceEstimate, setPriceEstimate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);

  // Validation schema
  const validationSchema = Yup.object({
    service_id: Yup.number().required('Service is required'),
    zone_id: Yup.number().required('Zone is required'),
    title: Yup.string().required('Title is required').min(5, 'Title must be at least 5 characters'),
    description: Yup.string().required('Description is required').min(20, 'Description must be at least 20 characters'),
    address: Yup.string().required('Address is required'),
    urgency: Yup.string().oneOf(['normal', 'urgent', 'emergency']).required('Urgency is required'),
    scheduled_at: Yup.date().min(new Date(), 'Schedule date must be in the future'),
    contact_name: Yup.string().required('Contact name is required'),
    contact_phone: Yup.string().required('Contact phone is required'),
    contact_email: Yup.string().email('Invalid email format')
  });

  const formik = useFormik({
    initialValues: {
      service_id: serviceId || '',
      zone_id: '',
      title: '',
      description: '',
      address: '',
      urgency: 'normal',
      scheduled_at: '',
      contact_name: '',
      contact_phone: '',
      contact_email: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const response = await axios.post('/api/user/request_service.php', values);
        
        if (response.data.success) {
          toast.success('Service request submitted successfully!');
          onSuccess && onSuccess(response.data.data);
          onClose && onClose();
        } else {
          toast.error(response.data.message || 'Failed to submit service request');
        }
      } catch (error) {
        toast.error('An error occurred while submitting the request');
        console.error('Service request error:', error);
      } finally {
        setLoading(false);
      }
    }
  });

  // Load services and zones
  useEffect(() => {
    const loadData = async () => {
      try {
        const [servicesRes, zonesRes] = await Promise.all([
          axios.get('/api/Services/get_services.php'),
          axios.get('/api/zones/view.php')
        ]);

        if (servicesRes.data.success) {
          setServices(servicesRes.data.data);
        }

        if (zonesRes.data.success) {
          setZones(zonesRes.data.data);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  // Calculate price estimate when service, zone, or urgency changes
  useEffect(() => {
    if (formik.values.service_id && formik.values.zone_id) {
      calculatePrice();
    }
  }, [formik.values.service_id, formik.values.zone_id, formik.values.urgency]);

  const calculatePrice = async () => {
    setCalculating(true);
    try {
      const response = await axios.post('/api/dynamic_pricing/calculate_price.php', {
        service_id: formik.values.service_id,
        zone_id: formik.values.zone_id,
        urgency: formik.values.urgency,
        request_time: formik.values.scheduled_at || new Date().toISOString()
      });

      if (response.data.success) {
        setPriceEstimate(response.data.data);
      }
    } catch (error) {
      console.error('Price calculation error:', error);
    } finally {
      setCalculating(false);
    }
  };

  const urgencyOptions = [
    { value: 'normal', label: 'Normal', color: 'success', icon: FaClock },
    { value: 'urgent', label: 'Urgent', color: 'warning', icon: FaExclamationTriangle },
    { value: 'emergency', label: 'Emergency', color: 'danger', icon: FaExclamationTriangle }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="modal-overlay"
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              <FaUser className="me-2" />
              Request Service
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>

          <form onSubmit={formik.handleSubmit}>
            <div className="modal-body">
              <div className="row">
                {/* Service Selection */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">Service *</label>
                  <select
                    className={`form-select ${formik.touched.service_id && formik.errors.service_id ? 'is-invalid' : ''}`}
                    name="service_id"
                    value={formik.values.service_id}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    <option value="">Select a service</option>
                    {services.map(service => (
                      <option key={service.id} value={service.id}>
                        {service.name} - ${service.base_price}/{service.unit}
                      </option>
                    ))}
                  </select>
                  {formik.touched.service_id && formik.errors.service_id && (
                    <div className="invalid-feedback">{formik.errors.service_id}</div>
                  )}
                </div>

                {/* Zone Selection */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    <FaMapMarkerAlt className="me-1" />
                    Zone *
                  </label>
                  <select
                    className={`form-select ${formik.touched.zone_id && formik.errors.zone_id ? 'is-invalid' : ''}`}
                    name="zone_id"
                    value={formik.values.zone_id}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    <option value="">Select a zone</option>
                    {zones.map(zone => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name}
                      </option>
                    ))}
                  </select>
                  {formik.touched.zone_id && formik.errors.zone_id && (
                    <div className="invalid-feedback">{formik.errors.zone_id}</div>
                  )}
                </div>

                {/* Title */}
                <div className="col-12 mb-3">
                  <label className="form-label">Service Title *</label>
                  <input
                    type="text"
                    className={`form-control ${formik.touched.title && formik.errors.title ? 'is-invalid' : ''}`}
                    name="title"
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Brief title for your service request"
                  />
                  {formik.touched.title && formik.errors.title && (
                    <div className="invalid-feedback">{formik.errors.title}</div>
                  )}
                </div>

                {/* Description */}
                <div className="col-12 mb-3">
                  <label className="form-label">Description *</label>
                  <textarea
                    className={`form-control ${formik.touched.description && formik.errors.description ? 'is-invalid' : ''}`}
                    name="description"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    rows="4"
                    placeholder="Detailed description of the work needed"
                  ></textarea>
                  {formik.touched.description && formik.errors.description && (
                    <div className="invalid-feedback">{formik.errors.description}</div>
                  )}
                </div>

                {/* Address */}
                <div className="col-12 mb-3">
                  <label className="form-label">
                    <FaMapMarkerAlt className="me-1" />
                    Service Address *
                  </label>
                  <textarea
                    className={`form-control ${formik.touched.address && formik.errors.address ? 'is-invalid' : ''}`}
                    name="address"
                    value={formik.values.address}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    rows="2"
                    placeholder="Complete address where service is needed"
                  ></textarea>
                  {formik.touched.address && formik.errors.address && (
                    <div className="invalid-feedback">{formik.errors.address}</div>
                  )}
                </div>

                {/* Urgency */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">Urgency Level *</label>
                  <div className="row">
                    {urgencyOptions.map(option => {
                      const IconComponent = option.icon;
                      return (
                        <div key={option.value} className="col-4">
                          <input
                            type="radio"
                            className="btn-check"
                            name="urgency"
                            id={`urgency-${option.value}`}
                            value={option.value}
                            checked={formik.values.urgency === option.value}
                            onChange={formik.handleChange}
                          />
                          <label
                            className={`btn btn-outline-${option.color} w-100 text-center`}
                            htmlFor={`urgency-${option.value}`}
                          >
                            <IconComponent className="d-block mx-auto mb-1" />
                            <small>{option.label}</small>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Scheduled Date */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    <FaClock className="me-1" />
                    Preferred Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    className={`form-control ${formik.touched.scheduled_at && formik.errors.scheduled_at ? 'is-invalid' : ''}`}
                    name="scheduled_at"
                    value={formik.values.scheduled_at}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  {formik.touched.scheduled_at && formik.errors.scheduled_at && (
                    <div className="invalid-feedback">{formik.errors.scheduled_at}</div>
                  )}
                </div>

                {/* Contact Information */}
                <div className="col-md-4 mb-3">
                  <label className="form-label">
                    <FaUser className="me-1" />
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    className={`form-control ${formik.touched.contact_name && formik.errors.contact_name ? 'is-invalid' : ''}`}
                    name="contact_name"
                    value={formik.values.contact_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Your name"
                  />
                  {formik.touched.contact_name && formik.errors.contact_name && (
                    <div className="invalid-feedback">{formik.errors.contact_name}</div>
                  )}
                </div>

                <div className="col-md-4 mb-3">
                  <label className="form-label">
                    <FaPhone className="me-1" />
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    className={`form-control ${formik.touched.contact_phone && formik.errors.contact_phone ? 'is-invalid' : ''}`}
                    name="contact_phone"
                    value={formik.values.contact_phone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Your phone number"
                  />
                  {formik.touched.contact_phone && formik.errors.contact_phone && (
                    <div className="invalid-feedback">{formik.errors.contact_phone}</div>
                  )}
                </div>

                <div className="col-md-4 mb-3">
                  <label className="form-label">
                    <FaEnvelope className="me-1" />
                    Contact Email
                  </label>
                  <input
                    type="email"
                    className={`form-control ${formik.touched.contact_email && formik.errors.contact_email ? 'is-invalid' : ''}`}
                    name="contact_email"
                    value={formik.values.contact_email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Your email address"
                  />
                  {formik.touched.contact_email && formik.errors.contact_email && (
                    <div className="invalid-feedback">{formik.errors.contact_email}</div>
                  )}
                </div>

                {/* Price Estimate */}
                {priceEstimate && (
                  <div className="col-12 mb-3">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6 className="card-title">
                          <FaCalculator className="me-2" />
                          Price Estimate
                          {calculating && <span className="spinner-border spinner-border-sm ms-2"></span>}
                        </h6>
                        <div className="row">
                          <div className="col-md-6">
                            <p className="mb-1">
                              <strong>Base Price:</strong> ${priceEstimate.breakdown.base_price}
                            </p>
                            {Object.entries(priceEstimate.breakdown.multipliers).map(([key, multiplier]) => (
                              <p key={key} className="mb-1 small">
                                {multiplier.description}: {multiplier.factor}x
                              </p>
                            ))}
                          </div>
                          <div className="col-md-6 text-end">
                            <h4 className="text-primary mb-0">
                              <strong>${priceEstimate.final_price}</strong>
                            </h4>
                            <small className="text-muted">Estimated Total</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !formik.isValid}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default ServiceRequestForm;
