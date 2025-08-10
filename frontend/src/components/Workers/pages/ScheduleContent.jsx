import React from 'react';
import { FaCalendar, FaClock, FaMapMarkerAlt } from 'react-icons/fa';

const ScheduleContent = ({ serviceRequests, availability }) => {
  const todaysTasks = serviceRequests.filter(r => 
    r.status === 'assigned' || r.status === 'in_progress'
  );

  const upcomingTasks = serviceRequests.filter(r => r.status === 'assigned').slice(0, 10);

  return (
    <div className="schedule-content">
      <h3><FaCalendar className="page-icon" /> My Schedule</h3>
      
      <div className="schedule-overview">
        <div className="schedule-stats">
          <div className="schedule-stat">
            <h4>Today's Tasks</h4>
            <p>{todaysTasks.length}</p>
          </div>
          <div className="schedule-stat">
            <h4>This Week</h4>
            <p>{serviceRequests.length}</p>
          </div>
          <div className="schedule-stat">
            <h4>Availability</h4>
            <p className={`status-${availability}`}>{availability}</p>
          </div>
        </div>

        <div className="upcoming-tasks">
          <h4>Upcoming Tasks</h4>
          <div className="tasks-list">
            {upcomingTasks.map(request => (
              <div key={request.id} className="schedule-item">
                <div className="schedule-time">
                  <FaClock /> {new Date(request.created_at).toLocaleDateString()}
                </div>
                <div className="schedule-details">
                  <h5>{request.title}</h5>
                  <p><FaMapMarkerAlt /> {request.address}</p>
                  <span className="schedule-price">${request.final_price}</span>
                </div>
                <div className="schedule-status">
                  <span className={`status-badge status-${request.status}`}>
                    {request.status}
                  </span>
                </div>
              </div>
            ))}
            {upcomingTasks.length === 0 && (
              <p className="no-tasks">No upcoming tasks scheduled.</p>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .schedule-content {
          max-width: 1200px;
          padding: 1rem;
        }

        .page-icon {
          margin-right: 0.5rem;
          color: #3b82f6;
        }

        .schedule-content h3 {
          margin: 0 0 1.5rem 0;
          color: #1f2937;
          font-size: 1.5rem;
          font-weight: 600;
          display: flex;
          align-items: center;
        }

        .schedule-overview {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 2rem;
        }

        .schedule-stats {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          height: fit-content;
        }

        .schedule-stat {
          margin-bottom: 1.5rem;
          padding: 1rem;
          border-radius: 8px;
          background: #f8fafc;
          border-left: 4px solid #3b82f6;
        }

        .schedule-stat:last-child {
          margin-bottom: 0;
        }

        .schedule-stat h4 {
          margin: 0 0 0.5rem 0;
          color: #6b7280;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }

        .schedule-stat p {
          margin: 0;
          font-size: 1.8rem;
          font-weight: 700;
          color: #1f2937;
        }

        .status-available { color: #10b981; }
        .status-busy { color: #f59e0b; }
        .status-offline { color: #ef4444; }

        .upcoming-tasks {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .upcoming-tasks h4 {
          margin: 0 0 1rem 0;
          color: #1f2937;
          font-size: 1.1rem;
          font-weight: 600;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 0.5rem;
        }

        .tasks-list {
          max-height: 500px;
          overflow-y: auto;
        }

        .schedule-item {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
          align-items: center;
          transition: background-color 0.2s ease;
        }

        .schedule-item:hover {
          background: #f9fafb;
        }

        .schedule-item:last-child {
          border-bottom: none;
        }

        .schedule-time {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #6b7280;
          font-size: 0.9rem;
          min-width: 140px;
          font-weight: 500;
        }

        .schedule-details {
          flex: 1;
        }

        .schedule-details h5 {
          margin: 0 0 0.25rem 0;
          color: #1f2937;
          font-weight: 600;
        }

        .schedule-details p {
          margin: 0 0 0.25rem 0;
          color: #6b7280;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .schedule-price {
          color: #10b981;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .schedule-status {
          min-width: 100px;
          text-align: right;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: capitalize;
          display: inline-block;
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

        .no-tasks {
          text-align: center;
          color: #6b7280;
          font-style: italic;
          padding: 2rem;
        }

        @media (max-width: 768px) {
          .schedule-overview {
            grid-template-columns: 1fr;
          }

          .schedule-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .schedule-time {
            min-width: auto;
          }

          .schedule-status {
            min-width: auto;
            text-align: left;
          }
        }
      `}</style>
    </div>
  );
};

export default ScheduleContent;
