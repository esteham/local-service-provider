# Admin Dashboard Integration Guide

This guide explains how to integrate the pending users functionality into your admin dashboard.

## Current Status

✅ **Completed Components:**
- Backend OTP verification system
- Frontend OTP verification modal
- Updated registration forms (User, Worker, Agent)
- PendingUsersContent component for admin interface
- All necessary API endpoints

✅ **Partially Integrated:**
- PendingUsersContent component imported in AdminDashboard.jsx
- Route case added for "pending-users" in renderContent function

## Integration Options

### Option 1: Add to Existing Navigation (Recommended)

If your admin dashboard has a navigation menu or sidebar, add a "Pending Users" option:

```jsx
// In your navigation component or admin dashboard
<nav>
  <a onClick={() => setActiveTab('dashboard')}>Dashboard</a>
  <a onClick={() => setActiveTab('users')}>Users</a>
  <a onClick={() => setActiveTab('pending-users')}>Pending Users</a>
  <a onClick={() => setActiveTab('workers')}>Workers</a>
  {/* ... other menu items */}
</nav>
```

### Option 2: Add as Tab in Users Section

Modify the existing users section to include pending users as a tab:

```jsx
// In the renderUsers function, add a tab for pending users
const [userTab, setUserTab] = useState('active'); // 'active' or 'pending'

// Add tab buttons
<div className="user-tabs">
  <button 
    className={userTab === 'active' ? 'active' : ''}
    onClick={() => setUserTab('active')}
  >
    Active Users
  </button>
  <button 
    className={userTab === 'pending' ? 'active' : ''}
    onClick={() => setUserTab('pending')}
  >
    Pending Approvals
  </button>
</div>

// Render content based on tab
{userTab === 'active' ? renderActiveUsers() : <PendingUsersContent />}
```

### Option 3: Dashboard Widget

Add a pending users widget to the main dashboard:

```jsx
// In renderDashboard function
<div className="dashboard-widgets">
  {/* Existing widgets */}
  
  <div className="widget pending-users-widget">
    <h3>Pending User Approvals</h3>
    <div className="widget-content">
      <div className="pending-count">
        {adminStats.pendingApprovals || 0} users awaiting approval
      </div>
      <button 
        className="btn btn-primary"
        onClick={() => setActiveTab('pending-users')}
      >
        Review Pending Users
      </button>
    </div>
  </div>
</div>
```

## Required Updates

### 1. Update Admin Stats API

Modify `/backend/api/admin/stats.php` to include pending users count:

```php
// Add this to your stats query
$pendingUsers = $db->fetch(
    "SELECT COUNT(*) as count FROM users WHERE status = 'pending' AND email_verified = TRUE"
);

$stats['pendingApprovals'] = $pendingUsers['count'] ?? 0;
```

### 2. Update Users API

Modify `/backend/api/admin/users.php` to support status filtering:

```php
// Add status parameter support
$status = $_GET['status'] ?? 'all';

$whereClause = "WHERE 1=1";
if ($status !== 'all') {
    $whereClause .= " AND status = ?";
    $params[] = $status;
}

$query = "SELECT * FROM users $whereClause ORDER BY created_at DESC";
```

### 3. Add Navigation Item (if using sidebar)

If you have a sidebar component, add the pending users item:

```jsx
const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: FaTachometerAlt },
  { id: 'users', label: 'Users', icon: FaUsers },
  { 
    id: 'pending-users', 
    label: 'Pending Users', 
    icon: FaUserClock,
    badge: adminStats.pendingApprovals > 0 ? adminStats.pendingApprovals : null
  },
  { id: 'workers', label: 'Workers', icon: FaHammer },
  // ... other items
];
```

## Testing the Integration

### 1. Test Registration Flow

1. Register a new worker or agent
2. Complete OTP verification
3. Check that user appears in pending users list
4. Test approval/rejection functionality

### 2. Test Admin Interface

1. Navigate to pending users section
2. Verify user details modal works
3. Test filtering by role
4. Test approval and rejection actions

### 3. Verify Database Changes

```sql
-- Check pending users
SELECT id, username, email, role, status, email_verified, created_at 
FROM users 
WHERE status = 'pending' AND email_verified = TRUE;

-- Check OTP records
SELECT user_id, otp_code, expires_at, is_used, attempts 
FROM otp_verifications 
WHERE user_id IN (SELECT id FROM users WHERE status = 'pending');
```

## Styling Integration

### Add CSS for Pending Users

```css
/* Pending users widget */
.pending-users-widget {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  padding: 1.5rem;
}

.pending-count {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

/* Navigation badge */
.nav-item .badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #dc3545;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 0.75rem;
}

/* Status badges */
.status-badge.email-pending {
  background: #ffc107;
  color: #000;
}

.status-badge.pending {
  background: #17a2b8;
  color: white;
}

.status-badge.active {
  background: #28a745;
  color: white;
}
```

## Real-time Updates (Optional)

For real-time pending user notifications, consider:

### 1. Polling Approach

```jsx
useEffect(() => {
  const interval = setInterval(() => {
    if (activeTab === 'pending-users') {
      // Refresh pending users data
      loadPendingUsers();
    }
    // Update stats for badge count
    loadStats();
  }, 30000); // Check every 30 seconds

  return () => clearInterval(interval);
}, [activeTab]);
```

### 2. WebSocket Approach (Advanced)

```jsx
useEffect(() => {
  const ws = new WebSocket('ws://localhost:8080');
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'user_registered') {
      // Update pending users count
      setAdminStats(prev => ({
        ...prev,
        pendingApprovals: prev.pendingApprovals + 1
      }));
      
      // Show notification
      toast.info('New user registration pending approval');
    }
  };

  return () => ws.close();
}, []);
```

## Troubleshooting

### Common Issues

1. **Pending Users Not Showing**:
   - Check database schema updates are applied
   - Verify API endpoint returns correct data
   - Check user status and email_verified fields

2. **Navigation Not Working**:
   - Verify activeTab state management
   - Check renderContent function includes pending-users case
   - Ensure component import is correct

3. **Approval Actions Failing**:
   - Check admin authentication
   - Verify API endpoint permissions
   - Check network requests in browser dev tools

### Debug Steps

1. Check browser console for errors
2. Verify API responses in Network tab
3. Check database records match expected state
4. Test with different user roles and statuses

## Next Steps

After integration:

1. **Configure Email Service**: Set up real email sending
2. **Add Notifications**: Implement admin notifications for new registrations
3. **Bulk Operations**: Add bulk approve/reject functionality
4. **Analytics**: Track approval rates and processing times
5. **Automated Tests**: Create tests for the approval workflow

This completes the integration guide for the pending users functionality.
