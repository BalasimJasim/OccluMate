import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AppointmentCalendar from '../components/AppointmentCalendar';
import AppointmentForm from '../components/Appointments/AppointmentForm';
import { getAllAppointments } from '../api';
import './Appointments.scss';
import AppointmentList from '../components/Appointments/AppointmentList';
import moment from 'moment';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [view, setView] = useState('calendar');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();
  const [selectedSlot, setSelectedSlot] = useState(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await getAllAppointments();
      console.log('Raw appointments response:', response); // Debug log
      
      // Set appointments directly from response since it's already an array
      setAppointments(response || []);
      
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleAppointmentAdded = (newAppointment) => {
    setAppointments(prev => [...prev, newAppointment]);
    setShowForm(false);
  };

  const handleAppointmentUpdated = (updatedAppointment) => {
    setAppointments(prev => 
      prev.map(apt => 
        apt._id === updatedAppointment._id ? updatedAppointment : apt
      )
    );
  };

  const handleAppointmentDeleted = (appointmentId) => {
    setAppointments(prev => 
      prev.filter(apt => apt._id !== appointmentId)
    );
  };

  const handleTimeSlotSelect = (slotInfo) => {
    setSelectedSlot(slotInfo);
    setShowForm(true); // Open the appointment form when a slot is selected
  };

  if (loading) return <div>Loading appointments...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="appointments-page">
      <div className="appointments-header">
        <h1>Appointments</h1>
        <div className="view-controls">
          <button 
            className={`btn ${view === 'calendar' ? 'active' : ''}`}
            onClick={() => setView('calendar')}
          >
            Calendar View
          </button>
          <button 
            className={`btn ${view === 'list' ? 'active' : ''}`}
            onClick={() => setView('list')}
          >
            List View
          </button>
          <button 
            className="btn primary"
            onClick={() => setShowForm(true)}
          >
            Add Appointment
          </button>
        </div>
      </div>

      {showForm && (
        <AppointmentForm
          onClose={() => {
            setShowForm(false);
            setSelectedSlot(null);
          }}
          onAppointmentAdded={handleAppointmentAdded}
          initialDate={selectedSlot?.start ? moment(selectedSlot.start).format('YYYY-MM-DD') : ''}
          initialTime={selectedSlot?.timeSlot || ''}
        />
      )}

      {view === 'calendar' ? (
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
  );
};

export default Appointments;
