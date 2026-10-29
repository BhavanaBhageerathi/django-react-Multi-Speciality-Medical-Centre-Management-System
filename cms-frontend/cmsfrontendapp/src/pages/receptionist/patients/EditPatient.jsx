import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000";

function EditPatient() {
  const navigate = useNavigate();
  const { patientId } = useParams();

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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const getHeaders = () => {
    const token = localStorage.getItem("accessToken");

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
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
          data.detail ||
            "Unable to load patient record."
        );
      }

      setFormData({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        date_of_birth: data.date_of_birth || "",
        gender: data.gender || "",
        phone: data.phone || "",
        email: data.email || "",
        address: data.address || "",
        emergency_name:
          data.emergency_name || "",
        emergency_phone:
          data.emergency_phone || "",
        blood_group:
          data.blood_group || "",
        insurance: data.insurance || "",
      });
    } catch (error) {
      console.error(
        "EDIT PATIENT LOAD ERROR:",
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

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    setErrorMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `${API_BASE}/api/receptionist/patients/${patientId}/`,
        {
          method: "PATCH",
          headers: getHeaders(),
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to update patient."
        );
      }

      navigate(`/patients/${patientId}`);
    } catch (error) {
      console.error(
        "PATIENT UPDATE ERROR:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to update patient."
      );
    } finally {
      setSaving(false);
    }
  };

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

  if (errorMessage && !formData.first_name) {
    return (
      <div className="container-fluid px-3 px-md-4 py-4">
        <div
          className="card border-0 shadow-sm"
          style={{
            maxWidth: "700px",
            margin: "60px auto",
          }}
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
              {errorMessage}
            </p>

            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() =>
                navigate("/patients")
              }
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back to Patients
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-3 px-md-4 py-4">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            Update Patient
          </h2>

          <p className="text-muted mb-0">
            Update the patient's information below.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() =>
            navigate(
              `/patients/${patientId}`
            )
          }
          disabled={saving}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Patient
        </button>
      </div>

      {/* =========================
          ERROR MESSAGE
      ========================= */}

      {errorMessage && (
        <div
          className="alert alert-danger d-flex align-items-start shadow-sm mb-4"
          role="alert"
        >
          <i className="bi bi-exclamation-triangle-fill me-2 mt-1"></i>

          <div>
            <strong>Update failed</strong>

            <div className="small mt-1">
              {errorMessage}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>

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
                  Patient's basic information
                </small>
              </div>

            </div>
          </div>

          <div className="card-body p-4">

            <div className="row g-4">

              {/* First Name */}

              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  First Name{" "}
                  <span className="text-danger">*</span>
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
                    required
                  />

                </div>
              </div>

              {/* Last Name */}

              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Last Name{" "}
                  <span className="text-danger">*</span>
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
                    required
                  />

                </div>
              </div>

              {/* Date of Birth */}

              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Date of Birth{" "}
                  <span className="text-danger">*</span>
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
                  Gender{" "}
                  <span className="text-danger">*</span>
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

              {/* Phone */}

              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Phone Number{" "}
                  <span className="text-danger">*</span>
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
                  />

                </div>
              </div>

              {/* Address */}

              <div className="col-12">
                <label className="form-label fw-semibold">
                  Address{" "}
                  <span className="text-danger">*</span>
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
                    required
                  />

                </div>
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
                  Optional emergency contact information
                </small>
              </div>

            </div>

          </div>

          <div className="card-body p-4">

            <div className="row g-4">

              {/* Contact Name */}

              <div className="col-md-6">

                <label className="form-label fw-semibold">
                  Contact Name
                </label>

                <div className="input-group">

                  <span className="input-group-text bg-light">
                    <i className="bi bi-person"></i>
                  </span>

                  <input
                    type="text"
                    name="emergency_name"
                    value={formData.emergency_name}
                    onChange={handleChange}
                    className="form-control"
                  />

                </div>

              </div>

              {/* Contact Phone */}

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
                  />

                </div>

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

                    <option value="A+">
                      A+
                    </option>

                    <option value="A-">
                      A-
                    </option>

                    <option value="B+">
                      B+
                    </option>

                    <option value="B-">
                      B-
                    </option>

                    <option value="AB+">
                      AB+
                    </option>

                    <option value="AB-">
                      AB-
                    </option>

                    <option value="O+">
                      O+
                    </option>

                    <option value="O-">
                      O-
                    </option>

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
                  />

                </div>

              </div>

            </div>
          </div>
        </div>

        {/* =========================
            ACTIONS
        ========================= */}

        <div className="card border-0 shadow-sm">

          <div className="card-body p-4">

            <div className="d-flex flex-column flex-sm-row justify-content-end gap-2">

              <button
                type="button"
                className="btn btn-outline-secondary px-4"
                onClick={() =>
                  navigate(
                    `/patients/${patientId}`
                  )
                }
                disabled={saving}
              >
                <i className="bi bi-x-lg me-2"></i>
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary px-4"
                disabled={saving}
              >

                {saving ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>

                    Saving Changes...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check2-circle me-2"></i>
                    Save Changes
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

export default EditPatient;