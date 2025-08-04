import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  ProgressBar,
  Alert,
  Spinner,
} from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  FiUpload,
  FiUser,
  FiMail,
  FiPhone,
  FiHome,
  FiUsers,
} from "react-icons/fi";

const WorkerRegistrationModal = ({ show, handleClose }) => {
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const BASE_URL = import.meta.env.VITE_API_URL;

  // Validation schemas per step
  const stepSchemas = [
    Yup.object().shape({
      first_name: Yup.string().required("First name is required"),
      last_name: Yup.string().required("Last name is required"),
      username: Yup.string().required("Username is required"),
      category_id: Yup.string()
        .required("Category is required")
        .matches(/^\d+$/, "Invalid category"),
    }),
    Yup.object().shape({
      phone: Yup.string().required("Phone is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      address: Yup.string().required("Address is required"),
      zone_id: Yup.string()
        .required("Zone is required")
        .matches(/^\d+$/, "Invalid zone"),
      area_id: Yup.string()
        .required("Area is required")
        .matches(/^\d+$/, "Invalid area"),
    }),
    Yup.object().shape({
      emergency_name: Yup.string(),
      emergency_phone: Yup.string(),
      emergency_relation: Yup.string(),
      skills: Yup.string().required("Skills are required"),
    }),
    Yup.object().shape({
      certificate: Yup.mixed(),
    }),
  ];

  const formik = useFormik({
    initialValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      username: "",
      category_id: "",
      zone_id: "",
      area_id: "",
      address: "",
      skills: "",
      emergency_name: "",
      emergency_phone: "",
      emergency_relation: "",
      certificate: null,
      experience: null,
    },
    validationSchema: stepSchemas[step - 1],
    onSubmit: async (values) => {
      if (step < 4) {
        setStep(step + 1);
        return;
      }

      setIsSubmitting(true);
      setSubmitError(null);

      try {
        const data = new FormData();

        // Append all fields except files
        data.append("first_name", values.first_name);
        data.append("last_name", values.last_name);
        data.append("email", values.email);
        data.append("phone", values.phone);
        data.append("username", values.username);
        data.append("category_id", values.category_id);
        data.append("zone_id", values.zone_id);
        data.append("area_id", values.area_id);
        data.append("address", values.address);
        data.append("skills", values.skills);
        data.append("emergency_name", values.emergency_name);
        data.append("emergency_phone", values.emergency_phone);
        data.append("emergency_relation", values.emergency_relation);

        // Append files if any
        if (values.certificate) {
          data.append("certificate", values.certificate);
        }

        const res = await fetch(
          `${BASE_URL}/backend/api/workers/register.php`,
          {
            method: "POST",
            credentials: "include",
            body: data,
          }
        );

        const result = await res.json();

        if (result.success) {
          handleClose();
          formik.resetForm();
          setStep(1);
        } else {
          setSubmitError(result.message || "Registration failed");
        }
      } catch (err) {
        console.error(err);
        setSubmitError("Something went wrong");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Fetch categories for dropdown
  useEffect(() => {
    if (show) {
      const fetchCategories = async () => {
        try {
          const res = await fetch(
            `${BASE_URL}/backend/api/categories/fetch_category.php`,
            {
              credentials: "include",
            }
          );
          const result = await res.json();
          if (result.success) {
            setCategories(result.categories);
          } else {
            throw new Error(result.message || "Failed to fetch categories");
          }
        } catch (err) {
          console.error("Category load failed:", err.message);
        }
      };
      fetchCategories();
    }
  }, [show]);

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleFileChange = (e) => {
    const { name } = e.target;
    const file = e.target.files[0];
    formik.setFieldValue(name, file);
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="lg"
      backdrop="static"
      centered
    >
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">Register New Worker</Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-1">
        <div className="mb-4">
          <ProgressBar
            now={(step / 4) * 100}
            className="mb-2"
            style={{ height: "6px" }}
          />
          <div className="d-flex justify-content-between text-muted small">
            <span className={step >= 1 ? "fw-bold text-primary" : ""}>
              Personal Info
            </span>
            <span className={step >= 2 ? "fw-bold text-primary" : ""}>
              Contact
            </span>
            <span className={step >= 3 ? "fw-bold text-primary" : ""}>
              Emergency
            </span>
            <span className={step >= 4 ? "fw-bold text-primary" : ""}>
              Documents
            </span>
          </div>
        </div>

        {submitError && (
          <Alert variant="danger" className="mb-4">
            {submitError}
          </Alert>
        )}

        <Form onSubmit={formik.handleSubmit}>
          {step === 1 && (
            <div className="row g-3">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="d-flex align-items-center">
                    <FiUser className="me-2" /> First Name
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="first_name"
                    placeholder="John"
                    value={formik.values.first_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    isInvalid={
                      formik.touched.first_name && formik.errors.first_name
                    }
                  />
                  <Form.Control.Feedback type="invalid">
                    {formik.errors.first_name}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="d-flex align-items-center">
                    <FiUser className="me-2" /> Last Name
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="last_name"
                    placeholder="Doe"
                    value={formik.values.last_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    isInvalid={
                      formik.touched.last_name && formik.errors.last_name
                    }
                  />
                  <Form.Control.Feedback type="invalid">
                    {formik.errors.last_name}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="d-flex align-items-center">
                    <FiUser className="me-2" /> Username
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    placeholder="johndoe"
                    value={formik.values.username}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    isInvalid={
                      formik.touched.username && formik.errors.username
                    }
                  />
                  <Form.Control.Feedback type="invalid">
                    {formik.errors.username}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="d-flex align-items-center">
                    <FiUsers className="me-2" /> Category
                  </Form.Label>
                  <Form.Select
                    name="category_id"
                    value={formik.values.category_id}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    isInvalid={
                      formik.touched.category_id && formik.errors.category_id
                    }
                  >
                    {!Array.isArray(categories) || categories.length === 0 ? (
                        <option disabled>Loading categories...</option>
                      ) : (
                        categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))
                      )}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {formik.errors.category_id}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="row g-3">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="d-flex align-items-center">
                    <FiPhone className="me-2" /> Phone
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="phone"
                    placeholder="+1 (555) 123-4567"
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    isInvalid={formik.touched.phone && formik.errors.phone}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formik.errors.phone}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="d-flex align-items-center">
                    <FiMail className="me-2" /> Email
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="john.doe@example.com"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    isInvalid={formik.touched.email && formik.errors.email}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formik.errors.email}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Zone ID</Form.Label>
                  <Form.Control
                    type="text"
                    name="zone_id"
                    placeholder="Zone ID"
                    value={formik.values.zone_id}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    isInvalid={formik.touched.zone_id && formik.errors.zone_id}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formik.errors.zone_id}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Area ID</Form.Label>
                  <Form.Control
                    type="text"
                    name="area_id"
                    placeholder="Area ID"
                    value={formik.values.area_id}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    isInvalid={formik.touched.area_id && formik.errors.area_id}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formik.errors.area_id}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>

              <div className="col-12">
                <Form.Group>
                  <Form.Label className="d-flex align-items-center">
                    <FiHome className="me-2" /> Address
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="address"
                    placeholder="123 Main St, City, Country"
                    value={formik.values.address}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    isInvalid={formik.touched.address && formik.errors.address}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formik.errors.address}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="row g-3">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Skills</Form.Label>
                  <Form.Control
                    type="text"
                    name="skills"
                    placeholder="e.g. Farmer, Carpenter"
                    value={formik.values.skills}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    isInvalid={formik.touched.skills && formik.errors.skills}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formik.errors.skills}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Emergency Contact Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="emergency_name"
                    placeholder="Jane Smith"
                    value={formik.values.emergency_name}
                    onChange={formik.handleChange}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Emergency Contact Phone</Form.Label>
                  <Form.Control
                    type="text"
                    name="emergency_phone"
                    placeholder="+1 (555) 987-6543"
                    value={formik.values.emergency_phone}
                    onChange={formik.handleChange}
                  />
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Group>
                  <Form.Label>Relationship</Form.Label>
                  <Form.Control
                    type="text"
                    name="emergency_relation"
                    placeholder="Spouse"
                    value={formik.values.emergency_relation}
                    onChange={formik.handleChange}
                  />
                </Form.Group>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="row g-3">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="d-flex align-items-center">
                    <FiUpload className="me-2" /> Documents (PDF/JPG/PNG)
                  </Form.Label>
                  <Form.Control
                    type="file"
                    name="certificate"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  {formik.values.certificate && (
                    <div className="mt-2 small text-muted">
                      Selected: {formik.values.certificate.name}
                    </div>
                  )}
                </Form.Group>
              </div>
            </div>
          )}

          <div className="d-flex justify-content-between mt-4">
            <Button
              variant="outline-secondary"
              onClick={step === 1 ? handleClose : handleBack}
              disabled={isSubmitting}
            >
              {step === 1 ? "Cancel" : "Back"}
            </Button>

            <Button
              variant={step === 4 ? "primary" : "outline-primary"}
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <Spinner animation="border" size="sm" className="me-2" />
              )}
              {step === 4 ? "Complete Registration" : "Next"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default WorkerRegistrationModal;
