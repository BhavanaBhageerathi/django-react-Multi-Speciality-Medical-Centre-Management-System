import { Outlet, useLocation, useNavigate } from "react-router-dom";

const pageTitles = {
    "/admin": {
        title: "Admin Dashboard",
        subtitle: "Clinic Management System",
    },

    "/admin/staff": {
        title: "Staff Management",
        subtitle: "Add, search and manage clinic staff",
    },

    "/admin/departments": {
        title: "Department Management",
        subtitle: "Manage clinic departments",
    },

    "/admin/medicines": {
        title: "Medicine Master",
        subtitle: "Manage clinic medicines",
    },

    "/admin/lab-tests": {
        title: "Lab Test Master",
        subtitle: "Manage laboratory tests",
    },
};

function AdminLayout() {

    const navigate = useNavigate();
    const location = useLocation();

    let user = {};

    try {
        user = JSON.parse(localStorage.getItem("user")) || {};
    } catch {
        user = {};
    }

    const adminName =
        user.first_name ||
        user.username ||
        "Admin";

    const handleLogout = () => {

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        navigate("/login");
    };

    const isDashboard =
        location.pathname === "/admin";

    const currentPage =
        pageTitles[location.pathname] ||
        pageTitles["/admin"];

    const handleBack = () => {

        if (location.pathname !== "/admin") {
            navigate("/admin");
        }
    };

    return (
        <div className="min-vh-100 bg-light">

            {/* =====================================================
                TOP NAVBAR
            ===================================================== */}

            <nav className="navbar navbar-dark bg-primary shadow-sm">

                <div className="container-fluid px-3 px-md-4">

                    {/* BRAND */}

                    <button
                        type="button"
                        className="navbar-brand fw-bold border-0 bg-transparent text-white p-0"
                        onClick={() => navigate("/admin")}
                        style={{ cursor: "pointer" }}
                    >
                        <i className="bi bi-hospital me-2"></i>
                        Clinic Management System
                    </button>


                    {/* USER + LOGOUT */}

                    <div className="d-flex align-items-center gap-2 gap-md-4">

                        <span className="text-white d-none d-sm-inline">

                            <i className="bi bi-person-circle me-2"></i>

                            {adminName}

                        </span>


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


            {/* =====================================================
                MAIN CONTENT
            ===================================================== */}

            <main className="container-fluid px-3 px-md-4 px-lg-5 py-4">

                {/* BACK BUTTON */}

                {!isDashboard && (

                    <div className="mb-3">

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


                {/* PAGE HEADER */}

                {!isDashboard && (

                    <div className="mb-4">

                        <h1 className="fw-bold mb-1">

                            {currentPage.title}

                        </h1>

                        <p className="text-muted mb-0">

                            {currentPage.subtitle}

                        </p>

                    </div>

                )}


                {/* PAGE */}

                <Outlet />

            </main>

        </div>
    );
}

export default AdminLayout;