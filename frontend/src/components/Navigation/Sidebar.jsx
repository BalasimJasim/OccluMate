import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import {
  FaHome,
  FaUserInjured,
  FaCalendarAlt,
  FaTooth,
  FaPrescription,
  FaTasks,
  FaChartLine,
  FaFileAlt,
  FaCog,
} from "react-icons/fa";

const Sidebar = () => {
  const { user } = useContext(AuthContext);

  return (
    <aside className="h-screen w-64 bg-white border-r border-gray-200 fixed left-0 top-0">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <Link to="/" className="text-xl font-bold text-blue-600">
            OccluMate
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-2 space-y-1">
            <Link
              to="/"
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-blue-600 group"
            >
              <FaHome className="mr-3 h-5 w-5" />
              Dashboard
            </Link>

            <Link
              to="/patients"
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-blue-600 group"
            >
              <FaUserInjured className="mr-3 h-5 w-5" />
              Patients
            </Link>

            <Link
              to="/appointments"
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-blue-600 group"
            >
              <FaCalendarAlt className="mr-3 h-5 w-5" />
              Appointments
            </Link>

            <Link
              to="/treatments"
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-blue-600 group"
            >
              <FaTooth className="mr-3 h-5 w-5" />
              Treatments
            </Link>

            <Link
              to="/prescriptions"
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-blue-600 group"
            >
              <FaPrescription className="mr-3 h-5 w-5" />
              Prescriptions
            </Link>

            <Link
              to="/tasks"
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-blue-600 group"
            >
              <FaTasks className="mr-3 h-5 w-5" />
              Tasks
            </Link>

            <Link
              to="/analytics"
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-blue-600 group"
            >
              <FaChartLine className="mr-3 h-5 w-5" />
              Analytics
            </Link>

            {["Dentist", "Admin"].includes(user?.role) && (
              <Link
                to="/templates"
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-blue-600 group"
              >
                <FaFileAlt className="mr-3 h-5 w-5" />
                Templates
              </Link>
            )}
          </div>
        </nav>

        <div className="border-t border-gray-200 p-4">
          <Link
            to="/settings"
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-blue-600 group"
          >
            <FaCog className="mr-3 h-5 w-5" />
            Settings
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
