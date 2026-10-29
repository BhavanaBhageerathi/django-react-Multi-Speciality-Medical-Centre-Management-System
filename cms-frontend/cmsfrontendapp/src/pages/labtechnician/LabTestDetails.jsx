import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./LabTestDetails.css";

function LabTestDetails() {
  const { requestId } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTestDetails();
  }, [requestId]);

  const fetchTestDetails = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setError("You are not logged in. Please login again.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/lab-technician/tests/${requestId}/`,
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

      if (response.status === 404) {
        setError("Laboratory test record not found.");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        setError(data.detail || "Unable to load laboratory test details.");
        setLoading(false);
        return;
      }

      setTest(data);
    } catch (err) {
      console.error("LAB TEST DETAILS ERROR:", err);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleEnterResult = () => {
    navigate(`/lab-technician/tests/${requestId}/result`);
  };

  const handleBack = () => {
    if (test && test.status === "COMPLETED") {
      navigate("/lab-technician/completed-tests");
    } else {
      navigate("/lab-technician/pending-tests");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGenerateReport = async () => {
    if (!test || test.status !== "COMPLETED") {
      return;
    }

    setGeneratingReport(true);
    setError("");

    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setError("Your login session has expired. Please login again.");
        setGeneratingReport(false);
        return;
      }

      const response = await fetch(
        `http://127.0.0.1:8000/api/lab-technician/tests/${requestId}/report/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        setError("Your login session has expired. Please login again.");
        setGeneratingReport(false);
        return;
      }

      if (!response.ok) {
        setError(data.detail || "Unable to generate laboratory report.");
        setGeneratingReport(false);
        return;
      }

      if (!data.bill || !data.bill.bill_id) {
        setError(
          "Laboratory report was generated, but the laboratory bill was not created."
        );
        setGeneratingReport(false);
        return;
      }

      navigate(`/lab-technician/payment/${data.bill.bill_id}`);
    } catch (err) {
      console.error("GENERATE LABORATORY REPORT ERROR:", err);
      setError("Unable to connect to the server.");
    } finally {
      setGeneratingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid px-3 px-md-4 py-5 text-center">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted">Loading laboratory test details...</p>
      </div>
    );
  }

  if (error && !test) {
    return (
      <div className="container-fluid px-3 px-md-4 py-4">
        <div className="alert alert-danger shadow-sm rounded-3 mb-4">
          <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
          {error}
        </div>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate("/lab-technician/pending-tests")}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Tests
        </button>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="container-fluid px-3 px-md-4 py-4">
        <div className="alert alert-warning shadow-sm rounded-3 mb-4">
          Laboratory test not found.
        </div>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate("/lab-technician/pending-tests")}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Tests
        </button>
      </div>
    );
  }

  const isCompleted = test.status === "COMPLETED";
  const isCancelled = test.status === "CANCELLED";

  const getStatusBadge = (status) => {
    const val = String(status || "").toUpperCase();
    if (val === "COMPLETED") {
      return (
        <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-2 fs-6">
          <i className="bi bi-check2-circle me-1"></i> Completed
        </span>
      );
    }
    if (val === "PENDING") {
      return (
        <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill px-3 py-2 fs-6">
          <i className="bi bi-clock me-1"></i> Pending
        </span>
      );
    }
    if (val === "IN_PROGRESS") {
      return (
        <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle rounded-pill px-3 py-2 fs-6">
          <i className="bi bi-arrow-repeat me-1"></i> In Progress
        </span>
      );
    }
    return (
      <span className="badge bg-secondary-subtle text-secondary rounded-pill px-3 py-2 fs-6">
        {status}
      </span>
    );
  };

  return (
    <div className="container-fluid px-3 px-md-4 py-4">
      {/* HEADER WITH ACTION BUTTONS */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 no-print">
        <div>
          <h2 className="fw-bold text-dark mb-1">Lab Test Details</h2>
          <p className="text-muted mb-0">
            Request information, diagnostic observations, and sample details
          </p>
        </div>

        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
            onClick={handleBack}
          >
            <i className="bi bi-arrow-left"></i>
            Back
          </button>

          {isCompleted && (
            <button
              type="button"
              className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
              onClick={handlePrint}
            >
              <i className="bi bi-printer"></i>
              Print
            </button>
          )}
        </div>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div
          className="alert alert-danger d-flex align-items-center shadow-sm rounded-3 mb-4 no-print"
          role="alert"
        >
          <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
          <div>{error}</div>
        </div>
      )}

      {/* TEST REQUEST INFORMATION CARD */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4">
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center pb-3 mb-4 border-bottom gap-2">
            <div>
              <h5 className="fw-bold text-dark mb-1">Test Request Information</h5>
              <p className="text-muted mb-0 small">
                Request specifications and assignment details
              </p>
            </div>
            <div>{getStatusBadge(test.status)}</div>
          </div>

          <div className="row g-4">
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="text-muted small text-uppercase fw-semibold mb-1">
                Request ID
              </div>
              <div className="fw-bold fs-5 text-primary">
                {test.request_id || "—"}
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <div className="text-muted small text-uppercase fw-semibold mb-1">
                Patient ID
              </div>
              <div className="fw-bold text-dark fs-5">
                #{test.patient_id || "—"}
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <div className="text-muted small text-uppercase fw-semibold mb-1">
                Doctor ID / Name
              </div>
              <div className="fw-bold text-dark fs-5">
                {test.doctor_id ? `Doctor #${test.doctor_id}` : "—"}
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <div className="text-muted small text-uppercase fw-semibold mb-1">
                Assigned Technician
              </div>
              <div className="fw-bold text-dark fs-5">
                {test.technician_name || "Assigned"}
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-4">
              <div className="text-muted small text-uppercase fw-semibold mb-1">
                Test Name
              </div>
              <div className="fw-bold text-dark fs-5">{test.test_name || "—"}</div>
              <span className="badge bg-light text-muted border mt-1">
                Code: {test.test_code || "—"}
              </span>
            </div>

            <div className="col-12 col-sm-6 col-lg-4">
              <div className="text-muted small text-uppercase fw-semibold mb-1">
                Category & Department
              </div>
              <div className="fw-semibold text-dark">
                {test.category || "General"}
              </div>
              <div className="small text-muted">
                {test.department_name || test.department || "Laboratory"}
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-4">
              <div className="text-muted small text-uppercase fw-semibold mb-1">
                Sample Type
              </div>
              <div className="fw-bold text-dark fs-5">
                {test.sample_type || "—"}
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-6">
              <div className="text-muted small text-uppercase fw-semibold mb-1">
                Requested At
              </div>
              <div className="fw-medium text-dark">
                {test.requested_at
                  ? new Date(test.requested_at).toLocaleString("en-IN")
                  : "—"}
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-6">
              <div className="text-muted small text-uppercase fw-semibold mb-1">
                Last Updated
              </div>
              <div className="fw-medium text-dark">
                {test.updated_at
                  ? new Date(test.updated_at).toLocaleString("en-IN")
                  : "—"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LABORATORY RESULT CARD (If available) */}
      {test.result && (
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-4">
            <div className="pb-3 mb-3 border-bottom">
              <h5 className="fw-bold text-dark mb-1">Recorded Laboratory Result</h5>
              <p className="text-muted mb-0 small">
                Diagnostic findings and technician remarks
              </p>
            </div>

            <div className="row g-4">
              <div className="col-12">
                <div className="text-muted small text-uppercase fw-semibold mb-2">
                  Test Observations / Result Value
                </div>
                <div className="p-3 bg-light rounded-3 border fw-medium text-dark">
                  {test.result}
                </div>
              </div>

              <div className="col-12">
                <div className="text-muted small text-uppercase fw-semibold mb-2">
                  Technician Remarks / Interpretation
                </div>
                <div className="p-3 bg-light rounded-3 border text-secondary">
                  {test.remarks || "No remarks provided."}
                </div>
              </div>

              {test.completed_at && (
                <div className="col-12">
                  <div className="small text-muted">
                    Completed on:{" "}
                    <strong>
                      {new Date(test.completed_at).toLocaleString("en-IN")}
                    </strong>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ACTION CARD */}
      <div className="card border-0 shadow-sm rounded-4 no-print">
        <div className="card-body p-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <h5 className="fw-bold text-dark mb-1">Test Processing Actions</h5>
              <p className="text-muted mb-0 small">
                {isCompleted
                  ? "This test is complete. You can generate the official lab report and proceed to billing."
                  : "Enter the lab findings once sample analysis is completed."}
              </p>
            </div>

            <div className="d-flex flex-wrap gap-2">
              {!isCompleted && !isCancelled && (
                <button
                  type="button"
                  className="btn btn-success d-flex align-items-center gap-2"
                  onClick={handleEnterResult}
                >
                  <i className="bi bi-pencil-square"></i>
                  Enter Lab Result
                </button>
              )}

              {isCompleted && (
                <button
                  type="button"
                  className="btn btn-primary d-flex align-items-center gap-2"
                  onClick={handleGenerateReport}
                  disabled={generatingReport}
                >
                  {generatingReport ? (
                    <>
                      <span className="spinner-border spinner-border-sm"></span>
                      Generating Report...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-file-earmark-plus"></i>
                      Generate Report → Payment
                    </>
                  )}
                </button>
              )}

              {isCompleted && (
                <button
                  type="button"
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                  onClick={handlePrint}
                >
                  <i className="bi bi-printer"></i>
                  Print Result
                </button>
              )}

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleBack}
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LabTestDetails;
