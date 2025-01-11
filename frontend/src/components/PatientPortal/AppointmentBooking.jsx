import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  checkDentistAvailability,
  bookAppointment,
  getAllDentists,
} from "../../api";
import moment from "moment";
import { FaTimes } from "react-icons/fa";

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
];

const AppointmentBooking = ({ onAppointmentBooked, onClose }) => {
  const [formData, setFormData] = useState({
    dentistId: "",
    date: moment().format("YYYY-MM-DD"),
    timeSlot: "",
    type: "check-up",
  });
  const [dentists, setDentists] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDentists();
  }, []);

  useEffect(() => {
    if (formData.dentistId && formData.date) {
      checkAvailability();
    }
  }, [formData.dentistId, formData.date]);

  const fetchDentists = async () => {
    try {
      const data = await getAllDentists();
      setDentists(data);
      if (data.length > 0) {
        setFormData((prev) => ({ ...prev, dentistId: data[0].id }));
      }
    } catch (err) {
      setError("Failed to fetch dentists");
    }
  };

  const checkAvailability = async () => {
    try {
      const availabilityPromises = TIME_SLOTS.map((slot) =>
        checkDentistAvailability({
          dentistId: formData.dentistId,
          date: formData.date,
          timeSlot: slot,
        })
      );

      const results = await Promise.all(availabilityPromises);
      const available = TIME_SLOTS.filter(
        (_, index) => results[index].available
      );
      setAvailableSlots(available);

      // If current selected slot is not available, clear it
      if (formData.timeSlot && !available.includes(formData.timeSlot)) {
        setFormData((prev) => ({ ...prev, timeSlot: "" }));
      }
    } catch (err) {
      setError("Failed to check availability");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await bookAppointment(formData);
      onAppointmentBooked();
      onClose();
    } catch (err) {
      setError("Failed to book appointment");
    } finally {
      setLoading(false);
    }
  };

  const isTimeSlotAvailable = (slot) => {
    return availableSlots.includes(slot);
  };

  const isTimeSlotPast = (slot) => {
    if (formData.date === moment().format("YYYY-MM-DD")) {
      return moment(slot, "HH:mm").isBefore(moment());
    }
    return false;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Book Appointment
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-md">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dentist
            </label>
            <select
              value={formData.dentistId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, dentistId: e.target.value }))
              }
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            >
              {dentists.map((dentist) => (
                <option key={dentist.id} value={dentist.id}>
                  Dr. {dentist.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              min={moment().format("YYYY-MM-DD")}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, date: e.target.value }))
              }
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Slot
            </label>
            <div className="grid grid-cols-3 gap-2">
              {TIME_SLOTS.map((slot) => {
                const isAvailable = isTimeSlotAvailable(slot);
                const isPast = isTimeSlotPast(slot);
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, timeSlot: slot }))
                    }
                    disabled={!isAvailable || isPast}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      formData.timeSlot === slot
                        ? "bg-blue-600 text-white"
                        : isAvailable && !isPast
                        ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Appointment Type
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, type: e.target.value }))
              }
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="check-up">Check-up</option>
              <option value="cleaning">Cleaning</option>
              <option value="consultation">Consultation</option>
              <option value="procedure">Procedure</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.timeSlot}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "Booking..." : "Book Appointment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

AppointmentBooking.propTypes = {
  onAppointmentBooked: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AppointmentBooking; 