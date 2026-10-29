import { useEffect, useRef, useState } from "react";
import pharmacyapi from "../../api/pharmacyapi";

function MedicineAllotment() {
  // ==========================================
  // STATE
  // ==========================================

  const [prescriptions, setPrescriptions] = useState([]);
  const [medicines, setMedicines] = useState([]);

  const [searchPatient, setSearchPatient] = useState("");

  const [selectedPrescription, setSelectedPrescription] =
    useState(null);

  const [prescriptionMedicines, setPrescriptionMedicines] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [medicineLoading, setMedicineLoading] =
    useState(false);
  const [issuing, setIssuing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  // ==========================================
  // AUTO SCROLL REFS
  // ==========================================

  const patientsSectionRef = useRef(null);
  const prescriptionSectionRef = useRef(null);

  // ==========================================
  // COMMON AUTO SCROLL FUNCTION
  // ==========================================

  const scrollTo = (ref) => {
    setTimeout(() => {
      ref.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  // ==========================================
  // LOAD DOCTOR PRESCRIPTIONS
  // ==========================================

  const loadPrescriptions = async () => {
    try {
      setError("");

      const response = await pharmacyapi.get(
        "pharmacist/doctor-prescriptions/"
      );

      setPrescriptions(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error(
        "Error loading doctor prescriptions:",
        error
      );

      setError(
        "Unable to load prescriptions. Please check the Django backend."
      );
    }
  };

  // ==========================================
  // LOAD MEDICINE INVENTORY
  // ==========================================

  const loadMedicines = async () => {
    try {
      const response = await pharmacyapi.get(
        "pharmacist/medicines/"
      );

      setMedicines(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error(
        "Error loading inventory:",
        error
      );

      setMedicines([]);
    }
  };

  // ==========================================
  // LOAD DATA WHEN PAGE OPENS
  // ==========================================

  useEffect(() => {
    let cancelled = false;

    const loadPageData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          prescriptionsResponse,
          medicinesResponse,
        ] = await Promise.all([
          pharmacyapi.get(
            "pharmacist/doctor-prescriptions/"
          ),

          pharmacyapi.get(
            "pharmacist/medicines/"
          ),
        ]);

        if (!cancelled) {
          setPrescriptions(
            Array.isArray(
              prescriptionsResponse.data
            )
              ? prescriptionsResponse.data
              : []
          );

          setMedicines(
            Array.isArray(
              medicinesResponse.data
            )
              ? medicinesResponse.data
              : []
          );

          setError("");
          setLoading(false);
        }
      } catch (error) {
        console.error(
          "Error loading page data:",
          error
        );

        if (!cancelled) {
          setError(
            "Unable to load prescriptions. Please check the Django backend."
          );

          setPrescriptions([]);
          setMedicines([]);
          setLoading(false);
        }
      }
    };

    loadPageData();

    return () => {
      cancelled = true;
    };
  }, []);

  // ==========================================
  // REFRESH ALL DATA
  // ==========================================

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError("");

      await Promise.all([
        loadPrescriptions(),
        loadMedicines(),
      ]);
    } catch (error) {
      console.error(
        "Refresh error:",
        error
      );
    } finally {
      setRefreshing(false);
    }
  };

  // ==========================================
  // SEARCH PATIENTS
  // ==========================================

  const filteredPrescriptions =
    prescriptions.filter((prescription) => {
      const patientName =
        prescription.patient_name || "";

      const patientId =
        prescription.patient_id || "";

      const appointmentId =
        prescription.appointment_id || "";

      const search =
        searchPatient
          .trim()
          .toLowerCase();

      if (!search) {
        return true;
      }

      return (
        patientName
          .toLowerCase()
          .includes(search) ||
        String(patientId)
          .toLowerCase()
          .includes(search) ||
        String(appointmentId)
          .toLowerCase()
          .includes(search)
      );
    });

  // ==========================================
  // SELECT PRESCRIPTION
  // ==========================================

  const handleSelectPrescription = (
    prescription
  ) => {
    try {
      setSelectedPrescription(
        prescription
      );

      setPrescriptionMedicines(
        Array.isArray(
          prescription.medicines
        )
          ? prescription.medicines
          : []
      );

      setMedicineLoading(false);

      // Automatically scroll to prescription details
      scrollTo(prescriptionSectionRef);
    } catch (error) {
      console.error(
        "Error loading prescription medicines:",
        error
      );

      alert(
        "Unable to load prescription medicines."
      );

      setPrescriptionMedicines([]);
    }
  };

  // ==========================================
  // FIND INVENTORY MEDICINE
  // ==========================================

  const getInventoryMedicine = (
    prescribedMedicine
  ) => {
    const masterMedicineId =
      Number(
        prescribedMedicine.medicine_id
      );

    const medicineByMasterId =
      medicines.find(
        (medicine) =>
          medicine.master_medicine &&
          Number(
            medicine.master_medicine
          ) === masterMedicineId
      );

    if (medicineByMasterId) {
      return medicineByMasterId;
    }

    const medicineName =
      prescribedMedicine.medicine_name ||
      "";

    return medicines.find(
      (medicine) =>
        medicine.name
          ?.toLowerCase()
          .trim() ===
        medicineName
          ?.toLowerCase()
          .trim()
    );
  };

  // ==========================================
  // CHECK STOCK AVAILABILITY
  // ==========================================

  const hasInsufficientStock =
    prescriptionMedicines.some(
      (prescribedMedicine) => {
        const inventoryMedicine =
          getInventoryMedicine(
            prescribedMedicine
          );

        if (!inventoryMedicine) {
          return true;
        }

        return (
          Number(
            inventoryMedicine.stock
          ) <
          Number(
            prescribedMedicine.quantity
          )
        );
      }
    );

  // ==========================================
  // ISSUE MEDICINES
  // ==========================================

  const handleIssueMedicines =
    async () => {
      if (!selectedPrescription) {
        alert(
          "Please select a prescription."
        );

        return;
      }

      if (
        prescriptionMedicines.length ===
        0
      ) {
        alert(
          "No medicines found in this prescription."
        );

        return;
      }

      // CHECK INVENTORY

      for (
        const prescribedMedicine of
          prescriptionMedicines
      ) {
        const inventoryMedicine =
          getInventoryMedicine(
            prescribedMedicine
          );

        if (!inventoryMedicine) {
          alert(
            `${prescribedMedicine.medicine_name} is not available in inventory.`
          );

          return;
        }

        if (
          Number(
            inventoryMedicine.stock
          ) <
          Number(
            prescribedMedicine.quantity
          )
        ) {
          alert(
            `Insufficient stock for ${prescribedMedicine.medicine_name}. Available: ${inventoryMedicine.stock}, Required: ${prescribedMedicine.quantity}`
          );

          return;
        }
      }

      // ISSUE THROUGH BACKEND

      try {
        setIssuing(true);

        const response =
          await pharmacyapi.post(
            `pharmacist/doctor-prescriptions/${selectedPrescription.consultation_id}/issue/`
          );

        console.log(
          "Doctor prescription issue response:",
          response.data
        );

        alert(
          "Medicines issued successfully!"
        );

        // REFRESH DATA

        await Promise.all([
          loadMedicines(),
          loadPrescriptions(),
        ]);

        // CLEAR SELECTION

        setSelectedPrescription(null);

        setPrescriptionMedicines([]);

        setSearchPatient("");

        // Automatically return to patient list
        scrollTo(patientsSectionRef);

      } catch (error) {
        console.error(
          "Error issuing medicines:",
          error.response?.data || error
        );

        const message =
          error.response?.data?.detail ||
          error.response?.data?.message ||
          "Unable to issue medicines. Please check the backend.";

        alert(message);
      } finally {
        setIssuing(false);
      }
    };

  // ==========================================
  // CLEAR SELECTED PRESCRIPTION
  // ==========================================

  const handleClearSelection = () => {
    if (issuing) {
      return;
    }

    setSelectedPrescription(null);
    setPrescriptionMedicines([]);

    // Automatically return to patient list
    scrollTo(patientsSectionRef);
  };

  // ==========================================
  // STATUS BADGE
  // ==========================================

  const getMedicineStatus = (
    prescribedMedicine
  ) => {
    const inventoryMedicine =
      getInventoryMedicine(
        prescribedMedicine
      );

    if (!inventoryMedicine) {
      return (
        <span className="badge bg-danger">
          Not Available
        </span>
      );
    }

    const availableStock =
      Number(
        inventoryMedicine.stock
      ) || 0;

    const requiredStock =
      Number(
        prescribedMedicine.quantity
      ) || 0;

    if (
      availableStock <
      requiredStock
    ) {
      return (
        <span className="badge bg-warning text-dark">
          Insufficient Stock
        </span>
      );
    }

    return (
      <span className="badge bg-success">
        Available
      </span>
    );
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
            Loading patients awaiting medicine allotment...
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
              <i className="bi bi-capsule-pill text-primary fs-4"></i>
            </div>

            <h2 className="fw-bold mb-0">
              Medicine Allotment
            </h2>

          </div>

          <p className="text-muted mb-0">
            View patients awaiting medicine allotment
            and issue their prescribed medicines.
          </p>

        </div>

        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={handleRefresh}
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
            onClick={handleRefresh}
          >
            Try Again
          </button>

        </div>
      )}

      {/* ==================================== */}
      {/* SUMMARY */}
      {/* ==================================== */}

      <div className="row g-3 mb-4">

        <div className="col-12 col-sm-6 col-xl-4">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body d-flex align-items-center">

              <div className="rounded-3 bg-warning bg-opacity-10 p-3 me-3">

                <i className="bi bi-hourglass-split text-warning fs-3"></i>

              </div>

              <div>

                <div className="text-muted small">
                  Awaiting Medicine Allotment
                </div>

                <h3 className="fw-bold mb-0">
                  {prescriptions.length}
                </h3>

              </div>

            </div>

          </div>

        </div>

        <div className="col-12 col-sm-6 col-xl-4">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body d-flex align-items-center">

              <div className="rounded-3 bg-success bg-opacity-10 p-3 me-3">

                <i className="bi bi-capsule text-success fs-3"></i>

              </div>

              <div>

                <div className="text-muted small">
                  Inventory Medicines
                </div>

                <h3 className="fw-bold mb-0">
                  {medicines.length}
                </h3>

              </div>

            </div>

          </div>

        </div>

        <div className="col-12 col-sm-6 col-xl-4">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body d-flex align-items-center">

              <div className="rounded-3 bg-info bg-opacity-10 p-3 me-3">

                <i className="bi bi-person-check text-info fs-3"></i>

              </div>

              <div>

                <div className="text-muted small">
                  Selected Patient
                </div>

                <h3 className="fw-bold mb-0">
                  {selectedPrescription
                    ? "1"
                    : "0"}
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
            Search Patients
          </h5>

          <p className="text-muted small mb-0">
            Search by patient name, patient ID,
            or appointment ID.
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
      {/* PATIENTS AWAITING ALLOTMENT */}
      {/* ==================================== */}

      {!selectedPrescription && (

        <div
          ref={patientsSectionRef}
          className="card border-0 shadow-sm mb-4"
        >

          <div className="card-header bg-white border-0 pt-4 px-4">

            <div className="d-flex justify-content-between align-items-center">

              <div>

                <h5 className="fw-bold mb-1">
                  <i className="bi bi-people text-primary me-2"></i>
                  Patients Awaiting Medicine Allotment
                </h5>

                <p className="text-muted small mb-0">
                  Select a patient to view and issue
                  the prescribed medicines.
                </p>

              </div>

              <span className="badge bg-primary">
                {filteredPrescriptions.length}
              </span>

            </div>

          </div>

          <div className="card-body px-4 pb-4">

            {filteredPrescriptions.length > 0 ? (

              <div className="row g-3">

                {filteredPrescriptions.map(
                  (prescription) => (

                    <div
                      className="col-12 col-lg-6"
                      key={
                        prescription.consultation_id
                      }
                    >

                      <div className="card border h-100 shadow-sm">

                        <div className="card-body">

                          <div className="d-flex justify-content-between align-items-start mb-3">

                            <div className="d-flex align-items-center">

                              <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">

                                <i className="bi bi-person-fill text-primary fs-5"></i>

                              </div>

                              <div>

                                <h6 className="fw-bold mb-1">
                                  {
                                    prescription.patient_name
                                  }
                                </h6>

                                <small className="text-muted">
                                  Patient ID:{" "}
                                  {
                                    prescription.patient_id
                                  }
                                </small>

                              </div>

                            </div>

                            <span className="badge bg-warning text-dark">
                              Awaiting
                            </span>

                          </div>

                          <div className="row g-2 small mb-3">

                            <div className="col-6">

                              <div className="bg-light rounded-3 p-2">

                                <div className="text-muted">
                                  Appointment
                                </div>

                                <div className="fw-semibold">
                                  #
                                  {
                                    prescription.appointment_id
                                  }
                                </div>

                              </div>

                            </div>

                            <div className="col-6">

                              <div className="bg-light rounded-3 p-2">

                                <div className="text-muted">
                                  Consultation
                                </div>

                                <div className="fw-semibold">
                                  #
                                  {
                                    prescription.consultation_id
                                  }
                                </div>

                              </div>

                            </div>

                            <div className="col-12">

                              <div className="bg-light rounded-3 p-2">

                                <div className="text-muted">
                                  Doctor
                                </div>

                                <div className="fw-semibold">
                                  {
                                    prescription.doctor_name
                                  }
                                </div>

                              </div>

                            </div>

                            <div className="col-6">

                              <div className="bg-light rounded-3 p-2">

                                <div className="text-muted">
                                  Appointment Date
                                </div>

                                <div className="fw-semibold">
                                  {
                                    prescription.appointment_date
                                  }
                                </div>

                              </div>

                            </div>

                            <div className="col-6">

                              <div className="bg-light rounded-3 p-2">

                                <div className="text-muted">
                                  Medicines
                                </div>

                                <div className="fw-semibold">
                                  {Array.isArray(
                                    prescription.medicines
                                  )
                                    ? prescription.medicines.length
                                    : 0}
                                </div>

                              </div>

                            </div>

                          </div>

                          <button
                            type="button"
                            className="btn btn-primary w-100"
                            onClick={() =>
                              handleSelectPrescription(
                                prescription
                              )
                            }
                          >

                            <i className="bi bi-capsule-pill me-2"></i>

                            View & Issue Medicines

                            <i className="bi bi-arrow-right ms-2"></i>

                          </button>

                        </div>

                      </div>

                    </div>

                  )
                )}

              </div>

            ) : (

              <div className="text-center py-5">

                <div className="rounded-circle bg-success bg-opacity-10 d-inline-flex p-4 mb-3">

                  <i className="bi bi-check-circle text-success fs-1"></i>

                </div>

                <h5 className="fw-bold">

                  {searchPatient.trim()
                    ? "No Matching Patient Found"
                    : "No Patients Awaiting Medicine Allotment"}

                </h5>

                <p className="text-muted mb-0">

                  {searchPatient.trim()
                    ? "Try another patient name, patient ID, or appointment ID."
                    : "All available prescriptions have already been allotted."}

                </p>

              </div>

            )}

          </div>

        </div>

      )}

      {/* ==================================== */}
      {/* SELECTED PRESCRIPTION */}
      {/* ==================================== */}

      {selectedPrescription && (

        <div
          ref={prescriptionSectionRef}
          className="card border-0 shadow-sm mb-4"
        >

          {/* HEADER */}

          <div className="card-header bg-white border-0 pt-4 px-4">

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">

              <div>

                <h5 className="fw-bold mb-1">

                  <i className="bi bi-file-medical text-primary me-2"></i>

                  Prescription Details

                </h5>

                <p className="text-muted small mb-0">
                  Review the prescribed medicines
                  and available pharmacy stock.
                </p>

              </div>

              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={handleClearSelection}
                disabled={issuing}
              >

                <i className="bi bi-arrow-left me-1"></i>

                Back to Patients

              </button>

            </div>

          </div>

          <div className="card-body px-4 pb-4">

            {/* ================================= */}
            {/* PATIENT DETAILS */}
            {/* ================================= */}

            <div className="row g-3 mb-4">

              <div className="col-12 col-md-6 col-xl-4">

                <div className="bg-light rounded-3 p-3 h-100">

                  <div className="d-flex align-items-center mb-2">

                    <i className="bi bi-person text-primary me-2"></i>

                    <small className="text-muted">
                      Patient
                    </small>

                  </div>

                  <div className="fw-semibold">
                    {
                      selectedPrescription.patient_name
                    }
                  </div>

                </div>

              </div>

              <div className="col-12 col-md-6 col-xl-4">

                <div className="bg-light rounded-3 p-3 h-100">

                  <div className="d-flex align-items-center mb-2">

                    <i className="bi bi-person-vcard text-primary me-2"></i>

                    <small className="text-muted">
                      Patient ID
                    </small>

                  </div>

                  <div className="fw-semibold">
                    {
                      selectedPrescription.patient_id
                    }
                  </div>

                </div>

              </div>

              <div className="col-12 col-md-6 col-xl-4">

                <div className="bg-light rounded-3 p-3 h-100">

                  <div className="d-flex align-items-center mb-2">

                    <i className="bi bi-calendar-check text-primary me-2"></i>

                    <small className="text-muted">
                      Appointment ID
                    </small>

                  </div>

                  <div className="fw-semibold">
                    {
                      selectedPrescription.appointment_id
                    }
                  </div>

                </div>

              </div>

              <div className="col-12 col-md-6 col-xl-4">

                <div className="bg-light rounded-3 p-3 h-100">

                  <div className="d-flex align-items-center mb-2">

                    <i className="bi bi-clipboard2-pulse text-primary me-2"></i>

                    <small className="text-muted">
                      Consultation ID
                    </small>

                  </div>

                  <div className="fw-semibold">
                    {
                      selectedPrescription.consultation_id
                    }
                  </div>

                </div>

              </div>

              <div className="col-12 col-md-6 col-xl-4">

                <div className="bg-light rounded-3 p-3 h-100">

                  <div className="d-flex align-items-center mb-2">

                    <i className="bi bi-person-badge text-primary me-2"></i>

                    <small className="text-muted">
                      Doctor
                    </small>

                  </div>

                  <div className="fw-semibold">
                    {
                      selectedPrescription.doctor_name
                    }
                  </div>

                </div>

              </div>

              <div className="col-12 col-md-6 col-xl-4">

                <div className="bg-light rounded-3 p-3 h-100">

                  <div className="d-flex align-items-center mb-2">

                    <i className="bi bi-calendar3 text-primary me-2"></i>

                    <small className="text-muted">
                      Appointment Date
                    </small>

                  </div>

                  <div className="fw-semibold">
                    {
                      selectedPrescription.appointment_date
                    }
                  </div>

                </div>

              </div>

            </div>

            {/* ================================= */}
            {/* MEDICINE TABLE */}
            {/* ================================= */}

            <div className="card border mb-4">

              <div className="card-header bg-light border-0">

                <div className="d-flex justify-content-between align-items-center">

                  <div>

                    <h6 className="fw-bold mb-1">
                      Prescribed Medicines
                    </h6>

                    <small className="text-muted">
                      Check the required quantity
                      against current inventory.
                    </small>

                  </div>

                  {!medicineLoading &&
                    prescriptionMedicines.length >
                      0 && (

                      <span className="badge bg-primary">

                        {
                          prescriptionMedicines.length
                        }{" "}
                        Medicine
                        {prescriptionMedicines.length !==
                        1
                          ? "s"
                          : ""}

                      </span>

                    )}

                </div>

              </div>

              <div className="card-body p-0">

                {medicineLoading ? (

                  <div className="text-center py-5">

                    <div
                      className="spinner-border text-primary"
                      role="status"
                    ></div>

                    <p className="text-muted mt-3 mb-0">
                      Loading prescribed medicines...
                    </p>

                  </div>

                ) : (

                  <div className="table-responsive">

                    <table className="table table-hover align-middle mb-0">

                      <thead className="table-light">

                        <tr>

                          <th className="px-3">
                            Medicine
                          </th>

                          <th>
                            Frequency
                          </th>

                          <th>
                            Duration
                          </th>

                          <th>
                            Instructions
                          </th>

                          <th>
                            Route
                          </th>

                          <th>
                            Required
                          </th>

                          <th>
                            Available
                          </th>

                          <th>
                            Status
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {prescriptionMedicines
                          .length === 0 ? (

                          <tr>

                            <td
                              colSpan="8"
                              className="text-center py-5"
                            >

                              <i className="bi bi-capsule text-muted fs-1"></i>

                              <div className="fw-semibold mt-3">
                                No medicines found
                              </div>

                              <div className="text-muted small">
                                This prescription does not contain any medicines.
                              </div>

                            </td>

                          </tr>

                        ) : (

                          prescriptionMedicines.map(
                            (
                              prescribedMedicine
                            ) => {

                              const inventoryMedicine =
                                getInventoryMedicine(
                                  prescribedMedicine
                                );

                              const hasEnoughStock =
                                inventoryMedicine &&
                                Number(
                                  inventoryMedicine.stock
                                ) >=
                                  Number(
                                    prescribedMedicine.quantity
                                  );

                              return (

                                <tr
                                  key={
                                    prescribedMedicine.id
                                  }
                                >

                                  <td className="px-3">

                                    <div className="d-flex align-items-center">

                                      <div className="rounded-3 bg-primary bg-opacity-10 p-2 me-2">

                                        <i className="bi bi-capsule text-primary"></i>

                                      </div>

                                      <div>

                                        <div className="fw-semibold">
                                          {
                                            prescribedMedicine.medicine_name
                                          }
                                        </div>

                                      </div>

                                    </div>

                                  </td>

                                  <td>
                                    {
                                      prescribedMedicine.frequency ||
                                      "—"
                                    }
                                  </td>

                                  <td>
                                    {
                                      prescribedMedicine.duration
                                    }{" "}
                                    days
                                  </td>

                                  <td>

                                    <span className="text-muted small">
                                      {
                                        prescribedMedicine.instructions ||
                                        "—"
                                      }
                                    </span>

                                  </td>

                                  <td>
                                    {
                                      prescribedMedicine.route ||
                                      "—"
                                    }
                                  </td>

                                  <td>

                                    <span className="badge bg-primary-subtle text-primary">
                                      {
                                        prescribedMedicine.quantity
                                      }
                                    </span>

                                  </td>

                                  <td>

                                    {inventoryMedicine ? (

                                      <span
                                        className={
                                          hasEnoughStock
                                            ? "fw-semibold text-success"
                                            : "fw-semibold text-danger"
                                        }
                                      >
                                        {
                                          inventoryMedicine.stock
                                        }
                                      </span>

                                    ) : (

                                      <span className="text-danger fw-semibold">
                                        Not Available
                                      </span>

                                    )}

                                  </td>

                                  <td>
                                    {getMedicineStatus(
                                      prescribedMedicine
                                    )}
                                  </td>

                                </tr>

                              );
                            }
                          )

                        )}

                      </tbody>

                    </table>

                  </div>

                )}

              </div>

            </div>

            {/* ================================= */}
            {/* STOCK WARNING */}
            {/* ================================= */}

            {!medicineLoading &&
              prescriptionMedicines.length >
                0 &&
              hasInsufficientStock && (

                <div
                  className="alert alert-warning d-flex align-items-start"
                  role="alert"
                >

                  <i className="bi bi-exclamation-triangle-fill me-3 fs-5"></i>

                  <div>

                    <div className="fw-semibold">
                      Medicine cannot be issued
                    </div>

                    <div className="small">
                      One or more prescribed medicines
                      are unavailable or have
                      insufficient stock.
                    </div>

                  </div>

                </div>
              )}

            {/* ================================= */}
            {/* ISSUE BUTTON */}
            {/* ================================= */}

            {!medicineLoading &&
              prescriptionMedicines.length >
                0 && (

                <div className="d-flex justify-content-end gap-2">

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleClearSelection}
                    disabled={issuing}
                  >

                    <i className="bi bi-arrow-left me-1"></i>

                    Back to Patients

                  </button>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={
                      handleIssueMedicines
                    }
                    disabled={
                      issuing ||
                      hasInsufficientStock
                    }
                  >

                    {issuing ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>

                        Issuing Medicines...
                      </>
                    ) : hasInsufficientStock ? (
                      <>
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        Insufficient Stock
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Issue Medicines
                      </>
                    )}

                  </button>

                </div>
              )}

          </div>

        </div>

      )}

    </div>
  );
}

export default MedicineAllotment;