import { useEffect, useMemo, useState } from "react";

function Medicines() {

    // =========================================================
    // STATE
    // =========================================================

    const [medicines, setMedicines] = useState([]);

    const [loading, setLoading] = useState(true);

    const [submitting, setSubmitting] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");

    const [showForm, setShowForm] = useState(false);

    const [message, setMessage] = useState("");

    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        generic_name: "",
        brand_name: "",
        formulation: "",
        strength: "",
        unit: "",
    });


    const API_URL =
        "http://127.0.0.1:8000/api/admin/medicines/";


    // =========================================================
    // TOKEN
    // =========================================================

    const getToken = () => {

        return localStorage.getItem(
            "accessToken"
        );

    };


    // =========================================================
    // FETCH MEDICINES
    // =========================================================

    const fetchMedicines = async () => {

        try {

            setLoading(true);

            setError("");

            const token = getToken();


            if (!token) {

                throw new Error(
                    "Authentication token not found. Please login again."
                );

            }


            const response =
                await fetch(API_URL, {

                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json",
                    },

                });


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    "Failed to fetch medicines."
                );

            }


            setMedicines(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (err) {

            console.error(
                "FETCH MEDICINES ERROR:",
                err
            );

            setError(
                err.message ||
                "Unable to load medicines."
            );

        } finally {

            setLoading(false);

        }

    };


    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {

        fetchMedicines();

    }, []);


    // =========================================================
    // FORM CHANGE
    // =========================================================

    const handleChange = (event) => {

        const {
            name,
            value
        } = event.target;


        setFormData(
            (previous) => ({
                ...previous,
                [name]: value,
            })
        );


        setMessage("");

        setError("");

    };


    // =========================================================
    // RESET FORM
    // =========================================================

    const resetForm = () => {

        setFormData({
            name: "",
            generic_name: "",
            brand_name: "",
            formulation: "",
            strength: "",
            unit: "",
        });

        setError("");

    };


    // =========================================================
    // OPEN / CLOSE FORM
    // =========================================================

    const toggleForm = () => {

        setShowForm(
            (previous) => !previous
        );

        setMessage("");

        setError("");

    };


    // =========================================================
    // ADD MEDICINE
    // =========================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setMessage("");

        setError("");


        // -----------------------------------------------------
        // FRONTEND VALIDATION
        // -----------------------------------------------------

        if (!formData.name.trim()) {

            setError(
                "Medicine name is required."
            );

            return;

        }


        if (!formData.formulation.trim()) {

            setError(
                "Formulation is required."
            );

            return;

        }


        try {

            setSubmitting(true);


            const token = getToken();


            if (!token) {

                throw new Error(
                    "Authentication token not found. Please login again."
                );

            }


            const response =
                await fetch(API_URL, {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`,

                    },

                    body: JSON.stringify({

                        name:
                            formData.name.trim(),

                        generic_name:
                            formData.generic_name.trim(),

                        brand_name:
                            formData.brand_name.trim(),

                        formulation:
                            formData.formulation.trim(),

                        strength:
                            formData.strength.trim(),

                        unit:
                            formData.unit.trim(),

                        is_active: true,

                    }),

                });


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(

                    data.name?.[0] ||

                    data.detail ||

                    "Failed to create medicine."

                );

            }


            setMessage(
                "Medicine added successfully."
            );


            resetForm();

            await fetchMedicines();

        } catch (err) {

            console.error(
                "ADD MEDICINE ERROR:",
                err
            );

            setError(
                err.message ||
                "Unable to add medicine."
            );

        } finally {

            setSubmitting(false);

        }

    };


    // =========================================================
    // ACTIVATE / DEACTIVATE
    // =========================================================

    const toggleMedicine =
        async (medicine) => {

            setMessage("");

            setError("");


            const action =
                medicine.is_active
                    ? "deactivate"
                    : "activate";


            const confirmed =
                window.confirm(

                    `Are you sure you want to ${action} "${medicine.name}"?`

                );


            if (!confirmed) {

                return;

            }


            try {

                const token =
                    getToken();


                if (!token) {

                    throw new Error(
                        "Authentication token not found. Please login again."
                    );

                }


                const response =
                    await fetch(

                        `${API_URL}${medicine.id}/`,

                        {

                            method: "PATCH",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                Authorization:
                                    `Bearer ${token}`,

                            },

                            body:
                                JSON.stringify({

                                    is_active:
                                        !medicine.is_active,

                                }),

                        }

                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(

                        data.detail ||

                        "Failed to update medicine."

                    );

                }


                setMessage(

                    `Medicine ${
                        medicine.is_active
                            ? "deactivated"
                            : "activated"
                    } successfully.`

                );


                await fetchMedicines();

            } catch (err) {

                console.error(
                    "TOGGLE MEDICINE ERROR:",
                    err
                );

                setError(
                    err.message ||
                    "Unable to update medicine."
                );

            }

        };


    // =========================================================
    // LIVE SEARCH
    // =========================================================

    const filteredMedicines =
        useMemo(() => {

            const term =
                searchTerm
                    .trim()
                    .toLowerCase();


            if (!term) {

                return medicines;

            }


            return medicines.filter(
                (medicine) => {

                    return (

                        String(
                            medicine.id || ""
                        )
                            .toLowerCase()
                            .includes(term)

                        ||

                        String(
                            medicine.name || ""
                        )
                            .toLowerCase()
                            .includes(term)

                        ||

                        String(
                            medicine.generic_name || ""
                        )
                            .toLowerCase()
                            .includes(term)

                        ||

                        String(
                            medicine.brand_name || ""
                        )
                            .toLowerCase()
                            .includes(term)

                        ||

                        String(
                            medicine.formulation || ""
                        )
                            .toLowerCase()
                            .includes(term)

                        ||

                        String(
                            medicine.strength || ""
                        )
                            .toLowerCase()
                            .includes(term)

                        ||

                        String(
                            medicine.unit || ""
                        )
                            .toLowerCase()
                            .includes(term)

                    );

                }
            );

        }, [medicines, searchTerm]);


    // =========================================================
    // COUNTS
    // =========================================================

    const activeCount =
        medicines.filter(
            (medicine) =>
                medicine.is_active
        ).length;


    const inactiveCount =
        medicines.filter(
            (medicine) =>
                !medicine.is_active
        ).length;


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <div>

            {/* =================================================
                TOP ACTION
            ================================================= */}

            <div className="d-flex justify-content-end mb-4">

                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={toggleForm}
                >

                    <i
                        className={`bi ${
                            showForm
                                ? "bi-x-lg"
                                : "bi-capsule"
                        } me-2`}
                    ></i>

                    {showForm
                        ? "Close"
                        : "Add Medicine"}

                </button>

            </div>


            {/* =================================================
                SUCCESS MESSAGE
            ================================================= */}

            {message && (

                <div
                    className="alert alert-success alert-dismissible fade show"
                    role="alert"
                >

                    <i className="bi bi-check-circle-fill me-2"></i>

                    {message}

                    <button
                        type="button"
                        className="btn-close"
                        onClick={() =>
                            setMessage("")
                        }
                    ></button>

                </div>

            )}


            {/* =================================================
                ERROR MESSAGE
            ================================================= */}

            {error && (

                <div
                    className="alert alert-danger alert-dismissible fade show"
                    role="alert"
                >

                    <i className="bi bi-exclamation-triangle-fill me-2"></i>

                    {error}

                    <button
                        type="button"
                        className="btn-close"
                        onClick={() =>
                            setError("")
                        }
                    ></button>

                </div>

            )}


            {/* =================================================
                ADD MEDICINE FORM
            ================================================= */}

            {showForm && (

                <div
                    className="card border-0 shadow-sm mb-4"
                >

                    <div className="card-header bg-white py-3">

                        <h5 className="fw-bold mb-1">

                            <i className="bi bi-capsule me-2 text-primary"></i>

                            Add Medicine

                        </h5>

                        <p className="text-muted mb-0 small">

                            Enter the medicine details below.

                        </p>

                    </div>


                    <div className="card-body">

                        <form
                            onSubmit={handleSubmit}
                        >

                            <div className="row g-3">


                                {/* MEDICINE NAME */}

                                <div className="col-12 col-md-6 col-lg-4">

                                    <label
                                        className="form-label fw-semibold"
                                    >

                                        Medicine Name

                                        <span className="text-danger">
                                            {" "}*
                                        </span>

                                    </label>


                                    <input
                                        type="text"
                                        className="form-control"
                                        name="name"
                                        placeholder="e.g. Paracetamol"
                                        value={
                                            formData.name
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                </div>


                                {/* GENERIC NAME */}

                                <div className="col-12 col-md-6 col-lg-4">

                                    <label
                                        className="form-label fw-semibold"
                                    >

                                        Generic Name

                                    </label>


                                    <input
                                        type="text"
                                        className="form-control"
                                        name="generic_name"
                                        placeholder="e.g. Paracetamol"
                                        value={
                                            formData.generic_name
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                </div>


                                {/* BRAND NAME */}

                                <div className="col-12 col-md-6 col-lg-4">

                                    <label
                                        className="form-label fw-semibold"
                                    >

                                        Brand Name

                                    </label>


                                    <input
                                        type="text"
                                        className="form-control"
                                        name="brand_name"
                                        placeholder="e.g. Crocin"
                                        value={
                                            formData.brand_name
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                </div>


                                {/* FORMULATION */}

                                <div className="col-12 col-md-6 col-lg-4">

                                    <label
                                        className="form-label fw-semibold"
                                    >

                                        Formulation

                                        <span className="text-danger">
                                            {" "}*
                                        </span>

                                    </label>


                                    <select
                                        className="form-select"
                                        name="formulation"
                                        value={
                                            formData.formulation
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    >

                                        <option value="">
                                            Select formulation
                                        </option>

                                        <option value="Tablet">
                                            Tablet
                                        </option>

                                        <option value="Capsule">
                                            Capsule
                                        </option>

                                        <option value="Syrup">
                                            Syrup
                                        </option>

                                        <option value="Injection">
                                            Injection
                                        </option>

                                        <option value="Cream">
                                            Cream
                                        </option>

                                        <option value="Ointment">
                                            Ointment
                                        </option>

                                        <option value="Drops">
                                            Drops
                                        </option>

                                        <option value="Inhaler">
                                            Inhaler
                                        </option>

                                        <option value="Suspension">
                                            Suspension
                                        </option>

                                    </select>

                                </div>


                                {/* STRENGTH */}

                                <div className="col-12 col-md-6 col-lg-4">

                                    <label
                                        className="form-label fw-semibold"
                                    >

                                        Strength

                                    </label>


                                    <input
                                        type="text"
                                        className="form-control"
                                        name="strength"
                                        placeholder="e.g. 500"
                                        value={
                                            formData.strength
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                </div>


                                {/* UNIT */}

                                <div className="col-12 col-md-6 col-lg-4">

                                    <label
                                        className="form-label fw-semibold"
                                    >

                                        Unit

                                    </label>


                                    <select
                                        className="form-select"
                                        name="unit"
                                        value={
                                            formData.unit
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >

                                        <option value="">
                                            Select unit
                                        </option>

                                        <option value="mg">
                                            mg
                                        </option>

                                        <option value="g">
                                            g
                                        </option>

                                        <option value="mcg">
                                            mcg
                                        </option>

                                        <option value="ml">
                                            ml
                                        </option>

                                        <option value="%">
                                            %
                                        </option>

                                    </select>

                                </div>

                            </div>


                            {/* FORM BUTTONS */}

                            <div className="d-flex flex-wrap gap-2 mt-4">

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={
                                        submitting
                                    }
                                >

                                    {submitting ? (

                                        <>

                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                            ></span>

                                            Adding...

                                        </>

                                    ) : (

                                        <>

                                            <i className="bi bi-plus-lg me-2"></i>

                                            Add Medicine

                                        </>

                                    )}

                                </button>


                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={
                                        resetForm
                                    }
                                    disabled={
                                        submitting
                                    }
                                >

                                    <i className="bi bi-arrow-counterclockwise me-2"></i>

                                    Clear

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* =================================================
                SEARCH + SUMMARY
            ================================================= */}

            <div
                className="card border-0 shadow-sm mb-4"
            >

                <div className="card-body">

                    <div className="row g-3 align-items-center">


                        {/* SEARCH */}

                        <div className="col-12 col-lg-8">

                            <div className="input-group">

                                <span className="input-group-text bg-white">

                                    <i className="bi bi-search"></i>

                                </span>


                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search by medicine name, generic name, brand, formulation..."
                                    value={
                                        searchTerm
                                    }
                                    onChange={(event) =>
                                        setSearchTerm(
                                            event.target.value
                                        )
                                    }
                                />


                                {searchTerm && (

                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() =>
                                            setSearchTerm("")
                                        }
                                        title="Clear search"
                                    >

                                        <i className="bi bi-x-lg"></i>

                                    </button>

                                )}

                            </div>


                            <small className="text-muted d-block mt-2">

                                Results update automatically while typing.

                            </small>

                        </div>


                        {/* COUNTS */}

                        <div className="col-12 col-lg-4">

                            <div className="d-flex justify-content-lg-end gap-2 flex-wrap">

                                <span className="badge bg-primary fs-6 px-3 py-2">

                                    <i className="bi bi-capsule me-2"></i>

                                    {searchTerm
                                        ? `${filteredMedicines.length} / ${medicines.length}`
                                        : medicines.length}

                                    {" "}Medicines

                                </span>


                                <span className="badge bg-success fs-6 px-3 py-2">

                                    {activeCount} Active

                                </span>


                                <span className="badge bg-secondary fs-6 px-3 py-2">

                                    {inactiveCount} Inactive

                                </span>

                            </div>

                        </div>

                    </div>

                </div>

            </div>


            {/* =================================================
                MEDICINE LIST
            ================================================= */}

            <div
                className="card border-0 shadow-sm"
            >

                <div
                    className="card-header bg-white py-3"
                >

                    <div className="d-flex justify-content-between align-items-center">

                        <div>

                            <h5 className="fw-bold mb-1">

                                Medicine List

                            </h5>

                            <p className="text-muted mb-0 small">

                                All medicines registered in the Medicine Master.

                            </p>

                        </div>


                        <i className="bi bi-capsule-pill fs-3 text-primary"></i>

                    </div>

                </div>


                <div className="card-body p-0">


                    {/* LOADING */}

                    {loading ? (

                        <div className="text-center py-5">

                            <div
                                className="spinner-border text-primary mb-3"
                                role="status"
                            ></div>


                            <p className="text-muted mb-0">

                                Loading medicines...

                            </p>

                        </div>

                    )


                    /* EMPTY */

                    : filteredMedicines.length === 0 ? (

                        <div className="text-center py-5 px-3">

                            <i className="bi bi-capsule fs-1 text-muted"></i>


                            <h5 className="mt-3">

                                No medicines found

                            </h5>


                            <p className="text-muted mb-0">

                                {searchTerm
                                    ? "No medicines match your search."
                                    : "Add your first medicine using the button above."}

                            </p>

                        </div>

                    )


                    /* TABLE */

                    : (

                        <div className="table-responsive">

                            <table className="table table-hover align-middle mb-0">

                                <thead className="table-light">

                                    <tr>

                                        <th className="px-3">
                                            ID
                                        </th>

                                        <th>
                                            Medicine
                                        </th>

                                        <th>
                                            Generic Name
                                        </th>

                                        <th>
                                            Brand
                                        </th>

                                        <th>
                                            Formulation
                                        </th>

                                        <th>
                                            Strength
                                        </th>

                                        <th>
                                            Unit
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th className="text-center">
                                            Action
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredMedicines.map(
                                        (medicine) => (

                                            <tr
                                                key={
                                                    medicine.id
                                                }
                                            >

                                                {/* ID */}

                                                <td className="px-3 text-muted">

                                                    #{medicine.id}

                                                </td>


                                                {/* NAME */}

                                                <td>

                                                    <div className="d-flex align-items-center">

                                                        <div
                                                            className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center me-2"
                                                            style={{
                                                                width: "38px",
                                                                height: "38px",
                                                            }}
                                                        >

                                                            <i className="bi bi-capsule"></i>

                                                        </div>


                                                        <strong>

                                                            {
                                                                medicine.name
                                                            }

                                                        </strong>

                                                    </div>

                                                </td>


                                                {/* GENERIC */}

                                                <td>

                                                    {
                                                        medicine.generic_name ||
                                                        "-"
                                                    }

                                                </td>


                                                {/* BRAND */}

                                                <td>

                                                    {
                                                        medicine.brand_name ||
                                                        "-"
                                                    }

                                                </td>


                                                {/* FORMULATION */}

                                                <td>

                                                    <span className="badge bg-light text-dark border">

                                                        {
                                                            medicine.formulation
                                                        }

                                                    </span>

                                                </td>


                                                {/* STRENGTH */}

                                                <td>

                                                    {
                                                        medicine.strength ||
                                                        "-"
                                                    }

                                                </td>


                                                {/* UNIT */}

                                                <td>

                                                    {
                                                        medicine.unit ||
                                                        "-"
                                                    }

                                                </td>


                                                {/* STATUS */}

                                                <td>

                                                    {medicine.is_active ? (

                                                        <span className="badge bg-success">

                                                            <i className="bi bi-check-circle me-1"></i>

                                                            Active

                                                        </span>

                                                    ) : (

                                                        <span className="badge bg-secondary">

                                                            <i className="bi bi-x-circle me-1"></i>

                                                            Inactive

                                                        </span>

                                                    )}

                                                </td>


                                                {/* ACTION */}

                                                <td className="text-center">

                                                    <button
                                                        type="button"
                                                        className={`btn btn-sm ${
                                                            medicine.is_active
                                                                ? "btn-outline-danger"
                                                                : "btn-outline-success"
                                                        }`}
                                                        onClick={() =>
                                                            toggleMedicine(
                                                                medicine
                                                            )
                                                        }
                                                        title={
                                                            medicine.is_active
                                                                ? "Deactivate medicine"
                                                                : "Activate medicine"
                                                        }
                                                    >

                                                        <i
                                                            className={`bi ${
                                                                medicine.is_active
                                                                    ? "bi-toggle-off"
                                                                    : "bi-toggle-on"
                                                            } me-1`}
                                                        ></i>


                                                        {medicine.is_active
                                                            ? "Deactivate"
                                                            : "Activate"}

                                                    </button>

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

export default Medicines;