import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

function Dashboard() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [bills, setBills] = useState([]);

  const [loading, setLoading] = useState(true);

  // --------------------------------------------------
  // Fetch Dashboard Data
  // --------------------------------------------------
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("accessToken");

        const headers = token
          ? {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            }
          : {
              "Content-Type": "application/json",
            };

        // Today's date
        const today = new Date()
          .toISOString()
          .split("T")[0];

        const [
          patientsResponse,
          appointmentsResponse,
          billsResponse,
        ] = await Promise.all([
          fetch(
            `${API_URL}/api/receptionist/patients/`,
            {
              headers,
            }
          ),

          fetch(
            `${API_URL}/api/receptionist/appointments/?date=${today}`,
            {
              headers,
            }
          ),

          fetch(
            `${API_URL}/api/receptionist/bills/`,
            {
              headers,
            }
          ),
        ]);

        // Patients
        if (patientsResponse.ok) {
          const patientsData =
            await patientsResponse.json();

          setPatients(
            Array.isArray(patientsData)
              ? patientsData
              : patientsData.results || []
          );
        }

        // Today's appointments
        if (appointmentsResponse.ok) {
          const appointmentsData =
            await appointmentsResponse.json();

          setAppointments(
            Array.isArray(appointmentsData)
              ? appointmentsData
              : appointmentsData.results || []
          );
        }

        // Bills
        if (billsResponse.ok) {
          const billsData =
            await billsResponse.json();

          setBills(
            Array.isArray(billsData)
              ? billsData
              : billsData.results || []
          );
        }
      } catch (error) {
        console.error(
          "Error loading dashboard:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // --------------------------------------------------
  // Date
  // --------------------------------------------------
  const currentDate = new Date();

  const formattedDate =
    currentDate.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  // --------------------------------------------------
  // Pending Bills
  // --------------------------------------------------
  const pendingBills = bills.filter(
    (bill) =>
      String(
        bill.payment_status || ""
      ).toUpperCase() !== "PAID"
  ).length;

  // --------------------------------------------------
  // Helpers
  // --------------------------------------------------
  const getPatientName = (appointment) => {
    return (
      appointment.patient_name ||
      appointment.patient?.name ||
      appointment.patient?.full_name ||
      appointment.patient ||
      "—"
    );
  };

  const getDoctorName = (appointment) => {
    return (
      appointment.doctor_name ||
      appointment.doctor?.name ||
      appointment.doctor?.full_name ||
      appointment.doctor ||
      "—"
    );
  };

  const getToken = (appointment, index) => {
    return (
      appointment.token ||
      appointment.token_number ||
      appointment.appointment_token ||
      `#${index + 1}`
    );
  };

  const getTime = (appointment) => {
    return (
      appointment.time ||
      appointment.appointment_time ||
      appointment.slot_time ||
      "—"
    );
  };

  const getStatus = (appointment) => {
    return appointment.status || "Scheduled";
  };

  const getStatusClass = (status) => {
    const value = String(status).toLowerCase();

    if (value === "completed") {
      return "bg-success-subtle text-success";
    }

    if (value === "pending") {
      return "bg-danger-subtle text-danger";
    }

    if (
      value === "cancelled" ||
      value === "canceled"
    ) {
      return "bg-secondary-subtle text-secondary";
    }

    return "bg-warning-subtle text-warning-emphasis";
  };

  // --------------------------------------------------
  // Dashboard Cards
  // --------------------------------------------------
  const services = [
    {
      title: "Patient Management",
      description:
        "Register and manage patients",
      icon: "bi-person-fill",
      iconColor: "text-primary",
      iconBg: "bg-primary-subtle",
      button: "View Patients",
      buttonClass: "btn-primary",
      path: "/patients",
    },
    {
      title: "Consultation",
      description:
        "Manage consultation details",
      icon: "bi-search-heart",
      iconColor: "text-success",
      iconBg: "bg-success-subtle",
      button: "Schedule Consultation",
      buttonClass: "btn-success",
      path: "/consultation",
    },
    {
      title: "Schedule Appointment",
      description:
        "Create a new appointment",
      icon: "bi-calendar-plus",
      iconColor: "text-danger",
      iconBg: "bg-danger-subtle",
      button: "Schedule Appointment",
      buttonClass: "btn-danger",
      path: "/appointments/schedule",
    },
    {
      title: "Appointment Listing",
      description:
        "View and manage appointments",
      icon: "bi-calendar3",
      iconColor: "text-purple",
      iconBg: "bg-purple-subtle",
      button: "View Appointments",
      buttonClass: "btn-primary",
      path: "/appointments/list",
    },
    {
      title: "Billing",
      description:
        "Manage patient billing",
      icon: "bi-coin",
      iconColor: "text-warning",
      iconBg: "bg-warning-subtle",
      button: "Manage Billing",
      buttonClass: "btn-warning",
      path: "/billing",
    },
  ];

  // --------------------------------------------------
  // Render
  // --------------------------------------------------
  return (
    <div className="bg-light min-vh-100">

      {/* MAIN CONTENT */}
      <div className="container-fluid px-3 px-md-5 py-4">

        {/* WELCOME SECTION */}
        <div className="row align-items-center mb-4">
          <div className="col-lg-8">
            <h2 className="fw-bold text-dark mb-2">
              Welcome back, Receptionist! 👋
            </h2>

            <p className="text-secondary fs-5 mb-0">
              Manage patients, appointments,
              and billing for a smooth clinic
              experience.
            </p>
          </div>

          <div className="col-lg-4 mt-3 mt-lg-0">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body d-flex align-items-center gap-3 py-3">
                <div
                  className="bg-primary-subtle text-primary rounded-4 d-flex align-items-center justify-content-center"
                  style={{
                    width: "55px",
                    height: "55px",
                  }}
                >
                  <i className="bi bi-calendar-date fs-3"></i>
                </div>

                <div>
                  <div className="fw-bold text-dark">
                    {formattedDate}
                  </div>

                  <div className="text-muted small">
                    Have a great day!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STATISTICS */}
        <div className="row g-4 mb-5">

          {/* Total Patients */}
          <div className="col-md-4">
            <div
              className="card border-0 shadow-sm rounded-4 h-100"
              style={{
                background:
                  "linear-gradient(135deg, #e8f2ff 0%, #dbeafe 100%)",
              }}
            >
              <div className="card-body p-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: "65px",
                        height: "65px",
                      }}
                    >
                      <i className="bi bi-people-fill fs-2"></i>
                    </div>

                    <div>
                      <div className="text-secondary small fw-semibold">
                        Total Patients
                      </div>

                      <div className="display-6 fw-bold text-dark">
                        {loading
                          ? "..."
                          : patients.length}
                      </div>

                      <div className="text-muted small">
                        Registered patients
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Appointments */}
          <div className="col-md-4">
            <div
              className="card border-0 shadow-sm rounded-4 h-100"
              style={{
                background:
                  "linear-gradient(135deg, #e8fff1 0%, #dcfce7 100%)",
              }}
            >
              <div className="card-body p-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: "65px",
                        height: "65px",
                      }}
                    >
                      <i className="bi bi-calendar-check-fill fs-2"></i>
                    </div>

                    <div>
                      <div className="text-secondary small fw-semibold">
                        Today's Appointments
                      </div>

                      <div className="display-6 fw-bold text-dark">
                        {loading
                          ? "..."
                          : appointments.length}
                      </div>

                      <div className="text-muted small">
                        Scheduled for today
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Bills */}
          <div className="col-md-4">
            <div
              className="card border-0 shadow-sm rounded-4 h-100"
              style={{
                background:
                  "linear-gradient(135deg, #fff9e6 0%, #fef3c7 100%)",
              }}
            >
              <div className="card-body p-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="bg-warning bg-opacity-25 text-warning-emphasis rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: "65px",
                        height: "65px",
                      }}
                    >
                      <i className="bi bi-receipt-cutoff fs-2"></i>
                    </div>

                    <div>
                      <div className="text-secondary small fw-semibold">
                        Pending Bills
                      </div>

                      <div className="display-6 fw-bold text-dark">
                        {loading
                          ? "..."
                          : pendingBills}
                      </div>

                      <div className="text-muted small">
                        Bills awaiting payment
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SERVICES */}
        <div className="mb-4">
          <h3 className="fw-bold text-dark mb-1">
            Receptionist Services
          </h3>

          <p className="text-muted mb-4">
            Quickly access your daily
            receptionist tasks.
          </p>

          <div className="row g-4">
            {services.map(
              (service, index) => (
                <div
                  key={service.title}
                  className={
                    index === 4
                      ? "col-md-6 offset-md-3"
                      : "col-md-6"
                  }
                >
                  <div
                    className="card border-0 shadow-sm rounded-4 h-100"
                    style={{
                      transition:
                        "transform 0.2s ease, box-shadow 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform =
                        "translateY(-4px)";

                      e.currentTarget.style.boxShadow =
                        "0 .75rem 1.5rem rgba(0,0,0,.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform =
                        "translateY(0)";

                      e.currentTarget.style.boxShadow =
                        "0 .125rem .25rem rgba(0,0,0,.075)";
                    }}
                  >
                    <div className="card-body p-4">

                      <div className="d-flex align-items-start justify-content-between mb-4">
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className={`${service.iconBg} ${service.iconColor} rounded-circle d-flex align-items-center justify-content-center`}
                            style={{
                              width: "68px",
                              height: "68px",
                              flexShrink: 0,
                            }}
                          >
                            <i
                              className={`bi ${service.icon} fs-2`}
                            ></i>
                          </div>

                          <div>
                            <h5 className="fw-bold mb-1">
                              {service.title}
                            </h5>

                            <p className="text-muted mb-0 small">
                              {service.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="d-flex justify-content-between align-items-center">
                        <button
                          type="button"
                          className={`btn ${service.buttonClass} px-3 py-2 fw-semibold`}
                          onClick={() =>
                            navigate(
                              service.path
                            )
                          }
                        >
                          {service.button}

                          <i className="bi bi-arrow-right ms-2"></i>
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* TODAY'S APPOINTMENTS */}
        <div className="card border-0 shadow-sm rounded-4 mt-5 mb-4">
          <div className="card-body p-3 p-md-4">

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "55px",
                    height: "55px",
                  }}
                >
                  <i className="bi bi-calendar-check fs-3"></i>
                </div>

                <div>
                  <h4 className="fw-bold mb-1">
                    Today's Appointments
                  </h4>

                  <p className="text-muted mb-0">
                    Patients scheduled for today.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-primary fw-semibold"
                onClick={() =>
                  navigate(
                    "/appointments/list"
                  )
                }
              >
                <i className="bi bi-list-ul me-2"></i>
                View All Appointments
              </button>
            </div>

            {/* Table */}
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr className="table-primary">
                    <th className="py-3 px-3">
                      Time
                    </th>

                    <th className="py-3">
                      Token
                    </th>

                    <th className="py-3">
                      Patient Name
                    </th>

                    <th className="py-3">
                      Doctor
                    </th>

                    <th className="py-3">
                      Status
                    </th>

                    <th className="py-3 text-center">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-5"
                      >
                        <div
                          className="spinner-border text-primary"
                          role="status"
                        >
                          <span className="visually-hidden">
                            Loading...
                          </span>
                        </div>

                        <div className="text-muted mt-2">
                          Loading appointments...
                        </div>
                      </td>
                    </tr>
                  ) : appointments.length ===
                    0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-5"
                      >
                        <div className="text-muted">
                          <i className="bi bi-calendar-x fs-1 d-block mb-2"></i>

                          No appointments
                          scheduled for today.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    appointments.map(
                      (
                        appointment,
                        index
                      ) => {
                        const status =
                          getStatus(
                            appointment
                          );

                        return (
                          <tr
                            key={
                              appointment.id ||
                              index
                            }
                          >
                            <td className="fw-semibold">
                              {getTime(
                                appointment
                              )}
                            </td>

                            <td>
                              <span className="badge bg-primary-subtle text-primary px-3 py-2">
                                {getToken(
                                  appointment,
                                  index
                                )}
                              </span>
                            </td>

                            <td className="fw-semibold">
                              {getPatientName(
                                appointment
                              )}
                            </td>

                            <td>
                              {getDoctorName(
                                appointment
                              )}
                            </td>

                            <td>
                              <span
                                className={`badge px-3 py-2 ${getStatusClass(
                                  status
                                )}`}
                              >
                                {status}
                              </span>
                            </td>

                            <td className="text-center">
                              <button
                                type="button"
                                className="btn btn-outline-primary btn-sm px-3"
                                onClick={() =>
                                  navigate(
                                    "/appointments/list"
                                  )
                                }
                              >
                                <i className="bi bi-eye me-1"></i>
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      }
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;