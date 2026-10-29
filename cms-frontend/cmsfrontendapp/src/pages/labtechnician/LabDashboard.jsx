import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LabDashboard.css";

function LabDashboard() {
  const navigate = useNavigate();

  const [prescriptionsCount, setPrescriptionsCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [inProgressCount, setInProgressCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [reportsCount, setReportsCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const technicianName =
    user.first_name ||
    user.name ||
    user.username ||
    "Lab Technician";

  const currentDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setError("You are not logged in. Please login again.");
      setLoading(false);
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    setLoading(true);
    setError("");

    try {
      const [pendingRes, completedRes, prescriptionsRes, reportsRes] =
        await Promise.allSettled([
          fetch("http://127.0.0.1:8000/api/lab-technician/pending-tests/", {
            headers,
          }),
          fetch("http://127.0.0.1:8000/api/lab-technician/completed-tests/", {
            headers,
          }),
          fetch(
            "http://127.0.0.1:8000/api/lab-technician/doctor-prescriptions/",
            { headers }
          ),
          fetch("http://127.0.0.1:8000/api/lab-technician/reports/", {
            headers,
          }),
        ]);

      // Pending and In Progress
      if (pendingRes.status === "fulfilled" && pendingRes.value.ok) {
        const pendingData = await pendingRes.value.json();
        if (Array.isArray(pendingData)) {
          setPendingCount(
            pendingData.filter((t) => t.status === "PENDING").length
          );
          setInProgressCount(
            pendingData.filter((t) => t.status === "IN_PROGRESS").length
          );
        }
      }

      // Completed
      if (completedRes.status === "fulfilled" && completedRes.value.ok) {
        const completedData = await completedRes.value.json();
        if (Array.isArray(completedData)) {
          setCompletedCount(completedData.length);
        }
      }

      // Prescriptions
      if (
        prescriptionsRes.status === "fulfilled" &&
        prescriptionsRes.value.ok
      ) {
        const prescData = await prescriptionsRes.value.json();
        if (Array.isArray(prescData)) {
          setPrescriptionsCount(prescData.length);
        }
      }

      // Reports
      if (reportsRes.status === "fulfilled" && reportsRes.value.ok) {
        const reportsData = await reportsRes.value.json();
        if (Array.isArray(reportsData)) {
          setReportsCount(reportsData.length);
        }
      }
    } catch (err) {
      console.error("LAB DASHBOARD ERROR:", err);
      setError("Unable to load complete dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const services = [
    {
      title: "Doctor Prescriptions",
      description:
        "View tests prescribed by doctors and allot them for lab testing.",
      icon: "bi-prescription2",
      iconColor: "text-primary",
      iconBg: "bg-primary-subtle",
      buttonText: "View Prescriptions",
      buttonClass: "btn-primary",
      path: "/lab-technician/doctor-prescriptions",
      badgeCount: prescriptionsCount,
    },
    {
      title: "Pending Tests",
      description:
        "View and process assigned laboratory tests awaiting sample or processing.",
      icon: "bi-hourglass-split",
      iconColor: "text-warning",
      iconBg: "bg-warning-subtle",
      buttonText: "Manage Pending Tests",
      buttonClass: "btn-warning text-dark",
      path: "/lab-technician/pending-tests",
      badgeCount: pendingCount,
    },
    {
      title: "Completed Tests",
      description:
        "Review previously completed tests, test observations, and patient results.",
      icon: "bi-check2-circle",
      iconColor: "text-success",
      iconBg: "bg-success-subtle",
      buttonText: "View Completed Tests",
      buttonClass: "btn-success",
      path: "/lab-technician/completed-tests",
      badgeCount: completedCount,
    },
    {
      title: "Laboratory Reports",
      description:
        "View, inspect, print, and manage generated laboratory diagnostic reports.",
      icon: "bi-file-earmark-medical",
      iconColor: "text-info",
      iconBg: "bg-info-subtle",
      buttonText: "Manage Reports",
      buttonClass: "btn-info text-white",
      path: "/lab-technician/reports",
      badgeCount: reportsCount,
    },
    {
      title: "Laboratory Billing",
      description:
        "Manage laboratory bills, verify charges, and record patient payments.",
      icon: "bi-receipt",
      iconColor: "text-purple",
      iconBg: "bg-purple-subtle",
      buttonText: "Manage Billing",
      buttonClass: "btn-primary",
      path: "/lab-technician/billing",
    },
    {
      title: "Test Management",
      description:
        "Search laboratory test master catalog, category, sample types, and fees.",
      icon: "bi-eyedropper",
      iconColor: "text-danger",
      iconBg: "bg-danger-subtle",
      buttonText: "View Test Master",
      buttonClass: "btn-danger",
      path: "/lab-technician/test-management",
    },
  ];

  return (
    <div className="container-fluid px-3 px-md-4 py-4">
      {/* ==================================================
          WELCOME & DATE BANNER
      ================================================== */}
      <div className="row align-items-center mb-4">
        <div className="col-lg-8">
          <h2 className="fw-bold text-dark mb-2">
            Welcome back, {technicianName}! 👋
          </h2>
          <p className="text-secondary fs-5 mb-0">
            Process doctor prescriptions, manage lab tests, enter test results,
            and generate laboratory reports.
          </p>
        </div>

        <div className="col-lg-4 mt-3 mt-lg-0">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body d-flex align-items-center gap-3 py-3">
              <div
                className="bg-primary-subtle text-primary rounded-4 d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: "52px", height: "52px" }}
              >
                <i className="bi bi-calendar2-week fs-4"></i>
              </div>
              <div>
                <div className="text-secondary small fw-semibold">
                  Today&apos;s Date
                </div>
                <div className="fw-bold text-dark">{currentDate}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div
          className="alert alert-danger d-flex align-items-center shadow-sm rounded-3 mb-4"
          role="alert"
        >
          <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
          <div>{error}</div>
        </div>
      )}

      {/* ==================================================
          STATISTICS OVERVIEW CARDS
      ================================================== */}
      <div className="row g-3 g-md-4 mb-5">
        {/* Prescriptions awaiting allotment */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div
            className="card border-0 shadow-sm rounded-4 h-100"
            style={{
              background:
                "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)",
            }}
          >
            <div className="card-body p-4 d-flex align-items-center justify-content-between">
              <div>
                <div className="text-secondary small fw-semibold mb-1">
                  Doctor Prescriptions
                </div>
                <div className="display-6 fw-bold text-dark">
                  {loading ? (
                    <span className="spinner-border spinner-border-sm text-primary"></span>
                  ) : (
                    prescriptionsCount
                  )}
                </div>
                <div className="small text-muted mt-1">Awaiting Allotment</div>
              </div>
              <div
                className="bg-primary bg-opacity-25 text-primary rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: "56px", height: "56px" }}
              >
                <i className="bi bi-prescription2 fs-3"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Tests */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div
            className="card border-0 shadow-sm rounded-4 h-100"
            style={{
              background:
                "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
            }}
          >
            <div className="card-body p-4 d-flex align-items-center justify-content-between">
              <div>
                <div className="text-secondary small fw-semibold mb-1">
                  Pending Tests
                </div>
                <div className="display-6 fw-bold text-warning-emphasis">
                  {loading ? (
                    <span className="spinner-border spinner-border-sm text-warning"></span>
                  ) : (
                    pendingCount
                  )}
                </div>
                <div className="small text-muted mt-1">Waiting Processing</div>
              </div>
              <div
                className="bg-warning bg-opacity-25 text-warning rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: "56px", height: "56px" }}
              >
                <i className="bi bi-hourglass-split fs-3"></i>
              </div>
            </div>
          </div>
        </div>

        {/* In Progress */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div
            className="card border-0 shadow-sm rounded-4 h-100"
            style={{
              background:
                "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
            }}
          >
            <div className="card-body p-4 d-flex align-items-center justify-content-between">
              <div>
                <div className="text-secondary small fw-semibold mb-1">
                  In Progress
                </div>
                <div className="display-6 fw-bold text-primary">
                  {loading ? (
                    <span className="spinner-border spinner-border-sm text-primary"></span>
                  ) : (
                    inProgressCount
                  )}
                </div>
                <div className="small text-muted mt-1">Under Testing</div>
              </div>
              <div
                className="bg-info bg-opacity-25 text-info rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: "56px", height: "56px" }}
              >
                <i className="bi bi-arrow-repeat fs-3"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Completed Tests */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div
            className="card border-0 shadow-sm rounded-4 h-100"
            style={{
              background:
                "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
            }}
          >
            <div className="card-body p-4 d-flex align-items-center justify-content-between">
              <div>
                <div className="text-secondary small fw-semibold mb-1">
                  Completed Tests
                </div>
                <div className="display-6 fw-bold text-success">
                  {loading ? (
                    <span className="spinner-border spinner-border-sm text-success"></span>
                  ) : (
                    completedCount
                  )}
                </div>
                <div className="small text-muted mt-1">Results Entered</div>
              </div>
              <div
                className="bg-success bg-opacity-25 text-success rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: "56px", height: "56px" }}
              >
                <i className="bi bi-check2-circle fs-3"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================
          SECTION TITLE
      ================================================== */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">Laboratory Services</h4>
          <p className="text-muted mb-0">
            Select a section to manage laboratory tests, results, and records
          </p>
        </div>

        <button
          className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
          onClick={fetchDashboardData}
          disabled={loading}
        >
          <i
            className={`bi bi-arrow-clockwise ${
              loading ? "spin-animation" : ""
            }`}
          ></i>
          Refresh Data
        </button>
      </div>

      {/* ==================================================
          SERVICES GRID
      ================================================== */}
      <div className="row g-4">
        {services.map((item) => (
          <div className="col-12 col-md-6 col-xl-4" key={item.path}>
            <div
              className="card border-0 shadow-sm rounded-4 h-100 lab-card-hover"
              onClick={() => navigate(item.path)}
              style={{ cursor: "pointer" }}
            >
              <div className="card-body p-4 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div
                      className={`${item.iconBg} ${item.iconColor} rounded-4 d-flex align-items-center justify-content-center`}
                      style={{ width: "54px", height: "54px" }}
                    >
                      <i className={`bi ${item.icon} fs-3`}></i>
                    </div>

                    {item.badgeCount !== undefined && item.badgeCount > 0 && (
                      <span className="badge bg-danger rounded-pill px-3 py-2">
                        {item.badgeCount} Active
                      </span>
                    )}
                  </div>

                  <h5 className="fw-bold text-dark mb-2">{item.title}</h5>

                  <p className="text-muted mb-4 small">{item.description}</p>
                </div>

                <div>
                  <Link
                    to={item.path}
                    className={`btn ${item.buttonClass} w-100 fw-semibold rounded-3 py-2 text-decoration-none`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {item.buttonText}
                    <i className="bi bi-arrow-right ms-2"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LabDashboard;
