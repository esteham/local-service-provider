/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="error-boundary">
          <div className="error-content">
            <div className="error-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h3>Something went wrong</h3>
            <p>An error occurred while rendering this component.</p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details">
                <summary>Error Details (Development Mode)</summary>
                <pre className="error-stack">
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            
            <button 
              className="btn btn-primary"
              onClick={() => {
                this.setState({ hasError: false, error: null, errorInfo: null });
                // Optionally reload the page
                window.location.reload();
              }}
            >
              Try Again
            </button>
          </div>
          
          <style jsx>{`
            .error-boundary {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 400px;
              padding: 2rem;
            }
            
            .error-content {
              text-align: center;
              max-width: 500px;
              padding: 2rem;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              background: #f9fafb;
            }
            
            .error-icon {
              font-size: 3rem;
              color: #ef4444;
              margin-bottom: 1rem;
            }
            
            .error-content h3 {
              color: #1f2937;
              margin-bottom: 0.5rem;
            }
            
            .error-content p {
              color: #6b7280;
              margin-bottom: 1.5rem;
            }
            
            .error-details {
              text-align: left;
              margin: 1rem 0;
              padding: 1rem;
              background: #fff;
              border: 1px solid #d1d5db;
              border-radius: 4px;
            }
            
            .error-details summary {
              cursor: pointer;
              font-weight: 600;
              color: #374151;
              margin-bottom: 0.5rem;
            }
            
            .error-stack {
              font-size: 0.875rem;
              color: #ef4444;
              background: #fef2f2;
              padding: 1rem;
              border-radius: 4px;
              overflow-x: auto;
              white-space: pre-wrap;
              word-break: break-word;
            }
            
            .btn {
              padding: 0.5rem 1rem;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-weight: 500;
              transition: all 0.2s;
            }
            
            .btn-primary {
              background: #3b82f6;
              color: white;
            }
            
            .btn-primary:hover {
              background: #2563eb;
            }
          `}</style>
        </div>
      );
    }

    // No error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
