import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000";

function AppointmentList() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);

  const [searchDate, setSearchDate] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const getHeaders = () => {
    const token =
      localStorage.getItem("accessToken");

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const formatTime = (time) => {
    if (!time) {
      return "-";
    }

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

  const formatStatus = (status) => {
    if (!status) {
      return "-";
    }

    return (
      status.charAt(0) +
      status.slice(1).toLowerCase()
    );
  };

  const getStatusClass = (status) => {
    const normalized =
      String(status || "").toLowerCase();

    if (normalized === "booked") {
      return "bg-primary";
    }

    if (normalized === "waiting") {
      return "bg-warning text-dark";
    }

    if (
      normalized === "in consultation"
    ) {
      return "bg-info text-dark";
    }

    if (normalized === "completed") {
      return "bg-success";
    }

    if (
      normalized === "cancelled" ||
      normalized === "canceled"
    ) {
      return "bg-danger";
    }

    return "bg-secondary";
  };

  const fetchAppointments = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `${API_BASE}/api/receptionist/appointments/`,
        {
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to load appointments."
        );
      }

      const appointmentList =
        Array.isArray(data)
          ? data
          : data.results || [];

      setAppointments(appointmentList);
    } catch (error) {
      console.error(
        "APPOINTMENT LIST ERROR:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to load appointments."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const filteredAppointments =
    appointments.filter((appointment) => {
      const appointmentDate =
        appointment.appointment_date;

      if (
        searchDate &&
        appointmentDate !== searchDate
      ) {
        return false;
      }

      if (
        fromDate &&
        appointmentDate < fromDate
      ) {
        return false;
      }

      if (
        toDate &&
        appointmentDate > toDate
      ) {
        return false;
      }

      return true;
    });

  const clearFilters = () => {
    setSearchDate("");
    setFromDate("");
    setToDate("");
  };

  return (
    <div className="container-fluid px-3 px-md-4 py-4">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">

        <div>
          <h2 className="fw-bold mb-1">
            Appointment Listing
          </h2>

          <p className="text-muted mb-0">
            View scheduled appointments and their current status.
          </p>
        </div>

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

      {/* =========================
          ERROR
      ========================= */}

      {errorMessage && (
        <div
          className="alert alert-danger d-flex align-items-start shadow-sm mb-4"
          role="alert"
        >
          <i className="bi bi-exclamation-triangle-fill me-2 mt-1"></i>

          <div>
            <strong>
              Unable to load appointments
            </strong>

            <div className="small mt-1">
              {errorMessage}
            </div>
          </div>
        </div>
      )}

      {/* =========================
          FILTER CARD
      ========================= */}

      <div className="card border-0 shadow-sm mb-4">

        <div className="card-header bg-white border-bottom py-3">

          <div className="d-flex align-items-center">

            <div className="rounded-3 bg-primary bg-opacity-10 p-2 me-3">
              <i className="bi bi-funnel text-primary fs-5"></i>
            </div>

            <div>
              <h5 className="fw-bold mb-0">
                Filter Appointments
              </h5>

              <small className="text-muted">
                Filter appointments by a specific date or date range.
              </small>
            </div>

          </div>

        </div>

        <div className="card-body p-4">

          <div className="row g-3 align-items-end">

            {/* Select Date */}

            <div className="col-md-4">

              <label className="form-label fw-semibold">
                Select Date
              </label>

              <div className="input-group">

                <span className="input-group-text bg-light">
                  <i className="bi bi-calendar3"></i>
                </span>

                <input
                  type="date"
                  className="form-control"
                  value={searchDate}
                  onChange={(event) =>
                    setSearchDate(
                      event.target.value
                    )
                  }
                />

              </div>

            </div>

            {/* From Date */}

            <div className="col-md-4">

              <label className="form-label fw-semibold">
                From Date
              </label>

              <div className="input-group">

                <span className="input-group-text bg-light">
                  <i className="bi bi-calendar-event"></i>
                </span>

                <input
                  type="date"
                  className="form-control"
                  value={fromDate}
                  onChange={(event) =>
                    setFromDate(
                      event.target.value
                    )
                  }
                />

              </div>

            </div>

            {/* To Date */}

            <div className="col-md-4">

              <label className="form-label fw-semibold">
                To Date
              </label>

              <div className="input-group">

                <span className="input-group-text bg-light">
                  <i className="bi bi-calendar-check"></i>
                </span>

                <input
                  type="date"
                  className="form-control"
                  value={toDate}
                  onChange={(event) =>
                    setToDate(
                      event.target.value
                    )
                  }
                />

              </div>

            </div>

          </div>

          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mt-4">

            <div className="text-muted small">
              <i className="bi bi-info-circle me-1"></i>

              {filteredAppointments.length}{" "}
              appointment
              {filteredAppointments.length !==
              1
                ? "s"
                : ""}{" "}
              found
            </div>

            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={clearFilters}
            >
              <i className="bi bi-x-circle me-2"></i>
              Clear Filters
            </button>

          </div>

        </div>
      </div>

      {/* =========================
          APPOINTMENTS CARD
      ========================= */}

      <div className="card border-0 shadow-sm">

        <div className="card-header bg-white border-bottom py-3">

          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">

            <div className="d-flex align-items-center">

              <div className="rounded-3 bg-success bg-opacity-10 p-2 me-3">
                <i className="bi bi-calendar2-check text-success fs-5"></i>
              </div>

              <div>
                <h5 className="fw-bold mb-0">
                  All Appointments
                </h5>

                <small className="text-muted">
                  Scheduled appointment records
                </small>
              </div>

            </div>

            <span className="badge bg-primary rounded-pill px-3 py-2">
              {filteredAppointments.length}{" "}
              Appointment
              {filteredAppointments.length !==
              1
                ? "s"
                : ""}
            </span>

          </div>

        </div>

        <div className="card-body p-0">

          {loading ? (
            <div className="text-center py-5">

              <div
                className="spinner-border text-primary mb-3"
                role="status"
              >
                <span className="visually-hidden">
                  Loading...
                </span>
              </div>

              <div className="text-muted">
                Loading appointments...
              </div>

            </div>
          ) : filteredAppointments.length ===
            0 ? (
            <div className="text-center py-5 px-3">

              <div
                className="rounded-circle bg-light d-inline-flex align-items-center justify-content-center mb-3"
                style={{
                  width: "70px",
                  height: "70px",
                }}
              >
                <i className="bi bi-calendar-x fs-2 text-muted"></i>
              </div>

              <h6 className="fw-bold">
                No appointments found
              </h6>

              <p className="text-muted mb-0">
                No appointments match the selected filters.
              </p>

            </div>
          ) : (
            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead className="table-light">

                  <tr>

                    <th className="px-3 py-3">
                      ID
                    </th>

                    <th className="py-3">
                      Patient
                    </th>

                    <th className="py-3">
                      Doctor
                    </th>

                    <th className="py-3">
                      Department
                    </th>

                    <th className="py-3">
                      Date
                    </th>

                    <th className="py-3">
                      Time
                    </th>

                    <th className="py-3">
                      Token
                    </th>

                    <th className="py-3">
                      Type
                    </th>

                    <th className="py-3 pe-3">
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredAppointments.map(
                    (appointment) => (
                      <tr
                        key={appointment.id}
                      >

                        {/* ID */}

                        <td className="px-3">

                          <span className="fw-semibold">
                            #{appointment.id}
                          </span>

                        </td>

                        {/* Patient */}

                        <td>

                          <div className="d-flex align-items-center">

                            <div className="rounded-circle bg-primary bg-opacity-10 text-primary p-2 me-2">
                              <i className="bi bi-person"></i>
                            </div>

                            <div>

                              <div className="fw-semibold">
                                {
                                  appointment.patient_name
                                }
                              </div>

                              <small className="text-muted">
                                {
                                  appointment.patient
                                }
                              </small>

                            </div>

                          </div>

                        </td>

                        {/* Doctor */}

                        <td>
                          <div className="d-flex align-items-center">

                            <i className="bi bi-person-badge text-primary me-2"></i>

                            <span>
                              {
                                appointment.doctor_name
                              }
                            </span>

                          </div>
                        </td>

                        {/* Department */}

                        <td>

                          <span className="text-muted">
                            {
                              appointment.department_name
                            }
                          </span>

                        </td>

                        {/* Date */}

                        <td>

                          <div className="d-flex align-items-center">

                            <i className="bi bi-calendar3 text-primary me-2"></i>

                            <span>
                              {
                                appointment.appointment_date
                              }
                            </span>

                          </div>

                        </td>

                        {/* Time */}

                        <td>

                          <div className="d-flex align-items-center">

                            <i className="bi bi-clock text-info me-2"></i>

                            <span>
                              {formatTime(
                                appointment.appointment_time
                              )}
                            </span>

                          </div>

                        </td>

                        {/* Token */}

                        <td>

                          <span className="badge bg-dark rounded-pill px-3 py-2">
                            #{appointment.token_number}
                          </span>

                        </td>

                        {/* Type */}

                        <td>

                          <span className="badge bg-light text-dark border">
                            {
                              appointment.appointment_type
                            }
                          </span>

                        </td>

                        {/* Status */}

                        <td className="pe-3">

                          <span
                            className={`badge rounded-pill px-3 py-2 ${getStatusClass(
                              appointment.status
                            )}`}
                          >
                            <i className="bi bi-circle-fill me-1 small"></i>

                            {formatStatus(
                              appointment.status
                            )}
                          </span>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>
      </div>

    </div>
  );
}

export default AppointmentList;