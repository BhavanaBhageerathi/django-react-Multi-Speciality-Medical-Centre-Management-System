import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function PharmacistLayout() {
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
    if (!user) return "Pharmacist";

    return (
      user.name ||
      user.full_name ||
      user.username ||
      "Pharmacist"
    );
  };

  const getRole = () => {
    if (!user) return "Pharmacist";

    return user.role || "Pharmacist";
  };

  const isDashboard =
    location.pathname === "/pharmacist" ||
    location.pathname === "/pharmacist/";

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <>
      {/* ==========================================
          TOP NAVBAR
      ========================================== */}

      <nav className="navbar navbar-expand-lg bg-primary shadow-sm sticky-top">
        <div className="container-fluid px-3 px-md-4">

          {/* BRAND */}

          <div className="d-flex align-items-center">

            <div className="rounded-3 bg-white bg-opacity-25 p-2 me-2">
              <i className="bi bi-hospital text-white fs-4"></i>
            </div>

            <span className="navbar-brand text-white fw-bold mb-0">
              Clinic Management System
            </span>

          </div>

          {/* USER + LOGOUT */}

          <div className="d-flex align-items-center gap-3">

            <div className="d-none d-sm-flex align-items-center">

              <div className="rounded-circle bg-white bg-opacity-25 p-2 me-2">
                <i className="bi bi-person-fill text-white"></i>
              </div>

              <div className="text-end">

                <div className="fw-semibold small text-white">
                  {getUserName()}
                </div>

                <div className="small text-white text-opacity-75">
                  {getRole()}
                </div>

              </div>

            </div>

            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right me-1"></i>
              Logout
            </button>

          </div>

        </div>
      </nav>

      {/* ==========================================
          BACK BUTTON
      ========================================== */}

      {!isDashboard && (
        <div className="container-fluid px-3 px-md-4 pt-3">

          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={handleBack}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back
          </button>

        </div>
      )}

      {/* ==========================================
          PAGE CONTENT
      ========================================== */}

      <main>
        <Outlet />
      </main>
    </>
  );
}

export default PharmacistLayout;