import { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { AuthContext } from "../context/authContext";
import LoadingSpinner from "../common/LoadingSpinner";

const ProtectedRoute = ({ allowedRoles = [], redirectPath = "/login" }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  // Debug logs
  console.log("ProtectedRoute - Current user:", user);
  console.log("ProtectedRoute - User role:", user?.role);
  console.log("ProtectedRoute - Allowed roles:", allowedRoles);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    // Save the attempted URL for redirecting after login
    sessionStorage.setItem("redirectUrl", location.pathname);
    return <Navigate to={redirectPath} replace state={{ from: location }} />;
  }

  // If no roles are specified, allow access
  if (allowedRoles.length === 0) {
    return <Outlet />;
  }

  // Check if user role matches any of the allowed roles (case-insensitive)
  const hasPermission = allowedRoles.some(
    (role) => user.role?.toLowerCase() === role.toLowerCase()
  );

  if (!hasPermission) {
    console.log("Access denied - User role doesn't match allowed roles");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-red-500 text-5xl mb-4">
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-6">
              You don&apos;t have permission to access this page. Please contact
              your administrator if you believe this is an error.
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
    );
  }

  return <Outlet />;
};

ProtectedRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
  redirectPath: PropTypes.string,
};

ProtectedRoute.defaultProps = {
  allowedRoles: [],
  redirectPath: "/login",
};

export default ProtectedRoute;
