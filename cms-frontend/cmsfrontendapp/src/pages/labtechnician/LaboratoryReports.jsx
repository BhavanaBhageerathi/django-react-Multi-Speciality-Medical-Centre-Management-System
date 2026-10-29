import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LaboratoryReports.css";

function LaboratoryReports() {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [searchBy, setSearchBy] = useState("report_id");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setError("You are not logged in. Please login again.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        "http://127.0.0.1:8000/api/lab-technician/reports/",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to load laboratory reports."
        );
      }

      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("LAB REPORTS ERROR:", err);
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = reports.filter((report) => {
    const value = search.trim().toLowerCase();

    if (!value) return true;

    if (searchBy === "report_id") {
      return report.report_id?.toLowerCase().includes(value);
    }

    if (searchBy === "patient_id") {
      return String(report.patient_id || "")
        .toLowerCase()
        .includes(value);
    }

    if (searchBy === "test_name") {
      return report.test_name?.toLowerCase().includes(value);
    }

    return true;
  });

  const handleViewReport = (report) => {
    navigate(`/lab-technician/reports/${report.report_id}`);
  };

  return (
    <div className="container-fluid px-3 px-md-4 py-4">
      {/* PAGE HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Laboratory Diagnostic Reports</h2>
          <p className="text-muted mb-0">
            View, inspect, print, and audit generated patient laboratory reports
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2 align-self-start align-self-md-auto"
          onClick={fetchReports}
          disabled={loading}
        >
          <i
            className={`bi bi-arrow-clockwise ${
              loading ? "spin-animation" : ""
            }`}
          ></i>
          Refresh Reports
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
        <div className="card-body p-4">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-3 col-lg-2">
              <label className="form-label small text-muted text-uppercase fw-semibold">
                Filter By
              </label>
              <select
                className="form-select"
                value={searchBy}
                onChange={(e) => setSearchBy(e.target.value)}
              >
                <option value="report_id">Report ID</option>
                <option value="patient_id">Patient ID</option>
                <option value="test_name">Test Name</option>
              </select>
            </div>

            <div className="col-12 col-md-7 col-lg-8">
              <label className="form-label small text-muted text-uppercase fw-semibold">
                Search Query
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-muted">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0"
                  placeholder={
                    searchBy === "report_id"
                      ? "Search Report ID (e.g. RPT00001)..."
                      : searchBy === "patient_id"
                      ? "Search Patient ID..."
                      : "Search Test Name..."
                  }
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    className="btn btn-light border border-start-0"
                    type="button"
                    onClick={() => setSearch("")}
                  >
                    <i className="bi bi-x"></i>
                  </button>
                )}
              </div>
            </div>

            <div className="col-12 col-md-2 col-lg-2 text-md-end">
              <button
                type="button"
                className="btn btn-outline-secondary w-100"
                onClick={() => setSearch("")}
                disabled={!search}
              >
                Clear Filter
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN TABLE CARD */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center">
          <div>
            <h5 className="fw-bold text-dark mb-0">Generated Reports</h5>
            <div className="small text-muted">
              Official records of validated laboratory test findings
            </div>
          </div>
          {!loading && (
            <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-2">
              {filteredReports.length} Reports
            </span>
          )}
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted mb-0">Loading laboratory reports...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-5 px-3">
            <div
              className="bg-light text-muted rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
              style={{ width: "64px", height: "64px" }}
            >
              <i className="bi bi-file-earmark-medical fs-2"></i>
            </div>
            <h5 className="fw-bold text-dark mb-1">No Reports Found</h5>
            <p className="text-muted mb-0 small">
              {search
                ? "No diagnostic reports match your filter criteria."
                : "No laboratory reports have been generated yet."}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-secondary small text-uppercase">
                <tr>
                  <th className="py-3 px-4">Report ID</th>
                  <th className="py-3">Request ID</th>
                  <th className="py-3">Patient ID</th>
                  <th className="py-3">Test Name & Code</th>
                  <th className="py-3">Result Summary</th>
                  <th className="py-3">Generated At</th>
                  <th className="py-3 px-4 text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr key={report.id || report.report_id}>
                    <td className="py-3 px-4">
                      <span className="fw-bold text-primary">
                        {report.report_id}
                      </span>
                    </td>

                    <td className="py-3">
                      <span className="text-muted fw-semibold">
                        {report.request_id}
                      </span>
                    </td>

                    <td className="py-3">
                      <span className="fw-medium text-dark">
                        #{report.patient_id}
                      </span>
                    </td>

                    <td className="py-3">
                      <div className="fw-bold text-dark">
                        {report.test_name}
                      </div>
                      <span className="badge bg-light text-muted border small">
                        {report.test_code}
                      </span>
                    </td>

                    <td className="py-3">
                      <div
                        className="text-dark small text-truncate"
                        style={{ maxWidth: "220px" }}
                      >
                        {report.lab_result || "—"}
                      </div>
                    </td>

                    <td className="py-3 text-muted small">
                      {report.generated_at
                        ? new Date(report.generated_at).toLocaleString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>

                    <td className="py-3 px-4 text-end">
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm rounded-2 d-inline-flex align-items-center gap-1"
                        onClick={() => handleViewReport(report)}
                      >
                        <i className="bi bi-file-earmark-text"></i>
                        View Report
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

export default LaboratoryReports;