import React, { useState, useEffect } from 'react';
import { FaUser, FaEdit, FaSave, FaTimes } from 'react-icons/fa';

const ProfileContent = () => {
  const [profileData, setProfileData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/backend/api/workers/profile.php`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setProfileData(data.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Fallback data
      setProfileData({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1 234 567 8900',
        skills: 'Plumbing, Electrical, HVAC',
        experience_years: 5,
        hourly_rate: 25,
        bio: 'Experienced service professional with expertise in multiple trades.',
        certifications: 'Licensed Plumber, Electrical Certification'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/backend/api/workers/profile.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(profileData)
      });
      const data = await response.json();
      if (data.success) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="profile-content">
      <div className="profile-header">
        <h3><FaUser className="page-icon" /> Worker Profile</h3>
        <button 
          className={`edit-btn ${isEditing ? 'cancel' : 'edit'}`}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? <FaTimes /> : <FaEdit />}
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <div className="profile-sections">
        <div className="profile-section">
          <h4>Personal Information</h4>
          <div className="profile-field">
            <label>First Name:</label>
            {isEditing ? (
              <input 
                type="text" 
                value={profileData.first_name || ''} 
                onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
              />
            ) : (
              <span>{profileData.first_name}</span>
            )}
          </div>
          <div className="profile-field">
            <label>Last Name:</label>
            {isEditing ? (
              <input 
                type="text" 
                value={profileData.last_name || ''} 
                onChange={(e) => setProfileData({...profileData, last_name: e.target.value})}
              />
            ) : (
              <span>{profileData.last_name}</span>
            )}
          </div>
          <div className="profile-field">
            <label>Email:</label>
            {isEditing ? (
              <input 
                type="email" 
                value={profileData.email || ''} 
                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
              />
            ) : (
              <span>{profileData.email}</span>
            )}
          </div>
          <div className="profile-field">
            <label>Phone:</label>
            {isEditing ? (
              <input 
                type="tel" 
                value={profileData.phone || ''} 
                onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
              />
            ) : (
              <span>{profileData.phone}</span>
            )}
          </div>
        </div>

        <div className="profile-section">
          <h4>Work Information</h4>
          <div className="profile-field">
            <label>Skills:</label>
            {isEditing ? (
              <input 
                type="text" 
                value={profileData.skills || ''} 
                onChange={(e) => setProfileData({...profileData, skills: e.target.value})}
                placeholder="e.g., Plumbing, Electrical, HVAC"
              />
            ) : (
              <span>{profileData.skills}</span>
            )}
          </div>
          <div className="profile-field">
            <label>Experience:</label>
            {isEditing ? (
              <input 
                type="number" 
                value={profileData.experience_years || ''} 
                onChange={(e) => setProfileData({...profileData, experience_years: e.target.value})}
                min="0"
                max="50"
              />
            ) : (
              <span>{profileData.experience_years} years</span>
            )}
          </div>
          <div className="profile-field">
            <label>Hourly Rate:</label>
            {isEditing ? (
              <input 
                type="number" 
                value={profileData.hourly_rate || ''} 
                onChange={(e) => setProfileData({...profileData, hourly_rate: e.target.value})}
                min="10"
                max="200"
              />
            ) : (
              <span>${profileData.hourly_rate}/hour</span>
            )}
          </div>
          <div className="profile-field">
            <label>Certifications:</label>
            {isEditing ? (
              <textarea 
                value={profileData.certifications || ''} 
                onChange={(e) => setProfileData({...profileData, certifications: e.target.value})}
                placeholder="List your certifications"
                rows="2"
              />
            ) : (
              <span>{profileData.certifications || 'No certifications listed'}</span>
            )}
          </div>
        </div>

        <div className="profile-section full-width">
          <h4>Bio</h4>
          <div className="profile-field">
            {isEditing ? (
              <textarea 
                value={profileData.bio || ''} 
                onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                placeholder="Tell customers about yourself and your experience"
                rows="4"
                className="bio-textarea"
              />
            ) : (
              <p className="bio-text">{profileData.bio || 'No bio provided'}</p>
            )}
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="profile-actions">
          <button className="btn btn-success" onClick={handleSaveProfile}>
            <FaSave /> Save Changes
          </button>
          <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>
            <FaTimes /> Cancel
          </button>
        </div>
      )}

      <style jsx>{`
        .profile-content {
          max-width: 1000px;
          padding: 1rem;
        }

        .page-icon {
          margin-right: 0.5rem;
          color: #3b82f6;
        }

        .profile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .profile-header h3 {
          margin: 0;
          color: #1f2937;
          font-size: 1.5rem;
          font-weight: 600;
          display: flex;
          align-items: center;
        }

        .edit-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border: 1px solid #d1d5db;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
          color: #374151;
        }

        .edit-btn:hover {
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .edit-btn.cancel {
          border-color: #ef4444;
          color: #ef4444;
        }

        .edit-btn.cancel:hover {
          background: #ef4444;
          color: white;
        }

        .loading {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
          font-size: 1.1rem;
        }

        .profile-sections {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .profile-section {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .profile-section.full-width {
          grid-column: 1 / -1;
        }

        .profile-section h4 {
          margin: 0 0 1rem 0;
          color: #1f2937;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 0.5rem;
          font-weight: 600;
        }

        .profile-field {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .profile-field:last-child {
          border-bottom: none;
        }

        .profile-field label {
          font-weight: 600;
          color: #374151;
          min-width: 120px;
        }

        .profile-field span {
          color: #6b7280;
          text-align: right;
          flex: 1;
        }

        .profile-field input,
        .profile-field textarea {
          flex: 1;
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 0.9rem;
          transition: border-color 0.2s ease;
        }

        .profile-field input:focus,
        .profile-field textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .bio-textarea {
          width: 100%;
          resize: vertical;
          min-height: 100px;
        }

        .bio-text {
          margin: 0;
          color: #6b7280;
          line-height: 1.6;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 8px;
          border-left: 4px solid #3b82f6;
        }

        .profile-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          padding: 1.5rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.9rem;
        }

        .btn-success {
          background: #10b981;
          color: white;
        }

        .btn-success:hover {
          background: #059669;
          transform: translateY(-1px);
        }

        .btn-secondary {
          background: #6b7280;
          color: white;
        }

        .btn-secondary:hover {
          background: #4b5563;
          transform: translateY(-1px);
        }

        @media (max-width: 768px) {
          .profile-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .profile-sections {
            grid-template-columns: 1fr;
          }

          .profile-field {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .profile-field label {
            min-width: auto;
          }

          .profile-field span,
          .profile-field input,
          .profile-field textarea {
            width: 100%;
            text-align: left;
          }

          .profile-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default ProfileContent;
