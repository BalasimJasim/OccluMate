import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { updateAppointment, getAllDentists, checkDentistAvailability } from '../../api';
import './AppointmentEditModal.scss';
import moment from 'moment';

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00'
];

const CABINETS = ['Cabinet-1', 'Cabinet-2', 'Cabinet-3', 'Cabinet-4'];

const AppointmentEditModal = ({ appointment, onClose, onAppointmentUpdated, onDelete }) => {
  const [formData, setFormData] = useState({
    dentistId: typeof appointment.dentist === 'object' ? 
      appointment.dentist._id : 
      appointment.dentist || '',
    date: moment(appointment.date).format('YYYY-MM-DD'),
    timeSlot: appointment.timeSlot,
    type: appointment.type,
    notes: appointment.notes || '',
    status: appointment.status,
    cabinet: appointment.cabinet || 'Cabinet-1'
  });

  const [dentists, setDentists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
      setError('Failed to fetch dentists');
      console.error('Error fetching dentists:', err);
    }
  };

  const checkDentistsAvailability = async () => {
    try {
      const availabilityPromises = dentists.map(dentist =>
        checkDentistAvailability({
          dentistId: dentist._id,
          date: formData.date,
          timeSlot: formData.timeSlot,
          excludeAppointmentId: appointment._id
        })
      );

      const results = await Promise.all(availabilityPromises);
      const busyStatus = {};
      
      results.forEach((result, index) => {
        busyStatus[dentists[index]._id] = !result.data.isAvailable;
      });

      setBusyDentists(busyStatus);
    } catch (err) {
      console.error('Error checking dentists availability:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
        status: formData.status
      });
      onAppointmentUpdated(updatedAppointment);
    } catch (error) {
      setError(error.message || 'Failed to update appointment');
    }
  };

  const handleDateChange = async (e) => {
    const newDate = e.target.value;
    setFormData(prev => ({ ...prev, date: newDate }));
    setShowTimeSlots(true);
    await checkAvailableTimeSlots(newDate);
  };

  const checkAvailableTimeSlots = async (selectedDate) => {
    try {
      const availabilityPromises = TIME_SLOTS.map(slot =>
        checkDentistAvailability({
          dentistId: formData.dentistId,
          date: selectedDate,
          timeSlot: slot,
          excludeAppointmentId: appointment._id
        })
      );

      const results = await Promise.all(availabilityPromises);
      const available = TIME_SLOTS.filter((slot, index) => {
        const isPast = moment(`${selectedDate}T${slot}`).isBefore(moment());
        return results[index].data.isAvailable && !isPast;
      });

      setAvailableSlots(available);
    } catch (err) {
      console.error('Error checking time slots availability:', err);
      setError('Failed to check available time slots');
    }
  };

  const handleTimeSlotSelect = (slot) => {
    setFormData(prev => ({ ...prev, timeSlot: slot }));
    setShowTimeSlots(false);
  };

  return (
    <div className="appointment-edit-modal-overlay" onClick={onClose}>
      <div className="appointment-edit-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Appointment</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Patient Name</label>
            <input
              type="text"
              value={appointment.patientName}
              disabled
              className="disabled-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="dentistId">Dentist</label>
            <select
              id="dentistId"
              name="dentistId"
              value={formData.dentistId}
              onChange={handleChange}
              required
            >
              {dentists.map(dentist => (
                <option 
                  key={dentist._id} 
                  value={dentist._id}
                  disabled={busyDentists[dentist._id] && dentist._id !== formData.dentistId}
                >
                  {dentist.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleDateChange}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="timeSlot">Time</label>
            <div className="time-slot-display" onClick={() => setShowTimeSlots(true)}>
              {formData.timeSlot || 'Select time'}
            </div>
          </div>

          {/* Time Slots Modal */}
          {showTimeSlots && (
            <div className="time-slots-container">
              <div className="time-slots-header">
                <h3>Available Time Slots</h3>
                <p>{moment(formData.date).format('dddd, MMMM D, YYYY')}</p>
                <button 
                  className="close-btn" 
                  onClick={() => setShowTimeSlots(false)}
                >
                  ×
                </button>
              </div>
              <div className="time-slots-grid">
                {TIME_SLOTS.map(slot => {
                  const isAvailable = availableSlots.includes(slot);
                  const isSelected = slot === formData.timeSlot;
                  const isPast = moment(`${formData.date}T${slot}`).isBefore(moment());

                  return (
                    <button
                      key={slot}
                      type="button"
                      className={`time-slot ${isAvailable ? 'available' : 'unavailable'} 
                                ${isSelected ? 'selected' : ''} 
                                ${isPast ? 'past' : ''}`}
                      onClick={() => isAvailable && !isPast && handleTimeSlotSelect(slot)}
                      disabled={!isAvailable || isPast}
                    >
                      {slot}
                      {!isAvailable && !isPast && <span className="status">Booked</span>}
                      {isPast && <span className="status">Past</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="cabinet">Cabinet</label>
            <select
              id="cabinet"
              name="cabinet"
              value={formData.cabinet}
              onChange={handleChange}
              required
            >
              <option value="">Select a cabinet</option>
              {CABINETS.map(cabinet => (
                <option key={cabinet} value={cabinet}>
                  {cabinet}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="type">Type</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="checkup">Check-up</option>
              <option value="cleaning">Cleaning</option>
              <option value="filling">Filling</option>
              <option value="extraction">Extraction</option>
              <option value="root-canal">Root Canal</option>
              <option value="consultation">Consultation</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn delete"
              onClick={onDelete}
              disabled={loading}
            >
              Delete Appointment
            </button>
            <button 
              type="button" 
              className="btn secondary" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn primary"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Appointment'}
            </button>
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
        _id: PropTypes.string,
        name: PropTypes.string
      })
    ]),
    dentistId: PropTypes.string,
    date: PropTypes.string.isRequired,
    timeSlot: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    notes: PropTypes.string,
    cabinet: PropTypes.string
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onAppointmentUpdated: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

export default AppointmentEditModal;
