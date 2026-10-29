import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./LaboratoryBillDetails.css";

function LaboratoryBillDetails() {
  const { billId } = useParams();
  const navigate = useNavigate();

  const [bill, setBill] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchBill = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        `http://127.0.0.1:8000/api/lab-technician/bills/${billId}/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to load laboratory bill.");
      }

      setBill(data);
    } catch (err) {
      console.error("FETCH BILL ERROR:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBill();
  }, [billId]);

  const handlePayment = async () => {
    if (!bill || bill.payment_status === "PAID") {
      return;
    }

    setProcessingPayment(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        `http://127.0.0.1:8000/api/lab-technician/bills/${billId}/pay/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            payment_method: paymentMethod,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to record payment.");
      }

      setBill(data.bill);
      setSuccess("Payment recorded successfully!");
    } catch (err) {
      console.error("PAYMENT ERROR:", err);
      setError(err.message);
    } finally {
      setProcessingPayment(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    alert(
      "Report and bill sharing will be connected after the Patient module is completed."
    );
  };

  if (loading) {
    return (
      <div className="container-fluid px-3 px-md-4 py-5 text-center">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted">Loading laboratory bill...</p>
      </div>
    );
  }

  if (error && !bill) {
    return (
      <div className="container-fluid px-3 px-md-4 py-4">
        <div className="alert alert-danger shadow-sm rounded-3 mb-4">
          <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
          {error}
        </div>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate("/lab-technician/billing")}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Billing
        </button>
      </div>
    );
  }

  if (!bill) {
    return null;
  }

  const isPaid = bill.payment_status === "PAID";

  return (
    <div className="container-fluid px-3 px-md-4 py-4">
      {/* TOOLBAR ACTIONS */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4 no-print">
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
          onClick={() => navigate("/lab-technician/billing")}
        >
          <i className="bi bi-arrow-left"></i>
          Back to Billing
        </button>

        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
            onClick={handlePrint}
          >
            <i className="bi bi-printer"></i>
            Print Invoice
          </button>

          {isPaid && (
            <button
              type="button"
              className="btn btn-success btn-sm d-flex align-items-center gap-1"
              onClick={handleShare}
            >
              <i className="bi bi-share"></i>
              Share Invoice
            </button>
          )}
        </div>
      </div>

      {/* FEEDBACK ALERTS */}
      {error && (
        <div
          className="alert alert-danger d-flex align-items-center shadow-sm rounded-3 mb-4 no-print"
          role="alert"
        >
          <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
          <div>{error}</div>
        </div>
      )}

      {success && (
        <div
          className="alert alert-success d-flex align-items-center shadow-sm rounded-3 mb-4 no-print"
          role="alert"
        >
          <i className="bi bi-check-circle-fill me-2 fs-5"></i>
          <div>{success}</div>
        </div>
      )}

      {/* INVOICE CARD */}
      <div className="card border-0 shadow-sm rounded-4 mx-auto bill-document-card mb-4">
        <div className="card-body p-4 p-md-5">
          {/* HEADER */}
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center pb-4 border-bottom mb-4">
            <div className="d-flex align-items-center mb-3 mb-sm-0">
              <div
                className="bg-primary text-white rounded-3 d-flex align-items-center justify-content-center me-3"
                style={{ width: "50px", height: "50px" }}
              >
                <i className="bi bi-hospital fs-3"></i>
              </div>
              <div>
                <h4 className="fw-bold text-dark mb-0">CLINIC MANAGEMENT SYSTEM</h4>
                <div className="text-secondary small fw-semibold">
                  Department of Laboratory Medicine
                </div>
              </div>
            </div>

            <div className="text-sm-end">
              <span
                className={`badge ${
                  isPaid ? "bg-success" : "bg-warning text-dark"
                } px-3 py-2 fs-6 mb-1`}
              >
                {isPaid ? "PAID INVOICE" : "PENDING PAYMENT"}
              </span>
              <div className="text-muted small">
                Invoice ID: <strong>{bill.bill_id}</strong>
              </div>
            </div>
          </div>

          {/* INVOICE METADATA */}
          <div className="bg-light p-4 rounded-4 mb-4 border">
            <div className="row g-3">
              <div className="col-6 col-md-3">
                <div className="text-muted small text-uppercase fw-semibold">
                  Patient ID
                </div>
                <div className="fw-bold text-dark fs-6">
                  #{bill.patient_id || "—"}
                </div>
              </div>

              <div className="col-6 col-md-3">
                <div className="text-muted small text-uppercase fw-semibold">
                  Request ID
                </div>
                <div className="fw-bold text-primary fs-6">
                  {bill.request_id || "—"}
                </div>
              </div>

              <div className="col-6 col-md-3">
                <div className="text-muted small text-uppercase fw-semibold">
                  Report ID
                </div>
                <div className="fw-bold text-dark fs-6">
                  {bill.report_id || "—"}
                </div>
              </div>

              <div className="col-6 col-md-3">
                <div className="text-muted small text-uppercase fw-semibold">
                  Invoice Date
                </div>
                <div className="fw-medium text-dark">
                  {bill.created_at
                    ? new Date(bill.created_at).toLocaleDateString("en-IN")
                    : "—"}
                </div>
              </div>
            </div>
          </div>

          {/* TEST LINE ITEMS TABLE */}
          <div className="table-responsive mb-4">
            <table className="table table-bordered align-middle mb-0">
              <thead className="table-light text-secondary small text-uppercase">
                <tr>
                  <th className="py-3 px-3">Item / Service Description</th>
                  <th className="py-3 px-3 text-center">Test Code</th>
                  <th className="py-3 px-3 text-center">Sample Type</th>
                  <th className="py-3 px-3 text-end">Charge</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-3 px-3">
                    <div className="fw-bold text-dark">{bill.test_name}</div>
                    <div className="small text-muted">Laboratory Diagnostics</div>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="badge bg-light text-muted border">
                      {bill.test_code || "—"}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center text-muted">
                    {bill.sample_type || "Standard"}
                  </td>
                  <td className="py-3 px-3 text-end fw-bold text-dark fs-6">
                    ₹{Number(bill.amount || 0).toFixed(2)}
                  </td>
                </tr>
              </tbody>
              <tfoot className="table-light">
                <tr>
                  <th colSpan="3" className="text-end py-3 px-3 fw-bold">
                    Total Amount Due:
                  </th>
                  <th className="text-end py-3 px-3 fw-bold text-primary fs-5">
                    ₹{Number(bill.amount || 0).toFixed(2)}
                  </th>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* PAYMENT DETAILS BOX */}
          <div className="card border bg-light rounded-4 mb-4">
            <div className="card-body p-4">
              <h6 className="fw-bold text-dark text-uppercase mb-3">
                Payment Verification Details
              </h6>
              <div className="row g-3">
                <div className="col-12 col-sm-4">
                  <div className="text-muted small text-uppercase fw-semibold">
                    Payment Status
                  </div>
                  <div>
                    <span
                      className={`badge ${
                        isPaid
                          ? "bg-success-subtle text-success border border-success-subtle"
                          : "bg-warning-subtle text-warning-emphasis border border-warning-subtle"
                      } rounded-pill px-3 py-2 mt-1`}
                    >
                      {bill.payment_status}
                    </span>
                  </div>
                </div>

                <div className="col-12 col-sm-4">
                  <div className="text-muted small text-uppercase fw-semibold">
                    Payment Method
                  </div>
                  <div className="fw-bold text-dark mt-1">
                    {bill.payment_method || "Pending Payment"}
                  </div>
                </div>

                <div className="col-12 col-sm-4">
                  <div className="text-muted small text-uppercase fw-semibold">
                    Payment Timestamp
                  </div>
                  <div className="fw-medium text-dark mt-1">
                    {bill.paid_at
                      ? new Date(bill.paid_at).toLocaleString("en-IN")
                      : "Awaiting Payment"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PAYMENT EXECUTION FORM (IF UNPAID) */}
          {!isPaid && (
            <div className="card border-primary border-opacity-50 rounded-4 bg-primary bg-opacity-10 p-4 no-print mb-4">
              <h5 className="fw-bold text-dark mb-2">Record Patient Payment</h5>
              <p className="text-muted small mb-3">
                Select the payment mode collected at the clinic and confirm
                receipt of ₹{Number(bill.amount || 0).toFixed(2)}.
              </p>

              <div className="row g-3 align-items-end">
                <div className="col-12 col-sm-6 col-md-5">
                  <label
                    htmlFor="paymentMethod"
                    className="form-label fw-semibold text-dark small"
                  >
                    Payment Method
                  </label>
                  <select
                    id="paymentMethod"
                    className="form-select"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="UPI">UPI / QR Code</option>
                    <option value="CASH">Cash</option>
                    <option value="CARD">Credit / Debit Card</option>
                    <option value="ONLINE">Online NetBanking</option>
                  </select>
                </div>

                <div className="col-12 col-sm-6 col-md-4">
                  <button
                    type="button"
                    className="btn btn-success w-100 d-flex align-items-center justify-content-center gap-2"
                    onClick={handlePayment}
                    disabled={processingPayment}
                  >
                    {processingPayment ? (
                      <>
                        <span className="spinner-border spinner-border-sm"></span>
                        Recording...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle"></i>
                        Confirm Payment
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* FOOTER */}
          <div className="text-center text-muted small pt-3 border-top mt-4">
            Thank you for choosing Clinic Management System. Official tax invoice generated under Clinic Laboratory Services.
          </div>
        </div>
      </div>
    </div>
  );
}

export default LaboratoryBillDetails;
