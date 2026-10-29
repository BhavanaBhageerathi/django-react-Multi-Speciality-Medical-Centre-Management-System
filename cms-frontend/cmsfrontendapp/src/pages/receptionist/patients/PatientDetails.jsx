import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000";

function PatientDetails() {
  const navigate = useNavigate();
  const { patientId } = useParams();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const getHeaders = () => {
    const token = localStorage.getItem("accessToken");

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const getPatientName = (patientData) => {
    return (
      `${patientData.first_name || ""} ${
        patientData.last_name || ""
      }`
    ).trim();
  };

  const fetchPatient = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `${API_BASE}/api/receptionist/patients/${patientId}/`,
        {
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to load patient record."
        );
      }

      setPatient(data);
    } catch (error) {
      console.error(
        "PATIENT DETAILS ERROR:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to load patient record."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      fetchPatient();
    }
  }, [patientId]);

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div className="container-fluid px-3 px-md-4 py-4">
        <div
          className="d-flex flex-column justify-content-center align-items-center"
          style={{ minHeight: "60vh" }}
        >
          <div
            className="spinner-border text-primary mb-3"
            role="status"
          ></div>

          <p className="text-muted mb-0">
            Loading patient record...
          </p>
        </div>
      </div>
    );
  }

  /* =========================
     ERROR / NOT FOUND
  ========================= */

  if (errorMessage || !patient) {
    return (
      <div className="container-fluid px-3 px-md-4 py-4">
        <div
          className="card border-0 shadow-sm"
          style={{ maxWidth: "700px", margin: "60px auto" }}
        >
          <div className="card-body text-center p-5">
            <div
              className="rounded-circle bg-danger bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3"
              style={{
                width: "70px",
                height: "70px",
              }}
            >
              <i className="bi bi-person-x text-danger fs-2"></i>
            </div>

            <h4 className="fw-bold mb-2">
              Patient Record Not Found
            </h4>

            <p className="text-muted mb-4">
              {errorMessage ||
                "The requested patient record could not be found."}
            </p>

            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigate("/patients")}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back to Patients
            </button>
          </div>
        </div>
      </div>
    );
  }

  const patientName = getPatientName(patient);
  const isActive = patient.is_active !== false;

  return (
    <div className="container-fluid px-3 px-md-4 py-4">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            Patient Details
          </h2>

          <p className="text-muted mb-0">
            View complete patient information.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => navigate("/patients")}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Patients
        </button>
      </div>

      {/* =========================
          PATIENT PROFILE
      ========================= */}

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">

          <div className="d-flex flex-column flex-sm-row align-items-sm-center gap-3">

            {/* Avatar */}

            <div
              className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: "80px",
                height: "80px",
                fontSize: "30px",
                fontWeight: "700",
              }}
            >
              {patient.first_name
                ? patient.first_name
                    .charAt(0)
                    .toUpperCase()
                : "P"}
            </div>

            {/* Patient Name */}

            <div className="flex-grow-1">
              <h3 className="fw-bold mb-1">
                {patientName}
              </h3>

              <div className="text-muted mb-2">
                Patient ID:{" "}
                <strong className="text-dark">
                  {patient.patient_id}
                </strong>
              </div>

              <span
                className={`badge ${
                  isActive
                    ? "text-bg-success"
                    : "text-bg-secondary"
                }`}
              >
                <i
                  className={`bi ${
                    isActive
                      ? "bi-check-circle"
                      : "bi-x-circle"
                  } me-1`}
                ></i>

                {isActive
                  ? "Active"
                  : "Inactive"}
              </span>
            </div>

            {/* Edit Button */}

            <div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() =>
                  navigate(
                    `/patients/${patient.patient_id}/edit`
                  )
                }
              >
                <i className="bi bi-pencil-square me-2"></i>
                Edit Patient
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================
          PERSONAL INFORMATION
      ========================= */}

      <div className="card border-0 shadow-sm mb-4">

        <div className="card-header bg-white border-bottom py-3">
          <div className="d-flex align-items-center">

            <div className="rounded-3 bg-primary bg-opacity-10 p-2 me-3">
              <i className="bi bi-person-vcard text-primary fs-5"></i>
            </div>

            <div>
              <h5 className="fw-bold mb-0">
                Personal Information
              </h5>

              <small className="text-muted">
                Basic patient details
              </small>
            </div>

          </div>
        </div>

        <div className="card-body p-4">

          <div className="row g-4">

            <div className="col-md-6">
              <DetailItem
                icon="bi-person"
                label="First Name"
                value={patient.first_name}
              />
            </div>

            <div className="col-md-6">
              <DetailItem
                icon="bi-person"
                label="Last Name"
                value={patient.last_name}
              />
            </div>

            <div className="col-md-6">
              <DetailItem
                icon="bi-calendar3"
                label="Date of Birth"
                value={patient.date_of_birth}
              />
            </div>

            <div className="col-md-6">
              <DetailItem
                icon="bi-gender-ambiguous"
                label="Gender"
                value={patient.gender}
              />
            </div>

          </div>
        </div>
      </div>

      {/* =========================
          CONTACT INFORMATION
      ========================= */}

      <div className="card border-0 shadow-sm mb-4">

        <div className="card-header bg-white border-bottom py-3">
          <div className="d-flex align-items-center">

            <div className="rounded-3 bg-success bg-opacity-10 p-2 me-3">
              <i className="bi bi-telephone text-success fs-5"></i>
            </div>

            <div>
              <h5 className="fw-bold mb-0">
                Contact Information
              </h5>

              <small className="text-muted">
                Patient contact details
              </small>
            </div>

          </div>
        </div>

        <div className="card-body p-4">

          <div className="row g-4">

            <div className="col-md-6">
              <DetailItem
                icon="bi-phone"
                label="Phone Number"
                value={patient.phone}
              />
            </div>

            <div className="col-md-6">
              <DetailItem
                icon="bi-envelope"
                label="Email"
                value={
                  patient.email ||
                  "Not provided"
                }
              />
            </div>

            <div className="col-12">
              <DetailItem
                icon="bi-geo-alt"
                label="Address"
                value={patient.address}
              />
            </div>

          </div>
        </div>
      </div>

      {/* =========================
          EMERGENCY CONTACT
      ========================= */}

      <div className="card border-0 shadow-sm mb-4">

        <div className="card-header bg-white border-bottom py-3">
          <div className="d-flex align-items-center">

            <div className="rounded-3 bg-danger bg-opacity-10 p-2 me-3">
              <i className="bi bi-person-heart text-danger fs-5"></i>
            </div>

            <div>
              <h5 className="fw-bold mb-0">
                Emergency Contact
              </h5>

              <small className="text-muted">
                Emergency contact information
              </small>
            </div>

          </div>
        </div>

        <div className="card-body p-4">

          <div className="row g-4">

            <div className="col-md-6">
              <DetailItem
                icon="bi-person"
                label="Contact Name"
                value={
                  patient.emergency_name ||
                  "Not provided"
                }
              />
            </div>

            <div className="col-md-6">
              <DetailItem
                icon="bi-telephone"
                label="Contact Phone"
                value={
                  patient.emergency_phone ||
                  "Not provided"
                }
              />
            </div>

          </div>
        </div>
      </div>

      {/* =========================
          ADDITIONAL INFORMATION
      ========================= */}

      <div className="card border-0 shadow-sm mb-4">

        <div className="card-header bg-white border-bottom py-3">
          <div className="d-flex align-items-center">

            <div className="rounded-3 bg-warning bg-opacity-10 p-2 me-3">
              <i className="bi bi-file-medical text-warning fs-5"></i>
            </div>

            <div>
              <h5 className="fw-bold mb-0">
                Additional Information
              </h5>

              <small className="text-muted">
                Medical and membership information
              </small>
            </div>

          </div>
        </div>

        <div className="card-body p-4">

          <div className="row g-4">

            <div className="col-md-6">
              <DetailItem
                icon="bi-droplet"
                label="Blood Group"
                value={
                  patient.blood_group ||
                  "Not provided"
                }
              />
            </div>

            <div className="col-md-6">
              <DetailItem
                icon="bi-shield-check"
                label="Insurance / Membership"
                value={
                  patient.insurance ||
                  "Not provided"
                }
              />
            </div>

          </div>
        </div>
      </div>

      {/* =========================
          APPOINTMENT HISTORY
      ========================= */}

      <div className="card border-0 shadow-sm">

        <div className="card-header bg-white border-bottom py-3">
          <div className="d-flex align-items-center">

            <div className="rounded-3 bg-info bg-opacity-10 p-2 me-3">
              <i className="bi bi-calendar-check text-info fs-5"></i>
            </div>

            <div>
              <h5 className="fw-bold mb-0">
                Appointment History
              </h5>

              <small className="text-muted">
                Patient appointment records
              </small>
            </div>

          </div>
        </div>

        <div className="card-body p-0">

          <div className="table-responsive">

            <table className="table table-hover align-middle mb-0">

              <thead className="table-light">

                <tr>
                  <th className="px-4">
                    Date
                  </th>

                  <th>
                    Doctor
                  </th>

                  <th>
                    Department
                  </th>

                  <th>
                    Status
                  </th>
                </tr>

              </thead>

              <tbody>

                <tr>

                  <td
                    colSpan="4"
                    className="text-center py-5"
                  >
                    <div className="text-muted">

                      <i className="bi bi-calendar-x fs-2 d-block mb-2"></i>

                      <div className="fw-semibold">
                        Appointment history is not available here yet.
                      </div>

                      <small>
                        Appointment history API integration
                        can be added from the existing
                        appointment endpoint.
                      </small>

                    </div>
                  </td>

                </tr>

              </tbody>

            </table>

          </div>
        </div>
      </div>

      {/* Bottom Back Button */}

      <div className="mt-4">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => navigate("/patients")}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Patients
        </button>
      </div>

    </div>
  );
}

/* =========================
   DETAIL ITEM COMPONENT
========================= */

function DetailItem({ icon, label, value }) {
  return (
    <div className="d-flex align-items-start">

      <div
        className="rounded-3 bg-light d-flex align-items-center justify-content-center me-3 flex-shrink-0"
        style={{
          width: "42px",
          height: "42px",
        }}
      >
        <i className={`bi ${icon} text-primary`}></i>
      </div>

      <div className="flex-grow-1">

        <div className="text-muted small mb-1">
          {label}
        </div>

        <div className="fw-semibold text-dark">
          {value || "Not provided"}
        </div>

      </div>

    </div>
  );
}

export default PatientDetails;