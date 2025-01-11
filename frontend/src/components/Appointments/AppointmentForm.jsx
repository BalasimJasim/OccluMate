import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  getAllPatients,
  getAllDentists,
  checkDentistAvailability,
  addAppointment,
} from "../../api";
import moment from "moment";
import PatientFormModal from "./PatientFormModal";

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

const APPOINTMENT_TYPES = [
  { value: "checkup", label: "Check-up" },
  { value: "cleaning", label: "Cleaning" },
  { value: "filling", label: "Filling" },
  { value: "extraction", label: "Extraction" },
  { value: "root-canal", label: "Root Canal" },
  { value: "consultation", label: "Consultation" },
  { value: "other", label: "Other" },
];

const AppointmentForm = ({
  onClose = () => {},
  onAppointmentAdded = () => {},
  initialDate = "",
  initialTime = "",
}) => {
  const [formData, setFormData] = useState({
    patientId: "",
    dentistId: "",
    cabinet: "Cabinet-1",
    date: initialDate ? moment(initialDate).format("YYYY-MM-DD") : "",
    timeSlot: initialTime || "",
    type: "checkup",
    notes: "",
  });

  const [patients, setPatients] = useState([]);
  const [dentists, setDentists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [availableCabinets, setAvailableCabinets] = useState(CABINETS);
  const [showPatientForm, setShowPatientForm] = useState(false);

  useEffect(() => {
    fetchPatients();
    fetchDentists();
  }, []);

  useEffect(() => {
    if (formData.date && formData.dentistId) {
      checkAvailability(formData.dentistId, formData.date, formData.timeSlot);
    }
  }, [formData.date, formData.dentistId, formData.timeSlot]);

  const fetchPatients = async () => {
    try {
      const response = await getAllPatients();
      setPatients(response.data);
    } catch (error) {
      console.error("Error fetching patients:", error);
      setError("Failed to fetch patients");
    }
  };

  const fetchDentists = async () => {
    try {
      const response = await getAllDentists();
      setDentists(response.data);
    } catch (err) {
      console.error("Error fetching dentists:", err);
      setError("Failed to fetch dentists");
    }
  };

  const checkAvailability = async (dentistId, date, timeSlot) => {
    try {
      const patientId = formData.patientId || null;
      const cabinet = formData.cabinet || null;

      console.log("Checking availability with params:", {
        dentistId,
        date,
        timeSlot,
        patientId,
        cabinet,
      });
      const response = await checkDentistAvailability({
        dentistId,
        date,
        timeSlot,
        patientId,
        cabinet,
      });

      if (response.data.success === false) {
        setError(response.data.message);
        return false;
      }

      setAvailableSlots(response.data.availableSlots || []);
      setAvailableCabinets(response.data.availableCabinets || CABINETS);
      return true;
    } catch (error) {
      if (error.response?.status === 409) {
        setError(error.response.data.message);
        return false;
      }
      console.error("Error checking availability:", error);
      setError("Error checking availability");
      return false;
    }
  };

  const handleTimeSlotSelect = async (slot) => {
    setFormData((prev) => ({ ...prev, timeSlot: slot, cabinet: "" }));

    if (formData.dentistId) {
      try {
        const response = await checkDentistAvailability({
          dentistId: formData.dentistId,
          date: formData.date,
          timeSlot: slot,
        });
        setAvailableCabinets(response.data.availableCabinets || []);
      } catch (err) {
        console.error("Error checking cabinet availability:", err);
        setError("Failed to check cabinet availability");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.patientId ||
      !formData.dentistId ||
      !formData.date ||
      !formData.timeSlot
    ) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      console.log("Submitting appointment data:", formData);
      const response = await addAppointment(formData);
      console.log("Raw appointment response:", response);

      if (response.data) {
        const newAppointment = {
          ...response.data,
          start: new Date(`${formData.date}T${formData.timeSlot}`),
          end: new Date(`${formData.date}T${formData.timeSlot}`),
          title: `${response.data.patientName} - ${response.data.type}`,
        };
        console.log("Formatted appointment for calendar:", newAppointment);
        onAppointmentAdded(newAppointment);
        onClose();
      }
    } catch (error) {
      console.error("Error adding appointment:", error);
      if (error.response?.status === 409) {
        setError(error.response.data.message);
      } else {
        setError(error.response?.data?.message || "Error creating appointment");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Schedule New Appointment
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
            <label
              htmlFor="patientId"
              className="block text-sm font-medium text-gray-700"
            >
              Patient
            </label>
            <select
              id="patientId"
              name="patientId"
              value={formData.patientId}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "new") {
                  setShowPatientForm(true);
                } else {
                  setFormData((prev) => ({ ...prev, patientId: value }));
                }
              }}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Patient</option>
              <option value="new">➕ Add New Patient</option>
              {patients.map((patient) => (
                <option key={patient._id} value={patient._id}>
                  {patient.name}
                </option>
              ))}
            </select>
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
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  dentistId: e.target.value,
                  cabinet: "", // Clear cabinet when dentist changes
                }))
              }
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Dentist</option>
              {dentists.map((dentist) => (
                <option key={dentist._id} value={dentist._id}>
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
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  date: e.target.value,
                  timeSlot: "", // Clear time slot when date changes
                  cabinet: "", // Clear cabinet when date changes
                }))
              }
              min={moment().format("YYYY-MM-DD")}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {formData.date && formData.dentistId && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Time Slot
              </label>
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
          )}

          {formData.timeSlot && (
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
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, cabinet: e.target.value }))
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Cabinet</option>
                {availableCabinets.map((cabinet) => (
                  <option key={cabinet} value={cabinet}>
                    {cabinet}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700"
            >
              Appointment Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, type: e.target.value }))
              }
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {APPOINTMENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
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
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Scheduling..." : "Schedule Appointment"}
            </button>
          </div>
        </form>

        {showPatientForm && (
          <PatientFormModal
            onClose={() => setShowPatientForm(false)}
            onPatientAdded={(newPatient) => {
              setPatients((prev) => [...prev, newPatient]);
              setFormData((prev) => ({ ...prev, patientId: newPatient._id }));
              setShowPatientForm(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

AppointmentForm.propTypes = {
  onClose: PropTypes.func,
  onAppointmentAdded: PropTypes.func,
  initialDate: PropTypes.string,
  initialTime: PropTypes.string,
};

export default AppointmentForm;
