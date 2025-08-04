import React from 'react';
import { Container, Row, Col, Card, Badge, Accordion, Button } from 'react-bootstrap';
import { 
  CheckBadgeIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  TrophyIcon,
  LightBulbIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';
import { motion as MotionDiv } from 'framer-motion';
import CreativeLabor from "../../assets/images/creative-labor-day-banner-composition_23-2149503647.avif";
import OurStory from "../../assets/images/maxresdefault.jpg";
import TeamMember1 from "../../assets/images/20210527_142533.jpg";
import TeamMember2 from "../../assets/images/IMG-20210128-WA0147.jpg";
import TeamMember3 from "../../assets/images/IMG_20200131_143230.jpg";
import TeamMember4 from "../../assets/images/received_363411758360649.jpeg";


const About = () => {
  const features = [
    {
      icon: <CheckBadgeIcon className="h-3 w-3 text-primary" />,
      title: "Certified Professionals",
      description: "All our technicians are licensed, certified, and background-checked."
    },
    {
      icon: <UserGroupIcon className="h-3 w-3 text-primary" />,
      title: "Customer-Focused",
      description: "We prioritize your satisfaction with transparent pricing and clear communication."
    },
    {
      icon: <ShieldCheckIcon className="h-3 w-3 text-primary" />,
      title: "Quality Guarantee",
      description: "We stand behind our work with comprehensive warranties on all services."
    },
    {
      icon: <TrophyIcon className="h-3 w-3 text-primary" />,
      title: "Award-Winning Service",
      description: "Recognized as the best local service provider for 3 consecutive years."
    }
  ];

  const faqs = [
    {
      question: "How quickly can you respond to service requests?",
      answer: "We typically respond within 2 hours for emergency services and schedule non-emergency services within 24-43 hours."
    },
    {
      question: "Do you offer emergency services?",
      answer: "Yes, we provide 24/7 emergency services for plumbing, electrical, and HVAC issues."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, checks, cash, and also offer financing options for larger projects."
    },
    {
      question: "Are your technicians insured?",
      answer: "Absolutely. All our technicians are fully insured and bonded for your protection."
    }
  ];

  return (
    <MotionDiv.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container className="py-5">
        {/* Hero Section */}
        <Row className="align-items-center mb-5">
          <Col lg={6}>
            <Badge bg="primary" className="mb-3">Serving the Community Since 2010</Badge>
            <h1 className="display-5 fw-bold mb-4">Your Trusted Local Service Provider</h1>
            <p className="lead mb-4">
              For over a decade, we've been delivering exceptional home and business services 
              with honesty, integrity, and unmatched expertise.
            </p>
            <div className="d-flex gap-3">
              <Button variant="primary" size="lg">Our Services</Button>
              <Button variant="outline-primary" size="lg">Contact Us</Button>
            </div>
          </Col>
          <Col lg={6}>
            <img 
              src={CreativeLabor}
              alt="Our team at work" 
              className="img-fluid rounded shadow"
            />
          </Col>
        </Row>

        {/* Features Section */}
        <Row className="g-4 py-5">
          {features.map((feature, index) => (
            <Col key={index} md={6} lg={3}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="mb-3">
                    {feature.icon}
                  </div>
                  <h5>{feature.title}</h5>
                  <p className="text-muted">{feature.description}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Our Story Section */}
        <Row className="py-5 align-items-center">
          <Col lg={6} className="order-lg-2">
            <div className="position-relative">
              <img 
                src={OurStory}
                alt="Our story" 
                className="img-fluid rounded shadow"
              />
              <div className="position-absolute bottom-0 start-0 bg-primary text-white p-3 m-3 rounded">
                <h4 className="mb-0">5000+</h4>
                <small>Happy Customers</small>
              </div>
            </div>
          </Col>
          <Col lg={6} className="order-lg-1">
            <h2 className="mb-4">Our Story</h2>
            <p>
              Founded in 2010 by John Smith, a master technician with 20 years of experience, 
              our company started as a small local operation with just two employees. 
              Today, we've grown to a team of 25 dedicated professionals serving the entire region.
            </p>
            <p>
              What hasn't changed is our commitment to treating every customer like family 
              and every job like it's our own home. We take pride in our work and believe 
              in doing things right the first time.
            </p>
            <div className="d-flex align-items-center mt-4">
              <div className="me-4">
                <WrenchScrewdriverIcon className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h5 className="mb-1">Our Mission</h5>
                <p className="mb-0">
                  To provide reliable, high-quality services that improve our customers' 
                  lives while maintaining the highest standards of integrity and professionalism.
                </p>
              </div>
            </div>
          </Col>
        </Row>

        {/* Team Section */}
        <div className="py-5">
          <h2 className="text-center mb-5">Meet Our Team</h2>
          <Row className="g-4">
            {[
              {
                name: "John Smith",
                role: "Founder & CEO",
                bio: "Master Technician with 25 years experience",
                img: TeamMember1
              },
              {
                name: "Sarah Johnson",
                role: "Operations Manager",
                bio: "10 years in customer service management",
                img: TeamMember2
              },
              {
                name: "Mike Davis",
                role: "Lead Technician",
                bio: "Specializes in HVAC systems",
                img: TeamMember3
              },
              {
                name: "Emily Wilson",
                role: "Customer Relations",
                bio: "Ensures 100% customer satisfaction",
                img: TeamMember4
              }
            ].map((member, index) => (
              <Col key={index} md={6} lg={3}>
                <Card className="border-0 shadow-sm h-100 text-center">
                  <Card.Body>
                    <img
                      src={member.img}
                      alt={member.name}
                      className="rounded-circle mb-3"
                      style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                    />
                    <h5 className="mb-1">{member.name}</h5>
                    <p className="text-primary mb-2">{member.role}</p>
                    <p className="text-muted small">{member.bio}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* FAQ Section */}
        <div className="py-5">
          <h2 className="text-center mb-5">Frequently Asked Questions</h2>
          <Accordion>
            {faqs.map((faq, index) => (
              <Accordion.Item key={index} eventKey={index.toString()}>
                <Accordion.Header>{faq.question}</Accordion.Header>
                <Accordion.Body>{faq.answer}</Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </div>

        {/* Call to Action */}
        <Container className="mt-5">
  <Row className="justify-content-center">
    <Col md={3} lg={6}>
      <Card className="bg-primary text-white shadow border-0">
        <Card.Body className="p-5 text-center">
          <LightBulbIcon className="h-10 w-10 mb-3 mx-auto" />
          <h2 className="mb-3">Ready to Experience Exceptional Service?</h2>
          <p className="mb-4 lead">
            Contact us today for a free estimate or to schedule your service appointment.
          </p>
          <Button variant="light" size="lg">Get Started Now</Button>
        </Card.Body>
      </Card>
    </Col>
  </Row>
</Container>

      </Container>
    </MotionDiv.div>
  );
};

export default About;