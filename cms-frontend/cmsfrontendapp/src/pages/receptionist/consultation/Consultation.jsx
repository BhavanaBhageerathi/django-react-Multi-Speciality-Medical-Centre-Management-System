import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000";

function Consultation() {
  const navigate = useNavigate();
  const location = useLocation();

  const [patientType, setPatientType] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [department, setDepartment] = useState("");
  const [doctor, setDoctor] = useState("");

  const [appointmentTime, setAppointmentTime] = useState("");
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);

  const getToken = () => {
    return localStorage.getItem("accessToken");
  };

  const getHeaders = () => {
    const token = getToken();

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  // Uses local browser date instead of UTC date.
  const getTodayDate = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const formatTodayDate = () => {
    const today = new Date();

    return today.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(":");

    const date = new Date();

    date.setHours(Number(hours), Number(minutes), 0, 0);

    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const fetchPatients = async () => {
    setLoadingPatients(true);
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

      setPatients(
        Array.isArray(data)
          ? data
          : data.results || []
      );
    } catch (error) {
      console.error("PATIENT LOAD ERROR:", error);

      setErrorMessage(
        error.message || "Unable to load patients."
      );
    } finally {
      setLoadingPatients(false);
    }
  };

  const fetchDepartments = async () => {
    setLoadingDepartments(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `${API_BASE}/api/admin/departments/`,
        {
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to load departments."
        );
      }

      const departmentList =
        Array.isArray(data)
          ? data
          : data.results || [];

      setDepartments(
        departmentList.filter(
          (item) => item.is_active !== false
        )
      );
    } catch (error) {
      console.error(
        "DEPARTMENT LOAD ERROR:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to load departments."
      );
    } finally {
      setLoadingDepartments(false);
    }
  };

  const fetchDoctors = async (departmentId) => {
    if (!departmentId) {
      setDoctors([]);
      return;
    }

    setLoadingDoctors(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `${API_BASE}/api/admin/doctors/?department=${departmentId}`,
        {
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to load doctors."
        );
      }

      setDoctors(
        Array.isArray(data)
          ? data
          : data.results || []
      );
    } catch (error) {
      console.error(
        "DOCTOR LOAD ERROR:",
        error
      );

      setDoctors([]);

      setErrorMessage(
        error.message ||
          "Unable to load doctors."
      );
    } finally {
      setLoadingDoctors(false);
    }
  };

  const fetchAvailableSlots = async (doctorId) => {
    if (!doctorId) {
      setAvailableTimeSlots([]);
      return;
    }

    setLoadingSlots(true);
    setAppointmentTime("");
    setErrorMessage("");

    try {
      const today = getTodayDate();

      const response = await fetch(
        `${API_BASE}/api/receptionist/appointments/available-slots/?doctor=${doctorId}&date=${today}`,
        {
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to load available time slots."
        );
      }

      const slots = Array.isArray(data.slots)
        ? data.slots
        : [];

      setAvailableTimeSlots(
        slots.map((slot) => ({
          value: slot,
          label: formatTime(slot),
        }))
      );
    } catch (error) {
      console.error(
        "SLOT LOAD ERROR:",
        error
      );

      setAvailableTimeSlots([]);

      setErrorMessage(
        error.message ||
          "Unable to load available time slots."
      );
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    fetchPatients();
    fetchDepartments();
  }, []);

  // Get newly registered patient from RegisterPatient
  useEffect(() => {
    const newPatient = location.state?.newPatient;

    if (!newPatient) {
      return;
    }

    setPatientType("existing");
    setSelectedPatient(newPatient);

    const name = (
      `${newPatient.first_name || ""} ${
        newPatient.last_name || ""
      }`
    ).trim();

    setSearchTerm(name);

    setSuccessMessage(
      `Patient ${newPatient.patient_id} registered successfully. You can now book the consultation.`
    );

    navigate("/consultation", {
      replace: true,
      state: null,
    });
  }, [location.state, navigate]);

  useEffect(() => {
    if (department) {
      fetchDoctors(department);
    } else {
      setDoctors([]);
    }

    setDoctor("");
    setAppointmentTime("");
    setAvailableTimeSlots([]);
  }, [department]);

  useEffect(() => {
    if (doctor) {
      fetchAvailableSlots(doctor);
    } else {
      setAvailableTimeSlots([]);
      setAppointmentTime("");
    }
  }, [doctor]);

  const filteredPatients = patients.filter(
    (patient) => {
      const search = searchTerm
        .toLowerCase()
        .trim();

      if (!search) {
        return true;
      }

      const fullName = (
        `${patient.first_name || ""} ${
          patient.last_name || ""
        }`
      ).toLowerCase();

      const phone = String(
        patient.phone || ""
      );

      const patientId = String(
        patient.patient_id || ""
      ).toLowerCase();

      return (
        fullName.includes(search) ||
        phone.includes(search) ||
        patientId.includes(search)
      );
    }
  );

  const handlePatientTypeChange = (type) => {
    setPatientType(type);

    setSelectedPatient(null);
    setSearchTerm("");

    setDepartment("");
    setDoctor("");
    setAppointmentTime("");
    setAvailableTimeSlots([]);

    setSuccessMessage("");
    setErrorMessage("");
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);

    const name = (
      `${patient.first_name || ""} ${
        patient.last_name || ""
      }`
    ).trim();

    setSearchTerm(name);

    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleDepartmentChange = (event) => {
    const departmentId = event.target.value;

    setDepartment(departmentId);

    setDoctor("");
    setAppointmentTime("");
    setAvailableTimeSlots([]);

    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleDoctorChange = (event) => {
    const doctorId = event.target.value;

    setDoctor(doctorId);

    setAppointmentTime("");

    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleBookConsultation = async () => {
    setSuccessMessage("");
    setErrorMessage("");

    if (!patientType) {
      setErrorMessage(
        "Please select New Patient or Existing Patient."
      );
      return;
    }

    if (patientType === "new") {
      setErrorMessage(
        "Please register the new patient before booking the consultation."
      );
      return;
    }

    if (!selectedPatient) {
      setErrorMessage(
        "Please select an existing patient."
      );
      return;
    }

    if (!department) {
      setErrorMessage(
        "Please select a department."
      );
      return;
    }

    if (!doctor) {
      setErrorMessage(
        "Please select a doctor."
      );
      return;
    }

    if (!appointmentTime) {
      setErrorMessage(
        "Please select an appointment time."
      );
      return;
    }

    setBooking(true);

    try {
      const today = getTodayDate();

      const response = await fetch(
        `${API_BASE}/api/receptionist/appointments/`,
        {
          method: "POST",
          headers: getHeaders(),

          body: JSON.stringify({
            patient:
              selectedPatient.patient_id,

            doctor: Number(doctor),

            appointment_date: today,

            appointment_time: appointmentTime,

            appointment_type: "CONSULTATION",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to book consultation."
        );
      }

      setSuccessMessage(
        `Consultation booked successfully for today at ${formatTime(
          appointmentTime
        )}. Token Number: ${data.token_number}`
      );

      setAppointmentTime("");

      // Refresh slots after booking
      await fetchAvailableSlots(doctor);
    } catch (error) {
      console.error(
        "CONSULTATION BOOKING ERROR:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to book consultation."
      );
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="bg-light min-vh-100">
      {/* Page Content */}
      <main className="container-fluid px-3 px-md-4 py-4">

        {/* Page Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h2 className="fw-bold mb-1">
              Consultation
            </h2>

            <p className="text-muted mb-0">
              Book a consultation for the current day.
            </p>
          </div>

          {/* <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => navigate(-1)}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back
          </button> */}
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div
            className="alert alert-danger d-flex align-items-start shadow-sm"
            role="alert"
          >
            <i className="bi bi-exclamation-circle-fill me-2 fs-5"></i>

            <div>{errorMessage}</div>

            <button
              type="button"
              className="btn-close ms-auto"
              onClick={() => setErrorMessage("")}
            ></button>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div
            className="alert alert-success d-flex align-items-start shadow-sm"
            role="alert"
          >
            <i className="bi bi-check-circle-fill me-2 fs-5"></i>

            <div>{successMessage}</div>

            <button
              type="button"
              className="btn-close ms-auto"
              onClick={() => setSuccessMessage("")}
            ></button>
          </div>
        )}

        {/* Main Consultation Card */}
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body p-3 p-md-4 p-lg-5">

            {/* Step 1 - Patient Type */}
            <div className="mb-5">
              <div className="d-flex align-items-center mb-3">
                <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-3">
                  <i className="bi bi-person-plus-fill text-primary fs-5"></i>
                </div>

                <div>
                  <h5 className="fw-bold mb-0">
                    Patient Type
                  </h5>

                  <small className="text-muted">
                    Select whether the patient is new or already registered.
                  </small>
                </div>
              </div>

              <div className="row g-3">
                {/* New Patient */}
                <div className="col-12 col-md-6">
                  <button
                    type="button"
                    className={`w-100 text-start border rounded-4 p-4 bg-white ${
                      patientType === "new"
                        ? "border-primary shadow-sm"
                        : "border-light-subtle"
                    }`}
                    onClick={() =>
                      handlePatientTypeChange("new")
                    }
                  >
                    <div className="d-flex align-items-center">
                      <div className="rounded-3 bg-primary bg-opacity-10 p-3 me-3">
                        <i className="bi bi-person-plus-fill text-primary fs-4"></i>
                      </div>

                      <div>
                        <h6 className="fw-bold mb-1">
                          New Patient
                        </h6>

                        <small className="text-muted">
                          Register a new patient first
                        </small>
                      </div>

                      {patientType === "new" && (
                        <i className="bi bi-check-circle-fill text-primary ms-auto fs-5"></i>
                      )}
                    </div>
                  </button>
                </div>

                {/* Existing Patient */}
                <div className="col-12 col-md-6">
                  <button
                    type="button"
                    className={`w-100 text-start border rounded-4 p-4 bg-white ${
                      patientType === "existing"
                        ? "border-success shadow-sm"
                        : "border-light-subtle"
                    }`}
                    onClick={() =>
                      handlePatientTypeChange(
                        "existing"
                      )
                    }
                  >
                    <div className="d-flex align-items-center">
                      <div className="rounded-3 bg-success bg-opacity-10 p-3 me-3">
                        <i className="bi bi-person-check-fill text-success fs-4"></i>
                      </div>

                      <div>
                        <h6 className="fw-bold mb-1">
                          Existing Patient
                        </h6>

                        <small className="text-muted">
                          Search for a registered patient
                        </small>
                      </div>

                      {patientType === "existing" && (
                        <i className="bi bi-check-circle-fill text-success ms-auto fs-5"></i>
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* New Patient */}
            {patientType === "new" && (
              <div className="card border-0 bg-light rounded-4 mb-5">
                <div className="card-body p-4">
                  <div className="d-flex align-items-start">
                    <div className="rounded-3 bg-primary bg-opacity-10 p-3 me-3">
                      <i className="bi bi-person-plus text-primary fs-4"></i>
                    </div>

                    <div>
                      <h5 className="fw-bold mb-1">
                        New Patient Registration
                      </h5>

                      <p className="text-muted mb-3">
                        Please register the patient before
                        booking the consultation.
                      </p>

                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() =>
                          navigate(
                            "/patients/register?from=consultation"
                          )
                        }
                      >
                        <i className="bi bi-person-plus me-2"></i>
                        Register Patient
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Existing Patient */}
            {patientType === "existing" && (
              <div className="mb-5">
                <div className="d-flex align-items-center mb-3">
                  <div className="rounded-circle bg-success bg-opacity-10 p-2 me-3">
                    <i className="bi bi-search text-success fs-5"></i>
                  </div>

                  <div>
                    <h5 className="fw-bold mb-0">
                      Search Existing Patient
                    </h5>

                    <small className="text-muted">
                      Search using name, phone number, or patient ID.
                    </small>
                  </div>
                </div>

                <div className="position-relative">
                  <div className="input-group input-group-lg">
                    <span className="input-group-text bg-white">
                      <i className="bi bi-search text-muted"></i>
                    </span>

                    <input
                      type="text"
                      className="form-control"
                      placeholder={
                        loadingPatients
                          ? "Loading patients..."
                          : "Search by patient name, phone, or patient ID..."
                      }
                      value={searchTerm}
                      onChange={(event) => {
                        setSearchTerm(
                          event.target.value
                        );
                        setSelectedPatient(null);
                      }}
                      disabled={loadingPatients}
                    />

                    {loadingPatients && (
                      <span className="input-group-text bg-white">
                        <span
                          className="spinner-border spinner-border-sm text-primary"
                          role="status"
                        ></span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Search Results */}
                {searchTerm && !selectedPatient && (
                  <div className="card border-0 shadow-sm mt-3 rounded-4">
                    <div className="card-header bg-white border-0 pt-3 px-3">
                      <small className="text-muted fw-semibold">
                        Search Results
                      </small>
                    </div>

                    <div className="list-group list-group-flush">
                      {filteredPatients.length === 0 ? (
                        <div className="p-4 text-center text-muted">
                          <i className="bi bi-person-x fs-2 d-block mb-2"></i>
                          No matching patients found.
                        </div>
                      ) : (
                        filteredPatients.map(
                          (patient) => {
                            const name = (
                              `${patient.first_name || ""} ${
                                patient.last_name || ""
                              }`
                            ).trim();

                            return (
                              <button
                                key={patient.id}
                                type="button"
                                className="list-group-item list-group-item-action p-3"
                                onClick={() =>
                                  handlePatientSelect(
                                    patient
                                  )
                                }
                              >
                                <div className="d-flex align-items-center">
                                  <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-3">
                                    <i className="bi bi-person text-primary"></i>
                                  </div>

                                  <div className="flex-grow-1 text-start">
                                    <div className="fw-semibold">
                                      {name}
                                    </div>

                                    <small className="text-muted">
                                      <span className="me-3">
                                        <i className="bi bi-telephone me-1"></i>
                                        {patient.phone}
                                      </span>

                                      <span>
                                        <i className="bi bi-person-badge me-1"></i>
                                        {patient.patient_id}
                                      </span>
                                    </small>
                                  </div>

                                  <i className="bi bi-chevron-right text-muted"></i>
                                </div>
                              </button>
                            );
                          }
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Selected Patient */}
                {selectedPatient && (
                  <div className="card border-success border-opacity-25 bg-success bg-opacity-10 mt-3 rounded-4">
                    <div className="card-body p-4">
                      <div className="d-flex flex-column flex-sm-row align-items-sm-center">
                        <div className="rounded-circle bg-success bg-opacity-10 p-3 me-sm-3 mb-3 mb-sm-0">
                          <i className="bi bi-person-check-fill text-success fs-4"></i>
                        </div>

                        <div className="flex-grow-1">
                          <small className="text-success fw-semibold">
                            SELECTED PATIENT
                          </small>

                          <h5 className="fw-bold mb-1 mt-1">
                            {selectedPatient.first_name}{" "}
                            {selectedPatient.last_name}
                          </h5>

                          <div className="d-flex flex-wrap gap-3 text-muted small">
                            <span>
                              <i className="bi bi-person-badge me-1"></i>
                              {selectedPatient.patient_id}
                            </span>

                            <span>
                              <i className="bi bi-telephone me-1"></i>
                              {selectedPatient.phone}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary mt-3 mt-sm-0"
                          onClick={() => {
                            setSelectedPatient(null);
                            setSearchTerm("");
                          }}
                        >
                          <i className="bi bi-x-lg me-1"></i>
                          Change
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Consultation Details */}
            {patientType === "existing" &&
              selectedPatient && (
                <div className="mb-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="rounded-circle bg-info bg-opacity-10 p-2 me-3">
                      <i className="bi bi-calendar2-check text-info fs-5"></i>
                    </div>

                    <div>
                      <h5 className="fw-bold mb-0">
                        Consultation Details
                      </h5>

                      <small className="text-muted">
                        Select the department, doctor and available appointment time.
                      </small>
                    </div>
                  </div>

                  <div className="card border-0 bg-light rounded-4">
                    <div className="card-body p-4">

                      <div className="row g-4">

                        {/* Date */}
                        <div className="col-12 col-md-6">
                          <label className="form-label fw-semibold">
                            <i className="bi bi-calendar-event me-2 text-primary"></i>
                            Consultation Date
                          </label>

                          <input
                            type="text"
                            className="form-control form-control-lg bg-white"
                            value={formatTodayDate()}
                            readOnly
                          />

                          <div className="form-text">
                            Consultation is booked for today.
                          </div>
                        </div>

                        {/* Department */}
                        <div className="col-12 col-md-6">
                          <label className="form-label fw-semibold">
                            <i className="bi bi-building me-2 text-primary"></i>
                            Department
                          </label>

                          <select
                            className="form-select form-select-lg bg-white"
                            value={department}
                            onChange={
                              handleDepartmentChange
                            }
                            disabled={
                              loadingDepartments
                            }
                          >
                            <option value="">
                              {loadingDepartments
                                ? "Loading Departments..."
                                : "Select Department"}
                            </option>

                            {departments.map(
                              (item) => (
                                <option
                                  key={item.id}
                                  value={item.id}
                                >
                                  {item.name}
                                </option>
                              )
                            )}
                          </select>
                        </div>

                        {/* Doctor */}
                        <div className="col-12">
                          <label className="form-label fw-semibold">
                            <i className="bi bi-person-badge me-2 text-primary"></i>
                            Doctor
                          </label>

                          <select
                            className="form-select form-select-lg bg-white"
                            value={doctor}
                            onChange={
                              handleDoctorChange
                            }
                            disabled={
                              !department ||
                              loadingDoctors
                            }
                          >
                            <option value="">
                              {loadingDoctors
                                ? "Loading Doctors..."
                                : !department
                                ? "Select Department First"
                                : "Select Doctor"}
                            </option>

                            {doctors.map(
                              (item) => (
                                <option
                                  key={item.id}
                                  value={item.id}
                                >
                                  {item.name}
                                </option>
                              )
                            )}
                          </select>
                        </div>

                        {/* Available Time */}
                        {doctor && (
                          <div className="col-12">
                            <label className="form-label fw-semibold">
                              <i className="bi bi-clock me-2 text-primary"></i>
                              Available Time
                            </label>

                            {loadingSlots ? (
                              <div className="card border-0 bg-white">
                                <div className="card-body text-center py-4">
                                  <div
                                    className="spinner-border text-primary mb-2"
                                    role="status"
                                  ></div>

                                  <div className="text-muted">
                                    Loading available slots...
                                  </div>
                                </div>
                              </div>
                            ) : availableTimeSlots.length ===
                              0 ? (
                              <div className="alert alert-warning mb-0">
                                <i className="bi bi-clock-history me-2"></i>
                                No available slots for today.
                              </div>
                            ) : (
                              <div className="d-flex flex-wrap gap-2">
                                {availableTimeSlots.map(
                                  (slot) => {
                                    const isSelected =
                                      appointmentTime ===
                                      slot.value;

                                    return (
                                      <button
                                        key={slot.value}
                                        type="button"
                                        className={`btn ${
                                          isSelected
                                            ? "btn-primary"
                                            : "btn-outline-primary"
                                        } rounded-pill px-4 py-2`}
                                        onClick={() =>
                                          setAppointmentTime(
                                            slot.value
                                          )
                                        }
                                      >
                                        <i
                                          className={`bi ${
                                            isSelected
                                              ? "bi-check-circle-fill"
                                              : "bi-clock"
                                          } me-2`}
                                        ></i>

                                        {slot.label}
                                      </button>
                                    );
                                  }
                                )}
                              </div>
                            )}

                            {appointmentTime && (
                              <div className="mt-3">
                                <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2">
                                  <i className="bi bi-check-circle-fill me-2"></i>
                                  Selected Time:{" "}
                                  {formatTime(
                                    appointmentTime
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {/* Bottom Actions */}
            {patientType === "existing" &&
              selectedPatient && (
                <div className="d-flex flex-column-reverse flex-sm-row justify-content-end gap-2 pt-4 border-top mt-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary px-4"
                    onClick={() => navigate(-1)}
                    disabled={booking}
                  >
                    <i className="bi bi-x-lg me-2"></i>
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="btn btn-primary px-4"
                    onClick={
                      handleBookConsultation
                    }
                    disabled={booking}
                  >
                    {booking ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>
                        Booking...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-calendar-check me-2"></i>
                        Book Consultation
                      </>
                    )}
                  </button>
                </div>
              )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Consultation;