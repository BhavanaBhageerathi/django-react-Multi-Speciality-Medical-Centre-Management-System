import { useEffect, useMemo, useState } from "react";
import pharmacyapi from "../../api/pharmacyapi";

function MedicineInventory() {
  // =========================================================
  // STATE
  // =========================================================

  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // =========================================================
  // UPDATE MEDICINE STATE
  // =========================================================

  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [stockChange, setStockChange] = useState("");
  const [transactionType, setTransactionType] =
    useState("Stock In");
  const [editPrice, setEditPrice] = useState("");

  // =========================================================
  // LOAD MEDICINES
  // =========================================================

  const loadMedicines = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await pharmacyapi.get(
        "pharmacist/master-medicines/"
      );

      setMedicines(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error(
        "Error loading medicines:",
        error
      );

      setError(
        "Unable to load medicine inventory. Make sure the Django server is running."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =========================================================
  // LOAD WHEN PAGE OPENS
  // =========================================================

  useEffect(() => {
    loadMedicines();
  }, []);

  // =========================================================
  // INITIALIZE INVENTORY
  // =========================================================

  const handleInitializeInventory = async (medicine) => {
    try {
      const response = await pharmacyapi.post(
        "pharmacist/medicines/initialize/",
        {
          master_medicine:
            medicine.master_medicine,
        }
      );

      const inventoryMedicine =
        response.data;

      alert(
        `${medicine.master_medicine_name} is now available in pharmacy inventory.`
      );

      setMedicines((previous) =>
        previous.map((item) =>
          item.master_medicine ===
          medicine.master_medicine
            ? {
                ...item,

                inventory_id:
                  inventoryMedicine.id,

                batch_no:
                  inventoryMedicine.batch_no,

                manufacture_date:
                  inventoryMedicine.manufacture_date,

                expiry_date:
                  inventoryMedicine.expiry_date,

                stock:
                  inventoryMedicine.stock,

                price:
                  inventoryMedicine.price,

                status:
                  inventoryMedicine.status,

                inventory_exists: true,
              }
            : item
        )
      );
    } catch (error) {
      console.error(
        "Inventory initialization error:",
        error.response?.data || error
      );

      alert(
        error.response?.data
          ? JSON.stringify(
              error.response.data
            )
          : "Unable to initialize medicine inventory."
      );
    }
  };

  // =========================================================
  // OPEN UPDATE FORM
  // =========================================================

  const handleOpenStockUpdate = (medicine) => {
    setSelectedMedicine(medicine);

    setStockChange("");
    setTransactionType("Stock In");
    setEditPrice(medicine.price ?? "");
  };

  // =========================================================
  // CLOSE UPDATE FORM
  // =========================================================

  const handleCloseUpdate = () => {
    setSelectedMedicine(null);
    setStockChange("");
    setEditPrice("");
    setTransactionType("Stock In");
  };

  // =========================================================
  // UPDATE STOCK AND PRICE
  // =========================================================

  const handleUpdateMedicine = async () => {
    if (!selectedMedicine) {
      return;
    }

    const previousStock =
      Number(selectedMedicine.stock) || 0;

    const quantity =
      Number(stockChange) || 0;

    let newStock = previousStock;

    // =======================================================
    // UPDATE STOCK
    // =======================================================

    if (stockChange !== "") {
      if (quantity <= 0) {
        alert(
          "Please enter a valid stock quantity."
        );
        return;
      }

      if (transactionType === "Stock In") {
        newStock =
          previousStock + quantity;
      } else {
        newStock =
          previousStock - quantity;
      }

      if (newStock < 0) {
        alert(
          `Cannot remove ${quantity} medicines. Current stock is only ${previousStock}.`
        );
        return;
      }
    }

    // =======================================================
    // VALIDATE PRICE
    // =======================================================

    const newPrice = Number(editPrice);

    if (
      editPrice === "" ||
      newPrice < 0 ||
      Number.isNaN(newPrice)
    ) {
      alert("Please enter a valid price.");
      return;
    }

    try {
      await pharmacyapi.patch(
        `pharmacist/medicines/${selectedMedicine.id}/`,
        {
          stock: newStock,
          price: newPrice,
        }
      );

      alert(
        "Medicine inventory updated successfully!"
      );

      handleCloseUpdate();

      await loadMedicines(true);
    } catch (error) {
      console.error(
        "Medicine update error:",
        error.response?.data || error
      );

      alert(
        error.response?.data
          ? JSON.stringify(
              error.response.data
            )
          : "Failed to update medicine."
      );
    }
  };

  // =========================================================
  // FILTER MEDICINES
  // =========================================================

  const filteredMedicines = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return medicines;
    }

    return medicines.filter((medicine) => {
      const medicineName =
        medicine.master_medicine_name ||
        medicine.name ||
        "";

      const medicineType =
        medicine.medicine_type || "";

      const batch =
        medicine.batch_no || "";

      return (
        medicineName
          .toLowerCase()
          .includes(query) ||
        medicineType
          .toLowerCase()
          .includes(query) ||
        batch
          .toLowerCase()
          .includes(query)
      );
    });
  }, [medicines, search]);

  // =========================================================
  // SUMMARY VALUES
  // =========================================================

  const totalMedicines =
    medicines.length;

  const totalStock = medicines.reduce(
    (total, medicine) =>
      total +
      (Number(medicine.stock) || 0),
    0
  );

  const lowStockCount =
    medicines.filter((medicine) => {
      const stock =
        Number(medicine.stock) || 0;

      return stock > 0 && stock < 20;
    }).length;

  const outOfStockCount =
    medicines.filter(
      (medicine) =>
        Number(medicine.stock) === 0
    ).length;

  // =========================================================
  // STATUS
  // =========================================================

  const getStatusBadge = (medicine) => {
    const stock =
      Number(medicine.stock) || 0;

    const status =
      String(
        medicine.status || ""
      ).toLowerCase();

    if (status === "expired") {
      return (
        <span className="badge bg-danger">
          Expired
        </span>
      );
    }

    if (status === "inactive") {
      return (
        <span className="badge bg-secondary">
          Inactive
        </span>
      );
    }

    if (stock === 0) {
      return (
        <span className="badge bg-danger">
          Out of Stock
        </span>
      );
    }

    if (stock < 20) {
      return (
        <span className="badge bg-warning text-dark">
          Low Stock
        </span>
      );
    }

    return (
      <span className="badge bg-success">
        Available
      </span>
    );
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="container-fluid px-3 px-md-4 py-4">
        <div className="text-center py-5">
          <div
            className="spinner-border text-primary"
            role="status"
          ></div>

          <p className="text-muted mt-3 mb-0">
            Loading medicine inventory...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN PAGE
  // =========================================================

  return (
    <div className="container-fluid px-3 px-md-4 py-4">

      {/* ================================================= */}
      {/* PAGE HEADER */}
      {/* ================================================= */}

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">

        <div>
          <div className="d-flex align-items-center gap-2 mb-2">
            <div className="rounded-3 bg-primary bg-opacity-10 p-2">
              <i className="bi bi-capsule text-primary fs-4"></i>
            </div>

            <h2 className="fw-bold mb-0">
              Medicine Inventory
            </h2>
          </div>

          <p className="text-muted mb-0">
            View and manage medicines available
            in the pharmacy inventory.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={() =>
            loadMedicines(true)
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

      {/* ================================================= */}
      {/* ERROR */}
      {/* ================================================= */}

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
              loadMedicines()
            }
          >
            Try Again
          </button>
        </div>
      )}

      {/* ================================================= */}
      {/* SUMMARY CARDS */}
      {/* ================================================= */}

      <div className="row g-3 mb-4">

        {/* TOTAL MEDICINES */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">

              <div className="rounded-3 bg-primary bg-opacity-10 p-3 me-3">
                <i className="bi bi-capsule-pill text-primary fs-3"></i>
              </div>

              <div>
                <div className="text-muted small">
                  Total Medicines
                </div>

                <h3 className="fw-bold mb-0">
                  {totalMedicines}
                </h3>
              </div>

            </div>
          </div>
        </div>

        {/* TOTAL STOCK */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">

              <div className="rounded-3 bg-success bg-opacity-10 p-3 me-3">
                <i className="bi bi-box-seam text-success fs-3"></i>
              </div>

              <div>
                <div className="text-muted small">
                  Total Stock
                </div>

                <h3 className="fw-bold mb-0">
                  {totalStock}
                </h3>
              </div>

            </div>
          </div>
        </div>

        {/* LOW STOCK */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">

              <div className="rounded-3 bg-warning bg-opacity-10 p-3 me-3">
                <i className="bi bi-exclamation-triangle text-warning fs-3"></i>
              </div>

              <div>
                <div className="text-muted small">
                  Low Stock
                </div>

                <h3 className="fw-bold mb-0">
                  {lowStockCount}
                </h3>
              </div>

            </div>
          </div>
        </div>

        {/* OUT OF STOCK */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">

              <div className="rounded-3 bg-danger bg-opacity-10 p-3 me-3">
                <i className="bi bi-x-circle text-danger fs-3"></i>
              </div>

              <div>
                <div className="text-muted small">
                  Out of Stock
                </div>

                <h3 className="fw-bold mb-0">
                  {outOfStockCount}
                </h3>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* ================================================= */}
      {/* UPDATE MEDICINE CARD */}
      {/* ================================================= */}

      {selectedMedicine && (
        <div className="card border-0 shadow-sm mb-4">

          <div className="card-header bg-white border-0 pt-4 px-4">
            <div className="d-flex justify-content-between align-items-center">

              <div>
                <h5 className="fw-bold mb-1">
                  <i className="bi bi-pencil-square text-primary me-2"></i>
                  Update Medicine Inventory
                </h5>

                <p className="text-muted small mb-0">
                  Update stock quantity or medicine price.
                </p>
              </div>

              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={handleCloseUpdate}
              >
                <i className="bi bi-x-lg"></i>
              </button>

            </div>
          </div>

          <div className="card-body px-4 pb-4">

            <div className="row g-3 mb-4">

              <div className="col-md-4">
                <div className="bg-light rounded-3 p-3">
                  <small className="text-muted">
                    Medicine
                  </small>

                  <div className="fw-semibold">
                    {selectedMedicine.master_medicine_name ||
                      selectedMedicine.name}
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="bg-light rounded-3 p-3">
                  <small className="text-muted">
                    Current Stock
                  </small>

                  <div className="fw-semibold">
                    {selectedMedicine.stock}
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="bg-light rounded-3 p-3">
                  <small className="text-muted">
                    Current Price
                  </small>

                  <div className="fw-semibold">
                    ₹
                    {Number(
                      selectedMedicine.price
                    ).toFixed(2)}
                  </div>
                </div>
              </div>

            </div>

            <div className="row g-3">

              {/* TRANSACTION */}
              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  Transaction Type
                </label>

                <select
                  className="form-select"
                  value={transactionType}
                  onChange={(event) =>
                    setTransactionType(
                      event.target.value
                    )
                  }
                >
                  <option value="Stock In">
                    Stock In
                  </option>

                  <option value="Stock Out">
                    Stock Out
                  </option>
                </select>
              </div>

              {/* QUANTITY */}
              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  Stock Quantity
                </label>

                <input
                  type="number"
                  min="1"
                  className="form-control"
                  placeholder="Enter quantity"
                  value={stockChange}
                  onChange={(event) =>
                    setStockChange(
                      event.target.value
                    )
                  }
                />
              </div>

              {/* PRICE */}
              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  Price Per Unit
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-control"
                  placeholder="Enter price"
                  value={editPrice}
                  onChange={(event) =>
                    setEditPrice(
                      event.target.value
                    )
                  }
                />
              </div>

            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleCloseUpdate}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleUpdateMedicine}
              >
                <i className="bi bi-check-lg me-2"></i>
                Update Medicine
              </button>

            </div>

          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* INVENTORY TABLE */}
      {/* ================================================= */}

      <div className="card border-0 shadow-sm">

        <div className="card-header bg-white border-0 pt-4 px-4">

          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">

            <div>
              <h5 className="fw-bold mb-1">
                Medicine Inventory
              </h5>

              <p className="text-muted small mb-0">
                Medicines maintained by the pharmacy.
              </p>
            </div>

            <div
              className="input-group"
              style={{ maxWidth: "350px" }}
            >
              <span className="input-group-text bg-white">
                <i className="bi bi-search text-muted"></i>
              </span>

              <input
                type="text"
                className="form-control"
                placeholder="Search medicine, type or batch..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />

              {search && (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setSearch("")}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              )}
            </div>

          </div>

        </div>

        <div className="card-body p-0">

          <div className="table-responsive">

            <table className="table table-hover align-middle mb-0">

              <thead className="table-light">
                <tr>

                  <th className="px-4">
                    ID
                  </th>

                  <th>
                    Medicine
                  </th>

                  <th>
                    Type
                  </th>

                  <th>
                    Batch No.
                  </th>

                  <th>
                    Manufacture
                  </th>

                  <th>
                    Expiry
                  </th>

                  <th>
                    Stock
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

                {filteredMedicines.length === 0 ? (

                  <tr>
                    <td
                      colSpan="10"
                      className="text-center py-5"
                    >
                      <i className="bi bi-capsule text-muted fs-1"></i>

                      <div className="fw-semibold mt-3">
                        No medicines found
                      </div>

                      <div className="text-muted small">
                        {search
                          ? "Try a different search term."
                          : "No medicines are currently available in the inventory."}
                      </div>
                    </td>
                  </tr>

                ) : (

                  filteredMedicines.map(
                    (medicine) => (

                      <tr
                        key={
                          medicine.master_medicine ||
                          medicine.inventory_id ||
                          medicine.id
                        }
                      >

                        {/* ID */}
                        <td className="px-4 fw-semibold">
                          {medicine.inventory_id ||
                            medicine.master_medicine ||
                            medicine.id ||
                            "—"}
                        </td>

                        {/* MEDICINE */}
                        <td>
                          <div className="fw-semibold">
                            {medicine.master_medicine_name ||
                              medicine.name}
                          </div>

                          {medicine.master_medicine_name &&
                            medicine.name &&
                            medicine.name !==
                              medicine.master_medicine_name && (
                              <small className="text-muted">
                                {medicine.name}
                              </small>
                            )}
                        </td>

                        {/* TYPE */}
                        <td>
                          {medicine.medicine_type || "—"}
                        </td>

                        {/* BATCH */}
                        <td>
                          {medicine.batch_no || "—"}
                        </td>

                        {/* MANUFACTURE */}
                        <td>
                          {medicine.manufacture_date || "—"}
                        </td>

                        {/* EXPIRY */}
                        <td>
                          {medicine.expiry_date || "—"}
                        </td>

                        {/* STOCK */}
                        <td>
                          <span className="fw-semibold">
                            {medicine.stock ?? 0}
                          </span>
                        </td>

                        {/* PRICE */}
                        <td>
                          ₹
                          {Number(
                            medicine.price || 0
                          ).toFixed(2)}
                        </td>

                        {/* STATUS */}
                        <td>
                          {getStatusBadge(medicine)}
                        </td>

                        {/* ACTION */}
                        <td className="text-center">

                          {medicine.inventory_exists ? (

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              title="Update medicine"
                              onClick={() =>
                                handleOpenStockUpdate({
                                  ...medicine,
                                  id:
                                    medicine.inventory_id,
                                })
                              }
                            >
                              <i className="bi bi-pencil-square me-1"></i>
                              Update
                            </button>

                          ) : (

                            <button
                              type="button"
                              className="btn btn-sm btn-primary"
                              title="Set pharmacy inventory"
                              onClick={() =>
                                handleInitializeInventory(
                                  medicine
                                )
                              }
                            >
                              <i className="bi bi-plus-circle me-1"></i>
                              Set Inventory
                            </button>

                          )}

                        </td>

                      </tr>

                    )
                  )

                )}

              </tbody>

            </table>

          </div>

        </div>

        <div className="card-footer bg-white border-0 px-4 py-3">

          <div className="text-muted small">
            Showing{" "}
            <strong>
              {filteredMedicines.length}
            </strong>{" "}
            of{" "}
            <strong>
              {medicines.length}
            </strong>{" "}
            medicines
          </div>

        </div>

      </div>

    </div>
  );
}

export default MedicineInventory;