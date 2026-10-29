import { useEffect, useState } from "react";

// ============================================================
// MINIMUM AGE BY ROLE
// ============================================================

const MIN_AGE_BY_ROLE = {
    RECEPTIONIST: 18,
    DOCTOR: 23,
    PHARMACIST: 23,
    LAB_TECHNICIAN: 18,
};


// ============================================================
// CALCULATE AGE
// ============================================================

const calculateAge = (dateOfBirth) => {

    if (!dateOfBirth) return null;

    const today = new Date();
    const dob = new Date(dateOfBirth);

    let age =
        today.getFullYear() -
        dob.getFullYear();

    const hasHadBirthdayThisYear =
        today.getMonth() > dob.getMonth() ||
        (
            today.getMonth() === dob.getMonth() &&
            today.getDate() >= dob.getDate()
        );

    if (!hasHadBirthdayThisYear) {
        age -= 1;
    }

    return age;
};


// ============================================================
// ROLE DISPLAY NAME
// ============================================================

const getRoleName = (role) => {

    const roles = {
        RECEPTIONIST: "Receptionist",
        DOCTOR: "Doctor",
        PHARMACIST: "Pharmacist",
        LAB_TECHNICIAN: "Lab Technician",
    };

    return roles[role] || role;
};


// ============================================================
// STAFF COMPONENT
// ============================================================

function Staff() {

    // ========================================================
    // DATA
    // ========================================================

    const [staff, setStaff] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ========================================================
    // SEARCH
    // ========================================================

    const [searchTerm, setSearchTerm] = useState("");

    // ========================================================
    // ADD FORM
    // ========================================================

    const [showForm, setShowForm] = useState(false);
    const [creating, setCreating] = useState(false);

    const [formError, setFormError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [formData, setFormData] = useState({
        username: "",
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        role: "RECEPTIONIST",
        date_of_birth: "",
        address: "",
        phone_number: "",
        department: "",
        consultation_fee: "",
        is_active: true,
    });


    // ========================================================
    // EDIT FORM
    // ========================================================

    const [editingStaffId, setEditingStaffId] =
        useState(null);

    const [editingRole, setEditingRole] =
        useState("");

    const [editFormData, setEditFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        date_of_birth: "",
        address: "",
        phone_number: "",
    });

    const [editError, setEditError] =
        useState("");

    const [editSuccess, setEditSuccess] =
        useState("");

    const [updating, setUpdating] =
        useState(false);


    // ========================================================
    // LOAD DATA
    // ========================================================

    useEffect(() => {

        fetchStaff();
        fetchDepartments();

    }, []);


    // ========================================================
    // FETCH STAFF
    // ========================================================

    const fetchStaff = async () => {

        try {

            setLoading(true);

            setError("");

            const response = await fetch(
                "http://127.0.0.1:8000/api/admin/staff/",
                {
                    headers: {
                        Authorization:
                            `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                console.error(
                    "STAFF API ERROR:",
                    data
                );

                setError(
                    "Unable to load staff."
                );

                return;
            }


            setStaff(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (err) {

            console.error(
                "STAFF ERROR:",
                err
            );

            setError(
                "Unable to connect to the server."
            );

        } finally {

            setLoading(false);

        }
    };


    // ========================================================
    // FETCH DEPARTMENTS
    // ========================================================

    const fetchDepartments = async () => {

        try {

            const response = await fetch(
                "http://127.0.0.1:8000/api/admin/departments/",
                {
                    headers: {
                        Authorization:
                            `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                console.error(
                    "DEPARTMENT API ERROR:",
                    data
                );

                return;
            }


            setDepartments(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (err) {

            console.error(
                "DEPARTMENT ERROR:",
                err
            );

        }
    };


    // ========================================================
    // ADD FORM CHANGE
    // ========================================================

    const handleChange = (event) => {

        const {
            name,
            value,
            type,
            checked
        } = event.target;


        setFormData((previous) => ({
            ...previous,
            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));


        setFormError("");
        setSuccessMessage("");
    };


    // ========================================================
    // RESET ADD FORM
    // ========================================================

    const resetForm = () => {

        setFormData({
            username: "",
            first_name: "",
            last_name: "",
            email: "",
            password: "",
            role: "RECEPTIONIST",
            date_of_birth: "",
            address: "",
            phone_number: "",
            department: "",
            consultation_fee: "",
            is_active: true,
        });
    };


    // ========================================================
    // CREATE STAFF
    // ========================================================

    const handleCreateStaff = async (event) => {

        event.preventDefault();

        setFormError("");
        setSuccessMessage("");


        const age =
            calculateAge(
                formData.date_of_birth
            );


        const minAge =
            MIN_AGE_BY_ROLE[
                formData.role
            ] ?? 18;


        if (age === null) {

            setFormError(
                "Date of birth is required."
            );

            return;
        }


        if (age < minAge) {

            setFormError(
                `A ${getRoleName(
                    formData.role
                )} must be at least ${minAge} years old. This staff member is ${age}.`
            );

            return;
        }


        setCreating(true);


        try {

            const dataToSend = {

                username:
                    formData.username,

                first_name:
                    formData.first_name,

                last_name:
                    formData.last_name,

                email:
                    formData.email,

                password:
                    formData.password,

                role:
                    formData.role,

                date_of_birth:
                    formData.date_of_birth,

                address:
                    formData.address,

                phone_number:
                    formData.phone_number,

                is_active:
                    formData.is_active,
            };


            // Doctor-only fields

            if (
                formData.role ===
                "DOCTOR"
            ) {

                dataToSend.department =
                    Number(
                        formData.department
                    );

                dataToSend.consultation_fee =
                    formData.consultation_fee;
            }


            const response =
                await fetch(
                    "http://127.0.0.1:8000/api/admin/staff/create/",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${localStorage.getItem(
                                    "accessToken"
                                )}`,
                        },

                        body:
                            JSON.stringify(
                                dataToSend
                            ),
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                console.error(
                    "CREATE STAFF ERROR:",
                    data
                );


                if (
                    typeof data ===
                    "object"
                ) {

                    const messages = [];


                    Object.keys(
                        data
                    ).forEach(
                        (field) => {

                            const fieldErrors =
                                data[field];


                            if (
                                Array.isArray(
                                    fieldErrors
                                )
                            ) {

                                fieldErrors.forEach(
                                    (message) => {

                                        messages.push(
                                            `${field}: ${message}`
                                        );

                                    }
                                );

                            } else {

                                messages.push(
                                    `${field}: ${fieldErrors}`
                                );

                            }

                        }
                    );


                    setFormError(
                        messages.join(" ")
                    );

                } else {

                    setFormError(
                        "Unable to create staff."
                    );

                }


                return;
            }


            setSuccessMessage(
                "Staff member created successfully."
            );


            resetForm();

            await fetchStaff();

        } catch (err) {

            console.error(
                "CREATE STAFF ERROR:",
                err
            );

            setFormError(
                "Unable to connect to the server."
            );

        } finally {

            setCreating(false);

        }
    };


    // ========================================================
    // TOGGLE ADD FORM
    // ========================================================

    const handleToggleForm = () => {

        setShowForm(
            (previous) =>
                !previous
        );

        setFormError("");
        setSuccessMessage("");
    };


    // ========================================================
    // EDIT STAFF
    // ========================================================

    const handleEditClick = (member) => {

        setShowForm(false);

        setEditingStaffId(
            member.staff_id
        );

        setEditingRole(
            member.role
        );


        setEditFormData({

            first_name:
                member.first_name || "",

            last_name:
                member.last_name || "",

            email:
                member.email || "",

            date_of_birth:
                member.date_of_birth || "",

            address:
                member.address || "",

            phone_number:
                member.phone_number || "",
        });


        setEditError("");
        setEditSuccess("");
    };


    // ========================================================
    // CANCEL EDIT
    // ========================================================

    const handleCancelEdit = () => {

        setEditingStaffId(null);

        setEditError("");
        setEditSuccess("");
    };


    // ========================================================
    // EDIT FORM CHANGE
    // ========================================================

    const handleEditChange = (event) => {

        const {
            name,
            value
        } = event.target;


        setEditFormData(
            (previous) => ({
                ...previous,
                [name]: value,
            })
        );


        setEditError("");
        setEditSuccess("");
    };


    // ========================================================
    // UPDATE STAFF
    // ========================================================

    const handleUpdateStaff = async (
        event
    ) => {

        event.preventDefault();

        setEditError("");
        setEditSuccess("");


        const age =
            calculateAge(
                editFormData.date_of_birth
            );


        const minAge =
            MIN_AGE_BY_ROLE[
                editingRole
            ] ?? 18;


        if (age === null) {

            setEditError(
                "Date of birth is required."
            );

            return;
        }


        if (age < minAge) {

            setEditError(
                `A ${getRoleName(
                    editingRole
                )} must be at least ${minAge} years old. This staff member is ${age}.`
            );

            return;
        }


        setUpdating(true);


        try {

            const response =
                await fetch(
                    `http://127.0.0.1:8000/api/admin/staff/${editingStaffId}/`,
                    {
                        method: "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${localStorage.getItem(
                                    "accessToken"
                                )}`,
                        },

                        body:
                            JSON.stringify(
                                editFormData
                            ),
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                console.error(
                    "UPDATE STAFF ERROR:",
                    data
                );


                if (
                    typeof data ===
                    "object"
                ) {

                    const messages = [];


                    Object.keys(
                        data
                    ).forEach(
                        (field) => {

                            const fieldErrors =
                                data[field];


                            if (
                                Array.isArray(
                                    fieldErrors
                                )
                            ) {

                                fieldErrors.forEach(
                                    (message) => {

                                        messages.push(
                                            `${field}: ${message}`
                                        );

                                    }
                                );

                            } else {

                                messages.push(
                                    `${field}: ${fieldErrors}`
                                );

                            }

                        }
                    );


                    setEditError(
                        messages.join(" ")
                    );

                } else {

                    setEditError(
                        "Unable to update staff."
                    );

                }


                return;
            }


            setEditSuccess(
                "Staff member updated successfully."
            );


            await fetchStaff();

            setEditingStaffId(null);

        } catch (err) {

            console.error(
                "UPDATE STAFF ERROR:",
                err
            );

            setEditError(
                "Unable to connect to the server."
            );

        } finally {

            setUpdating(false);

        }
    };


    // ========================================================
    // ACTIVATE / DEACTIVATE
    // ========================================================

    const handleToggleActive =
        async (member) => {

            const action =
                member.is_active
                    ? "deactivate"
                    : "activate";


            const confirmed =
                window.confirm(
                    `Are you sure you want to ${action} ${member.first_name} ${member.last_name}?`
                );


            if (!confirmed) return;


            try {

                const response =
                    await fetch(
                        `http://127.0.0.1:8000/api/admin/staff/${member.staff_id}/`,
                        {
                            method: "PATCH",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                Authorization:
                                    `Bearer ${localStorage.getItem(
                                        "accessToken"
                                    )}`,
                            },

                            body:
                                JSON.stringify({
                                    is_active:
                                        !member.is_active,
                                }),
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    console.error(
                        "TOGGLE ACTIVE ERROR:",
                        data
                    );

                    alert(
                        "Unable to update staff status."
                    );

                    return;
                }


                await fetchStaff();

            } catch (err) {

                console.error(
                    "TOGGLE ACTIVE ERROR:",
                    err
                );

                alert(
                    "Unable to connect to the server."
                );
            }
        };


    // ========================================================
    // FILTER STAFF
    // ========================================================

    const filteredStaff =
        staff.filter((member) => {

            const term =
                searchTerm
                    .trim()
                    .toLowerCase();


            if (!term) return true;


            const fullName =
                `${member.first_name || ""} ${
                    member.last_name || ""
                }`.toLowerCase();


            return (

                String(
                    member.staff_id || ""
                )
                    .toLowerCase()
                    .includes(term)

                ||

                String(
                    member.username || ""
                )
                    .toLowerCase()
                    .includes(term)

                ||

                fullName.includes(term)

                ||

                String(
                    member.phone_number || ""
                )
                    .toLowerCase()
                    .includes(term)

                ||

                String(
                    member.email || ""
                )
                    .toLowerCase()
                    .includes(term)

                ||

                String(
                    member.role || ""
                )
                    .toLowerCase()
                    .includes(term)

            );

        });


    // ========================================================
    // AGE PREVIEW
    // ========================================================

    const addFormAge =
        calculateAge(
            formData.date_of_birth
        );

    const addFormMinAge =
        MIN_AGE_BY_ROLE[
            formData.role
        ] ?? 18;


    const editFormAge =
        calculateAge(
            editFormData.date_of_birth
        );

    const editFormMinAge =
        MIN_AGE_BY_ROLE[
            editingRole
        ] ?? 18;


    // ========================================================
    // RENDER
    // ========================================================

    return (

        <div>

            {/* =================================================
                PAGE ACTION
            ================================================= */}

            <div className="d-flex justify-content-end mb-4">

                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleToggleForm}
                >

                    <i
                        className={`bi ${
                            showForm
                                ? "bi-x-lg"
                                : "bi-person-plus"
                        } me-2`}
                    ></i>

                    {showForm
                        ? "Close"
                        : "Add Staff"}

                </button>

            </div>


            {/* =================================================
                SUCCESS MESSAGE
            ================================================= */}

            {successMessage && (

                <div
                    className="alert alert-success alert-dismissible fade show"
                    role="alert"
                >

                    <i className="bi bi-check-circle-fill me-2"></i>

                    {successMessage}

                    <button
                        type="button"
                        className="btn-close"
                        onClick={() =>
                            setSuccessMessage("")
                        }
                    ></button>

                </div>

            )}


            {/* =================================================
                ADD STAFF
            ================================================= */}

            {showForm && (

                <div className="card border-0 shadow-sm mb-4">

                    <div className="card-header bg-white py-3">

                        <h5 className="fw-bold mb-1">

                            <i className="bi bi-person-plus me-2 text-primary"></i>

                            Add New Staff

                        </h5>

                        <p className="text-muted mb-0 small">

                            Enter the staff member's details below.

                        </p>

                    </div>


                    <div className="card-body">

                        {formError && (

                            <div
                                className="alert alert-danger"
                            >

                                <i className="bi bi-exclamation-triangle-fill me-2"></i>

                                {formError}

                            </div>

                        )}


                        <form
                            onSubmit={
                                handleCreateStaff
                            }
                        >

                            <div className="row g-3">


                                {/* USERNAME */}

                                <div className="col-12 col-md-6">

                                    <label className="form-label fw-semibold">

                                        Username
                                        <span className="text-danger">
                                            {" "}*
                                        </span>

                                    </label>

                                    <input
                                        type="text"
                                        name="username"
                                        className="form-control"
                                        value={
                                            formData.username
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Enter username"
                                        required
                                    />

                                </div>


                                {/* PASSWORD */}

                                <div className="col-12 col-md-6">

                                    <label className="form-label fw-semibold">

                                        Password
                                        <span className="text-danger">
                                            {" "}*
                                        </span>

                                    </label>

                                    <input
                                        type="password"
                                        name="password"
                                        className="form-control"
                                        value={
                                            formData.password
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Enter password"
                                        required
                                    />

                                </div>


                                {/* FIRST NAME */}

                                <div className="col-12 col-md-6">

                                    <label className="form-label fw-semibold">

                                        First Name

                                    </label>

                                    <input
                                        type="text"
                                        name="first_name"
                                        className="form-control"
                                        value={
                                            formData.first_name
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Enter first name"
                                    />

                                </div>


                                {/* LAST NAME */}

                                <div className="col-12 col-md-6">

                                    <label className="form-label fw-semibold">

                                        Last Name

                                    </label>

                                    <input
                                        type="text"
                                        name="last_name"
                                        className="form-control"
                                        value={
                                            formData.last_name
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Enter last name"
                                    />

                                </div>


                                {/* EMAIL */}

                                <div className="col-12 col-md-6">

                                    <label className="form-label fw-semibold">

                                        Email
                                        <span className="text-danger">
                                            {" "}*
                                        </span>

                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        className="form-control"
                                        value={
                                            formData.email
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Enter email"
                                        required
                                    />

                                </div>


                                {/* ROLE */}

                                <div className="col-12 col-md-6">

                                    <label className="form-label fw-semibold">

                                        Role
                                        <span className="text-danger">
                                            {" "}*
                                        </span>

                                    </label>

                                    <select
                                        name="role"
                                        className="form-select"
                                        value={
                                            formData.role
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >

                                        <option value="RECEPTIONIST">
                                            Receptionist
                                        </option>

                                        <option value="DOCTOR">
                                            Doctor
                                        </option>

                                        <option value="PHARMACIST">
                                            Pharmacist
                                        </option>

                                        <option value="LAB_TECHNICIAN">
                                            Lab Technician
                                        </option>

                                    </select>

                                </div>


                                {/* DOB */}

                                <div className="col-12 col-md-6">

                                    <label className="form-label fw-semibold">

                                        Date of Birth
                                        <span className="text-danger">
                                            {" "}*
                                        </span>

                                    </label>

                                    <input
                                        type="date"
                                        name="date_of_birth"
                                        className="form-control"
                                        value={
                                            formData.date_of_birth
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        max={
                                            new Date()
                                                .toISOString()
                                                .split("T")[0]
                                        }
                                        required
                                    />


                                    {formData.date_of_birth &&
                                        addFormAge !== null && (

                                            <div
                                                className={`small mt-1 ${
                                                    addFormAge <
                                                    addFormMinAge
                                                        ? "text-danger"
                                                        : "text-muted"
                                                }`}
                                            >

                                                Age:{" "}
                                                <strong>
                                                    {addFormAge}
                                                </strong>

                                                {" "}(
                                                minimum{" "}
                                                {addFormMinAge}
                                                )

                                            </div>

                                        )}

                                </div>


                                {/* PHONE */}

                                <div className="col-12 col-md-6">

                                    <label className="form-label fw-semibold">

                                        Phone Number
                                        <span className="text-danger">
                                            {" "}*
                                        </span>

                                    </label>

                                    <input
                                        type="tel"
                                        name="phone_number"
                                        className="form-control"
                                        value={
                                            formData.phone_number
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="+919876543210"
                                        pattern="^\+?\d{7,15}$"
                                        required
                                    />

                                </div>


                                {/* ADDRESS */}

                                <div className="col-12">

                                    <label className="form-label fw-semibold">

                                        Address
                                        <span className="text-danger">
                                            {" "}*
                                        </span>

                                    </label>

                                    <textarea
                                        name="address"
                                        className="form-control"
                                        rows="3"
                                        value={
                                            formData.address
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Enter address"
                                        required
                                    ></textarea>

                                </div>


                                {/* DOCTOR DEPARTMENT */}

                                {formData.role ===
                                    "DOCTOR" && (

                                    <div className="col-12 col-md-6">

                                        <label className="form-label fw-semibold">

                                            Department
                                            <span className="text-danger">
                                                {" "}*
                                            </span>

                                        </label>

                                        <select
                                            name="department"
                                            className="form-select"
                                            value={
                                                formData.department
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            required
                                        >

                                            <option value="">
                                                Select Department
                                            </option>

                                            {departments.map(
                                                (
                                                    department
                                                ) => (

                                                    <option
                                                        key={
                                                            department.id
                                                        }
                                                        value={
                                                            department.id
                                                        }
                                                    >
                                                        {
                                                            department.name
                                                        }
                                                    </option>

                                                )
                                            )}

                                        </select>

                                    </div>

                                )}


                                {/* CONSULTATION FEE */}

                                {formData.role ===
                                    "DOCTOR" && (

                                    <div className="col-12 col-md-6">

                                        <label className="form-label fw-semibold">

                                            Consultation Fee
                                            <span className="text-danger">
                                                {" "}*
                                            </span>

                                        </label>

                                        <input
                                            type="number"
                                            name="consultation_fee"
                                            className="form-control"
                                            value={
                                                formData.consultation_fee
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Enter consultation fee"
                                            min="0"
                                            step="0.01"
                                            required
                                        />

                                    </div>

                                )}


                                {/* ACTIVE */}

                                <div className="col-12">

                                    <div className="form-check">

                                        <input
                                            id="staff-active"
                                            type="checkbox"
                                            name="is_active"
                                            className="form-check-input"
                                            checked={
                                                formData.is_active
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />

                                        <label
                                            htmlFor="staff-active"
                                            className="form-check-label"
                                        >

                                            Active Staff

                                        </label>

                                    </div>

                                </div>

                            </div>


                            <div className="d-flex flex-wrap gap-2 mt-4">

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={
                                        creating
                                    }
                                >

                                    {creating ? (

                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                            ></span>

                                            Creating...
                                        </>

                                    ) : (

                                        <>
                                            <i className="bi bi-check-lg me-2"></i>
                                            Create Staff
                                        </>

                                    )}

                                </button>


                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={
                                        handleToggleForm
                                    }
                                >

                                    <i className="bi bi-x-lg me-2"></i>

                                    Cancel

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* =================================================
                EDIT STAFF
            ================================================= */}

            {editingStaffId && (

                <div className="card border-0 shadow-sm mb-4">

                    <div className="card-header bg-white py-3">

                        <h5 className="fw-bold mb-1">

                            <i className="bi bi-pencil-square me-2 text-warning"></i>

                            Edit Staff

                        </h5>

                        <p className="text-muted mb-0">

                            Staff ID:{" "}

                            <strong>
                                {editingStaffId}
                            </strong>

                        </p>

                    </div>


                    <div className="card-body">

                        {editError && (

                            <div className="alert alert-danger">

                                <i className="bi bi-exclamation-triangle-fill me-2"></i>

                                {editError}

                            </div>

                        )}


                        <form
                            onSubmit={
                                handleUpdateStaff
                            }
                        >

                            <div className="row g-3">


                                <div className="col-12 col-md-6">

                                    <label className="form-label fw-semibold">
                                        First Name
                                    </label>

                                    <input
                                        type="text"
                                        name="first_name"
                                        className="form-control"
                                        value={
                                            editFormData.first_name
                                        }
                                        onChange={
                                            handleEditChange
                                        }
                                    />

                                </div>


                                <div className="col-12 col-md-6">

                                    <label className="form-label fw-semibold">
                                        Last Name
                                    </label>

                                    <input
                                        type="text"
                                        name="last_name"
                                        className="form-control"
                                        value={
                                            editFormData.last_name
                                        }
                                        onChange={
                                            handleEditChange
                                        }
                                    />

                                </div>


                                <div className="col-12 col-md-6">

                                    <label className="form-label fw-semibold">
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        className="form-control"
                                        value={
                                            editFormData.email
                                        }
                                        onChange={
                                            handleEditChange
                                        }
                                        required
                                    />

                                </div>


                                <div className="col-12 col-md-6">

                                    <label className="form-label fw-semibold">
                                        Date of Birth
                                    </label>

                                    <input
                                        type="date"
                                        name="date_of_birth"
                                        className="form-control"
                                        value={
                                            editFormData.date_of_birth
                                        }
                                        onChange={
                                            handleEditChange
                                        }
                                        max={
                                            new Date()
                                                .toISOString()
                                                .split("T")[0]
                                        }
                                        required
                                    />


                                    {editFormData.date_of_birth &&
                                        editFormAge !== null && (

                                            <div
                                                className={`small mt-1 ${
                                                    editFormAge <
                                                    editFormMinAge
                                                        ? "text-danger"
                                                        : "text-muted"
                                                }`}
                                            >

                                                Age:{" "}
                                                <strong>
                                                    {editFormAge}
                                                </strong>

                                                {" "}(
                                                minimum{" "}
                                                {editFormMinAge}
                                                )

                                            </div>

                                        )}

                                </div>


                                <div className="col-12 col-md-6">

                                    <label className="form-label fw-semibold">
                                        Phone Number
                                    </label>

                                    <input
                                        type="tel"
                                        name="phone_number"
                                        className="form-control"
                                        value={
                                            editFormData.phone_number
                                        }
                                        onChange={
                                            handleEditChange
                                        }
                                        pattern="^\+?\d{7,15}$"
                                        required
                                    />

                                </div>


                                <div className="col-12">

                                    <label className="form-label fw-semibold">
                                        Address
                                    </label>

                                    <textarea
                                        name="address"
                                        className="form-control"
                                        rows="3"
                                        value={
                                            editFormData.address
                                        }
                                        onChange={
                                            handleEditChange
                                        }
                                        required
                                    ></textarea>

                                </div>

                            </div>


                            <div className="d-flex flex-wrap gap-2 mt-4">

                                <button
                                    type="submit"
                                    className="btn btn-warning"
                                    disabled={
                                        updating
                                    }
                                >

                                    {updating ? (

                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                            ></span>

                                            Saving...
                                        </>

                                    ) : (

                                        <>
                                            <i className="bi bi-save me-2"></i>
                                            Save Changes
                                        </>

                                    )}

                                </button>


                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={
                                        handleCancelEdit
                                    }
                                >

                                    <i className="bi bi-x-lg me-2"></i>

                                    Cancel

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* =================================================
                SEARCH + SUMMARY
            ================================================= */}

            <div className="card border-0 shadow-sm mb-4">

                <div className="card-body">

                    <div className="row g-3 align-items-center">

                        <div className="col-12 col-lg-8">

                            <div className="input-group">

                                <span className="input-group-text bg-white">

                                    <i className="bi bi-search"></i>

                                </span>

                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search by Staff ID, username, name, phone, email or role..."
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

                                Results update automatically as you type.

                            </small>

                        </div>


                        <div className="col-12 col-lg-4">

                            <div className="d-flex justify-content-lg-end">

                                <span className="badge bg-primary fs-6 px-3 py-2">

                                    <i className="bi bi-people me-2"></i>

                                    {searchTerm
                                        ? `${filteredStaff.length} / ${staff.length}`
                                        : `${staff.length}`}{" "}

                                    Staff

                                </span>

                            </div>

                        </div>

                    </div>

                </div>

            </div>


            {/* =================================================
                STAFF LIST
            ================================================= */}

            <div className="card border-0 shadow-sm">

                <div className="card-header bg-white py-3">

                    <div className="d-flex justify-content-between align-items-center">

                        <div>

                            <h5 className="fw-bold mb-1">

                                Staff List

                            </h5>

                            <p className="text-muted mb-0 small">

                                View and manage all clinic staff.

                            </p>

                        </div>

                    </div>

                </div>


                <div className="card-body p-0">

                    {loading ? (

                        <div className="text-center py-5">

                            <div
                                className="spinner-border text-primary"
                                role="status"
                            ></div>

                            <p className="text-muted mt-3 mb-0">

                                Loading staff...

                            </p>

                        </div>

                    ) : error ? (

                        <div className="p-4">

                            <div className="alert alert-danger mb-0">

                                <i className="bi bi-exclamation-triangle-fill me-2"></i>

                                {error}

                            </div>

                        </div>

                    ) : filteredStaff.length === 0 ? (

                        <div className="text-center py-5">

                            <i className="bi bi-person-x fs-1 text-muted"></i>

                            <h5 className="mt-3">

                                No staff found

                            </h5>

                            <p className="text-muted mb-0">

                                {searchTerm
                                    ? "No staff members match your search."
                                    : "There are no staff members yet."}

                            </p>

                        </div>

                    ) : (

                        <div className="table-responsive">

                            <table className="table table-hover align-middle mb-0">

                                <thead className="table-light">

                                    <tr>

                                        <th className="px-3">
                                            Staff ID
                                        </th>

                                        <th>
                                            Username
                                        </th>

                                        <th>
                                            Name
                                        </th>

                                        <th>
                                            Email
                                        </th>

                                        <th>
                                            Phone
                                        </th>

                                        <th>
                                            Age
                                        </th>

                                        <th>
                                            Role
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th className="text-center">
                                            Actions
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredStaff.map(
                                        (member) => (

                                            <tr
                                                key={
                                                    member.staff_id
                                                }
                                            >

                                                <td className="px-3">

                                                    <span className="fw-semibold">

                                                        {
                                                            member.staff_id
                                                        }

                                                    </span>

                                                </td>


                                                <td>

                                                    {
                                                        member.username
                                                    }

                                                </td>


                                                <td>

                                                    <strong>

                                                        {
                                                            member.first_name
                                                        }{" "}

                                                        {
                                                            member.last_name
                                                        }

                                                    </strong>

                                                </td>


                                                <td>

                                                    <span className="text-muted">

                                                        {
                                                            member.email
                                                        }

                                                    </span>

                                                </td>


                                                <td>

                                                    {
                                                        member.phone_number ||
                                                        "-"
                                                    }

                                                </td>


                                                <td>

                                                    {
                                                        member.age ??
                                                        "-"
                                                    }

                                                </td>


                                                <td>

                                                    <span className="badge bg-primary-subtle text-primary">

                                                        <i className="bi bi-person-badge me-1"></i>

                                                        {
                                                            getRoleName(
                                                                member.role
                                                            )
                                                        }

                                                    </span>

                                                </td>


                                                <td>

                                                    {member.is_active ? (

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


                                                <td>

                                                    <div className="d-flex justify-content-center gap-2">

                                                        {/* EDIT */}

                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-warning"
                                                            onClick={() =>
                                                                handleEditClick(
                                                                    member
                                                                )
                                                            }
                                                            title="Edit staff"
                                                        >

                                                            <i className="bi bi-pencil"></i>

                                                        </button>


                                                        {/* ACTIVATE / DEACTIVATE */}

                                                        <button
                                                            type="button"
                                                            className={`btn btn-sm ${
                                                                member.is_active
                                                                    ? "btn-outline-danger"
                                                                    : "btn-outline-success"
                                                            }`}
                                                            onClick={() =>
                                                                handleToggleActive(
                                                                    member
                                                                )
                                                            }
                                                            title={
                                                                member.is_active
                                                                    ? "Deactivate staff"
                                                                    : "Activate staff"
                                                            }
                                                        >

                                                            <i
                                                                className={`bi ${
                                                                    member.is_active
                                                                        ? "bi-person-x"
                                                                        : "bi-person-check"
                                                                }`}
                                                            ></i>

                                                        </button>

                                                    </div>

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

export default Staff;