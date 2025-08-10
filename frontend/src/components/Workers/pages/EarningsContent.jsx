import React, { useState, useEffect } from 'react';
import { FaDollarSign, FaCalendarAlt, FaDownload, FaChartBar } from 'react-icons/fa';

const EarningsContent = ({ workerStats, serviceRequests }) => {
  const [earningsData, setEarningsData] = useState({});
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarningsData();
  }, [timeRange]);

  const fetchEarningsData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/backend/api/workers/earnings.php?range=${timeRange}`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setEarningsData(data.data);
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
      setEarningsData({
        total_earnings: 0,
        this_month_earnings: 0,
        average_per_task: 0,
        completed_tasks: 0,
        recent_earnings: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading earnings data...</div>;
  }

  return (
    <div className="earnings-content">
      <div className="earnings-header">
        <h3><FaDollarSign className="page-icon" /> Earnings</h3>
        <div className="earnings-controls">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-select"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button className="download-btn">
            <FaDownload /> Export
          </button>
        </div>
      </div>

      <div className="earnings-overview">
        <div className="earnings-stats">
          <div className="earnings-stat primary">
            <h4>Total Earnings</h4>
            <p>${earningsData.total_earnings || workerStats.total_earnings || 0}</p>
            <span className="growth-indicator positive">+12% from last month</span>
          </div>
          <div className="earnings-stat secondary">
            <h4>This Month</h4>
            <p>${earningsData.this_month_earnings || workerStats.this_month_earnings || 0}</p>
            <span className="growth-indicator positive">+8% from last month</span>
          </div>
          <div className="earnings-stat tertiary">
            <h4>Average per Task</h4>
            <p>${earningsData.average_per_task || 
              (workerStats.completed_requests ? 
                Math.round((workerStats.total_earnings || 0) / workerStats.completed_requests) : 0)}</p>
            <span className="growth-indicator neutral">Same as last month</span>
          </div>
        </div>

        <div className="earnings-chart">
          <h4><FaChartBar /> Earnings Trend</h4>
          <div className="chart-container">
            <div className="chart-bars">
              <div className="chart-bar" style={{height: '40%'}} data-value="$320"></div>
              <div className="chart-bar" style={{height: '60%'}} data-value="$480"></div>
              <div className="chart-bar" style={{height: '35%'}} data-value="$280"></div>
              <div className="chart-bar" style={{height: '80%'}} data-value="$640"></div>
              <div className="chart-bar" style={{height: '70%'}} data-value="$560"></div>
              <div className="chart-bar" style={{height: '90%'}} data-value="$720"></div>
            </div>
            <div className="chart-labels">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
            </div>
          </div>
        </div>
      </div>

      <div className="earnings-breakdown">
        <h4>Recent Earnings</h4>
        <div className="earnings-list">
          {(earningsData.recent_earnings || serviceRequests.filter(r => r.status === 'completed')).slice(0, 10).map(request => (
            <div key={request.id} className="earning-item">
              <div className="earning-details">
                <span className="earning-title">{request.title}</span>
                <small className="earning-date">
                  {new Date(request.completed_at || request.created_at).toLocaleDateString()}
                </small>
              </div>
              <div className="earning-amount">
                ${request.final_price}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .earnings-content {
          max-width: 1200px;
          padding: 1rem;
        }

        .page-icon {
          margin-right: 0.5rem;
          color: #3b82f6;
        }

        .earnings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .earnings-header h3 {
          margin: 0;
          color: #1f2937;
          font-size: 1.5rem;
          font-weight: 600;
          display: flex;
          align-items: center;
        }

        .earnings-controls {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .time-range-select {
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.9rem;
          background: white;
          cursor: pointer;
        }

        .download-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .download-btn:hover {
          background: #059669;
          transform: translateY(-1px);
        }

        .loading {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
          font-size: 1.1rem;
        }

        .earnings-overview {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .earnings-stats {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .earnings-stat {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          text-align: center;
        }

        .earnings-stat.primary {
          border-left: 4px solid #10b981;
        }

        .earnings-stat.secondary {
          border-left: 4px solid #3b82f6;
        }

        .earnings-stat.tertiary {
          border-left: 4px solid #8b5cf6;
        }

        .earnings-stat h4 {
          margin: 0 0 0.5rem 0;
          color: #6b7280;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }

        .earnings-stat p {
          margin: 0 0 0.25rem 0;
          font-size: 1.8rem;
          font-weight: 700;
          color: #1f2937;
        }

        .growth-indicator {
          font-size: 0.8rem;
          font-weight: 500;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }

        .growth-indicator.positive {
          background: #d1fae5;
          color: #059669;
        }

        .growth-indicator.neutral {
          background: #f3f4f6;
          color: #6b7280;
        }

        .earnings-chart {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .earnings-chart h4 {
          margin: 0 0 1rem 0;
          color: #1f2937;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .chart-container {
          height: 200px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .chart-bars {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          height: 150px;
          padding: 0 1rem;
        }

        .chart-bar {
          width: 30px;
          background: linear-gradient(to top, #10b981, #34d399);
          border-radius: 4px 4px 0 0;
          transition: all 0.3s ease;
          position: relative;
          cursor: pointer;
        }

        .chart-bar:hover {
          background: linear-gradient(to top, #059669, #10b981);
          transform: scaleY(1.1);
        }

        .chart-bar:hover::after {
          content: attr(data-value);
          position: absolute;
          top: -30px;
          left: 50%;
          transform: translateX(-50%);
          background: #1f2937;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
          white-space: nowrap;
        }

        .chart-labels {
          display: flex;
          justify-content: space-between;
          padding: 0 1rem;
          margin-top: 0.5rem;
        }

        .chart-labels span {
          font-size: 0.8rem;
          color: #6b7280;
          font-weight: 500;
        }

        .earnings-breakdown {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .earnings-breakdown h4 {
          margin: 0 0 1rem 0;
          color: #1f2937;
          font-weight: 600;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 0.5rem;
        }

        .earnings-list {
          max-height: 400px;
          overflow-y: auto;
        }

        .earning-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          border-bottom: 1px solid #e5e7eb;
          transition: background-color 0.2s ease;
        }

        .earning-item:hover {
          background: #f9fafb;
        }

        .earning-item:last-child {
          border-bottom: none;
        }

        .earning-details {
          flex: 1;
        }

        .earning-title {
          display: block;
          color: #1f2937;
          font-weight: 500;
          margin-bottom: 0.25rem;
        }

        .earning-date {
          color: #6b7280;
          font-size: 0.8rem;
        }

        .earning-amount {
          font-weight: 700;
          color: #10b981;
          font-size: 1.1rem;
        }

        @media (max-width: 768px) {
          .earnings-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .earnings-controls {
            width: 100%;
            justify-content: space-between;
          }

          .earnings-overview {
            grid-template-columns: 1fr;
          }

          .earnings-stats {
            order: 2;
          }

          .earnings-chart {
            order: 1;
          }

          .chart-bars {
            padding: 0 0.5rem;
          }

          .chart-bar {
            width: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default EarningsContent;
