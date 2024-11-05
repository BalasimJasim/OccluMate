import { useEffect } from 'react';
import api from '../../api';

const Reminder = () => {
  const sendReminder = async (appointmentId) => {
    try {
      await api.post(`/appointments/${appointmentId}/remind`);
      alert('Reminder sent!');
    } catch (err) {
      alert('Failed to send reminder');
    }
  };

  useEffect(() => {
    // Logic to send reminders, e.g., checking for appointments that need reminders
  }, []);

  return (
    <div>
      <h2>Send Appointment Reminders</h2>
      {/* Add UI to send reminders based on appointments */}
    </div>
  );
};

export default Reminder;
