import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import LoadingSpinner from "./components/common/LoadingSpinner";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import Auth from "./components/Auth/Auth";

// Lazy load components
const Login = lazy(() => import("./components/Auth/Login"));
const Register = lazy(() => import("./components/Auth/Register"));
const PatientLogin = lazy(() => import("./components/Auth/PatientLogin"));
const ChangePassword = lazy(() => import("./components/Auth/ChangePassword"));
const Home = lazy(() => import("./pages/Home"));
const Patients = lazy(() => import("./pages/Patients"));
const PatientDetails = lazy(() => import("./pages/PatientDetails"));
const Appointments = lazy(() => import("./pages/Appointments"));
const AppointmentDetails = lazy(() =>
  import("./components/Appointments/AppointmentDetails")
);
const TemplateManager = lazy(() =>
  import("./components/Templates/TemplateManager")
);
const PatientPortal = lazy(() => import("./pages/PatientPortal"));
const PortalDashboard = lazy(() =>
  import("./components/PatientPortal/PortalDashboard")
);
const PortalSettings = lazy(() =>
  import("./components/PatientPortal/PortalSettings")
);

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <LoadingSpinner size="lg" />
  </div>
);

const AppRoutes = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route element={<Auth />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/patient-login" element={<PatientLogin />} />
            <Route path="/change-password" element={<ChangePassword />} />
          </Route>

          {/* Staff Routes */}
          <Route
            element={
              <ProtectedRoute
                allowedRoles={[
                  "admin",
                  "doctor",
                  "staff",
                  "Admin",
                  "Doctor",
                  "Staff",
                  "receptionist",
                  "Receptionist",
                  "RECEPTIONIST",
                ]}
                redirectPath="/login"
              />
            }
          >
            <Route path="/" element={<Home />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/patients/:id" element={<PatientDetails />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/appointments/:id" element={<AppointmentDetails />} />
            <Route path="/templates" element={<TemplateManager />} />
          </Route>

          {/* Patient Portal Routes */}
          <Route
            element={
              <ProtectedRoute
                allowedRoles={["patient", "Patient"]}
                redirectPath="/patient-login"
              />
            }
          >
            <Route path="/portal" element={<PatientPortal />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<PortalDashboard />} />
              <Route path="settings" element={<PortalSettings />} />
            </Route>
          </Route>

          {/* Catch all route */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full mx-auto p-6">
                  <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <div className="text-gray-500 text-5xl mb-4">
                      <svg
                        className="w-16 h-16 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Page Not Found
                    </h2>
                    <p className="text-gray-600 mb-6">
                      The page you&apos;re looking for doesn&apos;t exist or has
                      been moved.
                    </p>
                    <button
                      onClick={() => window.history.back()}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Go Back
                    </button>
                  </div>
                </div>
              </div>
            }
          />
        </Routes>
      </Suspense>
    </div>
  );
};

export default AppRoutes;
