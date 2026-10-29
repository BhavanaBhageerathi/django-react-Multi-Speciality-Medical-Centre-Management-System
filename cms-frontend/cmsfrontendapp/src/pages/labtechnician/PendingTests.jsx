import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./PendingTests.css";

function PendingTests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchPendingTests();
  }, []);

  const fetchPendingTests = async () => {
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
        "http://127.0.0.1:8000/api/lab-technician/pending-tests/",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        setError("Unable to load pending lab tests.");
        setLoading(false);
        return;
      }

      const data = await response.json();
      setTests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("PENDING TESTS ERROR:", err);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewTest = (requestId) => {
    navigate(`/lab-technician/tests/${requestId}`);
  };

  const handleEnterResult = (requestId) => {
    navigate(`/lab-technician/tests/${requestId}/result`);
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
        test.sample_type?.toLowerCase().includes(term) ||
        test.status?.toLowerCase().includes(term)
    );
  }, [tests, searchTerm]);

  const getStatusBadge = (status) => {
    const val = String(status || "").toUpperCase();
    if (val === "PENDING") {
      return (
        <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill px-3 py-2">
          <i className="bi bi-clock me-1"></i> Pending
        </span>
      );
    }
    if (val === "IN_PROGRESS") {
      return (
        <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle rounded-pill px-3 py-2">
          <i className="bi bi-arrow-repeat me-1"></i> In Progress
        </span>
      );
    }
    if (val === "SAMPLE_COLLECTED") {
      return (
        <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-2">
          <i className="bi bi-droplet me-1"></i> Sample Collected
        </span>
      );
    }
    return (
      <span className="badge bg-secondary-subtle text-secondary rounded-pill px-3 py-2">
        {status}
      </span>
    );
  };

  return (
    <div className="container-fluid px-3 px-md-4 py-4">
      {/* PAGE HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Pending Lab Tests</h2>
          <p className="text-muted mb-0">
            View and process assigned laboratory tests awaiting results
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2 align-self-start align-self-md-auto"
          onClick={fetchPendingTests}
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
              <strong>{tests.length}</strong> pending tests
            </div>
          </div>
        </div>
      </div>

      {/* MAIN TESTS TABLE CARD */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted mb-0">Loading pending lab tests...</p>
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="text-center py-5 px-3">
            <div
              className="bg-light text-muted rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
              style={{ width: "64px", height: "64px" }}
            >
              <i className="bi bi-inbox fs-2"></i>
            </div>
            <h5 className="fw-bold text-dark mb-1">No Pending Tests Found</h5>
            <p className="text-muted mb-0 small">
              {searchTerm
                ? "No lab tests match your search criteria."
                : "There are currently no pending laboratory tests in the queue."}
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
                    <td className="py-3">{getStatusBadge(test.status)}</td>
                    <td className="py-3 px-4 text-end">
                      <div className="d-inline-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm rounded-2 d-inline-flex align-items-center gap-1"
                          onClick={() => handleViewTest(test.request_id)}
                        >
                          <i className="bi bi-eye"></i>
                          View
                        </button>

                        <button
                          type="button"
                          className="btn btn-success btn-sm rounded-2 d-inline-flex align-items-center gap-1"
                          onClick={() => handleEnterResult(test.request_id)}
                        >
                          <i className="bi bi-pencil-square"></i>
                          Enter Result
                        </button>
                      </div>
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

export default PendingTests;
