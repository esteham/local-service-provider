import React, { useState, useEffect } from 'react';
import { 
  FaBuilding, 
  FaMapMarkerAlt, 
  FaGlobe, 
  FaCity, 
  FaHome,
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaTimes
} from 'react-icons/fa';
import axios from 'axios';
import useLiveValidation from '../../../hooks/useLiveValidation';
import ValidationMessage from '../../common/ValidationMessage';
import { showFormSuccessToast, showErrorToast } from '../../../utils/confirmationToast';
import { toast } from 'react-toastify';

const LocationContent = () => {
  const [activeTab, setActiveTab] = useState('divisions');
  const [locations, setLocations] = useState({
    divisions: [],
    districts: [],
    upazilas: [],
    zones: [],
    areas: []
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [editingItem, setEditingItem] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    division_id: '',
    district_id: '',
    upazila_id: '',
    zone_id: ''
  });

  // Live validation hook
  const nameValidation = useLiveValidation(
    activeTab, 
    'name', 
    editingItem?.id
  );

  const BASE_URL = import.meta.env.VITE_API_URL;

  const locationTypes = [
    { id: 'divisions', label: 'Divisions', icon: FaGlobe, color: '#3b82f6' },
    { id: 'districts', label: 'Districts', icon: FaBuilding, color: '#10b981' },
    { id: 'upazilas', label: 'Upazilas', icon: FaMapMarkerAlt, color: '#8b5cf6' },
    { id: 'zones', label: 'Zones', icon: FaLocationArrow, color: '#f59e0b' },
    { id: 'areas', label: 'Areas', icon: FaLocationArrow, color: '#ef4444' }
  ];

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    setLoading(true);
    try {
      console.log('Loading all locations...');
      const response = await axios.get(`${BASE_URL}/backend/api/admin/locations.php`, {
        withCredentials: true
      });
      
      console.log('All locations response:', response.data);
      
      if (response.data.success) {
        setLocations(response.data.data);
        console.log('Locations set:', response.data.data);
        console.log('Divisions count:', response.data.data.divisions?.length || 0);
        console.log('Districts count:', response.data.data.districts?.length || 0);
        console.log('Upazilas count:', response.data.data.upazilas?.length || 0);
        console.log('Zones count:', response.data.data.zones?.length || 0);
        console.log('Areas count:', response.data.data.areas?.length || 0);
      } else {
        console.error('API returned error:', response.data.message);
        toast.error('Failed to load locations');
      }
    } catch (error) {
      console.error('Failed to load locations:', error);
      toast.error('Failed to load locations');
    } finally {
      setLoading(false);
    }
  };

  const loadSpecificLocations = async (type, parentId = null) => {
    try {
      let url = `${BASE_URL}/backend/api/admin/locations.php?type=${type}`;
      if (parentId) {
        const parentKey = type === 'districts' ? 'division_id' : 
                         type === 'upazilas' ? 'district_id' :
                         type === 'zones' ? 'upazila_id' : 'zone_id';
        url += `&${parentKey}=${parentId}`;
      }
      
      console.log(`Loading specific locations for type: ${type}, URL: ${url}`);
      const response = await axios.get(url, { withCredentials: true });
      
      console.log(`Response for ${type}:`, response.data);
      
      if (response.data.success) {
        console.log(`Setting ${type} data:`, response.data.data);
        setLocations(prev => ({
          ...prev,
          [type]: response.data.data
        }));
      } else {
        console.error(`API error for ${type}:`, response.data.message);
        toast.error(`Failed to load ${type}: ${response.data.message}`);
      }
    } catch (error) {
      console.error(`Failed to load ${type}:`, error);
      toast.error(`Failed to load ${type}`);
    }
  };

  const handleCreate = () => {
    setModalMode('create');
    setEditingItem(null);
    setFormData({
      name: '',
      division_id: '',
      district_id: '',
      upazila_id: '',
      zone_id: ''
    });
    nameValidation.reset();
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setModalMode('edit');
    setEditingItem(item);
    setFormData({
      name: item.name,
      division_id: item.division_id || '',
      district_id: item.district_id || '',
      upazila_id: item.upazila_id || '',
      zone_id: item.zone_id || ''
    });
    nameValidation.reset();
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete this ${activeTab.slice(0, -1)}?`)) {
      return;
    }

    try {
      const response = await axios.delete(
        `${BASE_URL}/backend/api/admin/locations.php?type=${activeTab}`,
        {
          data: { id },
          withCredentials: true
        }
      );

      if (response.data.success) {
        const locationTypeSingular = activeTab.slice(0, -1);
        showFormSuccessToast(locationTypeSingular, 'delete');
        loadSpecificLocations(activeTab);
      } else {
        showErrorToast(response.data.message || 'Failed to delete item');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      showErrorToast('Failed to delete item. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation checks
    if (!formData.name.trim()) {
      showErrorToast('Name is required');
      return;
    }

    // Check if name validation failed
    if (nameValidation.exists && modalMode === 'create') {
      showErrorToast('This name is already in use. Please choose a different name.');
      return;
    }

    // Check if validation is still in progress
    if (nameValidation.isChecking) {
      showErrorToast('Please wait for validation to complete.');
      return;
    }

    try {
      const url = `${BASE_URL}/backend/api/admin/locations.php?type=${activeTab}`;
      const method = modalMode === 'create' ? 'POST' : 'PUT';
      
      const data = { ...formData };
      if (modalMode === 'edit') {
        data.id = editingItem.id;
      }

      const response = await axios({
        method,
        url,
        data,
        withCredentials: true
      });

      if (response.data.success) {
        // Show success message based on action
        const action = modalMode === 'create' ? 'create' : 'update';
        const locationTypeSingular = activeTab.slice(0, -1);
        showFormSuccessToast(locationTypeSingular, action);
        
        // Reset form and close modal
        setShowModal(false);
        setFormData({
          name: '',
          division_id: '',
          district_id: '',
          upazila_id: '',
          zone_id: ''
        });
        nameValidation.reset();
        
        // Reload data
        loadSpecificLocations(activeTab);
      } else {
        showErrorToast(response.data.message || 'Failed to save item');
      }
    } catch (error) {
      console.error('Submit failed:', error);
      showErrorToast('Failed to save item. Please try again.');
    }
  };

  const getFilteredItems = () => {
    const items = locations[activeTab] || [];
    console.log(`Getting filtered items for ${activeTab}:`, items);
    console.log(`Items length: ${items.length}`);
    if (!searchTerm) return items;
    
    return items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.division_name && item.division_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.district_name && item.district_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.upazila_name && item.upazila_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.zone_name && item.zone_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const getParentOptions = () => {
    switch (activeTab) {
      case 'districts':
        return locations.divisions.map(div => ({ id: div.id, name: div.name }));
      case 'upazilas':
        return locations.districts.map(dist => ({ id: dist.id, name: dist.name }));
      case 'zones':
        return locations.upazilas.map(upazila => ({ id: upazila.id, name: upazila.name }));
      case 'areas':
        return locations.zones.map(zone => ({ id: zone.id, name: zone.name }));
      default:
        return [];
    }
  };

  const getParentFieldName = () => {
    switch (activeTab) {
      case 'districts': return 'division_id';
      case 'upazilas': return 'district_id';
      case 'zones': return 'upazila_id';
      case 'areas': return 'zone_id';
      default: return '';
    }
  };

  const getParentLabel = () => {
    switch (activeTab) {
      case 'districts': return 'Division';
      case 'upazilas': return 'District';
      case 'zones': return 'Upazila';
      case 'areas': return 'Zone';
      default: return '';
    }
  };

  const renderLocationCard = (item) => {
    const currentType = locationTypes.find(type => type.id === activeTab);
    const IconComponent = currentType?.icon || FaBuilding;

    return (
      <div key={item.id} className="location-card">
        <div className="location-header">
          <div className="location-icon" style={{ backgroundColor: currentType?.color }}>
            <IconComponent />
          </div>
          <div className="location-info">
            <h4>{item.name}</h4>
            {item.division_name && <span className="parent-info">Division: {item.division_name}</span>}
            {item.district_name && <span className="parent-info">District: {item.district_name}</span>}
            {item.upazila_name && <span className="parent-info">Upazila: {item.upazila_name}</span>}
            {item.zone_name && <span className="parent-info">Zone: {item.zone_name}</span>}
          </div>
        </div>
        <div className="location-actions">
          <button
            className="btn btn-sm btn-warning"
            onClick={() => handleEdit(item)}
          >
            <FaEdit /> Edit
          </button>
          <button
            className="btn btn-sm btn-danger"
            onClick={() => handleDelete(item.id)}
          >
            <FaTrash /> Delete
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading locations...</p>
      </div>
    );
  }

  return (
    <div className="location-content">
      <div className="content-header">
        <h2>Location Management</h2>
        <button className="btn btn-primary" onClick={handleCreate}>
          <FaPlus /> Add {activeTab.slice(0, -1)}
        </button>
      </div>

      {/* Location Type Tabs */}
      <div className="location-tabs">
        {locationTypes.map(type => {
          const IconComponent = type.icon;
          const count = locations[type.id]?.length || 0;
          
          return (
            <button
              key={type.id}
              className={`location-tab ${activeTab === type.id ? 'active' : ''}`}
              onClick={() => {
                console.log(`Switching to tab: ${type.id}`);
                setActiveTab(type.id);
                // Only reload if the data is empty
                if (!locations[type.id] || locations[type.id].length === 0) {
                  console.log(`Loading data for ${type.id} because it's empty`);
                  loadSpecificLocations(type.id);
                } else {
                  console.log(`Using existing data for ${type.id}:`, locations[type.id]);
                }
              }}
              style={{ '--tab-color': type.color }}
            >
              <IconComponent />
              <span>{type.label}</span>
              <span className="count">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="search-section">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="clear-search"
              onClick={() => setSearchTerm('')}
            >
              <FaTimes />
            </button>
          )}
        </div>
      </div>

      {/* Locations Grid */}
      <div className="locations-grid">
        {getFilteredItems().length > 0 ? (
          getFilteredItems().map(renderLocationCard)
        ) : (
          <div className="no-data">
            <FaBuilding size={48} color="#e5e7eb" />
            <h3>No {activeTab} found</h3>
            <p>
              {searchTerm
                ? 'Try adjusting your search criteria'
                : `No ${activeTab} available. Create your first ${activeTab.slice(0, -1)}.`}
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {modalMode === 'create' ? 'Create' : 'Edit'} {activeTab.slice(0, -1)}
              </h3>
              <button
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, name: value });
                    nameValidation.validate(value);
                  }}
                  placeholder={`Enter ${activeTab.slice(0, -1)} name`}
                  className={nameValidation.isValid === false ? 'is-invalid' : nameValidation.isValid === true ? 'is-valid' : ''}
                  required
                />
                <ValidationMessage 
                  isChecking={nameValidation.isChecking}
                  isValid={nameValidation.isValid}
                  message={nameValidation.message}
                />
              </div>

              {getParentFieldName() && (
                <div className="form-group">
                  <label>{getParentLabel()} *</label>
                  <select
                    value={formData[getParentFieldName()]}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      [getParentFieldName()]: e.target.value 
                    })}
                    required
                  >
                    <option value="">Select {getParentLabel()}</option>
                    {getParentOptions().map(option => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {modalMode === 'create' ? 'Create' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .location-content {
          padding: 1rem;
        }

        .content-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .content-header h2 {
          margin: 0;
          color: #1f2937;
        }

        .location-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid #e5e7eb;
          overflow-x: auto;
        }

        .location-tab {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 1.5rem;
          border: none;
          background: none;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all 0.3s ease;
          white-space: nowrap;
          color: #6b7280;
        }

        .location-tab:hover {
          background: #f9fafb;
          color: var(--tab-color);
        }

        .location-tab.active {
          color: var(--tab-color);
          border-bottom-color: var(--tab-color);
          background: #f9fafb;
        }

        .location-tab .count {
          background: #e5e7eb;
          color: #6b7280;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.75rem;
        }

        .location-tab.active .count {
          background: var(--tab-color);
          color: white;
        }

        .search-section {
          margin-bottom: 2rem;
        }

        .search-box {
          display: flex;
          align-items: center;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 0.75rem 1rem;
          gap: 0.5rem;
          max-width: 400px;
        }

        .search-box input {
          border: none;
          outline: none;
          flex: 1;
          font-size: 0.9rem;
        }

        .clear-search {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 0.25rem;
        }

        .locations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .location-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .location-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }

        .location-header {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .location-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.25rem;
        }

        .location-info {
          flex: 1;
        }

        .location-info h4 {
          margin: 0 0 0.5rem 0;
          color: #1f2937;
          font-size: 1.1rem;
        }

        .parent-info {
          display: block;
          color: #6b7280;
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
        }

        .location-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        }

        .btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
        }

        .btn-primary {
          background: #3b82f6;
          color: white;
        }

        .btn-primary:hover {
          background: #2563eb;
        }

        .btn-warning {
          background: #f59e0b;
          color: white;
        }

        .btn-warning:hover {
          background: #d97706;
        }

        .btn-danger {
          background: #ef4444;
          color: white;
        }

        .btn-danger:hover {
          background: #dc2626;
        }

        .btn-secondary {
          background: #6b7280;
          color: white;
        }

        .btn-secondary:hover {
          background: #4b5563;
        }

        .btn-sm {
          padding: 0.375rem 0.75rem;
          font-size: 0.75rem;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .modal-header h3 {
          margin: 0;
          color: #1f2937;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.25rem;
          color: #6b7280;
          cursor: pointer;
          padding: 0.25rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: #374151;
          font-weight: 500;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.9rem;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
        }

        .no-data {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          text-align: center;
          gap: 1rem;
        }

        .no-data h3 {
          margin: 0;
          color: #6b7280;
        }

        .no-data p {
          margin: 0;
          color: #9ca3af;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          gap: 1rem;
        }

        /* Validation styles */
        .form-group input.is-valid,
        .form-group select.is-valid {
          border-color: #10b981;
          background-color: #f0fdf4;
        }

        .form-group input.is-invalid,
        .form-group select.is-invalid {
          border-color: #ef4444;
          background-color: #fef2f2;
        }

        .form-group input.is-valid:focus,
        .form-group select.is-valid:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        .form-group input.is-invalid:focus,
        .form-group select.is-invalid:focus {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }

        @media (max-width: 768px) {
          .content-header {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }

          .location-tabs {
            gap: 0.25rem;
          }

          .location-tab {
            padding: 0.75rem 1rem;
          }

          .locations-grid {
            grid-template-columns: 1fr;
          }

          .modal-content {
            margin: 1rem;
            width: calc(100% - 2rem);
          }
        }
      `}</style>
    </div>
  );
};

export default LocationContent;
