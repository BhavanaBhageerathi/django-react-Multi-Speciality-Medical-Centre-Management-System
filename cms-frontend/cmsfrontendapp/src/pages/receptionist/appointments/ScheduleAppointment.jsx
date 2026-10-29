import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000";

function ScheduleAppointment() {
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

  const [appointmentDate, setAppointmentDate] =
    useState("");
  const [availableTimeSlots, setAvailableTimeSlots] =
    useState([]);
  const [appointmentTime, setAppointmentTime] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");
  const [errorMessage, setErrorMessage] =
    useState("");

  const [loadingPatients, setLoadingPatients] =
    useState(false);
  const [loadingDepartments, setLoadingDepartments] =
    useState(false);
  const [loadingDoctors, setLoadingDoctors] =
    useState(false);
  const [loadingSlots, setLoadingSlots] =
    useState(false);
  const [booking, setBooking] =
    useState(false);

  const getHeaders = () => {
    const token =
      localStorage.getItem("accessToken");

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const getMinimumAppointmentDate = () => {
    const today = new Date();

    today.setDate(today.getDate() + 2);

    return today.toISOString().split("T")[0];
  };

  const getMaximumAppointmentDate = () => {
    const today = new Date();

    today.setFullYear(
      today.getFullYear() + 1
    );

    return today.toISOString().split("T")[0];
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(":");

    const date = new Date();

    date.setHours(
      Number(hours),
      Number(minutes),
      0,
      0
    );

    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  /* =========================
     FETCH PATIENTS
  ========================= */

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
          data.detail ||
            "Unable to load patients."
        );
      }

      setPatients(
        Array.isArray(data)
          ? data
          : data.results || []
      );
    } catch (error) {
      console.error(
        "PATIENT LOAD ERROR:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to load patients."
      );
    } finally {
      setLoadingPatients(false);
    }
  };

  /* =========================
     FETCH DEPARTMENTS
  ========================= */

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
          data.detail ||
            "Unable to load departments."
        );
      }

      const departmentList =
        Array.isArray(data)
          ? data
          : data.results || [];

      setDepartments(
        departmentList.filter(
          (item) =>
            item.is_active !== false
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

  /* =========================
     FETCH DOCTORS
  ========================= */

  const fetchDoctors = async (
    departmentId
  ) => {
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
          data.detail ||
            "Unable to load doctors."
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

  /* =========================
     FETCH AVAILABLE SLOTS
  ========================= */

  const fetchAvailableSlots = async (
    doctorId,
    date
  ) => {
    if (!doctorId || !date) {
      setAvailableTimeSlots([]);
      return;
    }

    setLoadingSlots(true);
    setAppointmentTime("");
    setErrorMessage("");

    try {
      const response = await fetch(
        `${API_BASE}/api/receptionist/appointments/available-slots/?doctor=${doctorId}&date=${date}`,
        {
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to load available slots."
        );
      }

      const slots = Array.isArray(
        data.slots
      )
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

  /* =========================
     INITIAL LOAD
  ========================= */

  useEffect(() => {
    fetchPatients();
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (department) {
      fetchDoctors(department);
    }
  }, [department]);

  useEffect(() => {
    if (doctor && appointmentDate) {
      fetchAvailableSlots(
        doctor,
        appointmentDate
      );
    }
  }, [doctor, appointmentDate]);

  /* =========================
     RETURN FROM PATIENT REGISTRATION
  ========================= */

  useEffect(() => {
    const newPatient =
      location.state?.newPatient;

    if (!newPatient) {
      return;
    }

    const timer = setTimeout(() => {
      setPatientType("existing");
      setSelectedPatient(newPatient);

      const name =
        `${newPatient.first_name || ""} ${
          newPatient.last_name || ""
        }`.trim();

      setSearchTerm(name);

      setSuccessMessage(
        `Patient ${newPatient.patient_id} registered successfully. You can now schedule the appointment.`
      );

      navigate("/appointments", {
        replace: true,
        state: null,
      });
    }, 0);

    return () => clearTimeout(timer);
  }, [location.state, navigate]);

  /* =========================
     FILTER PATIENTS
  ========================= */

  const filteredPatients =
    patients.filter((patient) => {
      const search = searchTerm
        .toLowerCase()
        .trim();

      if (!search) {
        return true;
      }

      const fullName =
        `${patient.first_name || ""} ${
          patient.last_name || ""
        }`.toLowerCase();

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
    });

  /* =========================
     PATIENT TYPE
  ========================= */

  const handlePatientTypeChange = (
    type
  ) => {
    setPatientType(type);
    setSelectedPatient(null);
    setSearchTerm("");

    setDepartment("");
    setDoctor("");

    setAppointmentDate("");
    setAppointmentTime("");
    setAvailableTimeSlots([]);

    setSuccessMessage("");
    setErrorMessage("");
  };

  /* =========================
     SELECT PATIENT
  ========================= */

  const handlePatientSelect = (
    patient
  ) => {
    setSelectedPatient(patient);

    const name =
      `${patient.first_name || ""} ${
        patient.last_name || ""
      }`.trim();

    setSearchTerm(name);
  };

  /* =========================
     DEPARTMENT CHANGE
  ========================= */

  const handleDepartmentChange = (
    event
  ) => {
    const departmentId =
      event.target.value;

    setDepartment(departmentId);
    setDoctor("");

    setAppointmentDate("");
    setAppointmentTime("");
    setAvailableTimeSlots([]);

    setSuccessMessage("");
    setErrorMessage("");
  };

  /* =========================
     DOCTOR CHANGE
  ========================= */

  const handleDoctorChange = (
    event
  ) => {
    setDoctor(event.target.value);

    setAppointmentDate("");
    setAppointmentTime("");
    setAvailableTimeSlots([]);

    setSuccessMessage("");
    setErrorMessage("");
  };

  /* =========================
     BOOK APPOINTMENT
  ========================= */

  const handleScheduleAppointment =
    async () => {
      setSuccessMessage("");
      setErrorMessage("");

      if (!patientType) {
        setErrorMessage(
          "Please select New Patient or Existing Patient."
        );
        return;
      }

      if (
        patientType === "existing" &&
        !selectedPatient
      ) {
        setErrorMessage(
          "Please select an existing patient."
        );
        return;
      }

      if (patientType === "new") {
        setErrorMessage(
          "Please register the new patient before scheduling the appointment."
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

      if (!appointmentDate) {
        setErrorMessage(
          "Please select an appointment date."
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
        const response = await fetch(
          `${API_BASE}/api/receptionist/appointments/`,
          {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({
              patient:
                selectedPatient.patient_id,
              doctor: Number(doctor),
              appointment_date:
                appointmentDate,
              appointment_time:
                appointmentTime,
              appointment_type: "PRIOR",
            }),
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail ||
              "Unable to book appointment."
          );
        }

        setSuccessMessage(
          `Appointment booked successfully. Token Number: ${data.token_number}`
        );

        setAppointmentTime("");

        await fetchAvailableSlots(
          doctor,
          appointmentDate
        );
      } catch (error) {
        console.error(
          "APPOINTMENT BOOKING ERROR:",
          error
        );

        setErrorMessage(
          error.message ||
            "Unable to book appointment."
        );
      } finally {
        setBooking(false);
      }
    };

  return (
    <div className="container-fluid px-3 px-md-4 py-4">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">

        <div>
          <h2 className="fw-bold mb-1">
            Schedule Appointment
          </h2>

          <p className="text-muted mb-0">
            Schedule an appointment for a patient.
          </p>
        </div>

        {/* <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() =>
            navigate("/receptionist")
          }
          disabled={booking}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Dashboard
        </button> */}

      </div>

      {/* =========================
          ALERTS
      ========================= */}

      {errorMessage && (
        <div
          className="alert alert-danger d-flex align-items-start shadow-sm mb-4"
          role="alert"
        >
          <i className="bi bi-exclamation-triangle-fill me-2 mt-1"></i>

          <div>
            <strong>Unable to continue</strong>

            <div className="small mt-1">
              {errorMessage}
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div
          className="alert alert-success d-flex align-items-start shadow-sm mb-4"
          role="alert"
        >
          <i className="bi bi-check-circle-fill me-2 mt-1"></i>

          <div>
            <strong>Appointment Status</strong>

            <div className="small mt-1">
              {successMessage}
            </div>
          </div>
        </div>
      )}

      {/* =========================
          PATIENT TYPE
      ========================= */}

      <div className="card border-0 shadow-sm mb-4">

        <div className="card-header bg-white border-bottom py-3">

          <div className="d-flex align-items-center">

            <div className="rounded-3 bg-primary bg-opacity-10 p-2 me-3">
              <i className="bi bi-person-plus text-primary fs-5"></i>
            </div>

            <div>
              <h5 className="fw-bold mb-0">
                Patient Type
              </h5>

              <small className="text-muted">
                Choose whether the patient is new or already registered.
              </small>
            </div>

          </div>

        </div>

        <div className="card-body p-4">

          <div className="row g-3">

            <div className="col-md-6">

              <button
                type="button"
                className={`btn w-100 py-3 ${
                  patientType === "new"
                    ? "btn-primary"
                    : "btn-outline-primary"
                }`}
                onClick={() =>
                  handlePatientTypeChange(
                    "new"
                  )
                }
              >
                <i className="bi bi-person-plus-fill me-2"></i>
                New Patient
              </button>

            </div>

            <div className="col-md-6">

              <button
                type="button"
                className={`btn w-100 py-3 ${
                  patientType === "existing"
                    ? "btn-primary"
                    : "btn-outline-primary"
                }`}
                onClick={() =>
                  handlePatientTypeChange(
                    "existing"
                  )
                }
              >
                <i className="bi bi-person-check-fill me-2"></i>
                Existing Patient
              </button>

            </div>

          </div>

        </div>
      </div>

      {/* =========================
          NEW PATIENT
      ========================= */}

      {patientType === "new" && (
        <div className="card border-0 shadow-sm mb-4">

          <div className="card-body p-4">

            <div className="text-center py-4">

              <div
                className="rounded-circle bg-primary bg-opacity-10 text-primary d-inline-flex align-items-center justify-content-center mb-3"
                style={{
                  width: "70px",
                  height: "70px",
                }}
              >
                <i className="bi bi-person-plus fs-2"></i>
              </div>

              <h5 className="fw-bold">
                Register New Patient
              </h5>

              <p className="text-muted mb-4">
                Please register the patient before scheduling the appointment.
              </p>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() =>
                  navigate(
                    "/patients/register?from=appointment"
                  )
                }
              >
                <i className="bi bi-person-plus-fill me-2"></i>
                Register Patient
              </button>

            </div>

          </div>
        </div>
      )}

      {/* =========================
          EXISTING PATIENT
      ========================= */}

      {patientType === "existing" && (
        <div className="card border-0 shadow-sm mb-4">

          <div className="card-header bg-white border-bottom py-3">

            <div className="d-flex align-items-center">

              <div className="rounded-3 bg-success bg-opacity-10 p-2 me-3">
                <i className="bi bi-search text-success fs-5"></i>
              </div>

              <div>
                <h5 className="fw-bold mb-0">
                  Search Existing Patient
                </h5>

                <small className="text-muted">
                  Search by patient name, phone number, or patient ID.
                </small>
              </div>

            </div>

          </div>

          <div className="card-body p-4">

            <div className="input-group">

              <span className="input-group-text bg-light">
                <i className="bi bi-search"></i>
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

              {searchTerm && (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedPatient(null);
                  }}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              )}

            </div>

            {/* Search Results */}

            {searchTerm &&
              !selectedPatient && (
                <div className="mt-3">

                  {filteredPatients.length ===
                  0 ? (
                    <div className="text-center py-4 text-muted">

                      <i className="bi bi-person-x fs-2 d-block mb-2"></i>

                      No matching patients found.

                    </div>
                  ) : (
                    <div className="list-group">

                      {filteredPatients.map(
                        (patient) => {
                          const name =
                            `${patient.first_name || ""} ${
                              patient.last_name || ""
                            }`.trim();

                          return (
                            <button
                              key={patient.id}
                              type="button"
                              className="list-group-item list-group-item-action"
                              onClick={() =>
                                handlePatientSelect(
                                  patient
                                )
                              }
                            >

                              <div className="d-flex align-items-center">

                                <div className="rounded-circle bg-primary bg-opacity-10 text-primary p-2 me-3">
                                  <i className="bi bi-person"></i>
                                </div>

                                <div className="text-start flex-grow-1">

                                  <div className="fw-semibold">
                                    {name}
                                  </div>

                                  <small className="text-muted">
                                    ID:{" "}
                                    {patient.patient_id}
                                    {" • "}
                                    Phone:{" "}
                                    {patient.phone}
                                  </small>

                                </div>

                                <i className="bi bi-chevron-right text-muted"></i>

                              </div>

                            </button>
                          );
                        }
                      )}

                    </div>
                  )}

                </div>
              )}

            {/* Selected Patient */}

            {selectedPatient && (
              <div className="card border border-primary border-opacity-25 bg-primary bg-opacity-10 mt-4">

                <div className="card-body">

                  <div className="d-flex flex-column flex-sm-row align-items-sm-center gap-3">

                    <div
                      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: "55px",
                        height: "55px",
                      }}
                    >
                      <i className="bi bi-person fs-4"></i>
                    </div>

                    <div className="flex-grow-1">

                      <div className="text-muted small">
                        Selected Patient
                      </div>

                      <h6 className="fw-bold mb-1">
                        {selectedPatient.first_name}{" "}
                        {selectedPatient.last_name}
                      </h6>

                      <small>
                        Patient ID:{" "}
                        <strong>
                          {selectedPatient.patient_id}
                        </strong>

                        {" • "}

                        Phone:{" "}
                        {selectedPatient.phone}
                      </small>

                    </div>

                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => {
                        setSelectedPatient(
                          null
                        );
                        setSearchTerm("");
                      }}
                    >
                      <i className="bi bi-arrow-repeat me-1"></i>
                      Change
                    </button>

                  </div>

                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* =========================
          APPOINTMENT DETAILS
      ========================= */}

      {patientType === "existing" &&
        selectedPatient && (
          <div className="card border-0 shadow-sm mb-4">

            <div className="card-header bg-white border-bottom py-3">

              <div className="d-flex align-items-center">

                <div className="rounded-3 bg-info bg-opacity-10 p-2 me-3">
                  <i className="bi bi-calendar-plus text-info fs-5"></i>
                </div>

                <div>
                  <h5 className="fw-bold mb-0">
                    Appointment Details
                  </h5>

                  <small className="text-muted">
                    Select department, doctor, date, and available time.
                  </small>
                </div>

              </div>

            </div>

            <div className="card-body p-4">

              <div className="row g-4">

                {/* Department */}

                <div className="col-md-6">

                  <label className="form-label fw-semibold">
                    Department
                  </label>

                  <div className="input-group">

                    <span className="input-group-text bg-light">
                      <i className="bi bi-building"></i>
                    </span>

                    <select
                      className="form-select"
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

                </div>

                {/* Doctor */}

                <div className="col-md-6">

                  <label className="form-label fw-semibold">
                    Doctor
                  </label>

                  <div className="input-group">

                    <span className="input-group-text bg-light">
                      <i className="bi bi-person-badge"></i>
                    </span>

                    <select
                      className="form-select"
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

                  {!department && (
                    <small className="text-muted">
                      Select a department first.
                    </small>
                  )}

                </div>

                {/* Date */}

                <div className="col-md-6">

                  <label className="form-label fw-semibold">
                    Appointment Date
                  </label>

                  <div className="input-group">

                    <span className="input-group-text bg-light">
                      <i className="bi bi-calendar3"></i>
                    </span>

                    <input
                      type="date"
                      className="form-control"
                      value={
                        appointmentDate
                      }
                      min={getMinimumAppointmentDate()}
                      max={getMaximumAppointmentDate()}
                      onChange={(event) =>
                        setAppointmentDate(
                          event.target.value
                        )
                      }
                    />

                  </div>

                  <small className="text-muted">
                    Appointment must be booked at least 2 days in advance and within one year.
                  </small>

                </div>

                {/* Time */}

                <div className="col-md-6">

                  <label className="form-label fw-semibold">
                    Appointment Time
                  </label>

                  <div className="input-group">

                    <span className="input-group-text bg-light">
                      <i className="bi bi-clock"></i>
                    </span>

                    <select
                      className="form-select"
                      value={
                        appointmentTime
                      }
                      onChange={(event) =>
                        setAppointmentTime(
                          event.target.value
                        )
                      }
                      disabled={
                        !doctor ||
                        !appointmentDate ||
                        loadingSlots
                      }
                    >

                      <option value="">
                        {loadingSlots
                          ? "Loading available slots..."
                          : !doctor ||
                            !appointmentDate
                          ? "Select doctor and date first"
                          : "Select Available Time"}
                      </option>

                      {availableTimeSlots.map(
                        (slot) => (
                          <option
                            key={slot.value}
                            value={slot.value}
                          >
                            {slot.label}
                          </option>
                        )
                      )}

                    </select>

                  </div>

                  {doctor &&
                    appointmentDate &&
                    !loadingSlots &&
                    availableTimeSlots.length ===
                      0 && (
                      <small className="text-danger">
                        No available slots for this date.
                      </small>
                    )}

                </div>

              </div>

              {/* Available Slot Cards */}

              {doctor &&
                appointmentDate &&
                availableTimeSlots.length >
                  0 && (
                  <div className="mt-4">

                    <label className="form-label fw-semibold">
                      Available Time Slots
                    </label>

                    <div className="d-flex flex-wrap gap-2">

                      {availableTimeSlots.map(
                        (slot) => (
                          <button
                            key={slot.value}
                            type="button"
                            className={`btn ${
                              appointmentTime ===
                              slot.value
                                ? "btn-primary"
                                : "btn-outline-primary"
                            }`}
                            onClick={() =>
                              setAppointmentTime(
                                slot.value
                              )
                            }
                          >
                            <i className="bi bi-clock me-1"></i>
                            {slot.label}
                          </button>
                        )
                      )}

                    </div>

                  </div>
                )}

            </div>
          </div>
        )}

      {/* =========================
          ACTIONS
      ========================= */}

      {patientType === "existing" &&
        selectedPatient && (
          <div className="card border-0 shadow-sm">

            <div className="card-body p-4">

              <div className="d-flex flex-column flex-sm-row justify-content-end gap-2">

                <button
                  type="button"
                  className="btn btn-outline-secondary px-4"
                  onClick={() =>
                    navigate(
                      "/receptionist"
                    )
                  }
                  disabled={booking}
                >
                  <i className="bi bi-x-lg me-2"></i>
                  Cancel
                </button>

                <button
                  type="button"
                  className="btn btn-primary px-4"
                  onClick={
                    handleScheduleAppointment
                  }
                  disabled={booking}
                >
                  {booking ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Booking...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-calendar-check me-2"></i>
                      Book Appointment
                    </>
                  )}
                </button>

              </div>

            </div>
          </div>
        )}

    </div>
  );
}

export default ScheduleAppointment;