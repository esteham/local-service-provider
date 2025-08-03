import React from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { EnvelopeIcon, PhoneIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { motion as MotionDiv } from 'framer-motion';

const Contact = () => {
  const BASE_URL = import.meta.env.VITE_API_URL;
  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      service: '',
      message: ''
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Required'),
      email: Yup.string().email('Invalid email address').required('Required'),
      phone: Yup.string().matches(/^[0-9]+$/, 'Must be only digits').min(10, 'Must be at least 10 digits'),
      service: Yup.string().required('Please select a service'),
      message: Yup.string().required('Please enter your message').min(10, 'Message must be at least 10 characters')
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const response = await axios.post(`${BASE_URL}backend/api/contact.php`, values);
        if (response.data.success) {
          alert('Thank you for your message! We will get back to you soon.');
          resetForm();
        } else {
          alert(response.data.message || 'There was an error submitting your message.');
        }
      } catch (error) {
        console.error('Contact form error:', error);
        const errorMessage = error.response?.data?.message || 'There was an error submitting your message. Please try again later.';
        alert(errorMessage);
      } finally {
        setSubmitting(false);
      }
    }
  });

  const services = [
    'Plumbing',
    'Electrical',
    'HVAC',
    'Landscaping',
    'Cleaning',
    'Handyman Services',
    'Pest Control'
  ];

  return (
    <MotionDiv.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container className="py-5">
        <h1 className="text-center mb-5">Contact Us</h1>
        
        <Row className="g-4 mb-5">
          <Col lg={6}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <h2 className="mb-4">Get in Touch</h2>
                <p className="mb-4">
                  Have questions about our services or need to schedule an appointment? 
                  Fill out the form and we'll get back to you as soon as possible.
                </p>
                
                <Form onSubmit={formik.handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      placeholder="John Doe"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.name}
                      isInvalid={formik.touched.name && !!formik.errors.name}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formik.errors.name}
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="john@example.com"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.email}
                      isInvalid={formik.touched.email && !!formik.errors.email}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formik.errors.email}
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                      type="tel"
                      name="phone"
                      placeholder="(123) 456-7890"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.phone}
                      isInvalid={formik.touched.phone && !!formik.errors.phone}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formik.errors.phone}
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Service Needed</Form.Label>
                    <Form.Select
                      name="service"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.service}
                      isInvalid={formik.touched.service && !!formik.errors.service}
                    >
                      <option value="">Select a service</option>
                      {services.map((service, index) => (
                        <option key={index} value={service}>{service}</option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {formik.errors.service}
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Message</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="message"
                      placeholder="Tell us about your needs..."
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.message}
                      isInvalid={formik.touched.message && !!formik.errors.message}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formik.errors.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  <div className="d-grid">
                    <Button 
                      variant="primary" 
                      type="submit"
                      size="lg"
                      disabled={formik.isSubmitting}
                    >
                      {formik.isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={6}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <h2 className="mb-4">Contact Information</h2>
                <p className="mb-4">
                  We're here to help you with all your service needs. 
                  Reach out to us through any of these channels.
                </p>
                
                <div className="d-flex align-items-start mb-4">
                  <div className="me-3 text-primary">
                    <PhoneIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="mb-1">Phone</h5>
                    <p className="mb-0">(123) 456-7890</p>
                    <small className="text-muted">Mon-Fri, 8am-6pm</small>
                  </div>
                </div>
                
                <div className="d-flex align-items-start mb-4">
                  <div className="me-3 text-primary">
                    <EnvelopeIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="mb-1">Email</h5>
                    <p className="mb-0">contact@localservice.com</p>
                    <small className="text-muted">Response within 24 hours</small>
                  </div>
                </div>
                
                <div className="d-flex align-items-start mb-4">
                  <div className="me-3 text-primary">
                    <MapPinIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="mb-1">Office</h5>
                    <p className="mb-0">123 Service Street</p>
                    <p className="mb-0">Your City, ST 12345</p>
                  </div>
                </div>
                
                <div className="d-flex align-items-start">
                  <div className="me-3 text-primary">
                    <ClockIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="mb-1">Business Hours</h5>
                    <p className="mb-1">Monday - Friday: 8:00 AM - 6:00 PM</p>
                    <p className="mb-1">Saturday: 9:00 AM - 2:00 PM</p>
                    <p className="mb-0">Sunday: Closed</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h5>Service Area</h5>
                  <p>We proudly serve the following areas:</p>
                  <ul className="row">
                    <li className="col-md-6">Your City</li>
                    <li className="col-md-6">Nearby Town</li>
                    <li className="col-md-6">Suburb A</li>
                    <li className="col-md-6">Suburb B</li>
                    <li className="col-md-6">County Area</li>
                  </ul>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Map Section */}
        <Row className="mb-5">
          {/* Google Map */}
          <Col md={12} lg={6} className="mb-4 mb-lg-0">
            <Card className="shadow-sm border-0">
              <Card.Body className="p-0">
                <div className="ratio ratio-16x9">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.215373510562!2d-73.9878449242395!3d40.74844097138979!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b3117469%3A0xd134e199a405a163!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1712345678901!5m2!1sen!2sus"
                    style={{ border: 0, width: "100%", height: "100%" }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Our Location"
                  ></iframe>
                </div>
              </Card.Body>
              <Card.Footer className="bg-light px-4 py-3">
                <div className="d-flex justify-content-between align-items-center flex-wrap">
                  <div className="d-flex align-items-center text-muted mb-2 mb-md-0">
                    <MapPinIcon className="me-2" style={{ width: "20px", height: "20px", color: "#0d6efd" }} />
                    <span>123 Service Street, Your City, ST 12345</span>
                  </div>
                  <Button variant="outline-primary" size="sm">
                    Get Directions
                  </Button>
                </div>
              </Card.Footer>
            </Card>
          </Col>

          {/* Modern Info Card */}
          <Col md={12} lg={6}>
            <Card className="shadow-sm border-0 h-100">
              <Card.Body className="p-4 d-flex flex-column justify-content-center">
                <h5 className="mb-3">Need Help? Contact Us</h5>
                <p className="text-muted mb-4">
                  Our team is available 24/7 to support you with emergency services and quick response.
                </p>

                <div className="d-flex align-items-center mb-3 text-dark">
                  <PhoneIcon className="me-3" style={{ width: "20px", height: "20px", color: "#198754" }} />
                  <strong>+1 (555) 123-4567</strong>
                </div>

                <div className="d-flex align-items-center mb-3 text-dark">
                  <EnvelopeIcon className="me-3" style={{ width: "20px", height: "20px", color: "#0d6efd" }} />
                  <strong>support@example.com</strong>
                </div>

                <div className="mt-4">
                  <Button variant="primary" className="me-2">
                    Live Chat
                  </Button>
                  <Button variant="outline-secondary">FAQs</Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        {/* FAQ Section */}
        <Row>
          <Col>
            <Card className="shadow-sm">
              <Card.Body>
                <h2 className="mb-4">Frequently Asked Questions</h2>
                <div className="accordion" id="faqAccordion">
                  <div className="accordion-item">
                    <h3 className="accordion-header" id="headingOne">
                      <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne">
                        What are your business hours?
                      </button>
                    </h3>
                    <div id="collapseOne" className="accordion-collapse collapse show" data-bs-parent="#faqAccordion">
                      <div className="accordion-body">
                        Our regular business hours are Monday to Friday from 8:00 AM to 6:00 PM, and Saturdays from 9:00 AM to 2:00 PM. We're closed on Sundays.
                      </div>
                    </div>
                  </div>
                  <div className="accordion-item">
                    <h3 className="accordion-header" id="headingTwo">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo">
                        How quickly can you respond to service requests?
                      </button>
                    </h3>
                    <div id="collapseTwo" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                      <div className="accordion-body">
                        For emergency services, we typically respond within 2 hours. For standard service requests, we aim to respond within 24 hours during business days.
                      </div>
                    </div>
                  </div>
                  <div className="accordion-item">
                    <h3 className="accordion-header" id="headingThree">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree">
                        What payment methods do you accept?
                      </button>
                    </h3>
                    <div id="collapseThree" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                      <div className="accordion-body">
                        We accept all major credit cards, cash, checks, and bank transfers. We also offer financing options for larger projects.
                      </div>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </MotionDiv.div>
  );
};

export default Contact;