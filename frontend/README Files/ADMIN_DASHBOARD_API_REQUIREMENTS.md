# Admin Dashboard Backend API Requirements

## Overview
This document outlines all the backend API endpoints required for the fully dynamic Admin Dashboard implementation.

## Base URL Structure
All APIs should be accessible under: `${VITE_API_URL}backend/api/`

## Required API Endpoints

### 1. Admin Statistics API
**Endpoint:** `GET /backend/api/admin/stats.php`
**Purpose:** Get dashboard statistics
**Response Format:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "activeWorkers": 45,
    "totalRequests": 320,
    "totalRevenue": 25420,
    "pendingApprovals": 8,
    "activeSessions": 12
  }
}
```

### 2. Users Management APIs

#### Get All Users
**Endpoint:** `GET /backend/api/admin/users.php`
**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "role": "customer",
      "created_at": "2024-01-15T10:30:00Z",
      "status": "active"
    }
  ]
}
```

#### Create User
**Endpoint:** `POST /backend/api/admin/users.php`
**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "role": "customer",
  "password": "securepassword"
}
```

#### Update User
**Endpoint:** `PUT /backend/api/admin/users.php`
**Request Body:**
```json
{
  "id": 1,
  "name": "Jane Smith Updated",
  "email": "jane.updated@example.com",
  "role": "worker",
  "password": "newpassword" // Optional
}
```

#### Delete User
**Endpoint:** `DELETE /backend/api/admin/users.php`
**Request Body:**
```json
{
  "id": 1
}
```

### 3. Workers Management APIs

#### Get All Workers
**Endpoint:** `GET /backend/api/admin/workers.php`
**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Mike Johnson",
      "first_name": "Mike",
      "last_name": "Johnson",
      "email": "mike@example.com",
      "phone": "+1234567890",
      "specialization": "Plumber",
      "category_name": "Plumbing",
      "status": "active",
      "rating": 4.8,
      "completedJobs": 45,
      "completed_jobs": 45,
      "created_at": "2024-01-10T08:00:00Z"
    }
  ]
}
```

#### Delete Worker
**Endpoint:** `DELETE /backend/api/admin/workers.php`
**Request Body:**
```json
{
  "id": 1
}
```

### 4. Service Requests APIs

#### Get All Service Requests
**Endpoint:** `GET /backend/api/admin/service-requests.php`
**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "service_name": "Plumbing Repair",
      "customer_name": "John Doe",
      "customer_id": 5,
      "address": "123 Main St",
      "phone": "+1234567890",
      "price": 150,
      "status": "pending",
      "created_at": "2024-01-15T10:30:00Z",
      "worker_id": null,
      "worker_name": null
    }
  ]
}
```

#### Manage Service Request
**Endpoint:** `POST /backend/api/admin/manage-request.php`
**Request Body:**
```json
{
  "requestId": 1,
  "action": "assign" // or "reject", "complete", "cancel"
}
```

### 5. Categories APIs (Already Existing)

#### Get Categories
**Endpoint:** `GET /backend/api/categories/fetch_category.php`
**Response Format:**
```json
{
  "success": true,
  "categories": [
    {
      "id": 1,
      "name": "Plumbing",
      "description": "Water and pipe services",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Delete Category
**Endpoint:** `POST /backend/api/categories/delete.php`
**Request Body:**
```json
{
  "id": 1
}
```

### 6. Divisions APIs

#### Get All Divisions
**Endpoint:** `GET /backend/api/admin/divisions.php`
**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "North Division",
      "description": "Covers northern areas",
      "manager": "John Smith",
      "workers_count": 15,
      "active_requests": 8,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Delete Division
**Endpoint:** `DELETE /backend/api/admin/divisions.php`
**Request Body:**
```json
{
  "id": 1
}
```

### 7. Notifications APIs

#### Get Notifications
**Endpoint:** `GET /backend/api/admin/notifications.php?filter=all`
**Query Parameters:**
- `filter`: all, unread, high, system, requests
**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "warning",
      "title": "Worker Availability Low",
      "message": "Only 3 workers are currently available.",
      "timestamp": "2024-01-15T10:30:00Z",
      "isRead": false,
      "priority": "high",
      "category": "system"
    }
  ]
}
```

#### Mark Notifications as Read
**Endpoint:** `POST /backend/api/admin/notifications/mark-read.php`
**Request Body:**
```json
{
  "notificationIds": [1, 2, 3]
}
```

#### Delete Notifications
**Endpoint:** `DELETE /backend/api/admin/notifications.php`
**Request Body:**
```json
{
  "notificationIds": [1, 2, 3]
}
```

### 8. Messages APIs

#### Get Messages
**Endpoint:** `GET /backend/api/admin/messages.php?filter=all`
**Query Parameters:**
- `filter`: all, unread, high
**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "from": "John Smith",
      "fromRole": "worker",
      "subject": "Request for Equipment",
      "message": "Hi Admin, I need new tools...",
      "timestamp": "2024-01-15T10:30:00Z",
      "isRead": false,
      "priority": "high"
    }
  ]
}
```

#### Mark Message as Read
**Endpoint:** `POST /backend/api/admin/messages/mark-read.php`
**Request Body:**
```json
{
  "messageId": 1
}
```

#### Delete Message
**Endpoint:** `DELETE /backend/api/admin/messages.php`
**Request Body:**
```json
{
  "messageId": 1
}
```

### 9. Financial APIs

#### Get Financial Data
**Endpoint:** `GET /backend/api/admin/finances.php?period=month`
**Query Parameters:**
- `period`: week, month, quarter, year
**Response Format:**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 25420,
    "totalExpenses": 8750,
    "netProfit": 16670,
    "pendingPayments": 3200,
    "completedTransactions": 156,
    "averageOrderValue": 163
  },
  "transactions": [
    {
      "id": 1,
      "type": "income",
      "amount": 250,
      "description": "Plumbing Service - John Doe",
      "date": "2024-01-15",
      "status": "completed",
      "method": "credit_card"
    }
  ]
}
```

### 10. Settings APIs

#### Get Settings
**Endpoint:** `GET /backend/api/admin/settings.php`
**Response Format:**
```json
{
  "success": true,
  "data": {
    "general": {
      "siteName": "Local Service Provider",
      "siteDescription": "Professional home services",
      "timezone": "America/New_York",
      "language": "en",
      "maintenanceMode": false
    },
    "notifications": {
      "emailNotifications": true,
      "smsNotifications": false,
      "pushNotifications": true
    }
  }
}
```

#### Save Settings
**Endpoint:** `POST /backend/api/admin/settings.php`
**Request Body:**
```json
{
  "settings": {
    "general": {
      "siteName": "Updated Site Name",
      "maintenanceMode": true
    }
  }
}
```

## Database Tables Required

### 1. users
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    name VARCHAR(200), -- Computed or stored
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    role ENUM('admin', 'agent', 'worker', 'customer'),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2. workers (extends users or separate table)
```sql
CREATE TABLE workers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    category_id INT,
    specialization VARCHAR(100),
    phone VARCHAR(20),
    rating DECIMAL(3,2) DEFAULT 4.0,
    completed_jobs INT DEFAULT 0,
    status ENUM('active', 'inactive', 'busy') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

### 3. service_requests
```sql
CREATE TABLE service_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT,
    worker_id INT NULL,
    category_id INT,
    service_name VARCHAR(200),
    customer_name VARCHAR(200),
    address TEXT,
    phone VARCHAR(20),
    price DECIMAL(10,2),
    status ENUM('pending', 'assigned', 'in_progress', 'completed', 'cancelled'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (worker_id) REFERENCES workers(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

### 4. divisions
```sql
CREATE TABLE divisions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    description TEXT,
    manager VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5. notifications
```sql
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type ENUM('info', 'warning', 'error', 'success'),
    title VARCHAR(200),
    message TEXT,
    priority ENUM('low', 'medium', 'high'),
    category VARCHAR(50),
    isRead BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 6. messages
```sql
CREATE TABLE messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    from_user_id INT,
    to_user_id INT,
    subject VARCHAR(200),
    message TEXT,
    priority ENUM('low', 'medium', 'high'),
    isRead BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_user_id) REFERENCES users(id),
    FOREIGN KEY (to_user_id) REFERENCES users(id)
);
```

### 7. transactions
```sql
CREATE TABLE transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    request_id INT,
    type ENUM('income', 'expense'),
    amount DECIMAL(10,2),
    description TEXT,
    status ENUM('pending', 'completed', 'failed'),
    method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES service_requests(id)
);
```

### 8. settings
```sql
CREATE TABLE settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    section VARCHAR(50),
    key_name VARCHAR(100),
    value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_setting (section, key_name)
);
```

## Authentication Requirements

All API endpoints should:
1. Require authentication via session/JWT
2. Verify admin role permissions
3. Include CORS headers for frontend requests
4. Use `withCredentials: true` for cookie-based sessions

## Error Response Format

All APIs should return consistent error responses:
```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field": "Field-specific error message"
  }
}
```

## Implementation Notes

1. **Data Validation**: All APIs should validate input data
2. **SQL Injection Prevention**: Use prepared statements
3. **Rate Limiting**: Implement rate limiting for API endpoints
4. **Logging**: Log all admin actions for audit trails
5. **Backup**: Ensure database backups before delete operations
6. **Pagination**: Implement pagination for large datasets
7. **Search**: Support search functionality in list endpoints
8. **File Uploads**: Handle file uploads for user avatars, logos, etc.

This comprehensive API structure will make the Admin Dashboard fully dynamic and connected to real database operations.
