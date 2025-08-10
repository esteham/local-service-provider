import React, { useState } from 'react';
import { FaQuestionCircle, FaPhone, FaEnvelope, FaClock, FaSearch, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const HelpSupportContent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqData = [
    {
      id: 1,
      question: "How do I accept a task?",
      answer: "Click on the 'Accept' button on any assigned task to start working on it. Once accepted, the task status will change to 'In Progress' and you can begin the work."
    },
    {
      id: 2,
      question: "How do I mark a task as completed?",
      answer: "Once you finish the work, click the 'Complete' button to mark the task as done. Make sure all work is finished and the customer is satisfied before marking it complete."
    },
    {
      id: 3,
      question: "How do I update my availability?",
      answer: "Use the availability controls on your dashboard to set your status as Available, Busy, or Offline. This helps the system assign tasks appropriately."
    },
    {
      id: 4,
      question: "What happens if I need to cancel a task?",
      answer: "If you need to cancel an accepted task, contact support immediately. Frequent cancellations may affect your rating and future task assignments."
    },
    {
      id: 5,
      question: "How are my earnings calculated?",
      answer: "Your earnings are based on the service price minus platform commission. You can view detailed earnings breakdown in the Earnings section."
    },
    {
      id: 6,
      question: "How do I update my profile and skills?",
      answer: "Go to the Profile section to update your personal information, skills, hourly rate, and certifications. Keep your profile updated to receive relevant tasks."
    },
    {
      id: 7,
      question: "What should I do if I encounter issues during a task?",
      answer: "Contact support immediately if you encounter any issues. Document the problem with photos if possible and communicate with the customer about any delays."
    },
    {
      id: 8,
      question: "How do customer ratings work?",
      answer: "Customers can rate your service from 1-5 stars after task completion. Maintain high ratings by providing quality service and good communication."
    }
  ];

  const filteredFaqs = faqData.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFaq = (faqId) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  return (
    <div className="help-content">
      <h3><FaQuestionCircle className="page-icon" /> Help & Support</h3>
      
      <div className="help-sections">
        <div className="faq-section">
          <h4>Frequently Asked Questions</h4>
          
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="faq-list">
            {filteredFaqs.map(faq => (
              <div key={faq.id} className="faq-item">
                <div 
                  className="faq-question"
                  onClick={() => toggleFaq(faq.id)}
                >
                  <h5>{faq.question}</h5>
                  {expandedFaq === faq.id ? <FaChevronUp /> : <FaChevronDown />}
                </div>
                {expandedFaq === faq.id && (
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
            
            {filteredFaqs.length === 0 && searchTerm && (
              <div className="no-results">
                <p>No FAQs found matching "{searchTerm}"</p>
              </div>
            )}
          </div>
        </div>

        <div className="contact-section">
          <h4>Contact Support</h4>
          <div className="contact-info">
            <div className="contact-item">
              <FaPhone className="contact-icon" />
              <div>
                <strong>Phone Support</strong>
                <p>+1 (555) 123-4567</p>
              </div>
            </div>
            <div className="contact-item">
              <FaEnvelope className="contact-icon" />
              <div>
                <strong>Email Support</strong>
                <p>support@serviceProvider.com</p>
              </div>
            </div>
            <div className="contact-item">
              <FaClock className="contact-icon" />
              <div>
                <strong>Support Hours</strong>
                <p>Monday - Friday<br />9:00 AM - 6:00 PM</p>
              </div>
            </div>
          </div>

          <div className="emergency-contact">
            <h5>Emergency Contact</h5>
            <p>For urgent issues during active tasks:</p>
            <a href="tel:+15551234567" className="emergency-btn">
              <FaPhone /> Call Emergency Line
            </a>
          </div>

          <div className="support-tips">
            <h5>Before Contacting Support</h5>
            <ul>
              <li>Check the FAQ section above</li>
              <li>Have your worker ID ready</li>
              <li>Describe the issue clearly</li>
              <li>Include screenshots if applicable</li>
            </ul>
          </div>
        </div>
      </div>

      <style jsx>{`
        .help-content {
          max-width: 1200px;
          padding: 1rem;
        }

        .page-icon {
          margin-right: 0.5rem;
          color: #3b82f6;
        }

        .help-content h3 {
          margin: 0 0 1.5rem 0;
          color: #1f2937;
          font-size: 1.5rem;
          font-weight: 600;
          display: flex;
          align-items: center;
        }

        .help-sections {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
        }

        .faq-section,
        .contact-section {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .faq-section h4,
        .contact-section h4 {
          margin: 0 0 1rem 0;
          color: #1f2937;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 0.5rem;
          font-weight: 600;
        }

        .search-box {
          position: relative;
          margin-bottom: 1.5rem;
        }

        .search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
          z-index: 1;
        }

        .search-box input {
          width: 100%;
          padding: 0.75rem 0.75rem 0.75rem 2.5rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 0.9rem;
          transition: border-color 0.2s ease;
        }

        .search-box input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .faq-item {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }

        .faq-question {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          cursor: pointer;
          transition: background-color 0.2s ease;
          background: #f8fafc;
        }

        .faq-question:hover {
          background: #f1f5f9;
        }

        .faq-question h5 {
          margin: 0;
          color: #1f2937;
          font-weight: 600;
          flex: 1;
        }

        .faq-question svg {
          color: #6b7280;
          transition: transform 0.2s ease;
        }

        .faq-answer {
          padding: 1rem;
          background: white;
          border-top: 1px solid #e5e7eb;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .faq-answer p {
          margin: 0;
          color: #6b7280;
          line-height: 1.6;
        }

        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .contact-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 8px;
          border-left: 4px solid #3b82f6;
        }

        .contact-icon {
          color: #3b82f6;
          font-size: 1.2rem;
          margin-top: 0.25rem;
        }

        .contact-item strong {
          display: block;
          color: #1f2937;
          margin-bottom: 0.25rem;
          font-weight: 600;
        }

        .contact-item p {
          margin: 0;
          color: #6b7280;
          line-height: 1.4;
        }

        .emergency-contact {
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: #fef2f2;
          border-radius: 8px;
          border-left: 4px solid #ef4444;
        }

        .emergency-contact h5 {
          margin: 0 0 0.5rem 0;
          color: #dc2626;
          font-weight: 600;
        }

        .emergency-contact p {
          margin: 0 0 1rem 0;
          color: #6b7280;
        }

        .emergency-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: #ef4444;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          transition: all 0.2s ease;
          width: fit-content;
        }

        .emergency-btn:hover {
          background: #dc2626;
          transform: translateY(-1px);
          text-decoration: none;
          color: white;
        }

        .support-tips h5 {
          margin: 0 0 0.5rem 0;
          color: #1f2937;
          font-weight: 600;
        }

        .support-tips ul {
          margin: 0;
          padding-left: 1.5rem;
          color: #6b7280;
        }

        .support-tips li {
          margin-bottom: 0.25rem;
          line-height: 1.4;
        }

        .no-results {
          text-align: center;
          padding: 2rem;
          color: #6b7280;
          background: #f9fafb;
          border-radius: 8px;
          border: 2px dashed #d1d5db;
        }

        @media (max-width: 768px) {
          .help-sections {
            grid-template-columns: 1fr;
          }

          .contact-item {
            flex-direction: column;
            text-align: center;
          }

          .emergency-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default HelpSupportContent;
