import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./LaboratoryReportDetails.css";

function LaboratoryReportDetails() {
  const { reportId } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReport = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        `http://127.0.0.1:8000/api/lab-technician/reports/${reportId}/`,
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
        throw new Error(data.detail || "Failed to load laboratory report.");
      }

      setReport(data);
    } catch (err) {
      console.error("REPORT DETAILS ERROR:", err);
      setError(err.message || "Unable to load laboratory report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="container-fluid px-3 px-md-4 py-5 text-center">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted">Loading laboratory report...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid px-3 px-md-4 py-4">
        <div className="alert alert-danger shadow-sm rounded-3 mb-4">
          <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
          {error}
        </div>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate("/lab-technician/reports")}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Reports
        </button>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <div className="container-fluid px-3 px-md-4 py-4">
      {/* ACTIONS TOOLBAR (HIDDEN WHEN PRINTING) */}
      <div className="d-flex justify-content-between align-items-center mb-4 no-print">
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
          onClick={() => navigate("/lab-technician/reports")}
        >
          <i className="bi bi-arrow-left"></i>
          Back to Reports
        </button>

        <button
          type="button"
          className="btn btn-primary btn-sm d-flex align-items-center gap-2"
          onClick={handlePrint}
        >
          <i className="bi bi-printer"></i>
          Print Official Report
        </button>
      </div>

      {/* OFFICIAL REPORT DOCUMENT CARD */}
      <div className="card border-0 shadow-sm rounded-4 mx-auto report-document-card">
        <div className="card-body p-4 p-md-5">
          {/* CLINIC HEADER */}
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center pb-4 border-bottom mb-4">
            <div className="d-flex align-items-center mb-3 mb-sm-0">
              <div
                className="bg-primary text-white rounded-3 d-flex align-items-center justify-content-center me-3"
                style={{ width: "50px", height: "50px" }}
              >
                <i className="bi bi-hospital fs-3"></i>
              </div>
              <div>
                <h4 className="fw-bold text-dark mb-0">
                  CLINIC MANAGEMENT SYSTEM
                </h4>
                <div className="text-secondary small fw-semibold">
                  Department of Laboratory Medicine & Diagnostics
                </div>
              </div>
            </div>

            <div className="text-sm-end">
              <span className="badge bg-primary px-3 py-2 fs-6 mb-1">
                OFFICIAL LAB REPORT
              </span>
              <div className="text-muted small">
                Report ID: <strong>{report.report_id}</strong>
              </div>
            </div>
          </div>

          {/* PATIENT & TEST METADATA GRID */}
          <div className="bg-light p-4 rounded-4 mb-4 border">
            <div className="row g-3">
              <div className="col-12 col-sm-6 col-md-3">
                <div className="text-muted small text-uppercase fw-semibold">
                  Patient ID
                </div>
                <div className="fw-bold text-dark fs-6">
                  #{report.patient_id || "—"}
                </div>
              </div>

              <div className="col-12 col-sm-6 col-md-3">
                <div className="text-muted small text-uppercase fw-semibold">
                  Request ID
                </div>
                <div className="fw-bold text-primary fs-6">
                  {report.request_id || "—"}
                </div>
              </div>

              <div className="col-12 col-sm-6 col-md-3">
                <div className="text-muted small text-uppercase fw-semibold">
                  Test Code
                </div>
                <div className="fw-bold text-dark fs-6">
                  {report.test_code || "—"}
                </div>
              </div>

              <div className="col-12 col-sm-6 col-md-3">
                <div className="text-muted small text-uppercase fw-semibold">
                  Sample Type
                </div>
                <div className="fw-bold text-dark fs-6">
                  {report.sample_type || "—"}
                </div>
              </div>

              <div className="col-12 col-sm-6 col-md-6">
                <div className="text-muted small text-uppercase fw-semibold">
                  Laboratory Test Name
                </div>
                <div className="fw-bold text-dark fs-5">
                  {report.test_name || "—"}
                </div>
              </div>

              <div className="col-12 col-sm-6 col-md-6">
                <div className="text-muted small text-uppercase fw-semibold">
                  Date Generated
                </div>
                <div className="fw-medium text-dark">
                  {report.generated_at
                    ? new Date(report.generated_at).toLocaleString("en-IN")
                    : "—"}
                </div>
              </div>
            </div>
          </div>

          {/* OBSERVATIONS / FINDINGS */}
          <div className="mb-4">
            <h6 className="fw-bold text-dark text-uppercase mb-3 pb-2 border-bottom">
              Test Observations & Quantitative / Qualitative Findings
            </h6>
            <div className="p-4 bg-white rounded-3 border fw-medium text-dark report-result-content">
              {report.lab_result || "No specific findings recorded."}
            </div>
          </div>

          {/* REMARKS / INTERPRETATION */}
          <div className="mb-4">
            <h6 className="fw-bold text-dark text-uppercase mb-3 pb-2 border-bottom">
              Clinical Interpretation & Remarks
            </h6>
            <div className="p-3 bg-light rounded-3 border text-secondary">
              {report.remarks || "No additional remarks."}
            </div>
          </div>

          {/* SIGN-OFF & AUTHENTICATION */}
          <div className="pt-4 border-top mt-5">
            <div className="row align-items-end">
              <div className="col-12 col-md-7">
                <div className="small text-muted mb-1">
                  Validated & Generated By:
                </div>
                <div className="fw-bold text-dark">
                  {report.technician_name || "Authorized Lab Technician"}
                </div>
                <div className="small text-muted">
                  Technician ID: #{report.technician_id || "STAFF"}
                </div>
              </div>

              <div className="col-12 col-md-5 text-md-end mt-3 mt-md-0">
                <div className="text-muted small">Electronic Signature / Seal</div>
                <div className="fw-semibold text-primary">
                  [Verified Clinic Laboratory]
                </div>
              </div>
            </div>
          </div>

          {/* REPORT FOOTER */}
          <div className="text-center text-muted small mt-5 pt-3 border-top">
            This is an electronically validated diagnostic report generated by the Clinic Management System.
            Report Reference: {report.report_id}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LaboratoryReportDetails;
