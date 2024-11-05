import { useState, useEffect } from 'react';
import { getTodayAppointments, getTodaysTasks, updateTask } from '../api';
import moment from 'moment';

const useDashboardData = (userRole) => {
  const [data, setData] = useState({
    appointments: [],
    tasks: [],
    loading: true,
    error: null
  });

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching dashboard data...');

      const [appointmentsRes, tasksRes] = await Promise.all([
        getTodayAppointments(),
        userRole !== 'Patient' ? getTodaysTasks() : Promise.resolve({ data: [] })
      ]);

      console.log('Appointments response:', appointmentsRes);

      const sortedAppointments = [...appointmentsRes].sort((a, b) => {
        const timeA = moment(a.timeSlot, 'HH:mm');
        const timeB = moment(b.timeSlot, 'HH:mm');
        return timeA.diff(timeB);
      });

      console.log('Sorted appointments:', sortedAppointments);

      setData({
        appointments: sortedAppointments,
        tasks: tasksRes.data || [],
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error in fetchDashboardData:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: error.userMessage || 'Failed to load dashboard data'
      }));
    }
  };

  const markTaskComplete = async (taskId) => {
    try {
      await updateTask(taskId, { status: 'completed' });
      fetchDashboardData();
    } catch (error) {
      console.error('Error marking task complete:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    const refreshInterval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, [userRole]);

  return {
    ...data,
    refreshData: fetchDashboardData,
    markTaskComplete
  };
};

export default useDashboardData; 