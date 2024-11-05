import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { checkDentistAvailability, bookAppointment, getAllDentists } from '../../api';
import './AppointmentBooking.scss';
import moment from 'moment';

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
];

const APPOINTMENT_TYPES = [
  { value: 'checkup', label: 'Regular Check-up' },
  { value: 'cleaning', label: 'Teeth Cleaning' },
  { value: 'filling', label: 'Dental Filling' },
  { value: 'emergency', label: 'Emergency Visit' },
  { value: 'consultation', label: 'Consultation' }
];

const AppointmentBooking = ({ onAppointmentBooked, onClose }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedDentist, setSelectedDentist] = useState('');
  const [dentists, setDentists] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchDentists();
  }, []);

  useEffect(() => {
    if (selectedDate && selectedDentist) {
      checkAvailability();
    }
  }, [selectedDate, selectedDentist]);

  const fetchDentists = async () => {
    try {
      const response = await getAllDentists();
      setDentists(response.data);
    } catch (error) {
      console.error('Error fetching dentists:', error);
      setError('Failed to fetch dentists');
    }
  };

  const checkAvailability = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Checking availability for:', {
        dentistId: selectedDentist,
        date: selectedDate
      });

      const availabilityPromises = TIME_SLOTS.map(slot =>
        checkDentistAvailability({
          dentistId: selectedDentist,
          date: selectedDate,
          timeSlot: slot
        }).catch(error => {
          console.error(`Error checking slot ${slot}:`, error);
          return { data: { isAvailable: false, reason: 'error' } };
        })
      );

      const results = await Promise.all(availabilityPromises);
      const available = TIME_SLOTS.filter((_, index) => {
        const result = results[index];
        return result?.data?.isAvailable;
      });

      console.log('Available slots:', available);
      setAvailableSlots(available);
    } catch (error) {
      console.error('Error checking availability:', error);
      setError('Failed to check availability. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await bookAppointment({
        dentistId: selectedDentist,
        date: selectedDate,
        timeSlot: selectedTime,
        type: selectedType
      });
      
      setSuccess('Appointment booked successfully!');
      onAppointmentBooked?.();
      
      // Reset form
      setSelectedDate('');
      setSelectedTime('');
      setSelectedType('');
      setSelectedDentist('');
    } catch (error) {
      console.error('Booking error:', error);
      setError(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const isTimeSlotAvailable = (slot) => {
    return availableSlots.includes(slot);
  };

  const isTimeSlotPast = (slot) => {
    const slotDateTime = moment(`${selectedDate} ${slot}`);
    return slotDateTime.isBefore(moment());
  };

  return (
    <div className="appointment-booking">
      <div className="booking-header">
        <h2>Book an Appointment</h2>
        {onClose && (
          <button className="close-btn" onClick={onClose}>&times;</button>
        )}
      </div>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="type">Appointment Type</label>
          <select
            id="type"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            required
          >
            <option value="">Select Type</option>
            {APPOINTMENT_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="dentist">Preferred Dentist</label>
          <select
            id="dentist"
            value={selectedDentist}
            onChange={(e) => setSelectedDentist(e.target.value)}
            required
          >
            <option value="">Select Dentist</option>
            {dentists.map(dentist => (
              <option key={dentist._id} value={dentist._id}>
                Dr. {dentist.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="date">Preferred Date</label>
          <input
            type="date"
            id="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={moment().format('YYYY-MM-DD')}
            required
          />
        </div>

        {selectedDate && selectedDentist && (
          <div className="time-slots">
            <label>Available Time Slots</label>
            <div className="slots-grid">
              {loading ? (
                <div className="loading">Checking availability...</div>
              ) : TIME_SLOTS.map(slot => {
                const isAvailable = isTimeSlotAvailable(slot);
                const isPast = isTimeSlotPast(slot);
                
                return (
                  <button
                    key={slot}
                    type="button"
                    className={`time-slot 
                      ${selectedTime === slot ? 'selected' : ''} 
                      ${!isAvailable ? 'unavailable' : ''} 
                      ${isPast ? 'past' : ''}`}
                    onClick={() => isAvailable && !isPast && setSelectedTime(slot)}
                    disabled={!isAvailable || isPast}
                  >
                    {slot}
                    {!isAvailable && <span className="status">Booked</span>}
                    {isPast && <span className="status">Past</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <button 
          type="submit" 
          className="btn primary"
          disabled={loading || !selectedDate || !selectedTime || !selectedType || !selectedDentist}
        >
          {loading ? 'Booking...' : 'Book Appointment'}
        </button>
      </form>
    </div>
  );
};

AppointmentBooking.propTypes = {
  onAppointmentBooked: PropTypes.func,
  onClose: PropTypes.func
};

export default AppointmentBooking; 