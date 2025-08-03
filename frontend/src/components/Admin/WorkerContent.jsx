import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import {
  Button,
  Card,
  Form,
  InputGroup,
  Table,
  Modal,
  Spinner,
  Pagination,
} from "react-bootstrap";
import { PersonPlusFill } from "react-bootstrap-icons";

const BASE_URL = import.meta.env.VITE_API_URL;

const WorkerContent = ({ setShowWorkerModal }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categoryWorkerCount, setCategoryWorkerCount] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchWorkers();
  }, []);

  const fetchCategories = () => {
    axios.get(`${BASE_URL}backend/api/categories/fetch_category.php`, {
      withCredentials: true,
    })
    .then((res) => {
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    });
  };

  const fetchWorkers = () => {
    setLoading(true);
    axios.get(`${BASE_URL}backend/api/workers/fetch_workers.php`, {
      withCredentials: true,
    })
    .then((res) => {
      if (res.data.success) {
        setWorkers(res.data.workers);
      }
      setLoading(false);
    });
  };

  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    setSelectedCategory(catId);
    if (!catId) {
      setCategoryWorkerCount(null);
      fetchWorkers();
      return;
    }

    setLoading(true);
    axios
      .post(`${BASE_URL}backend/api/workers/count_by_category.php`, {
        category_id: catId,
      }, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      })
      .then((res) => {
        if (res.data.success) {
          setWorkers(res.data.workers);
          setCategoryWorkerCount(res.data.workers.length);
        } else {
          setWorkers([]);
          setCategoryWorkerCount(0);
        }
        setLoading(false);
      })
      .catch(() => {
        setWorkers([]);
        setCategoryWorkerCount(0);
        setLoading(false);
      });
  };

  const handleDetails = (worker) => {
    setSelectedWorker(worker);
    setShowModal(true);
  };

  const filteredWorkers = workers.filter((emp) =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentWorkers = selectedCategory
    ? filteredWorkers
    : filteredWorkers.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredWorkers.length / itemsPerPage);

  const downloadExcel = () => {
    const catName =
      categories.find((d) => d.id == selectedCategory)?.name || "Unknown";

    const data = workers.map((emp) => ({
      ID: emp.id,
      Name: emp.name,
      Email: emp.email,
      Phone: emp.phone,
      Category: emp.department_name,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Workers");
    XLSX.writeFile(wb, `Workers_${catName.replace(/\s+/g, "_")}.xlsx`);
  };

  return (
    <div>
      <h4>Worker Management</h4>
      <Button variant="success" onClick={() => setShowWorkerModal(true)}>
        <PersonPlusFill /> Add Worker
      </Button>

      <Form.Group controlId="categorySelect" className="my-3">
        <Form.Label>Select Category</Form.Label>
        <Form.Select value={selectedCategory} onChange={handleCategoryChange}>
          <option value="">-- Select Category --</option>
          {categories.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      {selectedCategory && (
        <div className="mb-3">
          <p>
            <strong>Total Workers:</strong> {categoryWorkerCount ?? 0}
          </p>
          <Button variant="outline-primary" onClick={downloadExcel}>
            Export Excel
          </Button>
        </div>
      )}

      <InputGroup className="mb-3">
        <Form.Control
          placeholder="Search by name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </InputGroup>

      {loading ? (
        <Spinner animation="border" />
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Category</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentWorkers.map((worker) => (
              <tr key={worker.id}>
                <td>{worker.id}</td>
                <td>{worker.name}</td>
                <td>{worker.email}</td>
                <td>{worker.phone}</td>
                <td>{worker.department_name}</td>
                <td>
                  <Button
                    size="sm"
                    variant="info"
                    onClick={() => handleDetails(worker)}
                  >
                    Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {!selectedCategory && (
        <Pagination>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Pagination.Item
              key={page}
              active={page === currentPage}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Pagination.Item>
          ))}
        </Pagination>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Worker Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedWorker && (
            <div>
              <p><strong>Name:</strong> {selectedWorker.name}</p>
              <p><strong>Email:</strong> {selectedWorker.email}</p>
              <p><strong>Phone:</strong> {selectedWorker.phone}</p>
              <p><strong>Category:</strong> {selectedWorker.department_name}</p>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default WorkerContent;