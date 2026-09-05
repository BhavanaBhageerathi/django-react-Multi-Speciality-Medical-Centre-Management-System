import { BrowserRouter, Routes, Route } from "react-router-dom";
import Medicines from "./pages/admin/Medicines";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRoute from "./components/admin/AdminRoute";
import Staff from "./pages/admin/Staff";
import Departments from "./pages/admin/Departments";
import LabTests from "./pages/admin/LabTest";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/login" element={<Login />} />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/staff"
          element={
            <AdminRoute>
              <Staff />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/departments"
          element={
            <AdminRoute>
              <Departments />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/medicines"
          element={
            <AdminRoute>
              <Medicines />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/lab-tests"
          element={<LabTests />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;