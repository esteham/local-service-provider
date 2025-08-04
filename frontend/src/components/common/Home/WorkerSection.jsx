import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { motion as MotionDiv } from "framer-motion";
import WorkerPic from "../../../assets/images/peakpx.jpg"

const WorkerSection = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const workers = [
    {
      name: "Alex Rodriguez",
      profession: "Electrician",
      experience: "8 years",
      rating: 4.9,
      jobs: 247
    },
    {
      name: "Maria Garcia",
      profession: "Plumber",
      experience: "6 years",
      rating: 4.8,
      jobs: 192
    },
    {
      name: "James Wilson",
      profession: "Handyman",
      experience: "10 years",
      rating: 4.95,
      jobs: 312
    }
  ];

  return (
    <section className="py-5 bg-white">
      <Container>
        <MotionDiv.div
          initial="hidden"
          whileInView="visible"
          variants={fadeIn}
          viewport={{ once: true }}
        >
          <h2 className="text-center mb-5 display-5 fw-semibold">
            Trusted <span className="text-primary">Professionals</span>
          </h2>
          <p className="text-center text-muted mb-5 lead">
            Meet some of our top-rated service providers
          </p>
        </MotionDiv.div>

        <Row className="g-4">
          {workers.map((worker, index) => (
            <Col md={4} key={index}>
              <MotionDiv.div
                variants={fadeIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-100 border-0 rounded-4 shadow-sm hover-shadow-lg transition-all overflow-hidden">
                  <div 
                    className="bg-primary bg-opacity-10 p-4 text-center"
                    style={{ height: '120px' }}
                  >
                    <div className="bg-white rounded-circle p-2 d-inline-block shadow">
                      <img className="rounded-circle" src={WorkerPic} alt="worker"></img>
                    </div>
                  </div>
                  <Card.Body className="p-4 text-center">
                    <h4 className="mb-1">{worker.name}</h4>
                    <p className="text-muted mb-3">{worker.profession}</p>
                    
                    <div className="d-flex justify-content-center gap-4 mb-3">
                      <div>
                        <h5 className="mb-0">{worker.rating}</h5>
                        <small className="text-muted">Rating</small>
                      </div>
                      <div>
                        <h5 className="mb-0">{worker.experience}</h5>
                        <small className="text-muted">Experience</small>
                      </div>
                      <div>
                        <h5 className="mb-0">{worker.jobs}+</h5>
                        <small className="text-muted">Jobs</small>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline-primary" 
                      className="rounded-pill px-4 mt-2"
                    >
                      View Profile
                    </Button>
                  </Card.Body>
                </Card>
              </MotionDiv.div>
            </Col>
          ))}
        </Row>

        <MotionDiv.div
          initial="hidden"
          whileInView="visible"
          variants={fadeIn}
          viewport={{ once: true }}
          className="text-center mt-5"
        >
          <Button variant="primary" size="lg" className="rounded-pill px-4 shadow">
            Browse All Professionals
          </Button>
        </MotionDiv.div>
      </Container>
    </section>
  );
};

export default WorkerSection;