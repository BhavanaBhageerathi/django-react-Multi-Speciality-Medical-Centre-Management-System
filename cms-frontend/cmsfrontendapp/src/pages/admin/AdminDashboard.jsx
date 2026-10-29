import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function AdminDashboard() {

    const [staffCount, setStaffCount] = useState(0);
    const [medicineCount, setMedicineCount] = useState(0);
    const [labTestCount, setLabTestCount] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchCounts = async () => {

        const token =
            localStorage.getItem("accessToken");

        const headers = {
            Authorization: `Bearer ${token}`,
        };

        try {

            setLoading(true);
            setError("");

            const [
                staffResponse,
                medicineResponse,
                labTestResponse,
            ] = await Promise.all([

                fetch(
                    "http://127.0.0.1:8000/api/admin/staff/",
                    { headers }
                ),

                fetch(
                    "http://127.0.0.1:8000/api/admin/medicines/",
                    { headers }
                ),

                fetch(
                    "http://127.0.0.1:8000/api/admin/lab-tests/",
                    { headers }
                ),

            ]);


            if (
                !staffResponse.ok ||
                !medicineResponse.ok ||
                !labTestResponse.ok
            ) {

                throw new Error(
                    "Unable to load dashboard data."
                );
            }


            const staffData =
                await staffResponse.json();

            const medicineData =
                await medicineResponse.json();

            const labTestData =
                await labTestResponse.json();


            setStaffCount(
                Array.isArray(staffData)
                    ? staffData.length
                    : 0
            );

            setMedicineCount(
                Array.isArray(medicineData)
                    ? medicineData.length
                    : 0
            );

            setLabTestCount(
                Array.isArray(labTestData)
                    ? labTestData.length
                    : 0
            );

        } catch (err) {

            console.error(
                "ADMIN DASHBOARD ERROR:",
                err
            );

            setError(
                "Unable to load dashboard data."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        fetchCounts();

    }, []);


    const cards = [

        {
            title: "Staff",
            description:
                "Add, search and manage clinic staff.",
            icon: "bi-people",
            iconColor: "text-primary",
            button:
                "Manage Staff",
            buttonColor:
                "btn-primary",
            path:
                "/admin/staff",
            count:
                staffCount,
        },

        {
            title: "Departments",
            description:
                "Manage clinic departments.",
            icon: "bi-building",
            iconColor: "text-success",
            button:
                "Manage Departments",
            buttonColor:
                "btn-success",
            path:
                "/admin/departments",
            count:
                null,
        },

        {
            title: "Medicines",
            description:
                "Manage the medicine master list.",
            icon: "bi-capsule",
            iconColor: "text-danger",
            button:
                "Manage Medicines",
            buttonColor:
                "btn-danger",
            path:
                "/admin/medicines",
            count:
                medicineCount,
        },

        {
            title: "Lab Tests",
            description:
                "Manage laboratory tests.",
            icon: "bi-eyedropper",
            iconColor: "text-warning",
            button:
                "Manage Lab Tests",
            buttonColor:
                "btn-warning",
            path:
                "/admin/lab-tests",
            count:
                labTestCount,
        },

    ];


    return (

        <div>

            {/* =================================================
                WELCOME
            ================================================= */}

            <div className="mb-5">

                <h1 className="fw-bold">

                    Welcome, Admin! 👋

                </h1>

                <p className="text-muted fs-5">

                    Have a nice day. Here's your clinic overview.

                </p>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div
                    className="alert alert-danger d-flex align-items-center"
                    role="alert"
                >

                    <i className="bi bi-exclamation-triangle-fill me-2"></i>

                    {error}

                </div>

            )}


            {/* =================================================
                DASHBOARD CARDS
            ================================================= */}

            <div className="row g-4">

                {cards.map((card) => (

                    <div
                        className="col-12 col-md-6"
                        key={card.path}
                    >

                        <Link
                            to={card.path}
                            className="text-decoration-none"
                        >

                            <div
                                className="card border-0 shadow-sm h-100"
                                style={{
                                    transition:
                                        "transform 0.15s ease, box-shadow 0.15s ease",
                                }}
                            >

                                <div className="card-body p-4">

                                    <div className="d-flex justify-content-between align-items-start">

                                        {/* LEFT */}

                                        <div className="pe-3">

                                            <h5 className="fw-bold text-dark">

                                                {card.title}

                                            </h5>

                                            <p className="text-muted mb-0">

                                                {card.description}

                                            </p>

                                        </div>


                                        {/* ICON */}

                                        <div
                                            className={`fs-1 ${card.iconColor}`}
                                        >

                                            <i
                                                className={`bi ${card.icon}`}
                                            ></i>

                                        </div>

                                    </div>


                                    {/* COUNT */}

                                    {card.count !== null && (

                                        <div className="mt-3">

                                            <span className="fs-3 fw-bold text-dark">

                                                {loading
                                                    ? "..."
                                                    : card.count}

                                            </span>

                                            <span className="text-muted ms-2">

                                                total

                                            </span>

                                        </div>

                                    )}


                                    {/* BUTTON */}

                                    <button
                                        type="button"
                                        className={`btn ${card.buttonColor} mt-3`}
                                    >

                                        {card.button}

                                        <i className="bi bi-arrow-right ms-2"></i>

                                    </button>

                                </div>

                            </div>

                        </Link>

                    </div>

                ))}

            </div>

        </div>

    );
}

export default AdminDashboard;