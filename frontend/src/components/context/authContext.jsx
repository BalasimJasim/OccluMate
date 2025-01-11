import { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import api, { login as loginApi } from "../../api";

export const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check token and load user on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("[AuthContext] Loading user, token exists:", !!token);

        if (!token) {
          setLoading(false);
          return;
        }

        const response = await api.get("/auth/verify");
        console.log("[AuthContext] Verify response:", response.data);
        setUser(response.data);
        console.log("[AuthContext] User state set from verify:", response.data);
      } catch (error) {
        console.error("[AuthContext] Error loading user:", error);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (credentials) => {
    try {
      console.log("[AuthContext] Attempting login with:", credentials.email);
      const response = await loginApi(credentials);
      console.log("[AuthContext] Login response:", response.data);

      const userData = response.data;
      if (userData && userData.token) {
        // Extract token and remove it from user data
        const { token, ...userWithoutToken } = userData;
        localStorage.setItem("token", token);
        setUser(userWithoutToken);
        console.log("[AuthContext] User state set:", userWithoutToken);
        return { success: true };
      } else {
        console.error("[AuthContext] Invalid response format:", response.data);
        return {
          success: false,
          error: "Invalid response format from server",
        };
      }
    } catch (error) {
      console.error("[AuthContext] Login error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  const checkPermission = (permission) => {
    console.log("[checkPermission] Checking permission:", permission);
    console.log("[checkPermission] User role:", user?.role);

    if (!user) {
      console.log("[checkPermission] No user found");
      return false;
    }

    // Admin has access to everything
    if (user.role === "Admin") {
      console.log("[checkPermission] Admin user - granting access");
      return true;
    }

    let hasPermission = false;
    switch (permission) {
      case "dashboard.access":
        hasPermission = ["Admin", "Dentist", "Receptionist"].includes(
          user.role
        );
        break;
      case "patients.access":
        hasPermission = ["Admin", "Dentist", "Receptionist"].includes(
          user.role
        );
        break;
      case "appointments.access":
        hasPermission = ["Admin", "Dentist", "Receptionist"].includes(
          user.role
        );
        break;
      case "staff.manage":
        hasPermission = user.role === "Admin";
        break;
      default:
        hasPermission = false;
    }

    console.log("[checkPermission] Permission result:", hasPermission);
    return hasPermission;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        logout,
        checkPermission,
        isAdmin: user?.role === "Admin",
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
