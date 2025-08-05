import React, { useState } from "react";
import { Form, Button, Card, Alert, Spinner, Modal } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { FiLogIn, FiUser, FiLock, FiAlertCircle, FiX } from "react-icons/fi";
import * as Yup from "yup";
import { useFormik } from "formik";

const LoginFetchModal = ({ show, onHide }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const BASE_URL = import.meta.env.VITE_API_URL;

  // Validation schema
  const validationSchema = Yup.object().shape({
    username: Yup.string().required("Username is required"),
    password: Yup.string().required("Password is required"),
  });

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(`${BASE_URL}/backend/api/auth/login.php`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            username: values.username,
            password: values.password,
          }),
        });

        const data = await response.json();

        if (data.success) {
          login({ username: values.username, role: data.role });
          onHide(); // Close modal
          toast.success(`Welcome back, ${values.username.toUpperCase()}!`);

          if (["admin", "agent", "worker"].includes(data.role)) {
            navigate(
              data.role === "admin"
                ? "/AdminDashboard"
                : data.role === "agent"
                ? "/AgentDashboard"
                : "/WorkerDashboard"
            );
          } else {
            //Regular users stay on the same page
            navigate(location.pathname); 
          }
        } else {
          setError(data.message || "Invalid credentials");
        }
      } catch (err) {
        console.error(err);
        setError("Something went wrong. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  });

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Body className="p-0">
        <Card className="shadow-lg border-0 rounded-4 overflow-hidden" style={{ width: "100%", maxWidth: "400px", margin: "auto" }}>
          {/* Modern Header */}
          <div className="bg-primary text-white p-4 position-relative">
            <button 
              onClick={onHide}
              className="btn btn-sm btn-link text-white position-absolute end-0 top-0 mt-2 me-2"
            >
              <FiX size={20} />
            </button>
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-circle d-inline-flex p-3 mb-3">
                <FiLogIn size={24} className="text-white" />
              </div>
              <h3 className="fw-bold mb-1">Welcome Back</h3>
              <p className="text-white text-opacity-80 mb-0">Sign in to continue</p>
            </div>
          </div>
          
          <Card.Body className="p-4">
            {error && (
              <Alert variant="danger" className="d-flex align-items-center rounded-3">
                <FiAlertCircle className="me-2" size={18} />
                {error}
              </Alert>
            )}

            <Form onSubmit={formik.handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="text-muted small fw-bold">USERNAME</Form.Label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <FiUser className="text-muted" />
                  </span>
                  <Form.Control
                    type="text"
                    name="username"
                    placeholder="Enter your username"
                    value={formik.values.username}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    isInvalid={formik.touched.username && formik.errors.username}
                    className="border-start-0"
                  />
                </div>
                {formik.touched.username && formik.errors.username && (
                  <Form.Control.Feedback type="invalid" className="d-flex align-items-center">
                    <FiAlertCircle className="me-1" size={14} />
                    {formik.errors.username}
                  </Form.Control.Feedback>
                )}
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="text-muted small fw-bold">PASSWORD</Form.Label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <FiLock className="text-muted" />
                  </span>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    isInvalid={formik.touched.password && formik.errors.password}
                    className="border-start-0"
                  />
                </div>
                {formik.touched.password && formik.errors.password && (
                  <Form.Control.Feedback type="invalid" className="d-flex align-items-center">
                    <FiAlertCircle className="me-1" size={14} />
                    {formik.errors.password}
                  </Form.Control.Feedback>
                )}
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                className="w-100 py-2 fw-bold rounded-3"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <FiLogIn className="me-2" />
                    Sign In
                  </>
                )}
              </Button>
            </Form>

            <div className="text-center mt-4 pt-3 border-top">
              <p className="text-muted small mb-0">
                Forgot your password?{" "}
                <a href="/forgot-password" className="text-decoration-none text-primary">
                  Reset it here
                </a>
              </p>
            </div>
          </Card.Body>
        </Card>
      </Modal.Body>
    </Modal>
  );
};

export default LoginFetchModal;