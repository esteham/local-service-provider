import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { motion as MotionDiv } from "framer-motion";
import { Link } from "react-router-dom";
import AgentPic from "../../../assets/images/peakpx.jpg";

const AgentSection = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const benefits = [
    {
      title: "More Clients",
      description: "Get connected with customers in your area actively looking for your services",
      icon: "👥"
    },
    {
      title: "Fair Pricing",
      description: "Our dynamic pricing ensures you get paid fairly for your work",
      icon: "💰"
    },
    {
      title: "Easy Management",
      description: "Simple dashboard to manage your appointments and payments",
      icon: "📱"
    }
  ];

  return (
    <section className="py-5 bg-light">
      <Container>
        <Row className="align-items-center">
          <Col md={6} className="mb-5 mb-md-0">
            <MotionDiv.div
              initial="hidden"
              whileInView="visible"
              variants={fadeIn}
              viewport={{ once: true }}
            >
              <h2 className="display-5 fw-semibold mb-4">
                For <span className="text-primary">Service Providers</span>
              </h2>
              <p className="lead mb-4">
                Join our network of trusted professionals and grow your business with:
              </p>
              
              <ul className="list-unstyled mb-5">
                {benefits.map((benefit, index) => (
                  <MotionDiv.li 
                    key={index}
                    className="mb-3 d-flex align-items-start"
                    variants={fadeIn}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <span className="me-3 display-6">{benefit.icon}</span>
                    <div>
                      <h5 className="mb-1">{benefit.title}</h5>
                      <p className="text-muted mb-0">{benefit.description}</p>
                    </div>
                  </MotionDiv.li>
                ))}
              </ul>
              
              <Link to="/provider-register">
                <Button variant="primary" size="lg" className="rounded-pill px-4 shadow">
                  Join as a Provider
                </Button>
              </Link>
            </MotionDiv.div>
          </Col>
          
          <Col md={6}>
            <MotionDiv.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="border-0 rounded-4 shadow-lg overflow-hidden">
                <Card.Img 
                  variant="top" 
                  src={AgentPic}
                  alt="Service Provider" 
                />
                <Card.Body className="bg-dark text-white p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-primary rounded-circle p-2 me-3">
                      <span className="text-white">👍</span>
                    </div>
                    <div>
                      <h5 className="mb-0">Raj Patel</h5>
                      <small className="text-white-50">Electrician, 5 years on platform</small>
                    </div>
                  </div>
                  <p className="mb-0">
                    "Since joining, my monthly income has increased by 40% with better scheduling 
                    and fair pricing that reflects my skills."
                  </p>
                </Card.Body>
              </Card>
            </MotionDiv.div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default AgentSection;