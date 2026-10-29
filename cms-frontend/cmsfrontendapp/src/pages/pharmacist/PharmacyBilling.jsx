import { useEffect, useMemo, useRef, useState } from "react";
import pharmacyapi from "../../api/pharmacyapi";

function PharmacyBilling() {
  // ==========================================
  // STATE
  // ==========================================

  const [issuedPrescriptions, setIssuedPrescriptions] =
    useState([]);

  const [bills, setBills] = useState([]);

  const [searchPatient, setSearchPatient] =
    useState("");

  const [selectedPrescription, setSelectedPrescription] =
    useState(null);

  const [paymentMethod, setPaymentMethod] =
    useState("Cash");

  const [generatedBill, setGeneratedBill] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [generating, setGenerating] =
    useState(false);

  const [error, setError] =
    useState("");

  // ==========================================
  // AUTO SCROLL
  // ==========================================

  const generatedBillRef = useRef(null);
  const unbilledListRef = useRef(null);
  const billDetailsRef = useRef(null);

  const scrollTo = (ref) => {
    setTimeout(() => {
      ref.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  // ==========================================
  // LOAD ISSUED PRESCRIPTIONS
  // ==========================================

  const loadIssuedPrescriptions = async () => {
    try {
      const response = await pharmacyapi.get(
        "pharmacist/issued-prescriptions/"
      );

      setIssuedPrescriptions(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error(
        "Error loading issued prescriptions:",
        error
      );

      throw error;
    }
  };

  // ==========================================
  // LOAD BILLS
  // ==========================================

  const loadBills = async () => {
    try {
      const response = await pharmacyapi.get(
        "pharmacist/bills/"
      );

      setBills(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error(
        "Error loading bills:",
        error
      );

      throw error;
    }
  };

  // ==========================================
  // LOAD PAGE DATA
  // ==========================================

  const loadPageData = async (
    isRefresh = false
  ) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      await Promise.all([
        loadIssuedPrescriptions(),
        loadBills(),
      ]);
    } catch (error) {
      console.error(
        "Error loading billing data:",
        error
      );

      setError(
        "Unable to load billing data. Please check the Django backend."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ==========================================
  // LOAD WHEN PAGE OPENS
  // ==========================================

  useEffect(() => {
    loadPageData();
  }, []);

  // ==========================================
  // CHECK IF PRESCRIPTION IS ALREADY BILLED
  // ==========================================

  const isAlreadyBilled = (
    issuedPrescription
  ) => {
    return bills.some(
      (bill) =>
        Number(
          bill.issued_prescription
        ) ===
        Number(
          issuedPrescription.id
        )
    );
  };

  // ==========================================
  // UNBILLED ISSUED PRESCRIPTIONS
  // ==========================================

  const unbilledPrescriptions =
    useMemo(() => {
      return issuedPrescriptions.filter(
        (issuedPrescription) =>
          !isAlreadyBilled(
            issuedPrescription
          )
      );
    }, [
      issuedPrescriptions,
      bills,
    ]);

  // ==========================================
  // FILTER PRESCRIPTIONS
  // ==========================================

  const filteredPrescriptions =
    useMemo(() => {
      const search =
        searchPatient
          .trim()
          .toLowerCase();

      if (!search) {
        return unbilledPrescriptions;
      }

      return unbilledPrescriptions.filter(
        (issuedPrescription) => {
          const patientName =
            issuedPrescription.patient_name ||
            "";

          const patientId =
            issuedPrescription.patient_id ||
            "";

          return (
            patientName
              .toLowerCase()
              .includes(search) ||
            String(patientId)
              .toLowerCase()
              .includes(search)
          );
        }
      );
    }, [
      unbilledPrescriptions,
      searchPatient,
    ]);

  // ==========================================
  // CALCULATE TOTAL
  // ==========================================

  const calculateTotal = () => {
    if (!selectedPrescription) {
      return 0;
    }

    if (
      !Array.isArray(
        selectedPrescription.medicines
      )
    ) {
      return 0;
    }

    return selectedPrescription.medicines.reduce(
      (total, medicine) => {
        const quantity =
          Number(
            medicine.issued_quantity
          ) || 0;

        const price =
          Number(
            medicine.price_at_issue
          ) || 0;

        return (
          total +
          quantity * price
        );
      },
      0
    );
  };

  // ==========================================
  // SELECT PRESCRIPTION
  // ==========================================

  const handleSelectPrescription = (
    prescription
  ) => {
    setSelectedPrescription(
      prescription
    );

    setGeneratedBill(null);

    // Automatically scroll to bill details
    scrollTo(billDetailsRef);
  };

  // ==========================================
  // CLEAR SELECTION
  // ==========================================

  const handleClearSelection = () => {
    if (generating) {
      return;
    }

    setSelectedPrescription(null);

    // Return to unbilled list
    scrollTo(unbilledListRef);
  };

  // ==========================================
  // GENERATE BILL
  // ==========================================

  const handleGenerateBill =
    async () => {
      if (!selectedPrescription) {
        alert(
          "Please select a patient."
        );

        return;
      }

      if (
        isAlreadyBilled(
          selectedPrescription
        )
      ) {
        alert(
          "This prescription has already been billed."
        );

        return;
      }

      try {
        setGenerating(true);

        const response =
          await pharmacyapi.post(
            `pharmacist/issued-prescriptions/${selectedPrescription.id}/bill/`,
            {
              payment_method:
                paymentMethod,
            }
          );

        console.log(
          "Generated bill:",
          response.data
        );

        const bill =
          response.data.bill;

        // Save generated bill
        setGeneratedBill(bill);

        alert(
          "Bill generated successfully!"
        );

        // ======================================
        // REFRESH DATA
        // ======================================

        await Promise.all([
          loadBills(),
          loadIssuedPrescriptions(),
        ]);

        // ======================================
        // CLEAR SELECTED PRESCRIPTION
        // ======================================

        setSelectedPrescription(null);
        setSearchPatient("");

        // ======================================
        // AUTO SCROLL TO GENERATED BILL
        // ======================================

        scrollTo(generatedBillRef);

      } catch (error) {
        console.error(
          "Bill generation error:",
          error.response?.data ||
            error
        );

        const message =
          error.response?.data?.detail ||
          error.response?.data?.message ||
          "Unable to generate bill.";

        alert(message);
      } finally {
        setGenerating(false);
      }
    };

  // ==========================================
  // PRINT BILL
  // ==========================================

  const handlePrintBill = () => {
    window.print();
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="container-fluid px-3 px-md-4 py-4">

        <div className="text-center py-5">

          <div
            className="spinner-border text-primary"
            role="status"
          ></div>

          <p className="text-muted mt-3 mb-0">
            Loading pharmacy billing...
          </p>

        </div>

      </div>
    );
  }

  // ==========================================
  // MAIN PAGE
  // ==========================================

  return (
    <div className="container-fluid px-3 px-md-4 py-4">

      {/* ==================================== */}
      {/* PAGE HEADER */}
      {/* ==================================== */}

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">

        <div>

          <div className="d-flex align-items-center gap-2 mb-2">

            <div className="rounded-3 bg-primary bg-opacity-10 p-2">

              <i className="bi bi-receipt text-primary fs-4"></i>

            </div>

            <h2 className="fw-bold mb-0">
              Pharmacy Billing
            </h2>

          </div>

          <p className="text-muted mb-0">
            Generate bills for medicines issued
            to patients.
          </p>

        </div>

        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={() =>
            loadPageData(true)
          }
          disabled={refreshing}
        >

          {refreshing ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
              ></span>

              Refreshing...
            </>
          ) : (
            <>
              <i className="bi bi-arrow-clockwise me-2"></i>
              Refresh
            </>
          )}

        </button>

      </div>

      {/* ==================================== */}
      {/* ERROR */}
      {/* ==================================== */}

      {error && (
        <div
          className="alert alert-danger d-flex align-items-center justify-content-between"
          role="alert"
        >

          <div>

            <i className="bi bi-exclamation-triangle-fill me-2"></i>

            {error}

          </div>

          <button
            type="button"
            className="btn btn-sm btn-danger"
            onClick={() =>
              loadPageData()
            }
          >
            Try Again
          </button>

        </div>
      )}

      {/* ==================================== */}
      {/* SUMMARY CARDS */}
      {/* ==================================== */}

      <div className="row g-3 mb-4">

        {/* ISSUED */}

        <div className="col-12 col-sm-6 col-xl-4">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body d-flex align-items-center">

              <div className="rounded-3 bg-primary bg-opacity-10 p-3 me-3">

                <i className="bi bi-capsule-pill text-primary fs-3"></i>

              </div>

              <div>

                <div className="text-muted small">
                  Issued Prescriptions
                </div>

                <h3 className="fw-bold mb-0">
                  {issuedPrescriptions.length}
                </h3>

              </div>

            </div>

          </div>

        </div>

        {/* UNBILLED */}

        <div className="col-12 col-sm-6 col-xl-4">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body d-flex align-items-center">

              <div className="rounded-3 bg-warning bg-opacity-10 p-3 me-3">

                <i className="bi bi-hourglass-split text-warning fs-3"></i>

              </div>

              <div>

                <div className="text-muted small">
                  Unbilled Prescriptions
                </div>

                <h3 className="fw-bold mb-0">
                  {unbilledPrescriptions.length}
                </h3>

              </div>

            </div>

          </div>

        </div>

        {/* BILLS */}

        <div className="col-12 col-sm-6 col-xl-4">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body d-flex align-items-center">

              <div className="rounded-3 bg-success bg-opacity-10 p-3 me-3">

                <i className="bi bi-check-circle text-success fs-3"></i>

              </div>

              <div>

                <div className="text-muted small">
                  Generated Bills
                </div>

                <h3 className="fw-bold mb-0">
                  {bills.length}
                </h3>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ==================================== */}
      {/* SEARCH */}
      {/* ==================================== */}

      <div className="card border-0 shadow-sm mb-4">

        <div className="card-header bg-white border-0 pt-4 px-4">

          <h5 className="fw-bold mb-1">

            <i className="bi bi-search text-primary me-2"></i>

            Search Unbilled Prescription

          </h5>

          <p className="text-muted small mb-0">
            Search by patient name or patient ID.
          </p>

        </div>

        <div className="card-body px-4 pb-4">

          <div className="input-group">

            <span className="input-group-text bg-white">

              <i className="bi bi-search text-muted"></i>

            </span>

            <input
              type="text"
              className="form-control"
              placeholder="Search patient by name or patient ID..."
              value={searchPatient}
              onChange={(event) =>
                setSearchPatient(
                  event.target.value
                )
              }
            />

            {searchPatient && (

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() =>
                  setSearchPatient("")
                }
              >

                <i className="bi bi-x-lg"></i>

              </button>

            )}

          </div>

        </div>

      </div>

      {/* ==================================== */}
      {/* AUTOMATIC UNBILLED LIST */}
      {/* ==================================== */}

      <div
        ref={unbilledListRef}
        className="card border-0 shadow-sm mb-4"
      >

        <div className="card-header bg-white border-0 pt-4 px-4">

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">

            <div>

              <h5 className="fw-bold mb-1">

                <i className="bi bi-file-earmark-medical text-primary me-2"></i>

                Issued &amp; Unbilled Medicines

              </h5>

              <p className="text-muted small mb-0">
                Medicines already issued by the pharmacy
                and waiting for billing.
              </p>

            </div>

            <span className="badge bg-warning text-dark fs-6">

              {filteredPrescriptions.length}{" "}
              Pending

            </span>

          </div>

        </div>

        <div className="card-body p-0">

          <div className="table-responsive">

            <table className="table table-hover align-middle mb-0">

              <thead className="table-light">

                <tr>

                  <th className="px-4">
                    Patient
                  </th>

                  <th>
                    Patient ID
                  </th>

                  <th>
                    Appointment
                  </th>

                  <th>
                    Issued On
                  </th>

                  <th>
                    Medicines
                  </th>

                  <th>
                    Amount
                  </th>

                  <th className="text-center">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredPrescriptions.length ===
                0 ? (

                  <tr>

                    <td
                      colSpan="7"
                      className="text-center py-5"
                    >

                      <i className="bi bi-check-circle text-success fs-1"></i>

                      <div className="fw-semibold mt-3">

                        {searchPatient
                          ? "No matching unbilled prescription found"
                          : "No unbilled prescriptions"}

                      </div>

                      <div className="text-muted small">

                        {searchPatient
                          ? "Try another patient name or ID."
                          : "All issued prescriptions have been billed."}

                      </div>

                    </td>

                  </tr>

                ) : (

                  filteredPrescriptions.map(
                    (issuedPrescription) => {

                      const amount =
                        Array.isArray(
                          issuedPrescription.medicines
                        )
                          ? issuedPrescription.medicines.reduce(
                              (
                                total,
                                medicine
                              ) => {

                                const quantity =
                                  Number(
                                    medicine.issued_quantity
                                  ) || 0;

                                const price =
                                  Number(
                                    medicine.price_at_issue
                                  ) || 0;

                                return (
                                  total +
                                  quantity *
                                    price
                                );
                              },
                              0
                            )
                          : 0;

                      return (

                        <tr
                          key={
                            issuedPrescription.id
                          }
                        >

                          {/* PATIENT */}

                          <td className="px-4">

                            <div className="d-flex align-items-center">

                              <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-2">

                                <i className="bi bi-person-fill text-primary"></i>

                              </div>

                              <div>

                                <div className="fw-semibold">
                                  {
                                    issuedPrescription.patient_name
                                  }
                                </div>

                                <small className="text-muted">
                                  Issued Prescription
                                </small>

                              </div>

                            </div>

                          </td>

                          {/* PATIENT ID */}

                          <td>
                            {
                              issuedPrescription.patient_id
                            }
                          </td>

                          {/* APPOINTMENT */}

                          <td>
                            {
                              issuedPrescription.appointment_id
                            }
                          </td>

                          {/* ISSUED ON */}

                          <td>

                            {issuedPrescription.issued_at
                              ? new Date(
                                  issuedPrescription.issued_at
                                ).toLocaleString()
                              : "-"}

                          </td>

                          {/* MEDICINES */}

                          <td>

                            <span className="badge bg-primary-subtle text-primary">

                              {Array.isArray(
                                issuedPrescription.medicines
                              )
                                ? issuedPrescription
                                    .medicines
                                    .length
                                : 0}{" "}
                              Medicine
                              {Array.isArray(
                                issuedPrescription.medicines
                              ) &&
                              issuedPrescription
                                .medicines
                                .length !==
                                1
                                ? "s"
                                : ""}

                            </span>

                          </td>

                          {/* AMOUNT */}

                          <td>

                            <span className="fw-semibold">

                              ₹{" "}
                              {amount.toFixed(
                                2
                              )}

                            </span>

                          </td>

                          {/* ACTION */}

                          <td className="text-center">

                            <button
                              type="button"
                              className="btn btn-sm btn-primary"
                              onClick={() =>
                                handleSelectPrescription(
                                  issuedPrescription
                                )
                              }
                            >

                              <i className="bi bi-receipt me-1"></i>

                              Generate Bill

                            </button>

                          </td>

                        </tr>

                      );
                    }
                  )

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

      {/* ==================================== */}
      {/* BILL DETAILS */}
      {/* ==================================== */}

      {selectedPrescription && (

        <div
          ref={billDetailsRef}
          className="card border-0 shadow-sm mb-4"
        >

          {/* HEADER */}

          <div className="card-header bg-white border-0 pt-4 px-4">

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">

              <div>

                <h5 className="fw-bold mb-1">

                  <i className="bi bi-receipt-cutoff text-primary me-2"></i>

                  Bill Details

                </h5>

                <p className="text-muted small mb-0">
                  Review the issued medicines before
                  generating the pharmacy bill.
                </p>

              </div>

              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={
                  handleClearSelection
                }
                disabled={generating}
              >

                <i className="bi bi-x-lg me-1"></i>

                Close

              </button>

            </div>

          </div>

          <div className="card-body px-4 pb-4">

            {/* PATIENT DETAILS */}

            <div className="row g-3 mb-4">

              <div className="col-12 col-md-4">

                <div className="bg-light rounded-3 p-3 h-100">

                  <small className="text-muted">
                    Patient Name
                  </small>

                  <div className="fw-semibold mt-1">
                    {
                      selectedPrescription.patient_name
                    }
                  </div>

                </div>

              </div>

              <div className="col-12 col-md-4">

                <div className="bg-light rounded-3 p-3 h-100">

                  <small className="text-muted">
                    Patient ID
                  </small>

                  <div className="fw-semibold mt-1">
                    {
                      selectedPrescription.patient_id
                    }
                  </div>

                </div>

              </div>

              <div className="col-12 col-md-4">

                <div className="bg-light rounded-3 p-3 h-100">

                  <small className="text-muted">
                    Appointment ID
                  </small>

                  <div className="fw-semibold mt-1">
                    {
                      selectedPrescription.appointment_id
                    }
                  </div>

                </div>

              </div>

            </div>

            {/* MEDICINES TABLE */}

            <div className="card border mb-4">

              <div className="card-header bg-light border-0">

                <h6 className="fw-bold mb-0">
                  Issued Medicines
                </h6>

              </div>

              <div className="card-body p-0">

                <div className="table-responsive">

                  <table className="table table-hover align-middle mb-0">

                    <thead className="table-light">

                      <tr>

                        <th className="px-3">
                          Medicine
                        </th>

                        <th>
                          Quantity
                        </th>

                        <th>
                          Price / Unit
                        </th>

                        <th>
                          Total
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {selectedPrescription
                        .medicines
                        ?.map(
                          (medicine) => {

                            const quantity =
                              Number(
                                medicine.issued_quantity
                              ) || 0;

                            const price =
                              Number(
                                medicine.price_at_issue
                              ) || 0;

                            const total =
                              quantity *
                              price;

                            return (

                              <tr
                                key={
                                  medicine.id
                                }
                              >

                                <td className="px-3">

                                  <div className="d-flex align-items-center">

                                    <div className="rounded-3 bg-primary bg-opacity-10 p-2 me-2">

                                      <i className="bi bi-capsule text-primary"></i>

                                    </div>

                                    <span className="fw-semibold">
                                      {
                                        medicine.medicine_name
                                      }
                                    </span>

                                  </div>

                                </td>

                                <td>
                                  {quantity}
                                </td>

                                <td>
                                  ₹{" "}
                                  {price.toFixed(
                                    2
                                  )}
                                </td>

                                <td>

                                  <span className="fw-semibold">

                                    ₹{" "}
                                    {total.toFixed(
                                      2
                                    )}

                                  </span>

                                </td>

                              </tr>

                            );
                          }
                        )}

                    </tbody>

                  </table>

                </div>

              </div>

            </div>

            {/* TOTAL */}

            <div className="d-flex justify-content-end mb-4">

              <div className="bg-primary bg-opacity-10 rounded-3 px-4 py-3 text-end">

                <div className="text-muted small">
                  Total Amount
                </div>

                <div className="fs-3 fw-bold text-primary">

                  ₹{" "}
                  {calculateTotal().toFixed(
                    2
                  )}

                </div>

              </div>

            </div>

            {/* PAYMENT METHOD */}

            <div className="row g-3 align-items-end">

              <div className="col-12 col-md-6">

                <label className="form-label fw-semibold">
                  Payment Method
                </label>

                <select
                  className="form-select"
                  value={
                    paymentMethod
                  }
                  onChange={(event) =>
                    setPaymentMethod(
                      event.target.value
                    )
                  }
                >

                  <option value="Cash">
                    Cash
                  </option>

                  <option value="Card">
                    Card
                  </option>

                  <option value="UPI">
                    UPI
                  </option>

                </select>

              </div>

              <div className="col-12 col-md-6">

                <div className="d-flex justify-content-md-end gap-2">

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={
                      handleClearSelection
                    }
                    disabled={generating}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={
                      handleGenerateBill
                    }
                    disabled={generating}
                  >

                    {generating ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>

                        Generating Bill...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-receipt me-2"></i>

                        Generate Bill
                      </>
                    )}

                  </button>

                </div>

              </div>

            </div>

          </div>

        </div>

      )}

      {/* ==================================== */}
      {/* GENERATED BILL RECEIPT */}
      {/* ==================================== */}

      {generatedBill && (

        <div
          ref={generatedBillRef}
          className="card border-0 shadow-sm mb-4"
        >

          <div className="card-header bg-white border-0 pt-4 px-4">

            <div className="d-flex justify-content-between align-items-center">

              <div>

                <h5 className="fw-bold mb-1">

                  <i className="bi bi-check-circle text-success me-2"></i>

                  Bill Generated Successfully

                </h5>

                <p className="text-muted small mb-0">
                  Pharmacy bill receipt
                </p>

              </div>

              <span className="badge bg-success">
                PAID
              </span>

            </div>

          </div>

          <div className="card-body px-4 pb-4">

            <div
              className="border rounded-3 p-4"
              id="pharmacy-bill-receipt"
            >

              <div className="text-center mb-4">

                <div className="rounded-3 bg-primary bg-opacity-10 d-inline-flex p-3 mb-2">

                  <i className="bi bi-hospital text-primary fs-2"></i>

                </div>

                <h4 className="fw-bold mb-1">
                  Clinic Management System
                </h4>

                <div className="text-muted">
                  Pharmacy Bill Receipt
                </div>

              </div>

              <hr />

              <div className="row g-3 mb-4">

                <div className="col-12 col-md-6">

                  <small className="text-muted">
                    Bill Number
                  </small>

                  <div className="fw-semibold">
                    {
                      generatedBill.bill_number
                    }
                  </div>

                </div>

                <div className="col-12 col-md-6">

                  <small className="text-muted">
                    Date
                  </small>

                  <div className="fw-semibold">

                    {generatedBill.bill_date
                      ? new Date(
                          generatedBill.bill_date
                        ).toLocaleString()
                      : "-"}

                  </div>

                </div>

                <div className="col-12 col-md-6">

                  <small className="text-muted">
                    Patient
                  </small>

                  <div className="fw-semibold">

                    {
                      generatedBill.patient_name ||
                      "-"
                    }

                  </div>

                </div>

                <div className="col-12 col-md-6">

                  <small className="text-muted">
                    Patient ID
                  </small>

                  <div className="fw-semibold">

                    {
                      generatedBill.patient_id ||
                      "-"
                    }

                  </div>

                </div>

              </div>

              <div className="bg-light rounded-3 p-4">

                <div className="row g-3">

                  <div className="col-12 col-md-4">

                    <small className="text-muted">
                      Total Amount
                    </small>

                    <div className="fs-4 fw-bold text-primary">

                      ₹{" "}
                      {Number(
                        generatedBill.total_amount
                      ).toFixed(2)}

                    </div>

                  </div>

                  <div className="col-12 col-md-4">

                    <small className="text-muted">
                      Payment Method
                    </small>

                    <div className="fw-semibold">
                      {
                        generatedBill.payment_method
                      }
                    </div>

                  </div>

                  <div className="col-12 col-md-4">

                    <small className="text-muted">
                      Status
                    </small>

                    <div>

                      <span className="badge bg-success">
                        Paid
                      </span>

                    </div>

                  </div>

                </div>

              </div>

            </div>

            <div className="d-flex justify-content-end mt-4">

              <button
                type="button"
                className="btn btn-primary"
                onClick={
                  handlePrintBill
                }
              >

                <i className="bi bi-printer me-2"></i>

                Print Bill

              </button>

            </div>

          </div>

        </div>

      )}

      {/* ==================================== */}
      {/* NO UNBILLED PRESCRIPTIONS */}
      {/* ==================================== */}

      {unbilledPrescriptions.length ===
        0 &&
        !selectedPrescription && (
          <div className="card border-0 shadow-sm">

            <div className="card-body text-center py-5">

              <div className="rounded-circle bg-success bg-opacity-10 d-inline-flex p-4 mb-3">

                <i className="bi bi-check-circle text-success fs-1"></i>

              </div>

              <h5 className="fw-bold">
                No Pending Bills
              </h5>

              <p className="text-muted mb-0">
                There are currently no issued
                prescriptions waiting for billing.
              </p>

            </div>

          </div>
        )}

    </div>
  );
}

export default PharmacyBilling;