import React, { useState } from "react";
import { Button, Container, Row, Col, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import { motion as MotionDiv } from "framer-motion";
import OurServices from "./OurServices";
import OurClients from "./OurClients";
import WorkerSection from "./WorkerSection";
import AgentSection from "./AgentSection";
import StatsSection from "./StatsSection";
import LoginFetchModal from "../../Auth/LoginFetch";
import RegistrationModal from "../../Auth/RegistrationModal";
import ServiceIllustration from "../../../assets/images/premium_photo-1661932816149-291a447e3022.jpeg";

const Home = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const [showLoginModal, setshowLoginModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section
        className="bg-dark text-white py-5"
        style={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
        }}
      >
        <Container>
          <Row className="align-items-center">
            <Col md={6} className="mb-4 mb-md-0">
              <MotionDiv.div
                initial="hidden"
                animate="visible"
                variants={fadeIn}
              >
                <h1 className="display-4 fw-bold mb-4">
                  Hyper Local{" "}
                  <span className="text-primary">Service Network</span>
                </h1>
                <p className="lead mb-4">
                  Connect with trusted professionals in your neighborhood with
                  our smart, real-time dynamic pricing system.
                </p>
                <div className="d-flex gap-3 mt-4">
                  <Link to="">
                    <Button
                      variant="primary"
                      size="lg"
                      className="px-4 rounded-pill shadow"
                      onClick={() => setshowLoginModal(true)}
                    >
                      Get Started
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button
                      variant="outline-light"
                      size="lg"
                      className="px-4 rounded-pill"
                    >
                      Learn More
                    </Button>
                  </Link>
                </div>
              </MotionDiv.div>
            </Col>
            <Col md={6}>
              <MotionDiv.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
              >
                <img
                  src={ServiceIllustration}
                  alt="Service Illustration"
                  className="img-fluid rounded-3 shadow-lg"
                  style={{ border: "1px solid rgba(255,255,255,0.1)" }}
                />
              </MotionDiv.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-5 bg-light">
        <Container>
          <MotionDiv.div
            initial="hidden"
            whileInView="visible"
            variants={fadeIn}
            viewport={{ once: true }}
          >
            <h2 className="text-center text-info mb-5 display-5 fw-semibold">
              Why Choose <span className="text-primary">Our Platform?</span>
            </h2>
          </MotionDiv.div>

          <MotionDiv.div
            initial="hidden"
            whileInView="visible"
            variants={staggerContainer}
            viewport={{ once: true }}
          >
            <Row className="g-4">
              <Col md={4}>
                <MotionDiv.div variants={fadeIn}>
                  <Card className="h-100 border-0 rounded-4 shadow-sm hover-shadow-lg transition-all">
                    <Card.Body className="p-4">
                      <div
                        className="bg-primary bg-opacity-10 rounded-circle p-3 mb-3"
                        style={{ width: "60px" }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="feather feather-map-pin text-primary"
                        >
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                      </div>
                      <h4 className="mb-3">Smart Location Matching</h4>
                      <p className="text-muted">
                        Our algorithm automatically connects you with the best
                        service providers in your immediate area, ensuring quick
                        response times.
                      </p>
                    </Card.Body>
                  </Card>
                </MotionDiv.div>
              </Col>

              <Col md={4}>
                <MotionDiv.div variants={fadeIn}>
                  <Card className="h-100 border-0 rounded-4 shadow-sm hover-shadow-lg transition-all">
                    <Card.Body className="p-4">
                      <div
                        className="bg-primary bg-opacity-10 rounded-circle p-3 mb-3"
                        style={{ width: "60px" }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="feather feather-trending-up text-primary"
                        >
                          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                          <polyline points="17 6 23 6 23 12"></polyline>
                        </svg>
                      </div>
                      <h4 className="mb-3">Dynamic Pricing</h4>
                      <p className="text-muted">
                        Fair, transparent pricing that adjusts based on demand,
                        time, and provider availability - you always get the
                        best value.
                      </p>
                    </Card.Body>
                  </Card>
                </MotionDiv.div>
              </Col>

              <Col md={4}>
                <MotionDiv.div variants={fadeIn}>
                  <Card className="h-100 border-0 rounded-4 shadow-sm hover-shadow-lg transition-all">
                    <Card.Body className="p-4">
                      <div
                        className="bg-primary bg-opacity-10 rounded-circle p-3 mb-3"
                        style={{ width: "60px" }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="feather feather-shield text-primary"
                        >
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                      </div>
                      <h4 className="mb-3">Managed Ecosystem</h4>
                      <p className="text-muted">
                        Our comprehensive admin system ensures quality control,
                        proper zoning, and fair practices for both customers and
                        providers.
                      </p>
                    </Card.Body>
                  </Card>
                </MotionDiv.div>
              </Col>
            </Row>
          </MotionDiv.div>
        </Container>
      </section>

      <OurServices />
      <StatsSection />
      <OurClients />
      <WorkerSection />
      <AgentSection />

      {/* CTA Section */}
      <section className="py-5 bg-primary text-white">
        <Container className="text-center py-4">
          <MotionDiv.div
            initial="hidden"
            whileInView="visible"
            variants={fadeIn}
            viewport={{ once: true }}
          >
            <h2 className="display-5 fw-bold mb-4">
              Ready to experience the future of local services?
            </h2>
            <p className="lead mb-4 opacity-75">
              Join thousands of satisfied customers and service providers in
              your area.
            </p>
            <Link to="">
              <Button
                variant="light"
                size="lg"
                className="px-5 rounded-pill shadow fw-semibold mt-2"
                onClick={() => setShowRegistrationModal(true)}
              >
                Sign Up Now
              </Button>
              {/* Registration Modal */}
                <RegistrationModal 
                  show={showRegistrationModal} 
                  onHide={() => setShowRegistrationModal(false)} 
                />
                <LoginFetchModal 
                  show={showLoginModal} 
                  onHide={() => setshowLoginModal(false)} 
                />
            </Link>
          </MotionDiv.div>
        </Container>
      </section>
    </div>
  );
};

export default Home;
