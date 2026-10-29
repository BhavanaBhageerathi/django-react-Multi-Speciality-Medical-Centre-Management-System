import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./CompletedTests.css";

function CompletedTests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchCompletedTests();
  }, []);

  const fetchCompletedTests = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setError("You are not logged in. Please login again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/lab-technician/completed-tests/",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        setError("Your login session has expired. Please login again.");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        setError(data.detail || "Unable to load completed lab tests.");
        setLoading(false);
        return;
      }

      setTests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("COMPLETED TESTS ERROR:", err);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewResult = (requestId) => {
    navigate(`/lab-technician/tests/${requestId}`);
  };

  const filteredTests = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return tests;

    return tests.filter(
      (test) =>
        test.request_id?.toLowerCase().includes(term) ||
        test.test_name?.toLowerCase().includes(term) ||
        test.test_code?.toLowerCase().includes(term) ||
        String(test.patient_id || "").toLowerCase().includes(term) ||
        test.sample_type?.toLowerCase().includes(term)
    );
  }, [tests, searchTerm]);

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="container-fluid px-3 px-md-4 py-4">
      {/* PAGE HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Completed Lab Tests</h2>
          <p className="text-muted mb-0">
            View previously processed tests, findings, and diagnostic reports
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2 align-self-start align-self-md-auto"
          onClick={fetchCompletedTests}
          disabled={loading}
        >
          <i
            className={`bi bi-arrow-clockwise ${
              loading ? "spin-animation" : ""
            }`}
          ></i>
          Refresh List
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

      {/* SEARCH AND FILTER TOOLBAR */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-3">
          <div className="row g-3 align-items-center">
            <div className="col-12 col-md-6 col-lg-5">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-muted">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0"
                  placeholder="Search by Request ID, test name, patient ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    className="btn btn-light border-start-0 border"
                    type="button"
                    onClick={() => setSearchTerm("")}
                  >
                    <i className="bi bi-x"></i>
                  </button>
                )}
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-7 text-md-end text-muted small">
              Showing <strong>{filteredTests.length}</strong> of{" "}
              <strong>{tests.length}</strong> completed tests
            </div>
          </div>
        </div>
      </div>

      {/* MAIN TABLE CARD */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted mb-0">Loading completed lab tests...</p>
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="text-center py-5 px-3">
            <div
              className="bg-light text-muted rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
              style={{ width: "64px", height: "64px" }}
            >
              <i className="bi bi-check2-all fs-2"></i>
            </div>
            <h5 className="fw-bold text-dark mb-1">
              No Completed Tests Found
            </h5>
            <p className="text-muted mb-0 small">
              {searchTerm
                ? "No completed tests match your search criteria."
                : "There are currently no completed laboratory test records."}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-secondary small text-uppercase">
                <tr>
                  <th className="py-3 px-4">Request ID</th>
                  <th className="py-3">Test Details</th>
                  <th className="py-3">Patient ID</th>
                  <th className="py-3">Sample Type</th>
                  <th className="py-3">Completed At</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 px-4 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTests.map((test) => (
                  <tr key={test.id || test.request_id}>
                    <td className="py-3 px-4">
                      <span className="fw-semibold text-primary">
                        {test.request_id}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="fw-semibold text-dark">
                        {test.test_name}
                      </div>
                      <span className="badge bg-light text-muted border small">
                        {test.test_code}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="fw-medium text-dark">
                        #{test.patient_id}
                      </span>
                    </td>
                    <td className="py-3 text-muted">
                      {test.sample_type || "—"}
                    </td>
                    <td className="py-3 text-muted small">
                      {formatDate(test.completed_at || test.updated_at)}
                    </td>
                    <td className="py-3">
                      <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-2">
                        <i className="bi bi-check2-circle me-1"></i> Completed
                      </span>
                    </td>
                    <td className="py-3 px-4 text-end">
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm rounded-2 d-inline-flex align-items-center gap-1"
                        onClick={() => handleViewResult(test.request_id)}
                      >
                        <i className="bi bi-file-earmark-text"></i>
                        View Report / Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default CompletedTests;
