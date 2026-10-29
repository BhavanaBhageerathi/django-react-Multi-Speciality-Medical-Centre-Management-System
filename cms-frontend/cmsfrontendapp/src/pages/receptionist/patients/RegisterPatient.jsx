import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000";

function RegisterPatient() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const fromAppointment =
    searchParams.get("from") === "appointment";

  const fromConsultation =
    searchParams.get("from") === "consultation";

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    emergency_name: "",
    emergency_phone: "",
    blood_group: "",
    insurance: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const getHeaders = () => {
    const token = localStorage.getItem("accessToken");

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        `${API_BASE}/api/receptionist/patients/`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (typeof data === "object") {
          const messages = Object.entries(data)
            .map(([field, errors]) => {
              const errorText = Array.isArray(errors)
                ? errors.join(", ")
                : String(errors);

              return `${field}: ${errorText}`;
            })
            .join(" | ");

          throw new Error(
            messages || "Unable to register patient."
          );
        }

        throw new Error("Unable to register patient.");
      }

      setSuccessMessage(
        `Patient registered successfully. Patient ID: ${data.patient_id}`
      );

      if (fromAppointment) {
        setTimeout(() => {
          navigate("/appointments", {
            state: {
              newPatient: data,
            },
          });
        }, 1000);

        return;
      }

      if (fromConsultation) {
        setTimeout(() => {
          navigate("/consultation", {
            state: {
              newPatient: data,
            },
          });
        }, 1000);

        return;
      }

      setTimeout(() => {
        navigate("/patients");
      }, 1000);
    } catch (error) {
      console.error(
        "PATIENT REGISTRATION ERROR:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to register patient."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid px-3 px-md-4 py-4">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            Register New Patient
          </h2>

          <p className="text-muted mb-0">
            Enter the patient's information to create a new record.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => navigate("/patients")}
          disabled={loading}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Patients
        </button>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div
          className="alert alert-danger d-flex align-items-start shadow-sm mb-4"
          role="alert"
        >
          <i className="bi bi-exclamation-triangle-fill me-2 mt-1"></i>

          <div>
            <strong>Registration failed</strong>
            <div className="small mt-1">
              {errorMessage}
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div
          className="alert alert-success d-flex align-items-start shadow-sm mb-4"
          role="alert"
        >
          <i className="bi bi-check-circle-fill me-2 mt-1"></i>

          <div>
            <strong>Success</strong>
            <div className="small mt-1">
              {successMessage}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Personal Information */}
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
              {/* First Name */}
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  First Name <span className="text-danger">*</span>
                </label>

                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className="bi bi-person"></i>
                  </span>

                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Enter first name"
                    required
                  />
                </div>
              </div>

              {/* Last Name */}
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Last Name <span className="text-danger">*</span>
                </label>

                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className="bi bi-person"></i>
                  </span>

                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Date of Birth <span className="text-danger">*</span>
                </label>

                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className="bi bi-calendar3"></i>
                  </span>

                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>
              </div>

              {/* Gender */}
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Gender <span className="text-danger">*</span>
                </label>

                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className="bi bi-gender-ambiguous"></i>
                  </span>

                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">
                      Select Gender
                    </option>

                    <option value="MALE">
                      Male
                    </option>

                    <option value="FEMALE">
                      Female
                    </option>

                    <option value="OTHER">
                      Other
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
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
              {/* Phone */}
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Phone Number <span className="text-danger">*</span>
                </label>

                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className="bi bi-phone"></i>
                  </span>

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Enter phone number"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Email
                </label>

                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className="bi bi-envelope"></i>
                  </span>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="col-12">
                <label className="form-label fw-semibold">
                  Address <span className="text-danger">*</span>
                </label>

                <div className="input-group">
                  <span className="input-group-text bg-light align-items-start pt-2">
                    <i className="bi bi-geo-alt"></i>
                  </span>

                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="form-control"
                    rows="3"
                    placeholder="Enter complete address"
                    required
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white border-bottom py-3">
            <div className="d-flex align-items-center">
              <div className="rounded-3 bg-danger bg-opacity-10 p-2 me-3">
                <i className="bi bi-person-plus text-danger fs-5"></i>
              </div>

              <div>
                <h5 className="fw-bold mb-0">
                  Emergency Contact
                </h5>

                <small className="text-muted">
                  Optional emergency contact details
                </small>
              </div>
            </div>
          </div>

          <div className="card-body p-4">
            <div className="row g-4">
              {/* Emergency Name */}
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Contact Name
                </label>

                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className="bi bi-person-heart"></i>
                  </span>

                  <input
                    type="text"
                    name="emergency_name"
                    value={formData.emergency_name}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Enter emergency contact name"
                  />
                </div>
              </div>

              {/* Emergency Phone */}
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Contact Phone
                </label>

                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className="bi bi-telephone"></i>
                  </span>

                  <input
                    type="tel"
                    name="emergency_phone"
                    value={formData.emergency_phone}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Enter emergency contact phone"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
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
              {/* Blood Group */}
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Blood Group
                </label>

                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className="bi bi-droplet"></i>
                  </span>

                  <select
                    name="blood_group"
                    value={formData.blood_group}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="">
                      Select Blood Group
                    </option>

                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              {/* Insurance */}
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Insurance / Membership
                </label>

                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className="bi bi-shield-check"></i>
                  </span>

                  <input
                    type="text"
                    name="insurance"
                    value={formData.insurance}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            <div className="d-flex flex-column flex-sm-row justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary px-4"
                onClick={() => navigate("/patients")}
                disabled={loading}
              >
                <i className="bi bi-x-lg me-2"></i>
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary px-4"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Registering...
                  </>
                ) : (
                  <>
                    <i className="bi bi-person-plus-fill me-2"></i>
                    Register Patient
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default RegisterPatient;