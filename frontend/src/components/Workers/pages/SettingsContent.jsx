import React, { useState, useEffect } from 'react';
import { FaCog, FaSave, FaBell, FaLock, FaUser, FaTools } from 'react-icons/fa';

const SettingsContent = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/backend/api/workers/settings.php`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Fallback settings
      setSettings({
        email_notifications: true,
        sms_notifications: false,
        auto_accept_tasks: false,
        show_profile_to_customers: true,
        share_location_while_working: true,
        max_tasks_per_day: 5,
        preferred_work_radius: 10,
        notification_sound: true,
        weekend_availability: false,
        emergency_contact: '',
        preferred_payment_method: 'bank_transfer'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/backend/api/workers/settings.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(settings)
      });
      const data = await response.json();
      if (data.success) {
        // Show success message
        console.log('Settings saved successfully');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading settings...</div>;
  }

  return (
    <div className="settings-content">
      <div className="settings-header">
        <h3><FaCog className="page-icon" /> Settings</h3>
        <button 
          className="save-btn"
          onClick={saveSettings}
          disabled={saving}
        >
          <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="settings-sections">
        <div className="settings-section">
          <h4><FaBell className="section-icon" /> Notification Settings</h4>
          <div className="setting-item">
            <div className="setting-info">
              <label>Email Notifications</label>
              <span>Receive task updates via email</span>
            </div>
            <input 
              type="checkbox" 
              checked={settings.email_notifications || false}
              onChange={(e) => handleSettingChange('email_notifications', e.target.checked)}
            />
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <label>SMS Notifications</label>
              <span>Receive urgent updates via SMS</span>
            </div>
            <input 
              type="checkbox" 
              checked={settings.sms_notifications || false}
              onChange={(e) => handleSettingChange('sms_notifications', e.target.checked)}
            />
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <label>Notification Sound</label>
              <span>Play sound for new notifications</span>
            </div>
            <input 
              type="checkbox" 
              checked={settings.notification_sound || false}
              onChange={(e) => handleSettingChange('notification_sound', e.target.checked)}
            />
          </div>
        </div>

        <div className="settings-section">
          <h4><FaTools className="section-icon" /> Work Preferences</h4>
          <div className="setting-item">
            <div className="setting-info">
              <label>Auto-accept tasks</label>
              <span>Automatically accept suitable tasks</span>
            </div>
            <input 
              type="checkbox" 
              checked={settings.auto_accept_tasks || false}
              onChange={(e) => handleSettingChange('auto_accept_tasks', e.target.checked)}
            />
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <label>Weekend Availability</label>
              <span>Available for tasks on weekends</span>
            </div>
            <input 
              type="checkbox" 
              checked={settings.weekend_availability || false}
              onChange={(e) => handleSettingChange('weekend_availability', e.target.checked)}
            />
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <label>Maximum tasks per day</label>
              <span>Limit daily task assignments</span>
            </div>
            <input 
              type="number" 
              value={settings.max_tasks_per_day || 5}
              onChange={(e) => handleSettingChange('max_tasks_per_day', parseInt(e.target.value))}
              min="1" 
              max="20"
            />
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <label>Preferred work radius (miles)</label>
              <span>Maximum distance for task assignments</span>
            </div>
            <input 
              type="number" 
              value={settings.preferred_work_radius || 10}
              onChange={(e) => handleSettingChange('preferred_work_radius', parseInt(e.target.value))}
              min="1" 
              max="50"
            />
          </div>
        </div>

        <div className="settings-section">
          <h4><FaLock className="section-icon" /> Privacy Settings</h4>
          <div className="setting-item">
            <div className="setting-info">
              <label>Show profile to customers</label>
              <span>Allow customers to view your profile</span>
            </div>
            <input 
              type="checkbox" 
              checked={settings.show_profile_to_customers || false}
              onChange={(e) => handleSettingChange('show_profile_to_customers', e.target.checked)}
            />
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <label>Share location while working</label>
              <span>Share real-time location during tasks</span>
            </div>
            <input 
              type="checkbox" 
              checked={settings.share_location_while_working || false}
              onChange={(e) => handleSettingChange('share_location_while_working', e.target.checked)}
            />
          </div>
        </div>

        <div className="settings-section">
          <h4><FaUser className="section-icon" /> Account Settings</h4>
          <div className="setting-item">
            <div className="setting-info">
              <label>Emergency Contact</label>
              <span>Contact for emergency situations</span>
            </div>
            <input 
              type="tel" 
              value={settings.emergency_contact || ''}
              onChange={(e) => handleSettingChange('emergency_contact', e.target.value)}
              placeholder="+1 234 567 8900"
            />
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <label>Preferred Payment Method</label>
              <span>How you'd like to receive payments</span>
            </div>
            <select 
              value={settings.preferred_payment_method || 'bank_transfer'}
              onChange={(e) => handleSettingChange('preferred_payment_method', e.target.value)}
            >
              <option value="bank_transfer">Bank Transfer</option>
              <option value="paypal">PayPal</option>
              <option value="check">Check</option>
              <option value="cash">Cash</option>
            </select>
          </div>
        </div>
      </div>

      <style jsx>{`
        .settings-content {
          max-width: auto;
          padding: 0 7rem;
        }

        .page-icon {
          margin-right: 0.5rem;
          color: #3b82f6;
        }

        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .settings-header h3 {
          margin: 0;
          color: #1f2937;
          font-size: 1.5rem;
          font-weight: 600;
          display: flex;
          align-items: center;
        }

        .save-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .save-btn:hover:not(:disabled) {
          background: #059669;
          transform: translateY(-1px);
        }

        .save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .loading {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
          font-size: 1.1rem;
        }

        .settings-sections {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .settings-section {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .settings-section h4 {
          margin: 0 0 1rem 0;
          color: #1f2937;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 0.5rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .section-icon {
          color: #3b82f6;
        }

        .setting-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .setting-item:last-child {
          border-bottom: none;
        }

        .setting-info {
          flex: 1;
        }

        .setting-info label {
          display: block;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.25rem;
        }

        .setting-info span {
          color: #6b7280;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .setting-item input[type="checkbox"] {
          width: 20px;
          height: 20px;
          accent-color: #3b82f6;
          cursor: pointer;
        }

        .setting-item input[type="number"],
        .setting-item input[type="tel"] {
          width: 120px;
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          text-align: center;
          font-size: 0.9rem;
          transition: border-color 0.2s ease;
        }

        .setting-item input[type="number"]:focus,
        .setting-item input[type="tel"]:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .setting-item select {
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          font-size: 0.9rem;
          min-width: 150px;
        }

        .setting-item select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        @media (max-width: 768px) {
          .settings-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .save-btn {
            width: 100%;
            justify-content: center;
          }

          .setting-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .setting-item input[type="number"],
          .setting-item input[type="tel"],
          .setting-item select {
            width: 100%;
            text-align: left;
          }

          .setting-item input[type="checkbox"] {
            align-self: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default SettingsContent;
