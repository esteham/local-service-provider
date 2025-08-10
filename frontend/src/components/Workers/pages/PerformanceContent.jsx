import React from 'react';
import { FaChartLine, FaTasks, FaStar, FaDollarSign } from 'react-icons/fa';

const PerformanceContent = ({ workerStats }) => {
  const completionRate = workerStats.completed_requests && workerStats.total_requests ? 
    Math.round((workerStats.completed_requests / workerStats.total_requests) * 100) : 0;

  return (
    <div className="performance-content">
      <h3><FaChartLine className="page-icon" /> Performance Metrics</h3>
      
      <div className="metrics-grid">
        <div className="metric-card">
          <FaChartLine className="metric-icon" />
          <h4>Completion Rate</h4>
          <p>{completionRate}%</p>
          <span className="metric-subtitle">Task completion success rate</span>
        </div>
        <div className="metric-card">
          <FaTasks className="metric-icon" />
          <h4>Tasks Completed</h4>
          <p>{workerStats.completed_requests || 0}</p>
          <span className="metric-subtitle">Total completed tasks</span>
        </div>
        <div className="metric-card">
          <FaStar className="metric-icon" />
          <h4>Average Rating</h4>
          <p>{workerStats.average_rating || 0}/5</p>
          <span className="metric-subtitle">Customer satisfaction</span>
        </div>
        <div className="metric-card">
          <FaDollarSign className="metric-icon" />
          <h4>Monthly Earnings</h4>
          <p>${workerStats.this_month_earnings || 0}</p>
          <span className="metric-subtitle">Current month income</span>
        </div>
      </div>

      <div className="performance-details">
        <div className="performance-chart">
          <h4>Monthly Performance Trend</h4>
          <div className="chart-placeholder">
            <div className="chart-bars">
              <div className="chart-bar" style={{height: '60%'}}></div>
              <div className="chart-bar" style={{height: '80%'}}></div>
              <div className="chart-bar" style={{height: '45%'}}></div>
              <div className="chart-bar" style={{height: '90%'}}></div>
              <div className="chart-bar" style={{height: '75%'}}></div>
              <div className="chart-bar" style={{height: '95%'}}></div>
            </div>
            <p>Performance visualization</p>
          </div>
        </div>

        <div className="performance-summary">
          <h4>Performance Summary</h4>
          <div className="summary-items">
            <div className="summary-item">
              <label>Total Tasks:</label>
              <span>{workerStats.total_requests || 0}</span>
            </div>
            <div className="summary-item">
              <label>In Progress:</label>
              <span>{workerStats.in_progress_requests || 0}</span>
            </div>
            <div className="summary-item">
              <label>Pending:</label>
              <span>{workerStats.pending_requests || 0}</span>
            </div>
            <div className="summary-item">
              <label>Total Earnings:</label>
              <span>${workerStats.total_earnings || 0}</span>
            </div>
            <div className="summary-item">
              <label>Availability:</label>
              <span className={`status-${workerStats.availability || 'offline'}`}>
                {workerStats.availability || 'offline'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .performance-content {
          max-width: 1200px;
          padding: 1rem;
        }

        .page-icon {
          margin-right: 0.5rem;
          color: #3b82f6;
        }

        .performance-content h3 {
          margin: 0 0 1.5rem 0;
          color: #1f2937;
          font-size: 1.5rem;
          font-weight: 600;
          display: flex;
          align-items: center;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .metric-card {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          text-align: center;
          border-left: 4px solid #3b82f6;
          transition: transform 0.2s ease;
        }

        .metric-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }

        .metric-icon {
          font-size: 2.5rem;
          color: #3b82f6;
          margin-bottom: 1rem;
        }

        .metric-card h4 {
          margin: 0 0 0.5rem 0;
          color: #1f2937;
          font-size: 1rem;
          font-weight: 600;
        }

        .metric-card p {
          margin: 0 0 0.25rem 0;
          font-size: 2rem;
          font-weight: 700;
          color: #3b82f6;
        }

        .metric-subtitle {
          color: #6b7280;
          font-size: 0.8rem;
          font-style: italic;
        }

        .performance-details {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
        }

        .performance-chart {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .performance-chart h4 {
          margin: 0 0 1rem 0;
          color: #1f2937;
          font-weight: 600;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 0.5rem;
        }

        .chart-placeholder {
          height: 250px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #f9fafb;
          border-radius: 8px;
          border: 2px dashed #d1d5db;
        }

        .chart-bars {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          height: 100px;
          margin-bottom: 1rem;
        }

        .chart-bar {
          width: 20px;
          background: linear-gradient(to top, #3b82f6, #60a5fa);
          border-radius: 2px 2px 0 0;
          transition: all 0.3s ease;
        }

        .chart-bar:hover {
          background: linear-gradient(to top, #1d4ed8, #3b82f6);
        }

        .chart-placeholder p {
          color: #6b7280;
          margin: 0;
          font-style: italic;
        }

        .performance-summary {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          height: fit-content;
        }

        .performance-summary h4 {
          margin: 0 0 1rem 0;
          color: #1f2937;
          font-weight: 600;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 0.5rem;
        }

        .summary-items {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: #f8fafc;
          border-radius: 6px;
          border-left: 3px solid #e5e7eb;
        }

        .summary-item label {
          font-weight: 600;
          color: #374151;
          font-size: 0.9rem;
        }

        .summary-item span {
          color: #6b7280;
          font-weight: 500;
        }

        .status-available { color: #10b981; font-weight: 600; }
        .status-busy { color: #f59e0b; font-weight: 600; }
        .status-offline { color: #ef4444; font-weight: 600; }

        @media (max-width: 768px) {
          .performance-details {
            grid-template-columns: 1fr;
          }

          .metrics-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          }

          .metric-card p {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default PerformanceContent;
