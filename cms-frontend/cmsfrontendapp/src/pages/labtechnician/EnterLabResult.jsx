import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./EnterLabResult.css";

function EnterLabResult() {
  const { requestId } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [result, setResult] = useState("");
  const [remarks, setRemarks] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [editing, setEditing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getToken = () => localStorage.getItem("accessToken");

  useEffect(() => {
    fetchTestDetails();
  }, [requestId]);

  const fetchTestDetails = async () => {
    const token = getToken();

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

      if (!response.ok) {
        setError(data.detail || "Unable to load lab test details.");
        setLoading(false);
        return;
      }

      setTest(data);

      if (data.lab_result !== null && data.lab_result !== undefined) {
        setResult(data.lab_result);
      } else if (data.result !== null && data.result !== undefined) {
        setResult(data.result);
      } else {
        setResult("");
      }

      if (data.result_remarks !== null && data.result_remarks !== undefined) {
        setRemarks(data.result_remarks);
      } else if (data.remarks !== null && data.remarks !== undefined) {
        setRemarks(data.remarks);
      } else {
        setRemarks("");
      }
    } catch (err) {
      console.error("FETCH TEST ERROR:", err);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResult = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!result.trim()) {
      setError("Please enter the lab result / observations.");
      return;
    }

    const token = getToken();
    if (!token) {
      setError("You are not logged in.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/lab-technician/tests/${requestId}/result/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            result: result.trim(),
            remarks: remarks.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const firstError =
          typeof data === "object" ? Object.values(data)[0] : null;
        setError(
          Array.isArray(firstError)
            ? firstError[0]
            : data.detail || "Unable to save the lab result."
        );
        setSaving(false);
        return;
      }

      setSuccess("Lab result saved successfully.");
      setEditing(false);

      setTest((prev) => ({
        ...prev,
        status: "IN_PROGRESS",
        lab_result: data.result,
        result_remarks: data.remarks,
        result: data.result,
        remarks: data.remarks,
      }));
    } catch (err) {
      console.error("SAVE RESULT ERROR:", err);
      setError("Unable to connect to the server.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateResult = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!result.trim()) {
      setError("Please enter the lab result.");
      return;
    }

    const token = getToken();
    if (!token) {
      setError("You are not logged in.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/lab-technician/tests/${requestId}/result/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            result: result.trim(),
            remarks: remarks.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const firstError =
          typeof data === "object" ? Object.values(data)[0] : null;
        setError(
          Array.isArray(firstError)
            ? firstError[0]
            : data.detail || "Unable to update the lab result."
        );
        setSaving(false);
        return;
      }

      setSuccess("Lab result updated successfully.");
      setEditing(false);

      setTest((prev) => ({
        ...prev,
        lab_result: data.result,
        result_remarks: data.remarks,
        result: data.result,
        remarks: data.remarks,
      }));
    } catch (err) {
      console.error("UPDATE RESULT ERROR:", err);
      setError("Unable to connect to the server.");
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteTest = async () => {
    setError("");
    setSuccess("");

    const token = getToken();
    if (!token) {
      setError("You are not logged in.");
      return;
    }

    setCompleting(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/lab-technician/tests/${requestId}/complete/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Unable to complete the lab test.");
        setCompleting(false);
        return;
      }

      setSuccess("Lab test marked as completed successfully!");
      setTest((prev) => ({
        ...prev,
        status: "COMPLETED",
      }));
      setEditing(false);

      setTimeout(() => {
        navigate("/lab-technician/completed-tests");
      }, 1200);
    } catch (err) {
      console.error("COMPLETE TEST ERROR:", err);
      setError("Unable to connect to the server.");
    } finally {
      setCompleting(false);
    }
  };

  const handleBack = () => {
    navigate(`/lab-technician/tests/${requestId}`);
  };

  if (loading) {
    return (
      <div className="container-fluid px-3 px-md-4 py-5 text-center">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted">Loading laboratory test record...</p>
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
          onClick={handleBack}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Test Details
        </button>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="container-fluid px-3 px-md-4 py-4">
        <div className="alert alert-warning shadow-sm rounded-3 mb-4">
          Lab test record not found.
        </div>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={handleBack}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back
        </button>
      </div>
    );
  }

  const hasResult =
    (test.lab_result !== null &&
      test.lab_result !== undefined &&
      test.lab_result !== "") ||
    (test.result !== null && test.result !== undefined && test.result !== "");

  const isCompleted = test.status === "COMPLETED";

  return (
    <div className="container-fluid px-3 px-md-4 py-4">
      {/* PAGE HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Enter Lab Result</h2>
          <p className="text-muted mb-0">
            Record clinical findings, observation values, and technician remarks
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 align-self-start align-self-md-auto"
          onClick={handleBack}
        >
          <i className="bi bi-arrow-left"></i>
          Back to Test Details
        </button>
      </div>

      {/* FEEDBACK ALERTS */}
      {error && (
        <div
          className="alert alert-danger d-flex align-items-center shadow-sm rounded-3 mb-4"
          role="alert"
        >
          <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
          <div>{error}</div>
        </div>
      )}

      {success && (
        <div
          className="alert alert-success d-flex align-items-center shadow-sm rounded-3 mb-4"
          role="alert"
        >
          <i className="bi bi-check-circle-fill me-2 fs-5"></i>
          <div>{success}</div>
        </div>
      )}

      {/* TEST SUMMARY CARD */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4">
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center pb-3 mb-3 border-bottom gap-2">
            <div>
              <h5 className="fw-bold text-dark mb-1">Test Summary</h5>
              <p className="text-muted mb-0 small">
                Request specifications for #{test.request_id}
              </p>
            </div>
            <div>
              <span
                className={`badge ${
                  isCompleted
                    ? "bg-success-subtle text-success border border-success-subtle"
                    : "bg-warning-subtle text-warning-emphasis border border-warning-subtle"
                } rounded-pill px-3 py-2 fs-6`}
              >
                {test.status}
              </span>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-12 col-sm-6 col-md-3">
              <div className="text-muted small text-uppercase fw-semibold">
                Request ID
              </div>
              <div className="fw-bold text-primary">{test.request_id}</div>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <div className="text-muted small text-uppercase fw-semibold">
                Patient ID
              </div>
              <div className="fw-bold text-dark">#{test.patient_id}</div>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <div className="text-muted small text-uppercase fw-semibold">
                Test Name
              </div>
              <div className="fw-bold text-dark">{test.test_name}</div>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <div className="text-muted small text-uppercase fw-semibold">
                Sample Type
              </div>
              <div className="fw-bold text-dark">
                {test.sample_type || "—"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RESULT FORM / DISPLAY CARD */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center pb-3 mb-4 border-bottom">
            <div>
              <h5 className="fw-bold text-dark mb-1">Diagnostic Findings</h5>
              <p className="text-muted mb-0 small">
                {hasResult && !editing
                  ? "View recorded result details"
                  : "Enter the lab findings below"}
              </p>
            </div>

            {hasResult && !editing && !isCompleted && (
              <button
                type="button"
                className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
                onClick={() => setEditing(true)}
              >
                <i className="bi bi-pencil"></i>
                Edit Result
              </button>
            )}
          </div>

          {hasResult && !editing ? (
            /* VIEW MODE */
            <div>
              <div className="mb-4">
                <label className="form-label text-muted small text-uppercase fw-semibold">
                  Result Findings / Observations
                </label>
                <div className="p-3 bg-light rounded-3 border fw-medium text-dark">
                  {result}
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label text-muted small text-uppercase fw-semibold">
                  Technician Remarks / Interpretation
                </label>
                <div className="p-3 bg-light rounded-3 border text-secondary">
                  {remarks || "No remarks provided."}
                </div>
              </div>

              {!isCompleted && (
                <div className="d-flex flex-wrap gap-2 pt-2 border-top">
                  <button
                    type="button"
                    className="btn btn-success d-flex align-items-center gap-2"
                    onClick={handleCompleteTest}
                    disabled={completing}
                  >
                    {completing ? (
                      <>
                        <span className="spinner-border spinner-border-sm"></span>
                        Completing Test...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check2-circle"></i>
                        Mark Test as Completed
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleBack}
                  >
                    Back to Details
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* EDIT / CREATE MODE */
            <form onSubmit={hasResult ? handleUpdateResult : handleSaveResult}>
              <div className="mb-4">
                <label className="form-label fw-semibold text-dark">
                  Laboratory Result / Observations{" "}
                  <span className="text-danger">*</span>
                </label>
                <textarea
                  className="form-control rounded-3"
                  rows="4"
                  placeholder="Enter detailed laboratory result, findings, values, and metrics..."
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                  required
                ></textarea>
                <div className="form-text">
                  Provide clear, structured findings with relevant reference
                  ranges if applicable.
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold text-dark">
                  Remarks / Technician Notes
                </label>
                <textarea
                  className="form-control rounded-3"
                  rows="3"
                  placeholder="Enter any additional observations, sample quality notes, or clinical notes..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                ></textarea>
              </div>

              <div className="d-flex flex-wrap gap-2 pt-3 border-top">
                <button
                  type="submit"
                  className="btn btn-primary d-flex align-items-center gap-2"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm"></span>
                      Saving Result...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-floppy"></i>
                      {hasResult ? "Update Result" : "Save Result"}
                    </>
                  )}
                </button>

                {editing && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setEditing(false)}
                    disabled={saving}
                  >
                    Cancel Edit
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
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default EnterLabResult;