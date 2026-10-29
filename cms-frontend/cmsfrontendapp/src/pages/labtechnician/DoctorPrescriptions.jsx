import { useEffect, useState, useMemo } from "react";

function DoctorPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allotting, setAllotting] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchDoctorPrescriptions();
  }, []);

  const fetchDoctorPrescriptions = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setError("You are not logged in. Please login again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/lab-technician/doctor-prescriptions/",
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
        setError(
          data.detail || "Unable to load doctor lab prescriptions."
        );
        setLoading(false);
        return;
      }

      setPrescriptions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("DOCTOR PRESCRIPTIONS ERROR:", err);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleAllotTest = async (prescriptionId) => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setError("You are not logged in.");
      return;
    }

    setAllotting(prescriptionId);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/lab-technician/doctor-prescriptions/${prescriptionId}/allot/`,
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
        setAllotting(null);
        return;
      }

      if (!response.ok) {
        setError(
          data.detail || "Unable to allot this laboratory test."
        );
        setAllotting(null);
        return;
      }

      setSuccess(
        `Test "${data.test_name || "Prescription"}" successfully allotted for processing (Request ID: ${data.request_id || "Generated"}).`
      );

      await fetchDoctorPrescriptions();
    } catch (err) {
      console.error("ALLOT TEST ERROR:", err);
      setError("Unable to connect to the server.");
    } finally {
      setAllotting(null);
    }
  };

  const filteredPrescriptions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return prescriptions;

    return prescriptions.filter(
      (p) =>
        p.test_name?.toLowerCase().includes(term) ||
        p.test_code?.toLowerCase().includes(term) ||
        p.patient_name?.toLowerCase().includes(term) ||
        String(p.patient_id || "").toLowerCase().includes(term) ||
        p.doctor_name?.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term)
    );
  }, [prescriptions, searchTerm]);

  return (
    <div className="container-fluid px-3 px-md-4 py-4">
      {/* PAGE HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Doctor Lab Prescriptions</h2>
          <p className="text-muted mb-0">
            View laboratory tests prescribed by doctors during consultations and allot them for testing
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2 align-self-start align-self-md-auto"
          onClick={fetchDoctorPrescriptions}
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

      {/* ALERT MESSAGES */}
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
                  placeholder="Search by patient, doctor, test name..."
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
              Showing <strong>{filteredPrescriptions.length}</strong> of{" "}
              <strong>{prescriptions.length}</strong> prescriptions waiting for allotment
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
            <p className="text-muted mb-0">Loading doctor prescriptions...</p>
          </div>
        ) : filteredPrescriptions.length === 0 ? (
          <div className="text-center py-5 px-3">
            <div
              className="bg-light text-muted rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
              style={{ width: "64px", height: "64px" }}
            >
              <i className="bi bi-prescription2 fs-2"></i>
            </div>
            <h5 className="fw-bold text-dark mb-1">
              No Doctor Prescriptions Found
            </h5>
            <p className="text-muted mb-0 small">
              {searchTerm
                ? "No prescribed lab tests match your search criteria."
                : "There are currently no doctor lab prescriptions waiting for allotment."}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-secondary small text-uppercase">
                <tr>
                  <th className="py-3 px-4">Prescription</th>
                  <th className="py-3">Patient</th>
                  <th className="py-3">Prescribing Doctor</th>
                  <th className="py-3">Laboratory Test</th>
                  <th className="py-3">Category</th>
                  <th className="py-3">Sample</th>
                  <th className="py-3">Price</th>
                  <th className="py-3 px-4 text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrescriptions.map((prescription) => (
                  <tr key={prescription.id}>
                    <td className="py-3 px-4">
                      <span className="fw-bold text-primary">
                        #{prescription.id}
                      </span>
                      <div className="small text-muted">
                        Consultation #{prescription.consultation_id}
                      </div>
                    </td>

                    <td className="py-3">
                      <div className="fw-semibold text-dark">
                        {prescription.patient_name || `Patient #${prescription.patient_id}`}
                      </div>
                      <div className="small text-muted">
                        ID: #{prescription.patient_id}
                      </div>
                    </td>

                    <td className="py-3">
                      <span className="fw-medium text-dark">
                        {prescription.doctor_name ? `Dr. ${prescription.doctor_name}` : "—"}
                      </span>
                    </td>

                    <td className="py-3">
                      <div className="fw-semibold text-dark">
                        {prescription.test_name}
                      </div>
                      <span className="badge bg-light text-muted border small">
                        {prescription.test_code}
                      </span>
                    </td>

                    <td className="py-3 text-muted">
                      {prescription.category || "—"}
                    </td>

                    <td className="py-3 text-muted">
                      {prescription.sample_type || "—"}
                    </td>

                    <td className="py-3 fw-bold text-dark">
                      ₹{Number(prescription.price || 0).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </td>

                    <td className="py-3 px-4 text-end">
                      <button
                        type="button"
                        className="btn btn-primary btn-sm rounded-2 d-inline-flex align-items-center gap-1"
                        onClick={() => handleAllotTest(prescription.id)}
                        disabled={allotting === prescription.id}
                      >
                        {allotting === prescription.id ? (
                          <>
                            <span className="spinner-border spinner-border-sm"></span>
                            Allotting...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-plus-circle"></i>
                            Allot Test
                          </>
                        )}
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

export default DoctorPrescriptions;