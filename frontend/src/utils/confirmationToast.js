import { toast } from 'react-toastify';

export const showSuccessToast = (message, options = {}) => {
  toast.success(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    ...options
  });
};

export const showErrorToast = (message, options = {}) => {
  toast.error(message, {
    position: "top-right",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    ...options
  });
};

export const showInfoToast = (message, options = {}) => {
  toast.info(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    ...options
  });
};

export const showWarningToast = (message, options = {}) => {
  toast.warning(message, {
    position: "top-right",
    autoClose: 3500,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    ...options
  });
};

// Form-specific success messages
export const formSuccessMessages = {
  // Authentication
  login: 'Successfully logged in! Welcome back.',
  logout: 'Successfully logged out. See you soon!',
  register: 'Registration successful! Welcome to our platform.',
  
  // User Management
  userCreate: 'User created successfully!',
  userUpdate: 'User updated successfully!',
  userDelete: 'User deleted successfully!',
  
  // Location Management
  divisionCreate: 'Division created successfully!',
  divisionUpdate: 'Division updated successfully!',
  divisionDelete: 'Division deleted successfully!',
  districtCreate: 'District created successfully!',
  districtUpdate: 'District updated successfully!',
  districtDelete: 'District deleted successfully!',
  upazilaCreate: 'Upazila created successfully!',
  upazilaUpdate: 'Upazila updated successfully!',
  upazilaDelete: 'Upazila deleted successfully!',
  zoneCreate: 'Zone created successfully!',
  zoneUpdate: 'Zone updated successfully!',
  zoneDelete: 'Zone deleted successfully!',
  areaCreate: 'Area created successfully!',
  areaUpdate: 'Area updated successfully!',
  areaDelete: 'Area deleted successfully!',
  
  // Service Management
  categoryCreate: 'Category created successfully!',
  categoryUpdate: 'Category updated successfully!',
  categoryDelete: 'Category deleted successfully!',
  serviceCreate: 'Service created successfully!',
  serviceUpdate: 'Service updated successfully!',
  serviceDelete: 'Service deleted successfully!',
  
  // Worker Management
  workerCreate: 'Worker profile created successfully!',
  workerUpdate: 'Worker profile updated successfully!',
  workerApprove: 'Worker approved successfully!',
  workerReject: 'Worker rejected successfully!',
  
  // Agent Management
  agentCreate: 'Agent profile created successfully!',
  agentUpdate: 'Agent profile updated successfully!',
  agentApprove: 'Agent approved successfully!',
  
  // Service Requests
  serviceRequestCreate: 'Service request submitted successfully!',
  serviceRequestUpdate: 'Service request updated successfully!',
  serviceRequestCancel: 'Service request cancelled successfully!',
  serviceRequestComplete: 'Service request completed successfully!',
  
  // Settings
  settingsUpdate: 'Settings updated successfully!',
  profileUpdate: 'Profile updated successfully!',
  passwordChange: 'Password changed successfully!',
  
  // Generic
  create: 'Created successfully!',
  update: 'Updated successfully!',
  delete: 'Deleted successfully!',
  save: 'Saved successfully!'
};

export const showFormSuccessToast = (formType, action = 'create') => {
  const key = `${formType}${action.charAt(0).toUpperCase() + action.slice(1)}`;
  const message = formSuccessMessages[key] || formSuccessMessages[action] || 'Operation completed successfully!';
  showSuccessToast(message);
};
