import { useState, useEffect } from "react";
import {
  addAppointment,
  getAllAppointments,
  updateAppointmentStatus,
  deleteAppointment,
} from "../../api";
import { FaCalendarPlus, FaCheck, FaTimes, FaTrash } from "react-icons/fa";

const AppointmentScheduling = () => {
  const [appointments, setAppointments] = useState([]);
  const [currentAppointment, setCurrentAppointment] = useState({
    patientId: "",
    date: "",
    time: "",
    status: "Scheduled",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await getAllAppointments();
      setAppointments(response.data);
    } catch (err) {
      setError("Failed to fetch appointments");
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await addAppointment(currentAppointment);
      setCurrentAppointment({
        patientId: "",
        date: "",
        time: "",
        status: "Scheduled",
      });
      fetchAppointments();
    } catch (err) {
      setError("Failed to schedule appointment");
      console.error("Error scheduling appointment:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateAppointmentStatus(id, status);
      fetchAppointments();
    } catch (err) {
      setError("Failed to update appointment status");
      console.error("Error updating appointment status:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAppointment(id);
      fetchAppointments();
    } catch (err) {
      setError("Failed to delete appointment");
      console.error("Error deleting appointment:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading appointments...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Appointment Scheduling
      </h2>

      {error && (
        <div className="p-4 mb-6 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-sm p-6 mb-8 space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="patientId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Patient ID
            </label>
            <input
              id="patientId"
              type="text"
              placeholder="Enter patient ID"
              value={currentAppointment.patientId}
              onChange={(e) =>
                setCurrentAppointment({
                  ...currentAppointment,
                  patientId: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Date
            </label>
            <input
              id="date"
              type="date"
              value={currentAppointment.date}
              onChange={(e) =>
                setCurrentAppointment({
                  ...currentAppointment,
                  date: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="time"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Time
            </label>
            <input
              id="time"
              type="time"
              value={currentAppointment.time}
              onChange={(e) =>
                setCurrentAppointment({
                  ...currentAppointment,
                  time: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading}
          >
            <FaCalendarPlus className="mr-2" />
            Schedule Appointment
          </button>
        </div>
      </form>

      {appointments.length === 0 ? (
        <p className="text-center text-gray-500 py-8">
          No appointments scheduled
        </p>
      ) : (
        <ul className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
          {appointments.map((appointment) => (
            <li key={appointment._id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-900">
                    Patient ID: {appointment.patientId}
                  </p>
                  <p className="text-sm text-gray-500">
                    {appointment.date} at {appointment.time}
                  </p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      appointment.status === "Completed"
                        ? "bg-green-100 text-green-800"
                        : appointment.status === "Cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {appointment.status}
                  </span>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() =>
                      handleStatusUpdate(appointment._id, "Completed")
                    }
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <FaCheck className="mr-1.5" />
                    Complete
                  </button>
                  <button
                    onClick={() =>
                      handleStatusUpdate(appointment._id, "Cancelled")
                    }
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FaTimes className="mr-1.5" />
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(appointment._id)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <FaTrash className="mr-1.5" />
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AppointmentScheduling;
