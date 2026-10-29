import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import pharmacyapi from "../../api/pharmacyapi";

function PharmacistDashboard() {
  const navigate = useNavigate();

  // ==========================================
  // STATE
  // ==========================================

  const [medicines, setMedicines] = useState([]);
  const [bills, setBills] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [medicineSearch, setMedicineSearch] = useState("");
  const [billSearch, setBillSearch] = useState("");

  // ==========================================
  // LOAD DASHBOARD DATA
  // ==========================================

  const loadDashboardData = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [
        medicinesResponse,
        billsResponse,
      ] = await Promise.all([
        pharmacyapi.get("pharmacist/medicines/"),
        pharmacyapi.get("pharmacist/bills/"),
      ]);

      setMedicines(
        Array.isArray(medicinesResponse.data)
          ? medicinesResponse.data
          : []
      );

      setBills(
        Array.isArray(billsResponse.data)
          ? billsResponse.data
          : []
      );
    } catch (error) {
      console.error("Dashboard loading error:", error);

      setError(
        "Unable to load dashboard data. Please check the Django backend."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // ==========================================
  // DATE VALUES
  // ==========================================

  const today = new Date()
    .toISOString()
    .split("T")[0];

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // ==========================================
  // STATISTICS
  // ==========================================

  const totalMedicines = medicines.length;

  const totalStock = medicines.reduce(
    (total, medicine) =>
      total + Number(medicine.stock || 0),
    0
  );

  const lowStockList = medicines.filter((medicine) => {
    const stock = Number(medicine.stock || 0);

    return stock > 0 && stock < 20;
  });

  const lowStockMedicines = lowStockList.length;

  const outOfStockList = medicines.filter(
    (medicine) =>
      Number(medicine.stock || 0) === 0
  );

  const outOfStockMedicines =
    outOfStockList.length;

  const expiredMedicines = medicines.filter(
    (medicine) => {
      if (!medicine.expiry_date) {
        return false;
      }

      const expiryDate = new Date(
        medicine.expiry_date
      );

      const todayDate = new Date();

      expiryDate.setHours(0, 0, 0, 0);
      todayDate.setHours(0, 0, 0, 0);

      return expiryDate < todayDate;
    }
  );

  const expiringSoonMedicines =
    medicines.filter((medicine) => {
      if (!medicine.expiry_date) {
        return false;
      }

      const expiryDate = new Date(
        medicine.expiry_date
      );

      const todayDate = new Date();

      const difference =
        expiryDate - todayDate;

      const daysRemaining = Math.ceil(
        difference /
          (1000 * 60 * 60 * 24)
      );

      return (
        daysRemaining >= 0 &&
        daysRemaining <= 30
      );
    });

  // ==========================================
  // SALES
  // ==========================================

  const todaysBills = bills.filter((bill) => {
    if (!bill.bill_date) {
      return false;
    }

    return (
      bill.bill_date.split("T")[0] ===
      today
    );
  });

  const todaysSales = todaysBills.reduce(
    (total, bill) =>
      total + Number(bill.total_amount || 0),
    0
  );

  const monthlyBills = bills.filter((bill) => {
    if (!bill.bill_date) {
      return false;
    }

    const billDate = new Date(
      bill.bill_date
    );

    return (
      billDate.getMonth() === currentMonth &&
      billDate.getFullYear() === currentYear
    );
  });

  const monthlySales = monthlyBills.reduce(
    (total, bill) =>
      total + Number(bill.total_amount || 0),
    0
  );

  const totalSales = bills.reduce(
    (total, bill) =>
      total + Number(bill.total_amount || 0),
    0
  );

  // ==========================================
  // RECENT BILLS
  // ==========================================

  const recentBills = useMemo(() => {
    return [...bills]
      .sort(
        (a, b) =>
          new Date(b.bill_date) -
          new Date(a.bill_date)
      )
      .slice(0, 5);
  }, [bills]);

  // ==========================================
  // SEARCH
  // ==========================================

  const filteredMedicines = useMemo(() => {
    const search = medicineSearch
      .trim()
      .toLowerCase();

    if (!search) {
      return medicines.slice(0, 5);
    }

    return medicines
      .filter(
        (medicine) =>
          medicine.name
            ?.toLowerCase()
            .includes(search) ||
          medicine.batch_no
            ?.toLowerCase()
            .includes(search) ||
          medicine.medicine_type
            ?.toLowerCase()
            .includes(search)
      )
      .slice(0, 5);
  }, [medicines, medicineSearch]);

  const filteredBills = useMemo(() => {
    const search = billSearch
      .trim()
      .toLowerCase();

    if (!search) {
      return recentBills;
    }

    return recentBills.filter(
      (bill) =>
        bill.bill_number
          ?.toLowerCase()
          .includes(search) ||
        bill.patient_name
          ?.toLowerCase()
          .includes(search) ||
        String(bill.patient_id)
          .toLowerCase()
          .includes(search)
    );
  }, [recentBills, billSearch]);

  // ==========================================
  // HELPERS
  // ==========================================

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "-";
    }

    return new Date(
      dateValue
    ).toLocaleDateString("en-IN");
  };

  const formatDateTime = (dateValue) => {
    if (!dateValue) {
      return "-";
    }

    return new Date(
      dateValue
    ).toLocaleString("en-IN");
  };

  const formatMoney = (amount) => {
    return Number(amount || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  };

  const getMedicineStatus = (medicine) => {
    const stock = Number(
      medicine.stock || 0
    );

    if (stock === 0) {
      return "Out of Stock";
    }

    if (stock < 20) {
      return "Low Stock";
    }

    return "Available";
  };

  // ==========================================
  // SERVICES
  // ==========================================

  const services = [
    {
      title: "Medicine Inventory",
      description:
        "View and manage available medicines and stock.",
      icon: "bi-capsule-pill",
      color: "primary",
      path: "/pharmacist/inventory",
    },
    {
      title: "Medicine Allotment",
      description:
        "View prescriptions and issue medicines to patients.",
      icon: "bi-box-seam",
      color: "success",
      path: "/pharmacist/allotment",
    },
    {
      title: "Pharmacy Billing",
      description:
        "Generate and manage pharmacy bills.",
      icon: "bi-receipt",
      color: "warning",
      path: "/pharmacist/billing",
    },
    {
      title: "Sales Reports",
      description:
        "View pharmacy sales and billing reports.",
      icon: "bi-bar-chart-line",
      color: "info",
      path: "/pharmacist/reports",
    },
    {
      title: "Stock History",
      description:
        "View medicine stock movement and history.",
      icon: "bi-clock-history",
      color: "secondary",
      path: "/pharmacist/stock-history",
    },
  ];

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="container-fluid px-3 px-md-4 py-4">
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="text-center">
            <div
              className="spinner-border text-primary mb-3"
              role="status"
            >
              <span className="visually-hidden">
                Loading...
              </span>
            </div>

            <p className="text-muted mb-0">
              Loading pharmacy dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="container-fluid px-3 px-md-4 py-4">
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body p-4">
            <div className="d-flex align-items-start gap-3">

              <div className="rounded-circle bg-danger bg-opacity-10 p-3">
                <i className="bi bi-exclamation-triangle-fill text-danger fs-4"></i>
              </div>

              <div>
                <h5 className="fw-bold mb-2">
                  Unable to Load Dashboard
                </h5>

                <p className="text-muted mb-3">
                  {error}
                </p>

                <button
                  className="btn btn-primary"
                  onClick={() =>
                    loadDashboardData()
                  }
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Try Again
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN DASHBOARD
  // ==========================================

  return (
    <div className="container-fluid px-3 px-md-4 py-4">

      {/* ======================================
          WELCOME
      ====================================== */}

      <div className="mb-4">

        <h2 className="fw-bold text-dark mb-1">
          Welcome, Pharmacist! 👋
        </h2>

        <p className="text-muted mb-0">
          Manage medicines, prescriptions, billing
          and pharmacy operations from one place.
        </p>

      </div>

      {/* ======================================
          STATISTICS
      ====================================== */}

      <div className="row g-4 mb-5">

        {/* TOTAL MEDICINES */}

        <div className="col-12 col-md-6 col-xl-3">

          <div
            className="card border-0 shadow-sm rounded-4 h-100"
            style={{
              background:
                "linear-gradient(135deg, #e8f1ff 0%, #dbeafe 100%)",
            }}
          >

            <div className="card-body p-4">

              <div className="d-flex align-items-center gap-3">

                <div
                  className="bg-primary bg-opacity-25 text-primary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: "65px",
                    height: "65px",
                  }}
                >
                  <i className="bi bi-capsule-pill fs-2"></i>
                </div>

                <div>

                  <div className="text-secondary small fw-semibold">
                    Total Medicines
                  </div>

                  <div className="display-6 fw-bold text-dark">
                    {totalMedicines}
                  </div>

                  <div className="text-muted small">
                    Medicine records
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* TOTAL STOCK */}

        <div className="col-12 col-md-6 col-xl-3">

          <div
            className="card border-0 shadow-sm rounded-4 h-100"
            style={{
              background:
                "linear-gradient(135deg, #e9fbea 0%, #dcfce7 100%)",
            }}
          >

            <div className="card-body p-4">

              <div className="d-flex align-items-center gap-3">

                <div
                  className="bg-success bg-opacity-25 text-success rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: "65px",
                    height: "65px",
                  }}
                >
                  <i className="bi bi-box-seam fs-2"></i>
                </div>

                <div>

                  <div className="text-secondary small fw-semibold">
                    Total Stock
                  </div>

                  <div className="display-6 fw-bold text-dark">
                    {totalStock.toLocaleString(
                      "en-IN"
                    )}
                  </div>

                  <div className="text-muted small">
                    Total units available
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* LOW STOCK */}

        <div className="col-12 col-md-6 col-xl-3">

          <div
            className="card border-0 shadow-sm rounded-4 h-100"
            style={{
              background:
                "linear-gradient(135deg, #fff9e6 0%, #fef3c7 100%)",
            }}
          >

            <div className="card-body p-4">

              <div className="d-flex align-items-center gap-3">

                <div
                  className="bg-warning bg-opacity-25 text-warning-emphasis rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: "65px",
                    height: "65px",
                  }}
                >
                  <i className="bi bi-exclamation-triangle fs-2"></i>
                </div>

                <div>

                  <div className="text-secondary small fw-semibold">
                    Low Stock
                  </div>

                  <div className="display-6 fw-bold text-dark">
                    {lowStockMedicines}
                  </div>

                  <div className="text-muted small">
                    Below 20 units
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* OUT OF STOCK */}

        <div className="col-12 col-md-6 col-xl-3">

          <div
            className="card border-0 shadow-sm rounded-4 h-100"
            style={{
              background:
                "linear-gradient(135deg, #ffeaea 0%, #fee2e2 100%)",
            }}
          >

            <div className="card-body p-4">

              <div className="d-flex align-items-center gap-3">

                <div
                  className="bg-danger bg-opacity-25 text-danger rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: "65px",
                    height: "65px",
                  }}
                >
                  <i className="bi bi-x-circle fs-2"></i>
                </div>

                <div>

                  <div className="text-secondary small fw-semibold">
                    Out of Stock
                  </div>

                  <div className="display-6 fw-bold text-dark">
                    {outOfStockMedicines}
                  </div>

                  <div className="text-muted small">
                    Medicines unavailable
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ======================================
          PHARMACY SERVICES
      ====================================== */}

      <div className="mb-4">

        <h3 className="fw-bold text-dark mb-1">
          Pharmacy Services
        </h3>

        <p className="text-muted mb-4">
          Quickly access your daily pharmacy tasks.
        </p>

        <div className="row g-4">

          {services.map((service) => (

            <div
              className="col-12 col-md-6 col-xl-4"
              key={service.title}
            >

              <div
                className="card border-0 shadow-sm rounded-4 h-100"
                style={{
                  cursor: "pointer",
                  transition:
                    "transform 0.2s ease, box-shadow 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform =
                    "translateY(-4px)";

                  e.currentTarget.style.boxShadow =
                    "0 .75rem 1.5rem rgba(0,0,0,.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform =
                    "translateY(0)";

                  e.currentTarget.style.boxShadow =
                    "0 .125rem .25rem rgba(0,0,0,.075)";
                }}
                onClick={() =>
                  navigate(service.path)
                }
              >

                <div className="card-body p-4">

                  <div className="d-flex align-items-start gap-3">

                    <div
                      className={`bg-${service.color} bg-opacity-10 text-${service.color} rounded-3 d-flex align-items-center justify-content-center flex-shrink-0`}
                      style={{
                        width: "58px",
                        height: "58px",
                      }}
                    >
                      <i
                        className={`bi ${service.icon} fs-3`}
                      ></i>
                    </div>

                    <div className="flex-grow-1">

                      <h5 className="fw-bold text-dark mb-1">
                        {service.title}
                      </h5>

                      <p className="text-muted small mb-3">
                        {service.description}
                      </p>

                      <button
                        type="button"
                        className={`btn btn-${service.color} btn-sm`}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(service.path);
                        }}
                      >
                        Open
                        <i className="bi bi-arrow-right ms-2"></i>
                      </button>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

      {/* ======================================
          SALES OVERVIEW
      ====================================== */}

      <div className="mt-5 mb-4">

        <h3 className="fw-bold text-dark mb-1">
          Sales Overview
        </h3>

        <p className="text-muted mb-4">
          Current pharmacy billing and sales summary.
        </p>

        <div className="row g-4">

          <div className="col-12 col-md-4">

            <div
              className="card border-0 shadow-sm rounded-4 h-100"
              style={{
                background:
                  "linear-gradient(135deg, #e8f1ff 0%, #dbeafe 100%)",
              }}
            >

              <div className="card-body p-4">

                <div className="d-flex align-items-center gap-3">

                  <div
                    className="bg-primary bg-opacity-25 text-primary rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      width: "55px",
                      height: "55px",
                    }}
                  >
                    <i className="bi bi-calendar-day fs-4"></i>
                  </div>

                  <div>

                    <div className="text-muted small fw-semibold">
                      Today's Sales
                    </div>

                    <div className="fs-3 fw-bold">
                      ₹ {formatMoney(todaysSales)}
                    </div>

                    <div className="text-muted small">
                      {todaysBills.length} bill(s) today
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

          <div className="col-12 col-md-4">

            <div
              className="card border-0 shadow-sm rounded-4 h-100"
              style={{
                background:
                  "linear-gradient(135deg, #e9fbea 0%, #dcfce7 100%)",
              }}
            >

              <div className="card-body p-4">

                <div className="d-flex align-items-center gap-3">

                  <div
                    className="bg-success bg-opacity-25 text-success rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      width: "55px",
                      height: "55px",
                    }}
                  >
                    <i className="bi bi-calendar-month fs-4"></i>
                  </div>

                  <div>

                    <div className="text-muted small fw-semibold">
                      This Month
                    </div>

                    <div className="fs-3 fw-bold">
                      ₹ {formatMoney(monthlySales)}
                    </div>

                    <div className="text-muted small">
                      {monthlyBills.length} bill(s) this month
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

          <div className="col-12 col-md-4">

            <div
              className="card border-0 shadow-sm rounded-4 h-100"
              style={{
                background:
                  "linear-gradient(135deg, #e0f7fa 0%, #cffafe 100%)",
              }}
            >

              <div className="card-body p-4">

                <div className="d-flex align-items-center gap-3">

                  <div
                    className="bg-info bg-opacity-25 text-info rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      width: "55px",
                      height: "55px",
                    }}
                  >
                    <i className="bi bi-graph-up-arrow fs-4"></i>
                  </div>

                  <div>

                    <div className="text-muted small fw-semibold">
                      Total Sales
                    </div>

                    <div className="fs-3 fw-bold">
                      ₹ {formatMoney(totalSales)}
                    </div>

                    <div className="text-muted small">
                      All pharmacy sales
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ======================================
          ALERTS
      ====================================== */}

      <div className="mt-5 mb-4">

        <h3 className="fw-bold text-dark mb-1">
          Pharmacy Alerts
        </h3>

        <p className="text-muted mb-4">
          Important stock and expiry information.
        </p>

        <div className="row g-4">

          {/* LOW STOCK */}

          <div className="col-12 col-xl-6">

            <div className="card border-0 shadow-sm rounded-4 h-100">

              <div className="card-body p-4">

                <div className="d-flex justify-content-between align-items-center mb-3">

                  <div className="d-flex align-items-center">

                    <div className="rounded-3 bg-warning bg-opacity-10 p-2 me-3">
                      <i className="bi bi-exclamation-triangle text-warning fs-5"></i>
                    </div>

                    <div>

                      <h5 className="fw-bold mb-1">
                        Low Stock Alert
                      </h5>

                      <p className="text-muted small mb-0">
                        Medicines below 20 units
                      </p>

                    </div>

                  </div>

                  <span className="badge text-bg-warning">
                    {lowStockMedicines}
                  </span>

                </div>

                {lowStockList.length === 0 ? (

                  <div className="text-center py-4">

                    <i className="bi bi-check-circle text-success fs-2"></i>

                    <p className="text-muted mb-0 mt-2">
                      No low stock medicines.
                    </p>

                  </div>

                ) : (

                  <div className="table-responsive">

                    <table className="table table-hover align-middle mb-0">

                      <thead className="table-light">
                        <tr>
                          <th>Medicine</th>
                          <th>Stock</th>
                          <th>Status</th>
                        </tr>
                      </thead>

                      <tbody>

                        {lowStockList
                          .slice(0, 5)
                          .map((medicine) => (

                            <tr key={medicine.id}>

                              <td className="fw-semibold">
                                {medicine.name}
                              </td>

                              <td>
                                {medicine.stock}
                              </td>

                              <td>
                                <span className="badge text-bg-warning">
                                  Low Stock
                                </span>
                              </td>

                            </tr>

                          ))}

                      </tbody>

                    </table>

                  </div>

                )}

              </div>

            </div>

          </div>

          {/* EXPIRY */}

          <div className="col-12 col-xl-6">

            <div className="card border-0 shadow-sm rounded-4 h-100">

              <div className="card-body p-4">

                <div className="d-flex justify-content-between align-items-center mb-3">

                  <div className="d-flex align-items-center">

                    <div className="rounded-3 bg-danger bg-opacity-10 p-2 me-3">
                      <i className="bi bi-calendar-x text-danger fs-5"></i>
                    </div>

                    <div>

                      <h5 className="fw-bold mb-1">
                        Expiry Alerts
                      </h5>

                      <p className="text-muted small mb-0">
                        Expired or expiring medicines
                      </p>

                    </div>

                  </div>

                  <span className="badge text-bg-danger">
                    {
                      expiredMedicines.length +
                      expiringSoonMedicines.length
                    }
                  </span>

                </div>

                {expiredMedicines.length === 0 &&
                expiringSoonMedicines.length === 0 ? (

                  <div className="text-center py-4">

                    <i className="bi bi-check-circle text-success fs-2"></i>

                    <p className="text-muted mb-0 mt-2">
                      No expiry alerts.
                    </p>

                  </div>

                ) : (

                  <div className="table-responsive">

                    <table className="table table-hover align-middle mb-0">

                      <thead className="table-light">
                        <tr>
                          <th>Medicine</th>
                          <th>Expiry</th>
                          <th>Alert</th>
                        </tr>
                      </thead>

                      <tbody>

                        {expiredMedicines
                          .slice(0, 3)
                          .map((medicine) => (

                            <tr key={`expired-${medicine.id}`}>

                              <td className="fw-semibold">
                                {medicine.name}
                              </td>

                              <td>
                                {formatDate(
                                  medicine.expiry_date
                                )}
                              </td>

                              <td>
                                <span className="badge text-bg-danger">
                                  Expired
                                </span>
                              </td>

                            </tr>

                          ))}

                        {expiringSoonMedicines
                          .slice(0, 3)
                          .map((medicine) => (

                            <tr key={`expiring-${medicine.id}`}>

                              <td className="fw-semibold">
                                {medicine.name}
                              </td>

                              <td>
                                {formatDate(
                                  medicine.expiry_date
                                )}
                              </td>

                              <td>
                                <span className="badge text-bg-warning">
                                  Expiring Soon
                                </span>
                              </td>

                            </tr>

                          ))}

                      </tbody>

                    </table>

                  </div>

                )}

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ======================================
          RECENT BILLS
      ====================================== */}

      <div className="card border-0 shadow-sm rounded-4 mt-5">

        <div className="card-body p-4">

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">

            <div>

              <h4 className="fw-bold mb-1">
                Recent Pharmacy Bills
              </h4>

              <p className="text-muted mb-0">
                Latest pharmacy billing records.
              </p>

            </div>

            <div
              className="input-group"
              style={{ maxWidth: "350px" }}
            >

              <span className="input-group-text bg-white">
                <i className="bi bi-search"></i>
              </span>

              <input
                type="text"
                className="form-control"
                placeholder="Search bill or patient..."
                value={billSearch}
                onChange={(e) =>
                  setBillSearch(e.target.value)
                }
              />

            </div>

          </div>

          <div className="table-responsive">

            <table className="table table-hover align-middle mb-0">

              <thead className="table-light">

                <tr>
                  <th>Bill Number</th>
                  <th>Patient</th>
                  <th>Patient ID</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Date</th>
                </tr>

              </thead>

              <tbody>

                {filteredBills.length === 0 ? (

                  <tr>

                    <td
                      colSpan="6"
                      className="text-center py-5"
                    >

                      <i className="bi bi-receipt fs-2 text-muted"></i>

                      <p className="text-muted mb-0 mt-2">
                        No bills found.
                      </p>

                    </td>

                  </tr>

                ) : (

                  filteredBills.map((bill) => (

                    <tr key={bill.id}>

                      <td className="fw-semibold">
                        {bill.bill_number}
                      </td>

                      <td>
                        {bill.patient_name || "-"}
                      </td>

                      <td>
                        {bill.patient_id || "-"}
                      </td>

                      <td className="fw-semibold">
                        ₹{" "}
                        {formatMoney(
                          bill.total_amount
                        )}
                      </td>

                      <td>
                        <span className="badge text-bg-light border">
                          {bill.payment_method || "-"}
                        </span>
                      </td>

                      <td>
                        {formatDateTime(
                          bill.bill_date
                        )}
                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

      {/* ======================================
          REFRESH
      ====================================== */}

      <div className="text-center mt-4">

        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={() =>
            loadDashboardData(true)
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
              Refresh Dashboard
            </>
          )}

        </button>

      </div>

    </div>
  );
}

export default PharmacistDashboard;