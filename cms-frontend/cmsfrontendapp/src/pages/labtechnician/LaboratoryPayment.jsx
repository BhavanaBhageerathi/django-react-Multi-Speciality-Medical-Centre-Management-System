import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./LaboratoryPayment.css";

function LaboratoryPayment() {
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

      if (!token) {
        setError("Your login session has expired. Please login again.");
        setLoading(false);
        return;
      }

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

      if (response.status === 401) {
        setError("Your login session has expired. Please login again.");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(data.detail || "Failed to load laboratory bill.");
      }

      setBill(data);
    } catch (err) {
      console.error("PAYMENT PAGE ERROR:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBill();
  }, [billId]);

  const handlePayment = async () => {
    if (!bill) return;

    if (bill.payment_status === "PAID") {
      setSuccess("This bill has already been paid.");
      return;
    }

    setProcessingPayment(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setError("Your login session has expired. Please login again.");
        setProcessingPayment(false);
        return;
      }

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

      if (response.status === 401) {
        setError("Your login session has expired. Please login again.");
        setProcessingPayment(false);
        return;
      }

      if (!response.ok) {
        throw new Error(data.detail || "Payment could not be completed.");
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

  if (loading) {
    return (
      <div className="container-fluid px-3 px-md-4 py-5 text-center">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted">Loading payment details...</p>
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

  const paymentOptions = [
    {
      id: "UPI",
      title: "UPI / QR Code",
      desc: "Instant digital payment",
      icon: "bi-qr-code-scan",
    },
    {
      id: "CASH",
      title: "Cash",
      desc: "Physical cash at counter",
      icon: "bi-cash-stack",
    },
    {
      id: "CARD",
      title: "Credit / Debit Card",
      desc: "POS terminal swipe / chip",
      icon: "bi-credit-card-2-front",
    },
    {
      id: "ONLINE",
      title: "Online / NetBanking",
      desc: "Direct bank transfer",
      icon: "bi-globe",
    },
  ];

  return (
    <div className="container-fluid px-3 px-md-4 py-4">
      {/* HEADER */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Laboratory Bill Payment</h2>
          <p className="text-muted mb-0">
            Process and confirm payment collection for laboratory diagnostics
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
          onClick={() => navigate("/lab-technician/billing")}
        >
          <i className="bi bi-arrow-left"></i>
          Back to Bills
        </button>
      </div>

      {/* FEEDBACK ALERTS */}
      {error && (
        <div
          className="alert alert-danger d-flex align-items-center shadow-sm rounded-3 mb-4"
          role="alert"
        >
          <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
          <div>{error}</div>
        </div>
      )}

      {success && (
        <div
          className="alert alert-success d-flex align-items-center shadow-sm rounded-3 mb-4"
          role="alert"
        >
          <i className="bi bi-check-circle-fill me-2 fs-5"></i>
          <div>{success}</div>
        </div>
      )}

      <div className="row g-4 justify-content-center">
        {/* BILL SUMMARY CARD */}
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center pb-3 mb-3 border-bottom">
                <h5 className="fw-bold text-dark mb-0">Invoice Summary</h5>
                <span
                  className={`badge ${
                    isPaid
                      ? "bg-success-subtle text-success border border-success-subtle"
                      : "bg-warning-subtle text-warning-emphasis border border-warning-subtle"
                  } rounded-pill px-3 py-2`}
                >
                  {bill.payment_status}
                </span>
              </div>

              <div className="mb-4 text-center py-3 bg-light rounded-4 border">
                <div className="text-muted small text-uppercase fw-semibold mb-1">
                  Total Bill Amount
                </div>
                <div className="display-6 fw-bold text-primary">
                  ₹{Number(bill.amount || 0).toFixed(2)}
                </div>
              </div>

              <div className="row g-3 small">
                <div className="col-6">
                  <span className="text-muted">Bill ID:</span>
                  <div className="fw-bold text-dark">{bill.bill_id}</div>
                </div>

                <div className="col-6">
                  <span className="text-muted">Report Reference:</span>
                  <div className="fw-bold text-dark">{bill.report_id || "—"}</div>
                </div>

                <div className="col-6">
                  <span className="text-muted">Patient ID:</span>
                  <div className="fw-bold text-dark">#{bill.patient_id}</div>
                </div>

                <div className="col-6">
                  <span className="text-muted">Request ID:</span>
                  <div className="fw-bold text-dark">{bill.request_id || "—"}</div>
                </div>

                <div className="col-12 border-top pt-2">
                  <span className="text-muted">Test Service:</span>
                  <div className="fw-bold text-dark fs-6">{bill.test_name}</div>
                  <div className="text-muted small">
                    Code: {bill.test_code} | Sample: {bill.sample_type || "Standard"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PAYMENT ACTION CARD */}
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              {!isPaid ? (
                <div>
                  <h5 className="fw-bold text-dark mb-1">Select Payment Method</h5>
                  <p className="text-muted small mb-4">
                    Choose how the patient is paying for this laboratory service
                  </p>

                  <div className="row g-3 mb-4">
                    {paymentOptions.map((opt) => (
                      <div className="col-12 col-sm-6" key={opt.id}>
                        <div
                          className={`card border rounded-4 p-3 h-100 ${
                            paymentMethod === opt.id
                              ? "border-primary bg-primary bg-opacity-10 shadow-sm"
                              : "bg-white"
                          }`}
                          style={{ cursor: "pointer", transition: "all 0.2s" }}
                          onClick={() => setPaymentMethod(opt.id)}
                        >
                          <div className="d-flex align-items-center gap-3">
                            <div
                              className={`rounded-circle d-flex align-items-center justify-content-center ${
                                paymentMethod === opt.id
                                  ? "bg-primary text-white"
                                  : "bg-light text-muted"
                              }`}
                              style={{ width: "42px", height: "42px" }}
                            >
                              <i className={`bi ${opt.icon} fs-5`}></i>
                            </div>

                            <div className="flex-grow-1">
                              <div className="fw-bold text-dark">
                                {opt.title}
                              </div>
                              <div className="text-muted small">{opt.desc}</div>
                            </div>

                            <input
                              type="radio"
                              name="payMethod"
                              className="form-check-input"
                              checked={paymentMethod === opt.id}
                              onChange={() => setPaymentMethod(opt.id)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="btn btn-success w-100 py-3 fw-bold fs-6 rounded-3 d-flex align-items-center justify-content-center gap-2"
                    onClick={handlePayment}
                    disabled={processingPayment}
                  >
                    {processingPayment ? (
                      <>
                        <span className="spinner-border spinner-border-sm"></span>
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check2-circle fs-5"></i>
                        Confirm & Collect ₹{Number(bill.amount || 0).toFixed(2)}
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div
                    className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: "70px", height: "70px" }}
                  >
                    <i className="bi bi-check2 fs-1"></i>
                  </div>

                  <h4 className="fw-bold text-dark mb-1">Payment Completed</h4>
                  <p className="text-muted mb-4">
                    This laboratory invoice has been successfully paid and reconciled.
                  </p>

                  <div className="bg-light p-3 rounded-4 border mb-4 text-start">
                    <div className="row g-2 small">
                      <div className="col-6">
                        <span className="text-muted">Payment Method:</span>
                        <div className="fw-bold text-dark">
                          {bill.payment_method || "Confirmed"}
                        </div>
                      </div>

                      <div className="col-6">
                        <span className="text-muted">Paid At:</span>
                        <div className="fw-bold text-dark">
                          {bill.paid_at
                            ? new Date(bill.paid_at).toLocaleString("en-IN")
                            : "Recorded"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex flex-wrap gap-2 justify-content-center">
                    <button
                      type="button"
                      className="btn btn-primary px-4 d-flex align-items-center gap-2"
                      onClick={() =>
                        navigate(`/lab-technician/billing/${bill.bill_id}`)
                      }
                    >
                      <i className="bi bi-receipt"></i>
                      View Bill Invoice
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline-primary px-4 d-flex align-items-center gap-2"
                      onClick={() =>
                        navigate(`/lab-technician/reports/${bill.report_id}`)
                      }
                    >
                      <i className="bi bi-file-earmark-text"></i>
                      View Lab Report
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LaboratoryPayment;
