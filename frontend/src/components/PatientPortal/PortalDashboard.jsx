import { useState, useEffect } from 'react';
import { FaCalendarPlus, FaPrescription, FaFileUpload, FaCog } from 'react-icons/fa';
import { 
  getPatientAppointments, 
  getPatientPrescriptions,
  bookAppointment,
  updateAppointmentStatus
} from '../../api';
import AppointmentBooking from './AppointmentBooking';
import DocumentManager from './DocumentManager';
import PortalSettings from "./PortalSettings";

const PortalDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("Fetching dashboard data...");
      const [appointmentsRes, prescriptionsRes] = await Promise.all([
        getPatientAppointments(),
        getPatientPrescriptions(),
      ]);

      console.log("Appointments response:", appointmentsRes);
      console.log("Prescriptions response:", prescriptionsRes);

      setAppointments(appointmentsRes.data || []);
      setPrescriptions(prescriptionsRes.data || []);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to load dashboard data";
      setError(errorMessage);
      setAppointments([]);
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentBooked = async (appointmentData) => {
    try {
      await bookAppointment(appointmentData);
      await fetchDashboardData();
      setShowBookingForm(false);
    } catch (error) {
      console.error("Booking error:", error);
      setError("Failed to book appointment");
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      await updateAppointmentStatus(appointmentId, "cancelled");
      await fetchDashboardData();
    } catch (error) {
      console.error("Cancellation error:", error);
      setError("Failed to cancel appointment");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center p-8 text-gray-600">
        Loading dashboard...
      </div>
    );
  if (error)
    return <div className="p-4 bg-red-50 text-red-600 rounded-md">{error}</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex space-x-4 border-b border-gray-200 mb-8">
        {[
          "overview",
          "appointments",
          "prescriptions",
          "documents",
          "settings",
        ].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 font-medium text-sm capitalize transition-colors
              ${
                activeTab === tab
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-8 text-white">
              <h2 className="text-2xl font-semibold mb-2">
                Welcome to Your Patient Portal
              </h2>
              <p className="text-blue-100">
                Manage your dental care all in one place
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow space-y-3"
                onClick={() => setActiveTab("appointments")}
              >
                <FaCalendarPlus className="text-3xl text-blue-500" />
                <span className="text-gray-700 font-medium">
                  Book Appointment
                </span>
              </button>
              <button
                className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow space-y-3"
                onClick={() => setActiveTab("prescriptions")}
              >
                <FaPrescription className="text-3xl text-blue-500" />
                <span className="text-gray-700 font-medium">
                  View Prescriptions
                </span>
              </button>
              <button
                className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow space-y-3"
                onClick={() => setActiveTab("documents")}
              >
                <FaFileUpload className="text-3xl text-blue-500" />
                <span className="text-gray-700 font-medium">
                  Upload Documents
                </span>
              </button>
              <button
                className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow space-y-3"
                onClick={() => setActiveTab("settings")}
              >
                <FaCog className="text-3xl text-blue-500" />
                <span className="text-gray-700 font-medium">Settings</span>
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaCalendarPlus className="text-blue-500" />
                Upcoming Appointments
              </h3>
              {appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div
                      key={appointment._id}
                      className="flex justify-between items-center p-4 border border-gray-100 rounded-lg hover:bg-gray-50"
                    >
                      <div className="space-y-1">
                        <div className="text-sm text-gray-500">
                          {new Date(appointment.date).toLocaleDateString()}
                        </div>
                        <div className="font-medium text-gray-900">
                          {appointment.timeSlot}
                        </div>
                        <div className="text-sm text-gray-600">
                          {appointment.type}
                        </div>
                      </div>
                      <button
                        className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        onClick={() => handleCancelAppointment(appointment._id)}
                      >
                        Cancel
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  No upcoming appointments
                </p>
              )}
              <button
                className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                onClick={() => setShowBookingForm(true)}
              >
                Book New Appointment
              </button>
            </div>

            {showBookingForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <AppointmentBooking
                    onAppointmentBooked={handleAppointmentBooked}
                    onClose={() => setShowBookingForm(false)}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "appointments" && (
          <AppointmentBooking onAppointmentBooked={handleAppointmentBooked} />
        )}

        {activeTab === "prescriptions" && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <FaPrescription className="text-blue-500" />
              Your Prescriptions
            </h3>
            <div className="space-y-4">
              {prescriptions.map((prescription) => (
                <div
                  key={prescription._id}
                  className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">
                      {prescription.medication}
                    </h4>
                    <p className="text-gray-600">{prescription.dosage}</p>
                    <p className="text-gray-600">{prescription.instructions}</p>
                    <span className="text-sm text-gray-500">
                      Prescribed:{" "}
                      {new Date(prescription.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <button className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                    Request Refill
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "documents" && <DocumentManager />}

        {activeTab === "settings" && <PortalSettings />}
      </div>
    </div>
  );
};

export default PortalDashboard; 