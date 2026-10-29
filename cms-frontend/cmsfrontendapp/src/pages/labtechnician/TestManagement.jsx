import { useEffect, useState } from "react";
import "./TestManagement.css";

function TestManagement() {
  const [tests, setTests] = useState([]);

  const [searchBy, setSearchBy] = useState("test_id");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [viewingTest, setViewingTest] = useState(null);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async (
    currentSearch = search,
    currentSearchBy = searchBy
  ) => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setError("You are not logged in. Please login again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      let url = "http://127.0.0.1:8000/api/lab-technician/test-management/";

      if (currentSearch.trim()) {
        url += `?search=${encodeURIComponent(
          currentSearch.trim()
        )}&search_by=${currentSearchBy}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Unable to load laboratory tests.");
        setLoading(false);
        return;
      }

      setTests(Array.isArray(data) ? data : []);

      if (currentSearch.trim() && Array.isArray(data) && data.length === 0) {
        setError("Test not found matching search criteria.");
      }
    } catch (err) {
      console.error("TEST MANAGEMENT ERROR:", err);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const validateSearch = () => {
    const value = search.trim();
    if (!value) return true;

    if (searchBy === "test_id") {
      if (!/^[a-zA-Z0-9]+$/.test(value)) {
        setError("Test ID must contain letters and numbers only.");
        return false;
      }
    }

    if (searchBy === "test_name") {
      if (!/^[A-Za-z ]+$/.test(value)) {
        setError("Test Name must contain alphabetic characters only.");
        return false;
      }
    }

    return true;
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setError("");

    if (!validateSearch()) {
      return;
    }

    fetchTests(search.trim(), searchBy);
  };

  const handleClearSearch = () => {
    setSearch("");
    setError("");
    fetchTests("", searchBy);
  };

  const handleViewTest = (test) => {
    setViewingTest(test);
    setError("");
  };

  const closeViewModal = () => {
    setViewingTest(null);
  };

  return (
    <div className="container-fluid px-3 px-md-4 py-4">
      {/* PAGE HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Test Catalog Management</h2>
          <p className="text-muted mb-0">
            Search and reference laboratory tests, categories, sample requirements, and pricing
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2 align-self-start align-self-md-auto"
          onClick={() => fetchTests(search, searchBy)}
          disabled={loading}
        >
          <i
            className={`bi bi-arrow-clockwise ${
              loading ? "spin-animation" : ""
            }`}
          ></i>
          Refresh Catalog
        </button>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div
          className="alert alert-danger d-flex align-items-center shadow-sm rounded-3 mb-4"
          role="alert"
        >
          <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
          <div>{error}</div>
        </div>
      )}

      {/* SEARCH CARD */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4">
          <form className="row g-3 align-items-end" onSubmit={handleSearch}>
            <div className="col-12 col-md-3 col-lg-2">
              <label className="form-label small text-muted text-uppercase fw-semibold">
                Search By
              </label>
              <select
                className="form-select"
                value={searchBy}
                onChange={(e) => {
                  setSearchBy(e.target.value);
                  setError("");
                }}
              >
                <option value="test_id">Test ID / Code</option>
                <option value="test_name">Test Name</option>
              </select>
            </div>

            <div className="col-12 col-md-6 col-lg-7">
              <label className="form-label small text-muted text-uppercase fw-semibold">
                {searchBy === "test_id"
                  ? "Enter Test Code (e.g. CBC, LFT)"
                  : "Enter Test Name"}
              </label>
              <input
                type="text"
                className="form-control"
                placeholder={
                  searchBy === "test_id"
                    ? "Enter test code..."
                    : "Enter test name..."
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-3 col-lg-3 d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary flex-grow-1 d-flex align-items-center justify-content-center gap-1"
                disabled={loading}
              >
                <i className="bi bi-search"></i>
                Search
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleClearSearch}
                disabled={loading && !search}
              >
                Clear
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* TESTS TABLE CARD */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center">
          <div>
            <h5 className="fw-bold text-dark mb-0">Laboratory Tests</h5>
            <div className="small text-muted">
              Standardized tests configured in the clinic
            </div>
          </div>
          {!loading && (
            <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-2">
              {tests.length} {tests.length === 1 ? "Test" : "Tests"} Available
            </span>
          )}
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted mb-0">Loading laboratory tests...</p>
          </div>
        ) : tests.length === 0 ? (
          <div className="text-center py-5 px-3">
            <div
              className="bg-light text-muted rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
              style={{ width: "64px", height: "64px" }}
            >
              <i className="bi bi-eyedropper fs-2"></i>
            </div>
            <h5 className="fw-bold text-dark mb-1">No Tests Found</h5>
            <p className="text-muted mb-0 small">
              {search
                ? "No laboratory tests match your search query."
                : "No tests found in the master list."}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-secondary small text-uppercase">
                <tr>
                  <th className="py-3 px-4">Test Code</th>
                  <th className="py-3">Test Name</th>
                  <th className="py-3">Department</th>
                  <th className="py-3">Sample Type</th>
                  <th className="py-3">Standard Fee</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 px-4 text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((test) => (
                  <tr key={test.id}>
                    <td className="py-3 px-4">
                      <span className="badge bg-light text-primary border fw-semibold fs-6">
                        {test.test_code}
                      </span>
                    </td>

                    <td className="py-3">
                      <div className="fw-bold text-dark">{test.test_name}</div>
                      <div className="small text-muted">ID: #{test.id}</div>
                    </td>

                    <td className="py-3 text-muted">
                      {test.department || "—"}
                    </td>

                    <td className="py-3 text-muted">
                      {test.sample_type || "—"}
                    </td>

                    <td className="py-3 fw-bold text-dark">
                      ₹{Number(test.price || 0).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </td>

                    <td className="py-3">
                      <span
                        className={`badge ${
                          test.is_active
                            ? "bg-success-subtle text-success border border-success-subtle"
                            : "bg-secondary-subtle text-secondary border border-secondary-subtle"
                        } rounded-pill px-3 py-2`}
                      >
                        {test.is_active ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-end">
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm rounded-2 d-inline-flex align-items-center gap-1"
                        onClick={() => handleViewTest(test)}
                      >
                        <i className="bi bi-eye"></i>
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* BOOTSTRAP DETAIL MODAL */}
      {viewingTest && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header bg-primary text-white border-0 py-3">
                <div>
                  <h5 className="modal-title fw-bold mb-0">
                    Test Specifications
                  </h5>
                  <div className="small text-white-50">
                    {viewingTest.test_code} - {viewingTest.test_name}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeViewModal}
                ></button>
              </div>

              <div className="modal-body p-4">
                <div className="row g-3">
                  <div className="col-6">
                    <div className="text-muted small text-uppercase fw-semibold">
                      Test Code
                    </div>
                    <div className="fw-bold text-primary fs-5">
                      {viewingTest.test_code}
                    </div>
                  </div>

                  <div className="col-6">
                    <div className="text-muted small text-uppercase fw-semibold">
                      System ID
                    </div>
                    <div className="fw-bold text-dark fs-5">
                      #{viewingTest.id}
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="text-muted small text-uppercase fw-semibold">
                      Test Name
                    </div>
                    <div className="fw-bold text-dark fs-6">
                      {viewingTest.test_name}
                    </div>
                  </div>

                  <div className="col-6">
                    <div className="text-muted small text-uppercase fw-semibold">
                      Department
                    </div>
                    <div className="fw-medium text-dark">
                      {viewingTest.department || "—"}
                    </div>
                  </div>

                  <div className="col-6">
                    <div className="text-muted small text-uppercase fw-semibold">
                      Sample Type
                    </div>
                    <div className="fw-medium text-dark">
                      {viewingTest.sample_type || "—"}
                    </div>
                  </div>

                  <div className="col-6">
                    <div className="text-muted small text-uppercase fw-semibold">
                      Standard Fee
                    </div>
                    <div className="fw-bold text-success fs-5">
                      ₹{Number(viewingTest.price || 0).toFixed(2)}
                    </div>
                  </div>

                  <div className="col-6">
                    <div className="text-muted small text-uppercase fw-semibold">
                      Catalog Status
                    </div>
                    <div>
                      <span
                        className={`badge ${
                          viewingTest.is_active
                            ? "bg-success-subtle text-success"
                            : "bg-secondary-subtle text-secondary"
                        } rounded-pill px-3 py-2`}
                      >
                        {viewingTest.is_active ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer border-0 bg-light p-3">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm px-4"
                  onClick={closeViewModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TestManagement;
