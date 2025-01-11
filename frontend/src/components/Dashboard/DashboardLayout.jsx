import PropTypes from "prop-types";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";
import {
  FaCalendarAlt,
  FaClipboardList,
  FaUser,
  FaCog,
  FaBars,
  FaTimes,
  FaUsersCog,
  FaChartLine,
  FaBell,
  FaSignOutAlt,
} from "react-icons/fa";

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout, checkPermission } = useAuth();

  const navigation = [
    {
      name: "Dashboard",
      path: "/",
      icon: FaChartLine,
      permission: "dashboard.access",
    },
    {
      name: "Appointments",
      path: "/appointments",
      icon: FaCalendarAlt,
      permission: "appointments.access",
    },
    {
      name: "Patients",
      path: "/patients",
      icon: FaUser,
      permission: "patients.access",
    },
    {
      name: "Tasks",
      path: "/tasks",
      icon: FaClipboardList,
      permission: "dashboard.access",
    },
    {
      name: "Reminders",
      path: "/reminders",
      icon: FaBell,
      permission: "dashboard.access",
    },
    // Admin-only navigation item
    {
      name: "Staff Management",
      path: "/admin/staff",
      icon: FaUsersCog,
      permission: "staff.manage",
    },
    {
      name: "Settings",
      path: "/settings",
      icon: FaCog,
      permission: "dashboard.access",
    },
  ];

  const filteredNavigation = navigation.filter((item) =>
    checkPermission(item.permission)
  );

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out z-30 
          ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
      >
        <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <h1 className="text-xl font-semibold">OccluMate</h1>
          <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-6 px-4">
          {filteredNavigation.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center px-4 py-3 mt-2 text-sm rounded-lg transition-colors duration-150
                ${
                  isActive(item.path)
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            <button
              className="text-gray-600 lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <FaBars className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">Welcome, {user?.name}</div>
              <button
                onClick={logout}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                <FaSignOutAlt className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

DashboardLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default DashboardLayout;
