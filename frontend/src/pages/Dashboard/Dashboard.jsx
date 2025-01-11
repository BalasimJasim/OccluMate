import { Link } from "react-router-dom";
import {
  FaCalendarAlt,
  FaUserPlus,
  FaCalendarPlus,
  FaTooth,
  FaPrescriptionBottleAlt,
  FaTasks,
} from "react-icons/fa";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Today&apos;s Appointments Section */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center mb-4">
              <FaCalendarAlt className="h-5 w-5 text-blue-500 mr-2" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Today&apos;s Appointments
              </h2>
            </div>
            <div className="text-gray-600 mb-4">
              No appointments scheduled for today
            </div>
            <Link
              to="/appointments"
              className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-md transition-colors"
            >
              <FaCalendarAlt className="mr-2 h-4 w-4" /> View Calendar
            </Link>
          </div>

          {/* Today&apos;s Tasks Section */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center mb-4">
              <FaTasks className="h-5 w-5 text-blue-500 mr-2" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Today&apos;s Tasks
              </h2>
            </div>
            <div className="text-gray-600 mb-4">No tasks for today</div>
            <Link
              to="/tasks"
              className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-md transition-colors"
            >
              <FaTasks className="mr-2 h-4 w-4" /> Manage Tasks
            </Link>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/patients/add"
              className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <FaUserPlus className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 mr-3 flex-shrink-0" />
              <span className="text-sm sm:text-base text-gray-700 font-medium">
                Add New Patient
              </span>
            </Link>

            <Link
              to="/appointments/schedule"
              className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <FaCalendarPlus className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 mr-3 flex-shrink-0" />
              <span className="text-sm sm:text-base text-gray-700 font-medium">
                Schedule Appointment
              </span>
            </Link>

            <Link
              to="/dental-charts"
              className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <FaTooth className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 mr-3 flex-shrink-0" />
              <span className="text-sm sm:text-base text-gray-700 font-medium">
                Dental Charts
              </span>
            </Link>

            <Link
              to="/prescriptions/new"
              className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <FaPrescriptionBottleAlt className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 mr-3 flex-shrink-0" />
              <span className="text-sm sm:text-base text-gray-700 font-medium">
                Write Prescription
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
