import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000";

function PatientList() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [disablingPatient, setDisablingPatient] = useState(null);

  const getHeaders = () => {
    const token = localStorage.getItem("accessToken");

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) {
      return "-";
    }

    const birthDate = new Date(dateOfBirth);
    const today = new Date();

    let age =
      today.getFullYear() -
      birthDate.getFullYear();

    const monthDifference =
      today.getMonth() -
      birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 &&
        today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const getPatientName = (patient) => {
    return (
      `${patient.first_name || ""} ${
        patient.last_name || ""
      }`
    ).trim();
  };

  const fetchPatients = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `${API_BASE}/api/receptionist/patients/`,
        {
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to load patients."
        );
      }

      const patientList = Array.isArray(data)
        ? data
        : data.results || [];

      setPatients(patientList);
    } catch (error) {
      console.error(
        "PATIENT LIST ERROR:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to load patients."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleDisablePatient = async (patient) => {
    const patientName =
      getPatientName(patient);

    const confirmed = window.confirm(
      `Are you sure you want to disable ${patientName} (${patient.patient_id})?`
    );

    if (!confirmed) {
      return;
    }

    setDisablingPatient(
      patient.patient_id
    );

    setErrorMessage("");

    try {
      const response = await fetch(
        `${API_BASE}/api/receptionist/patients/${patient.patient_id}/`,
        {
          method: "PATCH",
          headers: getHeaders(),
          body: JSON.stringify({
            is_active: false,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to disable patient."
        );
      }

      setPatients((currentPatients) =>
        currentPatients.map((item) =>
          item.patient_id ===
          patient.patient_id
            ? {
                ...item,
                is_active: false,
              }
            : item
        )
      );
    } catch (error) {
      console.error(
        "DISABLE PATIENT ERROR:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to disable patient."
      );
    } finally {
      setDisablingPatient(null);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const filteredPatients =
    patients.filter((patient) => {
      const search = searchTerm
        .toLowerCase()
        .trim();

      if (!search) {
        return true;
      }

      const name = getPatientName(patient)
        .toLowerCase();

      const phone = String(
        patient.phone || ""
      );

      const patientId = String(
        patient.patient_id || ""
      ).toLowerCase();

      return (
        name.includes(search) ||
        phone.includes(search) ||
        patientId.includes(search)
      );
    });

  const activePatients = patients.filter(
    (patient) =>
      patient.is_active !== false
  ).length;

  const inactivePatients = patients.filter(
    (patient) =>
      patient.is_active === false
  ).length;

  return (
    <div className="container-fluid px-3 px-md-4 py-4">

      {/* =====================================================
          PAGE HEADER
          ===================================================== */}

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">

        <div>
          <h2 className="fw-bold mb-1">
            Patient Management
          </h2>

          <p className="text-muted mb-0">
            View and manage registered patients.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary px-4"
          onClick={() =>
            navigate("/patients/register")
          }
        >
          <i className="bi bi-person-plus-fill me-2"></i>
          Register Patient
        </button>

      </div>


      {/* =====================================================
          SUMMARY CARDS
          ===================================================== */}

      <div className="row g-3 mb-4">

        {/* Total Patients */}

        <div className="col-12 col-md-4">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body d-flex align-items-center">

              <div className="rounded-3 bg-primary bg-opacity-10 p-3 me-3">
                <i className="bi bi-people-fill text-primary fs-3"></i>
              </div>

              <div>
                <div className="text-muted small">
                  Total Patients
                </div>

                <div className="fs-3 fw-bold">
                  {loading ? "—" : patients.length}
                </div>
              </div>

            </div>

          </div>

        </div>


        {/* Active Patients */}

        <div className="col-12 col-md-4">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body d-flex align-items-center">

              <div className="rounded-3 bg-success bg-opacity-10 p-3 me-3">
                <i className="bi bi-person-check-fill text-success fs-3"></i>
              </div>

              <div>
                <div className="text-muted small">
                  Active Patients
                </div>

                <div className="fs-3 fw-bold">
                  {loading ? "—" : activePatients}
                </div>
              </div>

            </div>

          </div>

        </div>


        {/* Inactive Patients */}

        <div className="col-12 col-md-4">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body d-flex align-items-center">

              <div className="rounded-3 bg-danger bg-opacity-10 p-3 me-3">
                <i className="bi bi-person-x-fill text-danger fs-3"></i>
              </div>

              <div>
                <div className="text-muted small">
                  Inactive Patients
                </div>

                <div className="fs-3 fw-bold">
                  {loading ? "—" : inactivePatients}
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          ERROR MESSAGE
          ===================================================== */}

      {errorMessage && (
        <div
          className="alert alert-danger d-flex align-items-center shadow-sm"
          role="alert"
        >
          <i className="bi bi-exclamation-triangle-fill me-2"></i>

          <div>
            {errorMessage}
          </div>
        </div>
      )}


      {/* =====================================================
          SEARCH + PATIENT TABLE
          ===================================================== */}

      <div className="card border-0 shadow-sm">

        {/* Card Header */}

        <div className="card-header bg-white border-0 pt-4 px-4">

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">

            <div>
              <h5 className="fw-bold mb-1">
                Registered Patients
              </h5>

              <p className="text-muted small mb-0">
                Search and manage patient records.
              </p>
            </div>


            {/* Search */}

            <div
              className="input-group"
              style={{
                maxWidth: "450px",
              }}
            >

              <span className="input-group-text bg-white">
                <i className="bi bi-search text-muted"></i>
              </span>

              <input
                type="text"
                className="form-control"
                placeholder={
                  loading
                    ? "Loading patients..."
                    : "Search by ID, name or phone..."
                }
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
                disabled={loading}
              />

              {searchTerm && (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={clearSearch}
                  title="Clear search"
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              )}

            </div>

          </div>

        </div>


        {/* Table */}

        <div className="card-body px-0">

          <div className="table-responsive">

            <table className="table table-hover align-middle mb-0">

              <thead className="table-light">

                <tr>

                  <th className="px-4">
                    Patient ID
                  </th>

                  <th>
                    Name
                  </th>

                  <th>
                    Age
                  </th>

                  <th>
                    Gender
                  </th>

                  <th>
                    Phone
                  </th>

                  <th>
                    Address
                  </th>

                  <th>
                    Status
                  </th>

                  <th className="text-center">
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {/* Loading */}

                {loading ? (

                  <tr>

                    <td
                      colSpan="8"
                      className="text-center py-5"
                    >

                      <div
                        className="spinner-border text-primary mb-3"
                        role="status"
                      >
                        <span className="visually-hidden">
                          Loading...
                        </span>
                      </div>

                      <div className="text-muted">
                        Loading patients...
                      </div>

                    </td>

                  </tr>

                ) : filteredPatients.length > 0 ? (

                  filteredPatients.map(
                    (patient) => {

                      const patientName =
                        getPatientName(
                          patient
                        );

                      const isActive =
                        patient.is_active !== false;

                      const isDisabling =
                        disablingPatient ===
                        patient.patient_id;

                      return (

                        <tr
                          key={patient.id}
                        >

                          {/* Patient ID */}

                          <td className="px-4">

                            <span className="fw-bold text-primary">
                              {patient.patient_id}
                            </span>

                          </td>


                          {/* Name */}

                          <td>

                            <div className="d-flex align-items-center">

                              <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-2">
                                <i className="bi bi-person-fill text-primary"></i>
                              </div>

                              <span className="fw-semibold">
                                {patientName || "-"}
                              </span>

                            </div>

                          </td>


                          {/* Age */}

                          <td>
                            {calculateAge(
                              patient.date_of_birth
                            )}
                          </td>


                          {/* Gender */}

                          <td>
                            {patient.gender || "-"}
                          </td>


                          {/* Phone */}

                          <td>
                            {patient.phone || "-"}
                          </td>


                          {/* Address */}

                          <td>
                            <span
                              className="d-inline-block text-truncate"
                              style={{
                                maxWidth: "180px",
                              }}
                              title={
                                patient.address || "-"
                              }
                            >
                              {patient.address || "-"}
                            </span>
                          </td>


                          {/* Status */}

                          <td>

                            {isActive ? (

                              <span className="badge rounded-pill text-bg-success">
                                <i className="bi bi-check-circle-fill me-1"></i>
                                Active
                              </span>

                            ) : (

                              <span className="badge rounded-pill text-bg-secondary">
                                <i className="bi bi-x-circle-fill me-1"></i>
                                Inactive
                              </span>

                            )}

                          </td>


                          {/* Actions */}

                          <td>

                            <div className="d-flex justify-content-center gap-2">

                              {/* View */}

                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                title="View patient"
                                onClick={() =>
                                  navigate(
                                    `/patients/${patient.patient_id}`
                                  )
                                }
                              >
                                <i className="bi bi-eye-fill"></i>
                              </button>


                              {/* Edit */}

                              <button
                                type="button"
                                className="btn btn-sm btn-outline-success"
                                title="Edit patient"
                                onClick={() =>
                                  navigate(
                                    `/patients/${patient.patient_id}/edit`
                                  )
                                }
                              >
                                <i className="bi bi-pencil-fill"></i>
                              </button>


                              {/* Disable */}

                              {isActive && (

                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  title="Disable patient"
                                  onClick={() =>
                                    handleDisablePatient(
                                      patient
                                    )
                                  }
                                  disabled={isDisabling}
                                >

                                  {isDisabling ? (

                                    <span
                                      className="spinner-border spinner-border-sm"
                                      role="status"
                                      aria-hidden="true"
                                    ></span>

                                  ) : (

                                    <i className="bi bi-person-x-fill"></i>

                                  )}

                                </button>

                              )}

                            </div>

                          </td>

                        </tr>

                      );
                    }
                  )

                ) : (

                  /* No Patients */

                  <tr>

                    <td
                      colSpan="8"
                      className="text-center py-5"
                    >

                      <div className="mb-3">

                        <i
                          className="bi bi-people text-muted"
                          style={{
                            fontSize: "3rem",
                          }}
                        ></i>

                      </div>

                      <h6 className="fw-bold">
                        No patients found
                      </h6>

                      <p className="text-muted mb-0">

                        {searchTerm
                          ? "Try a different search term."
                          : "No patients have been registered yet."}

                      </p>

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>


        {/* Footer */}

        {!loading && (
          <div className="card-footer bg-white border-0 px-4 py-3">

            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">

              <small className="text-muted">
                Showing{" "}
                <strong>
                  {filteredPatients.length}
                </strong>{" "}
                of{" "}
                <strong>
                  {patients.length}
                </strong>{" "}
                patients
              </small>

              {searchTerm && (
                <small className="text-primary">
                  <i className="bi bi-funnel-fill me-1"></i>
                  Search filter applied
                </small>
              )}

            </div>

          </div>
        )}

      </div>


      {/* =====================================================
          BACK TO DASHBOARD
          ===================================================== */}

      <div className="mt-4">

        {/* <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() =>
            navigate("/receptionist")
          }
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Dashboard
        </button> */}

      </div>

    </div>
  );
}

export default PatientList;