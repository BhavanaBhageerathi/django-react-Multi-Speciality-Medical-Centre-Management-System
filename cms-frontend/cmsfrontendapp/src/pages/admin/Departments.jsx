import { useEffect, useState } from "react";

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("accessToken");

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://127.0.0.1:8000/api/admin/departments/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to fetch departments");
      }

      setDepartments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Department name is required.");
      setMessage("");
      return;
    }

    try {
      setError("");
      setMessage("");

      const response = await fetch(
        "http://127.0.0.1:8000/api/admin/departments/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: name.trim(),
            is_active: true,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.name?.[0] ||
            data.detail ||
            "Failed to create department"
        );
      }

      setMessage("Department created successfully.");
      setName("");

      fetchDepartments();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleDepartment = async (department) => {
    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `http://127.0.0.1:8000/api/admin/departments/${department.id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            is_active: !department.is_active,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to update department"
        );
      }

      setMessage(
        `Department ${
          department.is_active ? "deactivated" : "activated"
        } successfully.`
      );

      fetchDepartments();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredDepartments = departments.filter((department) => {
    const searchText = search.toLowerCase().trim();

    return (
      String(department.id)
        .toLowerCase()
        .includes(searchText) ||
      department.name?.toLowerCase().includes(searchText)
    );
  });

  const activeCount = departments.filter(
    (department) => department.is_active
  ).length;

  const inactiveCount = departments.filter(
    (department) => !department.is_active
  ).length;

  return (
    <div className="container-fluid px-3 px-md-4 py-4">

      {/* Page Header */}
      <div className="mb-4">
        <div className="d-flex align-items-center gap-2 mb-2">
         

          
        </div>
      </div>

      {/* Statistics */}
      <div className="row g-3 mb-4">

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                <i className="bi bi-building text-primary fs-4"></i>
              </div>

              <div>
                <h6 className="text-muted mb-1">
                  Total Departments
                </h6>

                <h3 className="fw-bold mb-0">
                  {departments.length}
                </h3>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                <i className="bi bi-check-circle text-success fs-4"></i>
              </div>

              <div>
                <h6 className="text-muted mb-1">
                  Active
                </h6>

                <h3 className="fw-bold mb-0 text-success">
                  {activeCount}
                </h3>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div className="rounded-circle bg-secondary bg-opacity-10 p-3 me-3">
                <i className="bi bi-x-circle text-secondary fs-4"></i>
              </div>

              <div>
                <h6 className="text-muted mb-1">
                  Inactive
                </h6>

                <h3 className="fw-bold mb-0 text-secondary">
                  {inactiveCount}
                </h3>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Add Department */}
      <div className="card border-0 shadow-sm mb-4">

        <div className="card-header bg-white border-0 pt-4 px-4">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-plus-circle text-primary fs-5"></i>

            <h5 className="fw-bold mb-0">
              Add Department
            </h5>
          </div>
        </div>

        <div className="card-body px-4 pb-4">

          <form onSubmit={handleSubmit}>

            <div className="row g-3 align-items-end">

              <div className="col-12 col-md-8 col-lg-9">
                <label
                  htmlFor="department-name"
                  className="form-label fw-semibold"
                >
                  Department Name
                </label>

                <input
                  id="department-name"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Cardiology"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="col-12 col-md-4 col-lg-3">
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                >
                  <i className="bi bi-plus-lg me-2"></i>
                  Add Department
                </button>
              </div>

            </div>

          </form>

          {message && (
            <div
              className="alert alert-success mt-3 mb-0 d-flex align-items-center"
              role="alert"
            >
              <i className="bi bi-check-circle-fill me-2"></i>
              {message}
            </div>
          )}

          {error && (
            <div
              className="alert alert-danger mt-3 mb-0 d-flex align-items-center"
              role="alert"
            >
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </div>
          )}

        </div>
      </div>

      {/* Department List */}
      <div className="card border-0 shadow-sm">

        <div className="card-header bg-white border-0 pt-4 px-4">

          <div className="d-flex flex-column flex-md-row justify-content-between gap-3">

            <div>
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-list-ul text-primary fs-5"></i>

                <h5 className="fw-bold mb-0">
                  Departments
                </h5>
              </div>

              <p className="text-muted small mb-0 mt-1">
                View and manage all clinic departments.
              </p>
            </div>

            {/* Search */}
            <div className="col-12 col-md-5 col-lg-4">
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <i className="bi bi-search"></i>
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Search department..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

          </div>

        </div>

        <div className="card-body px-0">

          {loading ? (
            <div className="text-center py-5">
              <div
                className="spinner-border text-primary"
                role="status"
              >
                <span className="visually-hidden">
                  Loading...
                </span>
              </div>

              <p className="text-muted mt-3 mb-0">
                Loading departments...
              </p>
            </div>

          ) : filteredDepartments.length === 0 ? (

            <div className="text-center py-5 px-3">
              <i className="bi bi-building text-muted fs-1"></i>

              <h6 className="fw-semibold mt-3">
                {search
                  ? "No matching departments found."
                  : "No departments found."}
              </h6>

              <p className="text-muted mb-0">
                {search
                  ? "Try a different search term."
                  : "Add a department to get started."}
              </p>
            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead className="table-light">
                  <tr>
                    <th className="px-4">ID</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th className="text-center pe-4">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {filteredDepartments.map((department) => (

                    <tr key={department.id}>

                      <td className="px-4 fw-semibold text-muted">
                        #{department.id}
                      </td>

                      <td>
                        <div className="d-flex align-items-center gap-2">

                          <div className="rounded-circle bg-primary bg-opacity-10 p-2">
                            <i className="bi bi-building text-primary"></i>
                          </div>

                          <span className="fw-semibold">
                            {department.name}
                          </span>

                        </div>
                      </td>

                      <td>
                        {department.is_active ? (
                          <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2">
                            <i className="bi bi-check-circle me-1"></i>
                            Active
                          </span>
                        ) : (
                          <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-3 py-2">
                            <i className="bi bi-x-circle me-1"></i>
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="text-center pe-4">

                        <button
                          type="button"
                          className={`btn btn-sm ${
                            department.is_active
                              ? "btn-outline-danger"
                              : "btn-outline-success"
                          }`}
                          onClick={() =>
                            toggleDepartment(department)
                          }
                          title={
                            department.is_active
                              ? "Deactivate department"
                              : "Activate department"
                          }
                        >

                          <i
                            className={`bi ${
                              department.is_active
                                ? "bi-toggle-off"
                                : "bi-toggle-on"
                            } me-1`}
                          ></i>

                          {department.is_active
                            ? "Deactivate"
                            : "Activate"}

                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>

        {!loading && filteredDepartments.length > 0 && (
          <div className="card-footer bg-white border-0 px-4 py-3">
            <small className="text-muted">
              Showing {filteredDepartments.length} of{" "}
              {departments.length} department
              {departments.length !== 1 ? "s" : ""}
            </small>
          </div>
        )}

      </div>

    </div>
  );
}

export default Departments;