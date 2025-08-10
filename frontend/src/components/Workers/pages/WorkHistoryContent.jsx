import React, { useState, useEffect } from 'react';
import { FaHistory, FaSearch, FaCalendarAlt, FaFilter } from 'react-icons/fa';

const WorkHistoryContent = ({ serviceRequests }) => {
  const [historyData, setHistoryData] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkHistory();
  }, []);

  useEffect(() => {
    filterHistory();
  }, [historyData, searchTerm, dateFilter]);

  const fetchWorkHistory = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/backend/api/workers/work_history.php`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setHistoryData(data.data);
      }
    } catch (error) {
      console.error('Error fetching work history:', error);
      setHistoryData([]);
    } finally {
      setLoading(false);
    }
  };

  const filterHistory = () => {
    let filtered = historyData;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.service_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date filter
    const now = new Date();
    if (dateFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(item => new Date(item.completed_at || item.created_at) >= weekAgo);
    } else if (dateFilter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(item => new Date(item.completed_at || item.created_at) >= monthAgo);
    }

    setFilteredHistory(filtered);
  };

  if (loading) {
    return <div className="loading">Loading work history...</div>;
  }

  return (
    <div className="work-history-content">
      <div className="history-header">
        <h3><FaHistory className="page-icon" /> Work History</h3>
        <div className="history-controls">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            value={dateFilter} 
            onChange={(e) => setDateFilter(e.target.value)}
            className="date-filter"
          >
            <option value="all">All Time</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
          </select>
        </div>
      </div>

      <div className="history-stats">
        <div className="stat-card">
          <h4>Total Completed</h4>
          <p>{historyData.length}</p>
        </div>
        <div className="stat-card">
          <h4>Total Earnings</h4>
          <p>${historyData.reduce((sum, item) => sum + (parseFloat(item.final_price) || 0), 0).toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h4>Average Rating</h4>
          <p>4.8/5</p>
        </div>
      </div>

      <div className="history-list">
        {filteredHistory.map(request => (
          <div key={request.id} className="history-item">
            <div className="history-header-item">
              <h4>{request.title}</h4>
              <span className="history-date">
                <FaCalendarAlt /> {new Date(request.completed_at || request.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="history-details">
              <div className="detail-row">
                <span className="detail-label">Service:</span>
                <span className="detail-value">{request.service_name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Customer:</span>
                <span className="detail-value">{request.customer_name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Location:</span>
                <span className="detail-value">{request.address}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Earnings:</span>
                <span className="detail-value earnings">${request.final_price}</span>
              </div>
            </div>
          </div>
        ))}
        
        {filteredHistory.length === 0 && historyData.length > 0 && (
          <div className="no-results">
            <p>No work history found matching your filters.</p>
          </div>
        )}
        
        {historyData.length === 0 && (
          <div className="no-history">
            <p>No completed work history yet.</p>
            <p>Complete some tasks to see your work history here.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .work-history-content {
          max-width: 1000px;
          padding: 1rem;
        }

        .page-icon {
          margin-right: 0.5rem;
          color: #3b82f6;
        }

        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .history-header h3 {
          margin: 0;
          color: #1f2937;
          font-size: 1.5rem;
          font-weight: 600;
          display: flex;
          align-items: center;
        }

        .history-controls {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .search-box {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 0.75rem;
          color: #6b7280;
          z-index: 1;
        }

        .search-box input {
          padding: 0.5rem 0.75rem 0.5rem 2.5rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.9rem;
          width: 200px;
          transition: border-color 0.2s ease;
        }

        .search-box input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .date-filter {
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.9rem;
          background: white;
          cursor: pointer;
        }

        .date-filter:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .loading {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
          font-size: 1.1rem;
        }

        .history-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          text-align: center;
          border-left: 4px solid #10b981;
        }

        .stat-card h4 {
          margin: 0 0 0.5rem 0;
          color: #6b7280;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }

        .stat-card p {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
          color: #10b981;
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .history-item {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          transition: transform 0.2s ease;
        }

        .history-item:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.15);
        }

        .history-header-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .history-header-item h4 {
          margin: 0;
          color: #1f2937;
          font-weight: 600;
        }

        .history-date {
          color: #6b7280;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-weight: 500;
        }

        .history-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.75rem;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background: #f8fafc;
          border-radius: 6px;
        }

        .detail-label {
          font-weight: 600;
          color: #374151;
          font-size: 0.9rem;
        }

        .detail-value {
          color: #6b7280;
          font-weight: 500;
        }

        .detail-value.earnings {
          color: #10b981;
          font-weight: 700;
        }

        .no-results,
        .no-history {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          border: 2px dashed #d1d5db;
        }

        .no-results p,
        .no-history p {
          margin: 0.5rem 0;
          font-size: 1rem;
        }

        @media (max-width: 768px) {
          .history-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .history-controls {
            flex-direction: column;
            width: 100%;
            gap: 0.5rem;
          }

          .search-box input {
            width: 100%;
          }

          .date-filter {
            width: 100%;
          }

          .history-stats {
            grid-template-columns: 1fr;
          }

          .history-details {
            grid-template-columns: 1fr;
          }

          .detail-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default WorkHistoryContent;
