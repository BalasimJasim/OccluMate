import React, { useState, useEffect } from 'react';
import { addAppointment, getAllAppointments, updateAppointmentStatus, deleteAppointment } from '../../api';

const AppointmentScheduling = () => {
  const [appointments, setAppointments] = useState([]);
  const [currentAppointment, setCurrentAppointment] = useState({ patientId: '', date: '', time: '', status: 'Scheduled' });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await getAllAppointments();
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addAppointment(currentAppointment);
      fetchAppointments();
      setCurrentAppointment({ patientId: '', date: '', time: '', status: 'Scheduled' });
    } catch (error) {
      console.error('Error saving appointment:', error);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateAppointmentStatus(id, status);
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment status:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAppointment(id);
      fetchAppointments();
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };

  return (
    <div>
      <h2>Appointment Scheduling</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Patient ID"
          value={currentAppointment.patientId}
          onChange={(e) => setCurrentAppointment({ ...currentAppointment, patientId: e.target.value })}
        />
        <input
          type="date"
          value={currentAppointment.date}
          onChange={(e) => setCurrentAppointment({ ...currentAppointment, date: e.target.value })}
        />
        <input
          type="time"
          value={currentAppointment.time}
          onChange={(e) => setCurrentAppointment({ ...currentAppointment, time: e.target.value })}
        />
        <button type="submit">Schedule Appointment</button>
      </form>
      <ul>
        {appointments.map((appointment) => (
          <li key={appointment._id}>
            {appointment.patientId} - {appointment.date} {appointment.time} - {appointment.status}
            <button onClick={() => handleStatusUpdate(appointment._id, 'Completed')}>Mark Completed</button>
            <button onClick={() => handleStatusUpdate(appointment._id, 'Cancelled')}>Cancel</button>
            <button onClick={() => handleDelete(appointment._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AppointmentScheduling;
