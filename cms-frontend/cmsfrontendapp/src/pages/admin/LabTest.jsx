import { useEffect, useMemo, useState } from "react";

function LabTests() {

    // =========================================================
    // STATE
    // =========================================================

    const [labTests, setLabTests] = useState([]);

    const [loading, setLoading] = useState(true);

    const [submitting, setSubmitting] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");

    const [showForm, setShowForm] = useState(false);

    const [message, setMessage] = useState("");

    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        test_code: "",
        test_name: "",
        category: "",
        sample_type: "",
        price: "",
    });


    const API_URL =
        "http://127.0.0.1:8000/api/admin/lab-tests/";


    // =========================================================
    // TOKEN
    // =========================================================

    const getToken = () => {

        return localStorage.getItem(
            "accessToken"
        );

    };


    // =========================================================
    // FETCH LAB TESTS
    // =========================================================

    const fetchLabTests = async () => {

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
                    "Failed to fetch lab tests."
                );

            }


            setLabTests(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (err) {

            console.error(
                "FETCH LAB TESTS ERROR:",
                err
            );

            setError(
                err.message ||
                "Unable to load lab tests."
            );

        } finally {

            setLoading(false);

        }

    };


    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {

        fetchLabTests();

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
            test_code: "",
            test_name: "",
            category: "",
            sample_type: "",
            price: "",
        });

        setError("");

    };


    // =========================================================
    // TOGGLE ADD FORM
    // =========================================================

    const toggleForm = () => {

        setShowForm(
            (previous) => !previous
        );

        setMessage("");

        setError("");

    };


    // =========================================================
    // ADD LAB TEST
    // =========================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setMessage("");

        setError("");


        // -----------------------------------------------------
        // VALIDATION
        // -----------------------------------------------------

        if (!formData.test_code.trim()) {

            setError(
                "Test code is required."
            );

            return;

        }


        if (!formData.test_name.trim()) {

            setError(
                "Test name is required."
            );

            return;

        }


        if (!formData.price) {

            setError(
                "Price is required."
            );

            return;

        }


        if (
            Number(formData.price) < 0
        ) {

            setError(
                "Price cannot be negative."
            );

            return;

        }


        try {

            setSubmitting(true);


            const token =
                getToken();


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

                        test_code:
                            formData.test_code
                                .trim()
                                .toUpperCase(),

                        test_name:
                            formData.test_name
                                .trim(),

                        category:
                            formData.category
                                .trim(),

                        sample_type:
                            formData.sample_type
                                .trim(),

                        price:
                            formData.price,

                        is_active:
                            true,

                    }),

                });


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(

                    data.test_code?.[0] ||

                    data.test_name?.[0] ||

                    data.price?.[0] ||

                    data.detail ||

                    "Failed to create lab test."

                );

            }


            setMessage(
                "Lab test added successfully."
            );


            resetForm();


            await fetchLabTests();

        } catch (err) {

            console.error(
                "ADD LAB TEST ERROR:",
                err
            );

            setError(
                err.message ||
                "Unable to add lab test."
            );

        } finally {

            setSubmitting(false);

        }

    };


    // =========================================================
    // ACTIVATE / DEACTIVATE
    // =========================================================

    const toggleLabTest =
        async (labTest) => {

            setMessage("");

            setError("");


            const action =
                labTest.is_active
                    ? "deactivate"
                    : "activate";


            const confirmed =
                window.confirm(

                    `Are you sure you want to ${action} "${labTest.test_name}"?`

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

                        `${API_URL}${labTest.id}/`,

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
                                        !labTest.is_active,

                                }),

                        }

                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(

                        data.detail ||

                        "Failed to update lab test."

                    );

                }


                setMessage(

                    `Lab test ${
                        labTest.is_active
                            ? "deactivated"
                            : "activated"
                    } successfully.`

                );


                await fetchLabTests();

            } catch (err) {

                console.error(
                    "TOGGLE LAB TEST ERROR:",
                    err
                );

                setError(
                    err.message ||
                    "Unable to update lab test."
                );

            }

        };


    // =========================================================
    // LIVE SEARCH
    // =========================================================

    const filteredLabTests =
        useMemo(() => {

            const term =
                searchTerm
                    .trim()
                    .toLowerCase();


            if (!term) {

                return labTests;

            }


            return labTests.filter(
                (labTest) => {

                    return (

                        String(
                            labTest.id || ""
                        )
                            .toLowerCase()
                            .includes(term)

                        ||

                        String(
                            labTest.test_code || ""
                        )
                            .toLowerCase()
                            .includes(term)

                        ||

                        String(
                            labTest.test_name || ""
                        )
                            .toLowerCase()
                            .includes(term)

                        ||

                        String(
                            labTest.category || ""
                        )
                            .toLowerCase()
                            .includes(term)

                        ||

                        String(
                            labTest.sample_type || ""
                        )
                            .toLowerCase()
                            .includes(term)

                        ||

                        String(
                            labTest.price || ""
                        )
                            .toLowerCase()
                            .includes(term)

                    );

                }
            );

        }, [labTests, searchTerm]);


    // =========================================================
    // COUNTS
    // =========================================================

    const activeCount =
        labTests.filter(
            (test) =>
                test.is_active
        ).length;


    const inactiveCount =
        labTests.filter(
            (test) =>
                !test.is_active
        ).length;


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <div>

            {/* =================================================
                ADD BUTTON
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
                                : "bi-eyedropper"
                        } me-2`}
                    ></i>

                    {showForm
                        ? "Close"
                        : "Add Lab Test"}

                </button>

            </div>


            {/* =================================================
                SUCCESS
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
                ERROR
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
                ADD LAB TEST FORM
            ================================================= */}

            {showForm && (

                <div
                    className="card border-0 shadow-sm mb-4"
                >

                    <div className="card-header bg-white py-3">

                        <h5 className="fw-bold mb-1">

                            <i className="bi bi-eyedropper me-2 text-primary"></i>

                            Add Lab Test

                        </h5>

                        <p className="text-muted mb-0 small">

                            Enter the laboratory test details below.

                        </p>

                    </div>


                    <div className="card-body">

                        <form
                            onSubmit={handleSubmit}
                        >

                            <div className="row g-3">


                                {/* TEST CODE */}

                                <div className="col-12 col-md-6 col-lg-4">

                                    <label
                                        className="form-label fw-semibold"
                                    >

                                        Test Code

                                        <span className="text-danger">
                                            {" "}*
                                        </span>

                                    </label>


                                    <input
                                        type="text"
                                        className="form-control text-uppercase"
                                        name="test_code"
                                        placeholder="e.g. CBC001"
                                        value={
                                            formData.test_code
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />


                                    <div className="form-text">

                                        Test code must be unique.

                                    </div>

                                </div>


                                {/* TEST NAME */}

                                <div className="col-12 col-md-6 col-lg-4">

                                    <label
                                        className="form-label fw-semibold"
                                    >

                                        Test Name

                                        <span className="text-danger">
                                            {" "}*
                                        </span>

                                    </label>


                                    <input
                                        type="text"
                                        className="form-control"
                                        name="test_name"
                                        placeholder="e.g. Complete Blood Count"
                                        value={
                                            formData.test_name
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                </div>


                                {/* CATEGORY */}

                                <div className="col-12 col-md-6 col-lg-4">

                                    <label
                                        className="form-label fw-semibold"
                                    >

                                        Category

                                    </label>


                                    <input
                                        type="text"
                                        className="form-control"
                                        name="category"
                                        placeholder="e.g. Hematology"
                                        value={
                                            formData.category
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                </div>


                                {/* SAMPLE TYPE */}

                                <div className="col-12 col-md-6 col-lg-4">

                                    <label
                                        className="form-label fw-semibold"
                                    >

                                        Sample Type

                                    </label>


                                    <select
                                        className="form-select"
                                        name="sample_type"
                                        value={
                                            formData.sample_type
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >

                                        <option value="">
                                            Select sample type
                                        </option>

                                        <option value="Blood">
                                            Blood
                                        </option>

                                        <option value="Urine">
                                            Urine
                                        </option>

                                        <option value="Stool">
                                            Stool
                                        </option>

                                        <option value="Sputum">
                                            Sputum
                                        </option>

                                        <option value="Saliva">
                                            Saliva
                                        </option>

                                        <option value="Swab">
                                            Swab
                                        </option>

                                        <option value="Serum">
                                            Serum
                                        </option>

                                        <option value="Plasma">
                                            Plasma
                                        </option>

                                        <option value="Other">
                                            Other
                                        </option>

                                    </select>

                                </div>


                                {/* PRICE */}

                                <div className="col-12 col-md-6 col-lg-4">

                                    <label
                                        className="form-label fw-semibold"
                                    >

                                        Price

                                        <span className="text-danger">
                                            {" "}*
                                        </span>

                                    </label>


                                    <div className="input-group">

                                        <span className="input-group-text">

                                            ₹

                                        </span>


                                        <input
                                            type="number"
                                            className="form-control"
                                            name="price"
                                            placeholder="e.g. 350"
                                            min="0"
                                            step="0.01"
                                            value={
                                                formData.price
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            required
                                        />

                                    </div>

                                </div>

                            </div>


                            {/* BUTTONS */}

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

                                            Add Lab Test

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
                                    placeholder="Search by test code, test name, category or sample type..."
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

                                    <i className="bi bi-eyedropper me-2"></i>

                                    {searchTerm
                                        ? `${filteredLabTests.length} / ${labTests.length}`
                                        : labTests.length}

                                    {" "}Tests

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
                LAB TEST LIST
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

                                Lab Test List

                            </h5>

                            <p className="text-muted mb-0 small">

                                All laboratory tests registered in the Lab Test Master.

                            </p>

                        </div>


                        <i className="bi bi-eyedropper fs-3 text-primary"></i>

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

                                Loading lab tests...

                            </p>

                        </div>

                    )


                    /* EMPTY */

                    : filteredLabTests.length === 0 ? (

                        <div className="text-center py-5 px-3">

                            <i className="bi bi-eyedropper fs-1 text-muted"></i>


                            <h5 className="mt-3">

                                No lab tests found

                            </h5>


                            <p className="text-muted mb-0">

                                {searchTerm
                                    ? "No lab tests match your search."
                                    : "Add your first lab test using the button above."}

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
                                            Test Code
                                        </th>

                                        <th>
                                            Test Name
                                        </th>

                                        <th>
                                            Category
                                        </th>

                                        <th>
                                            Sample Type
                                        </th>

                                        <th>
                                            Price
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

                                    {filteredLabTests.map(
                                        (labTest) => (

                                            <tr
                                                key={
                                                    labTest.id
                                                }
                                            >

                                                {/* ID */}

                                                <td className="px-3 text-muted">

                                                    #{labTest.id}

                                                </td>


                                                {/* CODE */}

                                                <td>

                                                    <span className="badge bg-primary-subtle text-primary border">

                                                        {
                                                            labTest.test_code
                                                        }

                                                    </span>

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

                                                            <i className="bi bi-eyedropper"></i>

                                                        </div>


                                                        <strong>

                                                            {
                                                                labTest.test_name
                                                            }

                                                        </strong>

                                                    </div>

                                                </td>


                                                {/* CATEGORY */}

                                                <td>

                                                    {
                                                        labTest.category ||
                                                        "-"
                                                    }

                                                </td>


                                                {/* SAMPLE */}

                                                <td>

                                                    {
                                                        labTest.sample_type ||
                                                        "-"
                                                    }

                                                </td>


                                                {/* PRICE */}

                                                <td>

                                                    <strong>

                                                        ₹
                                                        {Number(
                                                            labTest.price
                                                        ).toFixed(2)}

                                                    </strong>

                                                </td>


                                                {/* STATUS */}

                                                <td>

                                                    {labTest.is_active ? (

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
                                                            labTest.is_active
                                                                ? "btn-outline-danger"
                                                                : "btn-outline-success"
                                                        }`}
                                                        onClick={() =>
                                                            toggleLabTest(
                                                                labTest
                                                            )
                                                        }
                                                        title={
                                                            labTest.is_active
                                                                ? "Deactivate lab test"
                                                                : "Activate lab test"
                                                        }
                                                    >

                                                        <i
                                                            className={`bi ${
                                                                labTest.is_active
                                                                    ? "bi-toggle-off"
                                                                    : "bi-toggle-on"
                                                            } me-1`}
                                                        ></i>


                                                        {labTest.is_active
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

export default LabTests;