import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/context/authContext";
import Login from "./components/Auth/Login";
import PatientLogin from "./components/Auth/PatientLogin";
import AdminDashboard from "./pages/AdminDashboard";
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Dashboard/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Appointments from "./pages/Appointments";
import Patients from "./pages/Patients";
import Tasks from "./pages/Tasks";
import Reminders from "./pages/Reminders";
import Settings from "./pages/Settings";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/patient-login" element={<PatientLogin />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <PrivateRoute requiredPermission="dashboard.access">
                  <Layout>
                    <Dashboard />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/appointments"
              element={
                <PrivateRoute requiredPermission="appointments.access">
                  <Layout>
                    <Appointments />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/patients"
              element={
                <PrivateRoute requiredPermission="patients.access">
                  <Layout>
                    <Patients />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/tasks"
              element={
                <PrivateRoute requiredPermission="dashboard.access">
                  <Layout>
                    <Tasks />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/reminders"
              element={
                <PrivateRoute requiredPermission="dashboard.access">
                  <Layout>
                    <Reminders />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/staff"
              element={
                <PrivateRoute requiredPermission="staff.manage">
                  <Layout>
                    <AdminDashboard />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute requiredPermission="dashboard.access">
                  <Layout>
                    <Settings />
                  </Layout>
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
