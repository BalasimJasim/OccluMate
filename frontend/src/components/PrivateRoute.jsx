import { Navigate } from "react-router-dom";
import { useAuth } from "./context/authContext";
import PropTypes from "prop-types";

const PrivateRoute = ({ children, requiredPermission }) => {
  const { user, loading, checkPermission } = useAuth();

  console.log("[PrivateRoute] Current state:", {
    loading,
    user: user ? { ...user, token: "..." } : null,
    requiredPermission,
    path: window.location.pathname,
  });

  if (loading) {
    console.log("[PrivateRoute] Still loading, showing spinner");
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    console.log("[PrivateRoute] No user found, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // Check specific permission if required
  if (requiredPermission && !checkPermission(requiredPermission)) {
    console.log("[PrivateRoute] Permission check failed:", {
      required: requiredPermission,
      userRole: user.role,
    });
    return <Navigate to="/" replace />;
  }

  // For admin routes, check if user is admin
  if (window.location.pathname.startsWith("/admin") && user.role !== "Admin") {
    console.log("[PrivateRoute] Admin route access denied");
    return <Navigate to="/" replace />;
  }

  console.log("[PrivateRoute] Access granted");
  return children;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiredPermission: PropTypes.string,
};

export default PrivateRoute;
