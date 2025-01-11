import { useState, useEffect } from "react";
import AppointmentCalendar from "../components/AppointmentCalendar";
import AppointmentForm from "../components/Appointments/AppointmentForm";
import { getAllAppointments } from "../api";
import AppointmentList from "../components/Appointments/AppointmentList";
import moment from "moment";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [view, setView] = useState("calendar");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await getAllAppointments();
      console.log("Raw appointments response:", response); // Debug log

      // Extract the data array from the response
      const appointmentsData = response.data || [];
      setAppointments(appointmentsData);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setError("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleAppointmentAdded = (newAppointment) => {
    setAppointments((prev) => [...prev, newAppointment]);
    setShowForm(false);
  };

  const handleAppointmentUpdated = (updatedAppointment) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt._id === updatedAppointment._id ? updatedAppointment : apt
      )
    );
  };

  const handleAppointmentDeleted = (appointmentId) => {
    setAppointments((prev) => prev.filter((apt) => apt._id !== appointmentId));
  };

  const handleTimeSlotSelect = (slotInfo) => {
    setSelectedSlot(slotInfo);
    setShowForm(true); // Open the appointment form when a slot is selected
  };

  if (loading)
    return (
      <div className="flex items-center justify-center p-8 text-gray-600">
        Loading appointments...
      </div>
    );
  if (error)
    return (
      <div className="mx-auto max-w-2xl mt-8 p-4 bg-red-50 text-red-600 rounded-md">
        {error}
      </div>
    );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">Appointments</h1>
        <div className="flex flex-wrap gap-2">
          <div className="flex rounded-md shadow-sm">
            <button
              className={`px-4 py-2 text-sm font-medium border border-gray-300 rounded-l-md
                ${
                  view === "calendar"
                    ? "bg-blue-50 text-blue-700 border-blue-300"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              onClick={() => setView("calendar")}
            >
              Calendar View
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium border border-gray-300 -ml-px rounded-r-md
                ${
                  view === "list"
                    ? "bg-blue-50 text-blue-700 border-blue-300"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              onClick={() => setView("list")}
            >
              List View
            </button>
          </div>
          <button
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
            onClick={() => setShowForm(true)}
          >
            Add Appointment
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <AppointmentForm
              onClose={() => {
                setShowForm(false);
                setSelectedSlot(null);
              }}
              onAppointmentAdded={handleAppointmentAdded}
              initialDate={
                selectedSlot?.start
                  ? moment(selectedSlot.start).format("YYYY-MM-DD")
                  : ""
              }
              initialTime={selectedSlot?.timeSlot || ""}
            />
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm">
        {view === "calendar" ? (
          <AppointmentCalendar
            appointments={appointments}
            onAppointmentUpdated={handleAppointmentUpdated}
            onAppointmentDeleted={handleAppointmentDeleted}
            onTimeSlotSelect={handleTimeSlotSelect}
            selectedSlot={selectedSlot}
          />
        ) : (
          <AppointmentList
            appointments={appointments}
            onAppointmentUpdated={handleAppointmentUpdated}
            onAppointmentDeleted={handleAppointmentDeleted}
          />
        )}
      </div>
    </div>
  );
};

export default Appointments;
