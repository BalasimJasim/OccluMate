import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./context/authContext";
import {
  FaHome,
  FaUserInjured,
  FaCalendarAlt,
  FaTooth,
  FaPrescription,
  FaTasks,
  FaChartLine,
  FaSignOutAlt,
  FaUser,
} from "react-icons/fa";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold text-blue-600">
                OccluMate
              </Link>
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link
                to="/"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <FaHome className="mr-1" /> Home
              </Link>
              <Link
                to="/patients"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <FaUserInjured className="mr-1" /> Patients
              </Link>
              <Link
                to="/appointments"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <FaCalendarAlt className="mr-1" /> Appointments
              </Link>
              <Link
                to="/treatments"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <FaTooth className="mr-1" /> Treatments
              </Link>
              <Link
                to="/prescriptions"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <FaPrescription className="mr-1" /> Prescriptions
              </Link>
              <Link
                to="/tasks"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <FaTasks className="mr-1" /> Tasks
              </Link>
              <Link
                to="/analytics"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <FaChartLine className="mr-1" /> Analytics
              </Link>
              {user?.role === "Admin" && (
                <Link
                  to="/admin/staff"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  Staff Management
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900 focus:outline-none"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-sm hover:bg-blue-600 transition-colors">
                    {user.name?.[0]?.toUpperCase() || <FaUser />}
                  </div>
                  {/* <span className="text-sm text-gray-700 hidden sm:block">
                    Welcome, {user.name}
                  </span> */}
                  {/* <FaCaretDown className="h-4 w-4 text-gray-500" /> */}
                </button>

                {showUserMenu && (
                  <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-gray-700">
                        <p className="font-medium truncate">{user.name}</p>
                        <p className="text-gray-500 truncate text-xs">
                          {user.role}
                        </p>
                      </div>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <FaSignOutAlt className="mr-2 h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <FaUser className="h-4 w-4 mr-1" />
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
