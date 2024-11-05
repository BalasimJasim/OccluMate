import { useEffect, useState } from 'react';
import api from '../../api';

const AppointmentHistory = ({ patientId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const response = await api.get(`/appointments/history/${patientId}`);
      setHistory(response.data);
    } catch (err) {
      console.error('Error fetching appointment history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [patientId]);

  if (loading) return <div>Loading appointment history...</div>;

  return (
    <div>
      <h2>Appointment History</h2>
      {history.length === 0 ? <p>No appointment history found.</p> : (
        <ul>
          {history.map((appointment) => (
            <li key={appointment._id}>
              <div>{appointment.date} at {appointment.time}</div>
              <div>Notes: {appointment.notes}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AppointmentHistory;
