import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Table, Modal, Form, Badge, Tab, Tabs, Alert } from 'react-bootstrap';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { toast } from 'react-toastify';

const ServicesContent = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeTab, setActiveTab] = useState('services');
  
  const [serviceForm, setServiceForm] = useState({
    id: '',
    category_id: '',
    name: '',
    description: '',
    image: null,
    imageFile: null,
    imagePreview: null,
    base_price: '',
    unit: 'hour',
    status: 'active'
  });

  const [categoryForm, setCategoryForm] = useState({
    id: '',
    name: '',
    description: '',
    icon: '',
    status: 'active'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [servicesRes, categoriesRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/backend/api/services.php?action=services`, { withCredentials: true }),
        axios.get(`${import.meta.env.VITE_API_URL}/backend/api/services.php?action=categories`, { withCredentials: true })
      ]);

      if (servicesRes.data.success) {
        setServices(servicesRes.data.data);
      }
      if (categoriesRes.data.success) {
        setCategories(categoriesRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append('id', serviceForm.id);
      formData.append('category_id', serviceForm.category_id);
      formData.append('name', serviceForm.name);
      formData.append('description', serviceForm.description);
      formData.append('base_price', serviceForm.base_price);
      formData.append('unit', serviceForm.unit);
      formData.append('status', serviceForm.status);
      
      if (serviceForm.imageFile) {
        formData.append('image', serviceForm.imageFile);
      }

      const url = serviceForm.id 
        ? `${import.meta.env.VITE_API_URL}/backend/api/services.php?action=service&id=${serviceForm.id}`
        : `${import.meta.env.VITE_API_URL}/backend/api/services.php?action=service`;

      const response = await axios({
        method: serviceForm.id ? 'PUT' : 'POST',
        url,
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setShowServiceModal(false);
        resetServiceForm();
        fetchData();
      } else {
        toast.error(response.data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error(error.response?.data?.error || 'Failed to save service');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setServiceForm({
        ...serviceForm,
        imageFile: file,
        imagePreview: URL.createObjectURL(file)
      });
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = categoryForm.id 
        ? `${import.meta.env.VITE_API_URL}/backend/api/services.php?action=category&id=${categoryForm.id}`
        : `${import.meta.env.VITE_API_URL}/backend/api/services.php?action=category`;
      
      const method = categoryForm.id ? 'PUT' : 'POST';
      
      const response = await axios({
        method,
        url,
        data: categoryForm,
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setShowCategoryModal(false);
        resetCategoryForm();
        fetchData();
      } else {
        toast.error(response.data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(error.response?.data?.error || 'Failed to save category');
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/backend/api/services.php?action=service&id=${serviceId}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Service deleted successfully');
        fetchData();
      } else {
        toast.error(response.data.message || 'Failed to delete service');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error(error.response?.data?.error || 'Failed to delete service');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category? This will also delete all associated services.')) return;
    
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/backend/api/services.php?action=category&id=${categoryId}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Category deleted successfully');
        fetchData();
      } else {
        toast.error(response.data.message || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(error.response?.data?.error || 'Failed to delete category');
    }
  };

  const openServiceModal = (service = null) => {
    if (service) {
      setServiceForm({
        id: service.id,
        category_id: service.category_id,
        name: service.name,
        description: service.description || '',
        image: service.image || null,
        imageFile: null,
        imagePreview: service.image ? `${import.meta.env.VITE_API_URL}/${service.image}` : null,
        base_price: service.base_price,
        unit: service.unit,
        status: service.status
      });
      setSelectedService(service);
    } else {
      resetServiceForm();
    }
    setShowServiceModal(true);
  };

  const openCategoryModal = (category = null) => {
    if (category) {
      setCategoryForm({
        id: category.id,
        name: category.name,
        description: category.description || '',
        icon: category.icon || '',
        status: category.status
      });
      setSelectedCategory(category);
    } else {
      resetCategoryForm();
    }
    setShowCategoryModal(true);
  };

  const resetServiceForm = () => {
    setServiceForm({
      id: '',
      category_id: '',
      name: '',
      description: '',
      image: null,
      imageFile: null,
      imagePreview: null,
      base_price: '',
      unit: 'hour',
      status: 'active'
    });
    setSelectedService(null);
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      id: '',
      name: '',
      description: '',
      icon: '',
      status: 'active'
    });
    setSelectedCategory(null);
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="services-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Services Management</h2>
      </div>

      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
        <Tab eventKey="services" title="Services">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">All Services</h5>
              <Button variant="primary" onClick={() => openServiceModal()}>
                <PlusIcon className="me-2" style={{ width: '16px', height: '16px' }} />
                Add Service
              </Button>
            </Card.Header>
            <Card.Body>
              {services.length === 0 ? (
                <Alert variant="info">No services found. Create your first service to get started.</Alert>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Unit</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((service) => (
                      <tr key={service.id}>
                        <td>
                          {service.image && (
                            <img 
                              src={`${import.meta.env.VITE_API_URL}/${service.image}`} 
                              alt={service.name}
                              style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                              className="rounded"
                            />
                          )}
                        </td>
                        <td>
                          <strong>{service.name}</strong>
                          {service.description && (
                            <div className="text-muted small">
                              {service.description.length > 50 
                                ? `${service.description.substring(0, 50)}...` 
                                : service.description}
                            </div>
                          )}
                        </td>
                        <td>{getCategoryName(service.category_id)}</td>
                        <td>${service.base_price}</td>
                        <td>{service.unit}</td>
                        <td>
                          <Badge bg={service.status === 'active' ? 'success' : 'secondary'}>
                            {service.status}
                          </Badge>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => openServiceModal(service)}
                            >
                              <PencilIcon style={{ width: '14px', height: '14px' }} />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteService(service.id)}
                            >
                              <TrashIcon style={{ width: '14px', height: '14px' }} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="categories" title="Categories">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Service Categories</h5>
              <Button variant="primary" onClick={() => openCategoryModal()}>
                <PlusIcon className="me-2" style={{ width: '16px', height: '16px' }} />
                Add Category
              </Button>
            </Card.Header>
            <Card.Body>
              {categories.length === 0 ? (
                <Alert variant="info">No categories found. Create your first category to get started.</Alert>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Icon</th>
                      <th>Status</th>
                      <th>Services Count</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <tr key={category.id}>
                        <td><strong>{category.name}</strong></td>
                        <td>
                          {category.description ? (
                            category.description.length > 50 
                              ? `${category.description.substring(0, 50)}...` 
                              : category.description
                          ) : '-'}
                        </td>
                        <td>
                          {category.icon ? (
                            <i className={category.icon}></i>
                          ) : '-'}
                        </td>
                        <td>
                          <Badge bg={category.status === 'active' ? 'success' : 'secondary'}>
                            {category.status}
                          </Badge>
                        </td>
                        <td>
                          {services.filter(s => s.category_id === category.id).length}
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => openCategoryModal(category)}
                            >
                              <PencilIcon style={{ width: '14px', height: '14px' }} />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteCategory(category.id)}
                            >
                              <TrashIcon style={{ width: '14px', height: '14px' }} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* Service Modal */}
      <Modal show={showServiceModal} onHide={() => setShowServiceModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedService ? 'Edit Service' : 'Add New Service'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleServiceSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Service Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={serviceForm.name}
                    onChange={(e) => setServiceForm({...serviceForm, name: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category *</Form.Label>
                  <Form.Select
                    value={serviceForm.category_id}
                    onChange={(e) => setServiceForm({...serviceForm, category_id: e.target.value})}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={serviceForm.description}
                onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Service Image</Form.Label>
              <Form.Control 
                type="file" 
                accept="image/*"
                onChange={handleImageChange}
              />
              {serviceForm.imagePreview && (
                <div className="mt-2">
                  <img 
                    src={serviceForm.imagePreview} 
                    alt="Preview" 
                    style={{ maxWidth: '200px', maxHeight: '200px' }}
                    className="img-thumbnail"
                  />
                </div>
              )}
              {selectedService?.image && !serviceForm.imagePreview && (
                <div className="mt-2">
                  <img 
                    src={`${import.meta.env.VITE_API_URL}/${selectedService.image}`} 
                    alt="Current" 
                    style={{ maxWidth: '200px', maxHeight: '200px' }}
                    className="img-thumbnail"
                  />
                </div>
              )}
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Base Price *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    value={serviceForm.base_price}
                    onChange={(e) => setServiceForm({...serviceForm, base_price: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Unit</Form.Label>
                  <Form.Select
                    value={serviceForm.unit}
                    onChange={(e) => setServiceForm({...serviceForm, unit: e.target.value})}
                  >
                    <option value="hour">Hour</option>
                    <option value="job">Job</option>
                    <option value="visit">Visit</option>
                    <option value="day">Day</option>
                    <option value="project">Project</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={serviceForm.status}
                onChange={(e) => setServiceForm({...serviceForm, status: e.target.value})}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowServiceModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {selectedService ? 'Update Service' : 'Create Service'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Category Modal */}
      <Modal show={showCategoryModal} onHide={() => setShowCategoryModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedCategory ? 'Edit Category' : 'Add New Category'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCategorySubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Category Name *</Form.Label>
              <Form.Control
                type="text"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Icon Class</Form.Label>
              <Form.Control
                type="text"
                value={categoryForm.icon}
                onChange={(e) => setCategoryForm({...categoryForm, icon: e.target.value})}
                placeholder="e.g., fas fa-wrench"
              />
              <Form.Text className="text-muted">
                Use FontAwesome or Bootstrap icon classes
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={categoryForm.status}
                onChange={(e) => setCategoryForm({...categoryForm, status: e.target.value})}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCategoryModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {selectedCategory ? 'Update Category' : 'Create Category'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default ServicesContent;