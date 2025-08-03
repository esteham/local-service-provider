// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/';

// Ensure the URL ends with a slash
export const BASE_URL = API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`;

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: 'backend/api/auth/login.php',
  LOGOUT: 'backend/api/auth/logout.php',
  
  // Users
  USER_REQUEST_SERVICE: '/api/user/request_service.php',
  USER_HISTORY: '/api/user/history.php',
  USER_STATS: '/api/user/stats.php',
  USER_NOTIFICATIONS: '/api/user/notifications.php',
  
  // Workers
  WORKER_REGISTER: 'backend/api/workers/register.php',
  WORKER_TASKS: '/api/workers/show_task.php',
  WORKER_STATS: '/api/workers/stats.php',
  WORKER_NOTIFICATIONS: '/api/workers/notifications.php',
  WORKER_AVAILABILITY: '/api/workers/availability.php',
  
  // Agents
  AGENT_STATS: '/api/agents/stats.php',
  AGENT_SERVICE_REQUESTS: '/api/agents/service-requests.php',
  AGENT_WORKERS: '/api/agents/workers.php',
  AGENT_NOTIFICATIONS: '/api/agents/notifications.php',
  
  // Categories
  CATEGORIES_FETCH: 'backend/api/categories/fetch_category.php',
  CATEGORIES_CREATE: 'backend/api/categories/create.php',
  CATEGORIES_EDIT: 'backend/api/categories/edit.php',
  
  // Services
  SERVICES_GET: '/api/Services/get_services.php',
  
  // Zones
  ZONES_VIEW: '/api/zones/view.php',
  
  // Dynamic Pricing
  CALCULATE_PRICE: '/api/dynamic_pricing/calculate_price.php',
  
  // Contact
  CONTACT: '/api/contact'
};

// Helper function to build full URL
export const buildApiUrl = (endpoint) => {
  if (endpoint.startsWith('/api/')) {
    // For relative API paths, use as-is (will be proxied by Vite)
    return endpoint;
  } else if (endpoint.startsWith('backend/')) {
    // For backend paths, prepend BASE_URL
    return `${BASE_URL}${endpoint}`;
  } else {
    // For other paths, prepend BASE_URL
    return `${BASE_URL}${endpoint}`;
  }
};
