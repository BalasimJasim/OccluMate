import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  updateAppointment,
  getAllDentists,
  checkDentistAvailability,
} from "../../api";
import moment from "moment";

const TIME_SLOTS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
];

const CABINETS = ["Cabinet-1", "Cabinet-2", "Cabinet-3", "Cabinet-4"];

const AppointmentEditModal = ({
  appointment,
  onClose,
  onAppointmentUpdated,
  onDelete,
}) => {
  const [formData, setFormData] = useState({
    dentistId:
      typeof appointment.dentist === "object"
        ? appointment.dentist._id
        : appointment.dentist || "",
    date: moment(appointment.date).format("YYYY-MM-DD"),
    timeSlot: appointment.timeSlot,
    type: appointment.type,
    notes: appointment.notes || "",
    status: appointment.status,
    cabinet: appointment.cabinet || "Cabinet-1",
  });

  const [dentists, setDentists] = useState([]);
  const [error, setError] = useState("");
  const [busyDentists, setBusyDentists] = useState({});
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);

  useEffect(() => {
    fetchDentists();
  }, []);

  useEffect(() => {
    if (formData.date && formData.timeSlot) {
      checkDentistsAvailability();
    }
  }, [formData.date, formData.timeSlot]);

  const fetchDentists = async () => {
    try {
      const response = await getAllDentists();
      setDentists(response.data);
    } catch (err) {
      setError("Failed to fetch dentists");
      console.error("Error fetching dentists:", err);
    }
  };

  const checkDentistsAvailability = async () => {
    try {
      const availabilityPromises = dentists.map((dentist) =>
        checkDentistAvailability({
          dentistId: dentist._id,
          date: formData.date,
          timeSlot: formData.timeSlot,
          excludeAppointmentId: appointment._id,
        })
      );

      const results = await Promise.all(availabilityPromises);
      const busyStatus = {};

      results.forEach((result, index) => {
        busyStatus[dentists[index]._id] = !result.data.isAvailable;
      });

      setBusyDentists(busyStatus);
    } catch (err) {
      console.error("Error checking dentists availability:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedAppointment = await updateAppointment(appointment._id, {
        dentistId: formData.dentistId,
        date: formData.date,
        timeSlot: formData.timeSlot,
        type: formData.type,
        notes: formData.notes,
        cabinet: formData.cabinet,
        status: formData.status,
      });
      onAppointmentUpdated(updatedAppointment);
    } catch (error) {
      setError(error.message || "Failed to update appointment");
    }
  };

  const handleDateChange = async (e) => {
    const newDate = e.target.value;
    setFormData((prev) => ({ ...prev, date: newDate }));
    setShowTimeSlots(true);
    await checkAvailableTimeSlots(newDate);
  };

  const checkAvailableTimeSlots = async (selectedDate) => {
    try {
      const availabilityPromises = TIME_SLOTS.map((slot) =>
        checkDentistAvailability({
          dentistId: formData.dentistId,
          date: selectedDate,
          timeSlot: slot,
          excludeAppointmentId: appointment._id,
        })
      );

      const results = await Promise.all(availabilityPromises);
      const available = TIME_SLOTS.filter((slot, index) => {
        const isPast = moment(`${selectedDate}T${slot}`).isBefore(moment());
        return results[index].data.isAvailable && !isPast;
      });

      setAvailableSlots(available);
    } catch (err) {
      console.error("Error checking time slots availability:", err);
      setError("Failed to check available time slots");
    }
  };

  const handleTimeSlotSelect = (slot) => {
    setFormData((prev) => ({ ...prev, timeSlot: slot }));
    setShowTimeSlots(false);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Edit Appointment
          </h2>
          <button
            className="text-gray-500 hover:text-gray-700 text-2xl font-semibold focus:outline-none"
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Patient Name
            </label>
            <input
              type="text"
              value={appointment.patientName}
              disabled
              className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-500 cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="dentistId"
              className="block text-sm font-medium text-gray-700"
            >
              Dentist
            </label>
            <select
              id="dentistId"
              name="dentistId"
              value={formData.dentistId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {dentists.map((dentist) => (
                <option
                  key={dentist._id}
                  value={dentist._id}
                  disabled={
                    busyDentists[dentist._id] &&
                    dentist._id !== formData.dentistId
                  }
                  className={
                    busyDentists[dentist._id] &&
                    dentist._id !== formData.dentistId
                      ? "text-gray-400"
                      : ""
                  }
                >
                  {dentist.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700"
            >
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleDateChange}
              min={new Date().toISOString().split("T")[0]}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="timeSlot"
              className="block text-sm font-medium text-gray-700"
            >
              Time
            </label>
            <button
              type="button"
              className="w-full px-3 py-2 text-left border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onClick={() => setShowTimeSlots(true)}
            >
              {formData.timeSlot || "Select time"}
            </button>
          </div>

          {/* Time Slots Modal */}
          {showTimeSlots && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Available Time Slots
                    </h3>
                    <p className="text-sm text-gray-500">
                      {moment(formData.date).format("dddd, MMMM D, YYYY")}
                    </p>
                  </div>
                  <button
                    className="text-gray-500 hover:text-gray-700 text-2xl font-semibold focus:outline-none"
                    onClick={() => setShowTimeSlots(false)}
                  >
                    ×
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {TIME_SLOTS.map((slot) => {
                    const isAvailable = availableSlots.includes(slot);
                    const isSelected = slot === formData.timeSlot;
                    const isPast = moment(`${formData.date}T${slot}`).isBefore(
                      moment()
                    );

                    return (
                      <button
                        key={slot}
                        type="button"
                        className={`px-3 py-2 text-sm font-medium rounded-md transition-colors
                          ${
                            isSelected
                              ? "bg-blue-600 text-white"
                              : isAvailable && !isPast
                              ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                        onClick={() =>
                          isAvailable && !isPast && handleTimeSlotSelect(slot)
                        }
                        disabled={!isAvailable || isPast}
                      >
                        {slot}
                        {!isAvailable && !isPast && (
                          <span className="block text-xs text-gray-500">
                            Booked
                          </span>
                        )}
                        {isPast && (
                          <span className="block text-xs text-gray-500">
                            Past
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="cabinet"
              className="block text-sm font-medium text-gray-700"
            >
              Cabinet
            </label>
            <select
              id="cabinet"
              name="cabinet"
              value={formData.cabinet}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {CABINETS.map((cabinet) => (
                <option key={cabinet} value={cabinet}>
                  {cabinet}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700"
            >
              Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="checkup">Check-up</option>
              <option value="cleaning">Cleaning</option>
              <option value="filling">Filling</option>
              <option value="extraction">Extraction</option>
              <option value="root-canal">Root Canal</option>
              <option value="consultation">Consultation</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700"
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700"
            >
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-between pt-4 border-t border-gray-200">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              onClick={onDelete}
            >
              Delete Appointment
            </button>
            <div className="space-x-3">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

AppointmentEditModal.propTypes = {
  appointment: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    patientName: PropTypes.string.isRequired,
    dentist: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        _id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
      }),
    ]).isRequired,
    date: PropTypes.string.isRequired,
    timeSlot: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    notes: PropTypes.string,
    status: PropTypes.string.isRequired,
    cabinet: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onAppointmentUpdated: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default AppointmentEditModal;
