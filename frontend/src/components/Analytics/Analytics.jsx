import React, { useState, useEffect } from 'react';
import { getAppointmentStats, getTreatmentStats, getTaskStats } from '../../api';

const Analytics = () => {
  const [appointmentStats, setAppointmentStats] = useState({});
  const [treatmentStats, setTreatmentStats] = useState({});
  const [taskStats, setTaskStats] = useState({});

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const appointmentResponse = await getAppointmentStats();
      setAppointmentStats(appointmentResponse.data);

      const treatmentResponse = await getTreatmentStats();
      setTreatmentStats(treatmentResponse.data);

      const taskResponse = await getTaskStats();
      setTaskStats(taskResponse.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  return (
    <div>
      <h2>Analytics Dashboard</h2>
      <div>
        <h3>Appointment Statistics</h3>
        {/* Display appointment stats here */}
      </div>
      <div>
        <h3>Treatment Statistics</h3>
        {/* Display treatment stats here */}
      </div>
      <div>
        <h3>Task Statistics</h3>
        {/* Display task stats here */}
      </div>
    </div>
  );
};

export default Analytics;
