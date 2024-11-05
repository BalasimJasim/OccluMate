import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getAllPatients, getAllDentists, checkDentistAvailability, addAppointment } from '../../api';
import './AppointmentForm.scss';
import moment from 'moment';
import PatientFormModal from './PatientFormModal';

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00'
];

const CABINETS = ['Cabinet-1', 'Cabinet-2', 'Cabinet-3', 'Cabinet-4'];

const APPOINTMENT_TYPES = [
  { value: 'checkup', label: 'Check-up' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'filling', label: 'Filling' },
  { value: 'extraction', label: 'Extraction' },
  { value: 'root-canal', label: 'Root Canal' },
  { value: 'consultation', label: 'Consultation' },
  { value: 'other', label: 'Other' }
];

const AppointmentForm = ({ 
  onClose = () => {}, 
  onAppointmentAdded = () => {}, 
  initialDate = '', 
  initialTime = '' 
}) => {
  const [formData, setFormData] = useState({
    patientId: '',
    dentistId: '',
    cabinet: 'Cabinet-1',
    date: initialDate ? moment(initialDate).format('YYYY-MM-DD') : '',
    timeSlot: initialTime || '',
    type: 'checkup',
    notes: ''
  });

  const [patients, setPatients] = useState([]);
  const [dentists, setDentists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [availableCabinets, setAvailableCabinets] = useState(CABINETS);
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

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
      console.error('Error fetching patients:', error);
      setError('Failed to fetch patients');
    }
  };

  const fetchDentists = async () => {
    try {
      const response = await getAllDentists();
      setDentists(response.data);
    } catch (err) {
      console.error('Error fetching dentists:', err);
      setError('Failed to fetch dentists');
    }
  };

  const checkAvailability = async (dentistId, date, timeSlot) => {
    try {
      const patientId = formData.patientId || null;
      const cabinet = formData.cabinet || null;
      
      console.log('Checking availability with params:', { dentistId, date, timeSlot, patientId, cabinet });
      const response = await checkDentistAvailability({ 
        dentistId, 
        date, 
        timeSlot,
        patientId,
        cabinet
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
      console.error('Error checking availability:', error);
      setError('Error checking availability');
      return false;
    }
  };

  const handleTimeSlotSelect = async (slot) => {
    setSelectedTimeSlot(slot);
    setFormData(prev => ({ ...prev, timeSlot: slot, cabinet: '' }));
    
    if (formData.dentistId) {
      try {
        const response = await checkDentistAvailability({
          dentistId: formData.dentistId,
          date: formData.date,
          timeSlot: slot
        });
        setAvailableCabinets(response.data.availableCabinets || []);
      } catch (err) {
        console.error('Error checking cabinet availability:', err);
        setError('Failed to check cabinet availability');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.patientId || !formData.dentistId || !formData.date || !formData.timeSlot) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      console.log('Submitting appointment data:', formData);
      const response = await addAppointment(formData);
      console.log('Raw appointment response:', response);

      if (response.data) {
        const newAppointment = {
          ...response.data,
          start: new Date(`${formData.date}T${formData.timeSlot}`),
          end: new Date(`${formData.date}T${formData.timeSlot}`),
          title: `${response.data.patientName} - ${response.data.type}`
        };
        console.log('Formatted appointment for calendar:', newAppointment);
        onAppointmentAdded(newAppointment);
        onClose();
      }
    } catch (error) {
      console.error('Error adding appointment:', error);
      if (error.response?.status === 409) {
        setError(error.response.data.message);
      } else {
        setError(error.response?.data?.message || 'Error creating appointment');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="appointment-form-overlay">
      <div className="appointment-form">
        <div className="form-header">
          <h2>Schedule New Appointment</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="patientId">Patient</label>
            <select
              id="patientId"
              name="patientId"
              value={formData.patientId}
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'new') {
                  setShowPatientForm(true);
                } else {
                  setFormData(prev => ({ ...prev, patientId: value }));
                }
              }}
              required
            >
              <option value="">Select Patient</option>
              <option value="new">➕ Add New Patient</option>
              {patients.map(patient => (
                <option key={patient._id} value={patient._id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="dentistId">Dentist</label>
            <select
              id="dentistId"
              name="dentistId"
              value={formData.dentistId}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                dentistId: e.target.value,
                cabinet: '' // Clear cabinet when dentist changes
              }))}
              required
            >
              <option value="">Select Dentist</option>
              {dentists.map(dentist => (
                <option key={dentist._id} value={dentist._id}>
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
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                date: e.target.value,
                timeSlot: '', // Clear time slot when date changes
                cabinet: '' // Clear cabinet when date changes
              }))}
              min={moment().format('YYYY-MM-DD')}
              required
            />
          </div>

          {formData.date && formData.dentistId && (
            <div className="form-group">
              <label>Available Time Slots</label>
              <div className="time-slots-grid">
                {TIME_SLOTS.map(slot => {
                  const isAvailable = availableSlots.includes(slot);
                  const isSelected = formData.timeSlot === slot;
                  const isPast = moment(`${formData.date} ${slot}`).isBefore(moment());

                  return (
                    <button
                      key={slot}
                      type="button"
                      className={`time-slot 
                        ${isAvailable ? 'available' : 'unavailable'} 
                        ${isSelected ? 'selected' : ''} 
                        ${isPast ? 'past' : ''}`}
                      onClick={() => {
                        if (isAvailable && !isPast) {
                          handleTimeSlotSelect(slot);
                          console.log('Selected time slot:', slot);
                        }
                      }}
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

          {formData.timeSlot && (
            <div className="form-group">
              <label htmlFor="cabinet">Cabinet</label>
              <select
                id="cabinet"
                name="cabinet"
                value={formData.cabinet}
                onChange={(e) => setFormData(prev => ({ ...prev, cabinet: e.target.value }))}
                required
                className="form-control"
              >
                <option value="">Select Cabinet</option>
                {availableCabinets.map(cabinet => (
                  <option 
                    key={cabinet} 
                    value={cabinet}
                  >
                    {cabinet}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="type">Appointment Type</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              required
            >
              {APPOINTMENT_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              placeholder="Add any additional notes..."
            />
          </div>

          <div className="form-actions">
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
              disabled={loading || !formData.dentistId || !formData.cabinet}
            >
              {loading ? 'Scheduling...' : 'Schedule Appointment'}
            </button>
          </div>
        </form>

        {showPatientForm && (
          <PatientFormModal
            onClose={() => setShowPatientForm(false)}
            onPatientAdded={(newPatient) => {
              setFormData(prev => ({ ...prev, patientId: newPatient._id }));
              setShowPatientForm(false);
              fetchPatients();
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
  initialDate: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date)
  ]),
  initialTime: PropTypes.string
};

export default AppointmentForm;
