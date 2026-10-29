import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000";

function Billing() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] =
    useState("");

  const [generatedBill, setGeneratedBill] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState("CASH");

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [loadingAppointments, setLoadingAppointments] =
    useState(false);

  const [generatingBill, setGeneratingBill] =
    useState(false);

  const [processingPayment, setProcessingPayment] =
    useState(false);

  const getToken = () => {
    return localStorage.getItem("accessToken");
  };

  const getHeaders = () => {
    const token = getToken();

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const formatTime = (time) => {
    if (!time) {
      return "";
    }

    const [hours, minutes] = time.split(":");

    const date = new Date();

    date.setHours(
      Number(hours),
      Number(minutes),
      0,
      0
    );

    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const fetchAppointments = async () => {
    setLoadingAppointments(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `${API_BASE}/api/receptionist/appointments/`,
        {
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to load appointments."
        );
      }

      const appointmentList =
        Array.isArray(data)
          ? data
          : data.results || [];

      // Cancelled appointments should not be billed.
      setAppointments(
        appointmentList.filter(
          (item) => item.status !== "CANCELLED"
        )
      );
    } catch (error) {
      console.error(
        "APPOINTMENT LOAD ERROR:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to load appointments."
      );
    } finally {
      setLoadingAppointments(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const appointment = appointments.find(
    (item) =>
      String(item.id) ===
      String(selectedAppointment)
  );

  const handleGenerateBill = async () => {
    setSuccessMessage("");
    setErrorMessage("");

    if (!selectedAppointment) {
      setErrorMessage(
        "Please select an appointment."
      );
      return;
    }

    setGeneratingBill(true);

    try {
      const response = await fetch(
        `${API_BASE}/api/receptionist/bills/`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({
            appointment:
              Number(selectedAppointment),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to generate bill."
        );
      }

      setGeneratedBill(data);

      setPaymentMethod(
        data.payment_method || "CASH"
      );

      setSuccessMessage(
        `Bill generated successfully for ${
          data.patient_name ||
          appointment?.patient_name ||
          "the patient"
        }.`
      );
    } catch (error) {
      console.error(
        "BILL GENERATION ERROR:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to generate bill."
      );
    } finally {
      setGeneratingBill(false);
    }
  };

  const handleProcessPayment = async () => {
    if (!generatedBill) {
      return;
    }

    setSuccessMessage("");
    setErrorMessage("");
    setProcessingPayment(true);

    try {
      const response = await fetch(
        `${API_BASE}/api/receptionist/bills/${generatedBill.id}/`,
        {
          method: "PATCH",
          headers: getHeaders(),
          body: JSON.stringify({
            payment_status: "PAID",
            payment_method: paymentMethod,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to process payment."
        );
      }

      setGeneratedBill(data);

      setSuccessMessage(
        "Payment processed successfully."
      );
    } catch (error) {
      console.error(
        "PAYMENT ERROR:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to process payment."
      );
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleAppointmentChange = (event) => {
    setSelectedAppointment(
      event.target.value
    );

    setGeneratedBill(null);
    setSuccessMessage("");
    setErrorMessage("");
  };

  const patientName =
    generatedBill?.patient_name ||
    appointment?.patient_name ||
    "";

  const patientId =
    generatedBill?.patient_id ||
    appointment?.patient_id ||
    "";

  const doctorName =
    generatedBill?.doctor_name ||
    appointment?.doctor_name ||
    "";

  const departmentName =
    generatedBill?.department_name ||
    appointment?.department_name ||
    "";

  const appointmentDate =
    generatedBill?.appointment_date ||
    appointment?.appointment_date ||
    "";

  const appointmentTime =
    generatedBill?.appointment_time ||
    appointment?.appointment_time ||
    "";

  const consultationFee =
    generatedBill?.consultation_fee ?? 0;

  const registrationFee =
    generatedBill?.registration_fee ?? 0;

  const totalAmount =
    generatedBill?.total_amount ?? 0;

  const billId =
    generatedBill?.id || "";

  return (
    <main className="container-fluid px-3 px-md-4 py-4 bg-light min-vh-100">

      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            Consultation Billing
          </h2>

          <p className="text-muted mb-0">
            Generate and process consultation bills.
          </p>
        </div>

        {/* <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => navigate(-1)}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back
        </button> */}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div
          className="alert alert-danger d-flex align-items-start shadow-sm"
          role="alert"
        >
          <i className="bi bi-exclamation-circle-fill me-2 fs-5"></i>

          <div>{errorMessage}</div>

          <button
            type="button"
            className="btn-close ms-auto"
            onClick={() =>
              setErrorMessage("")
            }
          ></button>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div
          className="alert alert-success d-flex align-items-start shadow-sm"
          role="alert"
        >
          <i className="bi bi-check-circle-fill me-2 fs-5"></i>

          <div>{successMessage}</div>

          <button
            type="button"
            className="btn-close ms-auto"
            onClick={() =>
              setSuccessMessage("")
            }
          ></button>
        </div>
      )}

      {/* Billing Selection Card */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-3 p-md-4 p-lg-5">

          {/* Section Header */}
          <div className="d-flex align-items-center mb-4">
            <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-3">
              <i className="bi bi-receipt text-primary fs-5"></i>
            </div>

            <div>
              <h5 className="fw-bold mb-0">
                Select Appointment
              </h5>

              <small className="text-muted">
                Choose an appointment to generate its consultation bill.
              </small>
            </div>
          </div>

          {/* Appointment Selection */}
          <div className="mb-3">
            <label className="form-label fw-semibold">
              <i className="bi bi-calendar-check me-2 text-primary"></i>
              Appointment
            </label>

            <select
              className="form-select form-select-lg"
              value={selectedAppointment}
              onChange={
                handleAppointmentChange
              }
              disabled={loadingAppointments}
            >
              <option value="">
                {loadingAppointments
                  ? "Loading appointments..."
                  : "Select an appointment"}
              </option>

              {appointments.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.id}
                  {" - "}
                  {item.patient_name}
                  {" - "}
                  {item.appointment_date}
                  {" - "}
                  {formatTime(
                    item.appointment_time
                  )}
                </option>
              ))}
            </select>

            {loadingAppointments && (
              <div className="form-text">
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                ></span>
                Loading appointments...
              </div>
            )}

            {!loadingAppointments &&
              appointments.length === 0 && (
                <div className="form-text text-warning">
                  <i className="bi bi-info-circle me-1"></i>
                  No billable appointments available.
                </div>
              )}
          </div>

          {/* Selected Appointment */}
          {appointment && (
            <div className="mt-4">

              <div className="d-flex align-items-center mb-3">
                <div className="rounded-circle bg-info bg-opacity-10 p-2 me-3">
                  <i className="bi bi-calendar2-check text-info fs-5"></i>
                </div>

                <div>
                  <h5 className="fw-bold mb-0">
                    Appointment Details
                  </h5>

                  <small className="text-muted">
                    Details of the selected appointment.
                  </small>
                </div>
              </div>

              <div className="row g-3">

                {/* Appointment ID */}
                <div className="col-12 col-sm-6 col-lg-4">
                  <div className="card border-0 bg-light h-100 rounded-4">
                    <div className="card-body">
                      <small className="text-muted d-block mb-1">
                        Appointment ID
                      </small>

                      <div className="fw-bold">
                        #{appointment.id}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Token */}
                <div className="col-12 col-sm-6 col-lg-4">
                  <div className="card border-0 bg-light h-100 rounded-4">
                    <div className="card-body">
                      <small className="text-muted d-block mb-1">
                        Token Number
                      </small>

                      <div className="fw-bold">
                        {appointment.token_number}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Patient */}
                <div className="col-12 col-sm-6 col-lg-4">
                  <div className="card border-0 bg-light h-100 rounded-4">
                    <div className="card-body">
                      <small className="text-muted d-block mb-1">
                        Patient
                      </small>

                      <div className="fw-bold">
                        {appointment.patient_name}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Patient ID */}
                <div className="col-12 col-sm-6 col-lg-4">
                  <div className="card border-0 bg-light h-100 rounded-4">
                    <div className="card-body">
                      <small className="text-muted d-block mb-1">
                        Patient ID
                      </small>

                      <div className="fw-bold">
                        {appointment.patient_id}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Doctor */}
                <div className="col-12 col-sm-6 col-lg-4">
                  <div className="card border-0 bg-light h-100 rounded-4">
                    <div className="card-body">
                      <small className="text-muted d-block mb-1">
                        Doctor
                      </small>

                      <div className="fw-bold">
                        {appointment.doctor_name}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Department */}
                <div className="col-12 col-sm-6 col-lg-4">
                  <div className="card border-0 bg-light h-100 rounded-4">
                    <div className="card-body">
                      <small className="text-muted d-block mb-1">
                        Department
                      </small>

                      <div className="fw-bold">
                        {appointment.department_name}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Date */}
                <div className="col-12 col-sm-6 col-lg-4">
                  <div className="card border-0 bg-light h-100 rounded-4">
                    <div className="card-body">
                      <small className="text-muted d-block mb-1">
                        Appointment Date
                      </small>

                      <div className="fw-bold">
                        {appointment.appointment_date}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Time */}
                <div className="col-12 col-sm-6 col-lg-4">
                  <div className="card border-0 bg-light h-100 rounded-4">
                    <div className="card-body">
                      <small className="text-muted d-block mb-1">
                        Appointment Time
                      </small>

                      <div className="fw-bold">
                        {formatTime(
                          appointment.appointment_time
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="col-12 col-sm-6 col-lg-4">
                  <div className="card border-0 bg-light h-100 rounded-4">
                    <div className="card-body">
                      <small className="text-muted d-block mb-1">
                        Status
                      </small>

                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2">
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Generate Bill Buttons */}
              {!generatedBill && (
                <div className="d-flex flex-column-reverse flex-sm-row justify-content-end gap-2 mt-4 pt-4 border-top">
                  <button
                    type="button"
                    className="btn btn-outline-secondary px-4"
                    onClick={() =>
                      navigate(-1)
                    }
                    disabled={generatingBill}
                  >
                    <i className="bi bi-x-lg me-2"></i>
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="btn btn-primary px-4"
                    onClick={
                      handleGenerateBill
                    }
                    disabled={generatingBill}
                  >
                    {generatingBill ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>
                        Generating Bill...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-receipt-cutoff me-2"></i>
                        Generate Bill
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Generated Bill */}
      {generatedBill && (
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body p-3 p-md-4 p-lg-5">

            {/* Bill Header */}
            <div className="text-center border-bottom pb-4 mb-4">
              <div className="d-inline-flex align-items-center justify-content-center rounded-3 bg-primary bg-opacity-10 p-3 mb-3">
                <i className="bi bi-hospital text-primary fs-3"></i>
              </div>

              <h3 className="fw-bold mb-1">
                Clinic Management System
              </h3>

              <p className="text-muted mb-0">
                Consultation Bill
              </p>
            </div>

            {/* Bill Information */}
            <div className="row g-3 mb-4">

              <div className="col-12 col-md-4">
                <div className="bg-light rounded-4 p-3 h-100">
                  <small className="text-muted d-block mb-1">
                    Bill ID
                  </small>

                  <strong>
                    #{billId}
                  </strong>
                </div>
              </div>

              <div className="col-12 col-md-4">
                <div className="bg-light rounded-4 p-3 h-100">
                  <small className="text-muted d-block mb-1">
                    Appointment ID
                  </small>

                  <strong>
                    #{generatedBill.appointment}
                  </strong>
                </div>
              </div>

              <div className="col-12 col-md-4">
                <div className="bg-light rounded-4 p-3 h-100">
                  <small className="text-muted d-block mb-1">
                    Bill Date
                  </small>

                  <strong>
                    {generatedBill.created_at
                      ? new Date(
                          generatedBill.created_at
                        ).toLocaleDateString(
                          "en-IN"
                        )
                      : appointmentDate}
                  </strong>
                </div>
              </div>
            </div>

            {/* Patient Details */}
            <div className="mb-4">
              <div className="d-flex align-items-center mb-3">
                <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-3">
                  <i className="bi bi-person-vcard text-primary"></i>
                </div>

                <h5 className="fw-bold mb-0">
                  Patient Details
                </h5>
              </div>

              <div className="row g-3">

                <div className="col-12 col-sm-6">
                  <div className="border rounded-4 p-3 h-100">
                    <small className="text-muted d-block mb-1">
                      Patient ID
                    </small>

                    <strong>
                      {patientId}
                    </strong>
                  </div>
                </div>

                <div className="col-12 col-sm-6">
                  <div className="border rounded-4 p-3 h-100">
                    <small className="text-muted d-block mb-1">
                      Patient Name
                    </small>

                    <strong>
                      {patientName}
                    </strong>
                  </div>
                </div>

                <div className="col-12 col-sm-6">
                  <div className="border rounded-4 p-3 h-100">
                    <small className="text-muted d-block mb-1">
                      Doctor
                    </small>

                    <strong>
                      {doctorName}
                    </strong>
                  </div>
                </div>

                <div className="col-12 col-sm-6">
                  <div className="border rounded-4 p-3 h-100">
                    <small className="text-muted d-block mb-1">
                      Department
                    </small>

                    <strong>
                      {departmentName}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Appointment */}
            <div className="mb-4">
              <div className="d-flex align-items-center mb-3">
                <div className="rounded-circle bg-info bg-opacity-10 p-2 me-3">
                  <i className="bi bi-calendar-event text-info"></i>
                </div>

                <h5 className="fw-bold mb-0">
                  Appointment
                </h5>
              </div>

              <div className="row g-3">

                <div className="col-12 col-sm-6">
                  <div className="border rounded-4 p-3">
                    <small className="text-muted d-block mb-1">
                      Date
                    </small>

                    <strong>
                      {appointmentDate}
                    </strong>
                  </div>
                </div>

                <div className="col-12 col-sm-6">
                  <div className="border rounded-4 p-3">
                    <small className="text-muted d-block mb-1">
                      Time
                    </small>

                    <strong>
                      {formatTime(
                        appointmentTime
                      )}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Charges */}
            <div className="mb-4">
              <div className="d-flex align-items-center mb-3">
                <div className="rounded-circle bg-warning bg-opacity-10 p-2 me-3">
                  <i className="bi bi-cash-stack text-warning"></i>
                </div>

                <h5 className="fw-bold mb-0">
                  Charges
                </h5>
              </div>

              <div className="border rounded-4 overflow-hidden">

                <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                  <span>
                    Consultation Fee
                  </span>

                  <strong>
                    ₹{consultationFee}
                  </strong>
                </div>

                <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                  <span>
                    Registration Fee
                  </span>

                  <strong>
                    ₹{registrationFee}
                  </strong>
                </div>

                <div className="d-flex justify-content-between align-items-center p-3 bg-primary bg-opacity-10">
                  <span className="fw-bold">
                    Total Amount
                  </span>

                  <strong className="fs-5 text-primary">
                    ₹{totalAmount}
                  </strong>
                </div>
              </div>
            </div>

            {/* Payment Status */}
            <div className="card border-0 bg-light rounded-4 mb-4">
              <div className="card-body p-4">
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
                  <div>
                    <small className="text-muted d-block">
                      Payment Status
                    </small>

                    <strong>
                      {generatedBill.payment_status}
                    </strong>
                  </div>

                  <span
                    className={`badge px-3 py-2 ${
                      generatedBill.payment_status ===
                      "PAID"
                        ? "bg-success-subtle text-success border border-success-subtle"
                        : "bg-warning-subtle text-warning-emphasis border border-warning-subtle"
                    }`}
                  >
                    <i
                      className={`bi ${
                        generatedBill.payment_status ===
                        "PAID"
                          ? "bi-check-circle-fill"
                          : "bi-clock-fill"
                      } me-1`}
                    ></i>

                    {generatedBill.payment_status}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            {generatedBill.payment_status !==
              "PAID" && (
              <div className="mb-4">
                <label className="form-label fw-semibold">
                  <i className="bi bi-credit-card me-2 text-primary"></i>
                  Payment Method
                </label>

                <select
                  className="form-select form-select-lg"
                  value={paymentMethod}
                  onChange={(event) =>
                    setPaymentMethod(
                      event.target.value
                    )
                  }
                  disabled={
                    processingPayment
                  }
                >
                  <option value="CASH">
                    Cash
                  </option>

                  <option value="CARD">
                    Card
                  </option>

                  <option value="UPI">
                    UPI
                  </option>

                  <option value="OTHER">
                    Other
                  </option>
                </select>
              </div>
            )}

            {/* Bill Actions */}
            <div className="d-flex flex-column flex-sm-row justify-content-end gap-2 pt-4 border-top">

              {generatedBill.payment_status !==
                "PAID" && (
                <button
                  type="button"
                  className="btn btn-success px-4"
                  onClick={
                    handleProcessPayment
                  }
                  disabled={
                    processingPayment
                  }
                >
                  {processingPayment ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-credit-card-2-front me-2"></i>
                      Process Payment
                    </>
                  )}
                </button>
              )}

              <button
                type="button"
                className="btn btn-primary px-4"
                onClick={() =>
                  window.print()
                }
              >
                <i className="bi bi-printer me-2"></i>
                Print Bill
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Billing;