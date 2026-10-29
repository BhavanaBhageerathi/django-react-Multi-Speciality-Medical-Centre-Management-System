import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./LabLayout.css";

function LabLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Unable to read user data:", error);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getUserName = () => {
    if (!user) return "Lab Technician";
    return (
      user.first_name ||
      user.name ||
      user.full_name ||
      user.username ||
      "Lab Technician"
    );
  };

  const getRole = () => {
    if (!user) return "LAB TECHNICIAN";
    return user.role || "LAB TECHNICIAN";
  };

  const isDashboard =
    location.pathname === "/lab-technician" ||
    location.pathname === "/lab-technician/";

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/lab-technician");
    }
  };

  return (
    <div className="min-vh-100 bg-light d-flex flex-column">
      {/* ==================================================
          BLUE GRADIENT NAVBAR
      ================================================== */}
      <nav
        className="navbar navbar-expand-lg sticky-top shadow-sm"
        style={{
          background:
            "linear-gradient(135deg, #0d6efd 0%, #0b5ed7 55%, #084298 100%)",
        }}
      >
        <div className="container-fluid px-3 px-md-4">
          {/* Brand */}
          <div
            className="d-flex align-items-center"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/lab-technician")}
          >
            <div
              className="rounded-3 d-flex align-items-center justify-content-center me-3"
              style={{
                width: "48px",
                height: "48px",
                backgroundColor: "rgba(255,255,255,0.18)",
              }}
            >
              <i className="bi bi-hospital text-white fs-4"></i>
            </div>

            <div>
              <div className="text-white fw-bold fs-5">
                Clinic Management System
              </div>
              <div
                className="text-white small"
                style={{ opacity: 0.8 }}
              >
                Lab Technician Dashboard
              </div>
            </div>
          </div>

          {/* Right side: User & Logout */}
          <div className="d-flex align-items-center gap-3">
            {/* User Details */}
            <div className="d-none d-sm-flex align-items-center text-white">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center me-2"
                style={{
                  width: "42px",
                  height: "42px",
                  backgroundColor: "rgba(255,255,255,0.2)",
                }}
              >
                <i className="bi bi-person-fill fs-5"></i>
              </div>

              <div>
                <div className="fw-semibold">{getUserName()}</div>
                <div
                  className="small"
                  style={{ opacity: 0.8 }}
                >
                  {getRole()}
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              type="button"
              className="btn btn-danger fw-semibold shadow-sm btn-sm"
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right me-2"></i>
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* ==================================================
          BACK BUTTON FOR SUBPAGES
      ================================================== */}
      {!isDashboard && (
        <div className="container-fluid px-3 px-md-4 pt-3">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={handleBack}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to Dashboard
          </button>
        </div>
      )}

      {/* ==================================================
          MAIN CONTENT OUTLET
      ================================================== */}
      <main className="flex-grow-1">
        <Outlet />
      </main>
    </div>
  );
}

export default LabLayout;
