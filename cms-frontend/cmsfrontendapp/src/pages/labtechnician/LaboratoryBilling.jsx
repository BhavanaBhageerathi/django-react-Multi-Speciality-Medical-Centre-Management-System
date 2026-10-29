import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LaboratoryBilling.css";

function LaboratoryBilling() {
  const navigate = useNavigate();

  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchType, setSearchType] = useState("bill_id");
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setError("You are not logged in. Please login again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/lab-technician/bills/",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        setError("Your login session has expired. Please login again.");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        setError(data.detail || "Unable to load laboratory bills.");
        setLoading(false);
        return;
      }

      setBills(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("LABORATORY BILLING ERROR:", err);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const value = searchValue.trim().toLowerCase();
    if (!value) return;

    const filtered = bills.filter((bill) => {
      let fieldValue = "";
      if (searchType === "bill_id") fieldValue = bill.bill_id || "";
      if (searchType === "report_id") fieldValue = bill.report_id || "";
      if (searchType === "patient_id") fieldValue = String(bill.patient_id || "");
      if (searchType === "test_name") fieldValue = bill.test_name || "";
      return fieldValue.toLowerCase().includes(value);
    });

    setBills(filtered);
  };

  const handleClearSearch = () => {
    setSearchValue("");
    fetchBills();
  };

  const handleViewBill = (bill) => {
    navigate(`/lab-technician/billing/${bill.bill_id}`);
  };

  const handlePayBill = (bill) => {
    navigate(`/lab-technician/payment/${bill.bill_id}`);
  };

  const getPaymentBadge = (status) => {
    const s = String(status || "").toUpperCase();
    if (s === "PAID") {
      return (
        <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-2">
          <i className="bi bi-check-circle me-1"></i> PAID
        </span>
      );
    }
    if (s === "CANCELLED") {
      return (
        <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-3 py-2">
          <i className="bi bi-x-circle me-1"></i> CANCELLED
        </span>
      );
    }
    return (
      <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill px-3 py-2">
        <i className="bi bi-clock me-1"></i> PENDING
      </span>
    );
  };

  return (
    <div className="container-fluid px-3 px-md-4 py-4">
      {/* PAGE HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Laboratory Billing</h2>
          <p className="text-muted mb-0">
            Manage test invoices, patient billing records, and payment reconciliation
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2 align-self-start align-self-md-auto"
          onClick={fetchBills}
          disabled={loading}
        >
          <i
            className={`bi bi-arrow-clockwise ${
              loading ? "spin-animation" : ""
            }`}
          ></i>
          Refresh Bills
        </button>
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

      {/* SEARCH AND FILTER TOOLBAR */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-3 col-lg-2">
              <label className="form-label small text-muted text-uppercase fw-semibold">
                Filter Field
              </label>
              <select
                className="form-select"
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
              >
                <option value="bill_id">Bill ID</option>
                <option value="report_id">Report ID</option>
                <option value="patient_id">Patient ID</option>
                <option value="test_name">Test Name</option>
              </select>
            </div>

            <div className="col-12 col-md-6 col-lg-7">
              <label className="form-label small text-muted text-uppercase fw-semibold">
                Search Term
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-muted">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0"
                  placeholder="Enter search value..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                />
              </div>
            </div>

            <div className="col-12 col-md-3 col-lg-3 d-flex gap-2">
              <button
                type="button"
                className="btn btn-primary flex-grow-1"
                onClick={handleSearch}
              >
                Search
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleClearSearch}
                disabled={!searchValue}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BILLS TABLE CARD */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center">
          <div>
            <h5 className="fw-bold text-dark mb-0">Laboratory Invoices</h5>
            <div className="small text-muted">
              Bills generated for diagnostic reports
            </div>
          </div>
          {!loading && (
            <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-2">
              {bills.length} {bills.length === 1 ? "Bill" : "Bills"}
            </span>
          )}
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted mb-0">Loading laboratory bills...</p>
          </div>
        ) : bills.length === 0 ? (
          <div className="text-center py-5 px-3">
            <div
              className="bg-light text-muted rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
              style={{ width: "64px", height: "64px" }}
            >
              <i className="bi bi-receipt fs-2"></i>
            </div>
            <h5 className="fw-bold text-dark mb-1">No Bills Found</h5>
            <p className="text-muted mb-0 small">
              {searchValue
                ? "No billing records match your search."
                : "No laboratory bills recorded yet."}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-secondary small text-uppercase">
                <tr>
                  <th className="py-3 px-4">Bill ID</th>
                  <th className="py-3">Report ID</th>
                  <th className="py-3">Patient ID</th>
                  <th className="py-3">Test Details</th>
                  <th className="py-3">Bill Amount</th>
                  <th className="py-3">Payment Status</th>
                  <th className="py-3">Method</th>
                  <th className="py-3">Date</th>
                  <th className="py-3 px-4 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((bill) => (
                  <tr key={bill.id || bill.bill_id}>
                    <td className="py-3 px-4">
                      <span className="fw-bold text-primary">
                        {bill.bill_id}
                      </span>
                    </td>

                    <td className="py-3">
                      <span className="text-muted fw-semibold">
                        {bill.report_id || "—"}
                      </span>
                    </td>

                    <td className="py-3">
                      <span className="fw-medium text-dark">
                        #{bill.patient_id}
                      </span>
                    </td>

                    <td className="py-3">
                      <div className="fw-bold text-dark">{bill.test_name}</div>
                      <span className="badge bg-light text-muted border small">
                        {bill.test_code}
                      </span>
                    </td>

                    <td className="py-3 fw-bold text-dark fs-6">
                      ₹{Number(bill.amount || 0).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </td>

                    <td className="py-3">{getPaymentBadge(bill.payment_status)}</td>

                    <td className="py-3 text-muted">
                      {bill.payment_method ? (
                        <span className="badge bg-light text-dark border">
                          {bill.payment_method}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td className="py-3 text-muted small">
                      {bill.created_at
                        ? new Date(bill.created_at).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "—"}
                    </td>

                    <td className="py-3 px-4 text-end">
                      <div className="d-inline-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm rounded-2 d-inline-flex align-items-center gap-1"
                          onClick={() => handleViewBill(bill)}
                        >
                          <i className="bi bi-receipt"></i>
                          Invoice
                        </button>

                        {bill.payment_status !== "PAID" && (
                          <button
                            type="button"
                            className="btn btn-success btn-sm rounded-2 d-inline-flex align-items-center gap-1"
                            onClick={() => handlePayBill(bill)}
                          >
                            <i className="bi bi-credit-card"></i>
                            Pay
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default LaboratoryBilling;
