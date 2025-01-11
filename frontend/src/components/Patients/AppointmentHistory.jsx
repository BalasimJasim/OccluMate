import { useEffect, useState } from 'react';
import api from '../../api';
import PropTypes from "prop-types";

const AppointmentHistory = ({ patientId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const response = await api.get(`/appointments/history/${patientId}`);
      setHistory(response.data);
    } catch (error) {
      console.error("Error fetching appointment history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [patientId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">
          Loading appointment history...
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Appointment History
      </h2>
      {history.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No appointment history found.
        </p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {history.map((appointment) => (
            <li key={appointment._id} className="py-4 space-y-2">
              <div className="flex justify-between items-start">
                <div className="text-sm font-medium text-gray-900">
                  {appointment.date} at {appointment.time}
                </div>
              </div>
              {appointment.notes && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Notes:</span>{" "}
                  {appointment.notes}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

AppointmentHistory.propTypes = {
  patientId: PropTypes.string.isRequired,
};

export default AppointmentHistory;
