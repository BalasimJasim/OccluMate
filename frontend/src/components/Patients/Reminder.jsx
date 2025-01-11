import { useState, useEffect } from "react";
import api from "../../api";
import { FaBell } from "react-icons/fa";

const Reminder = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAppointments = async () => {
    try {
      const response = await api.get("/appointments/upcoming");
      setAppointments(response.data);
    } catch (error) {
      setError("Failed to fetch appointments");
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendReminder = async (appointmentId) => {
    try {
      await api.post(`/appointments/${appointmentId}/remind`);
      alert("Reminder sent successfully!");
    } catch (error) {
      alert("Failed to send reminder");
      console.error("Error sending reminder:", error);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading appointments...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Send Appointment Reminders
      </h2>

      {error && (
        <div className="p-4 mb-6 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {appointments.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No upcoming appointments found.
        </p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {appointments.map((appointment) => (
            <li key={appointment._id} className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {appointment.patientName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {appointment.date} at {appointment.time}
                  </p>
                  <p className="text-sm text-gray-500">
                    Type: {appointment.type}
                  </p>
                </div>
                <button
                  onClick={() => sendReminder(appointment._id)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FaBell className="mr-2" />
                  Send Reminder
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Reminder;
