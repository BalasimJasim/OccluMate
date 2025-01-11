import { useState, useEffect } from "react";
import {
  getAppointmentStats,
  getTreatmentStats,
  getTaskStats,
} from "../../api";
import { FaCalendarCheck, FaTooth, FaTasks } from "react-icons/fa";

const Analytics = () => {
  const [appointmentStats, setAppointmentStats] = useState({});
  const [treatmentStats, setTreatmentStats] = useState({});
  const [taskStats, setTaskStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const appointmentResponse = await getAppointmentStats();
      setAppointmentStats(appointmentResponse.data);

      const treatmentResponse = await getTreatmentStats();
      setTreatmentStats(treatmentResponse.data);

      const taskResponse = await getTaskStats();
      setTaskStats(taskResponse.data);
      setError("");
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 p-4 rounded-md">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">
        Analytics Dashboard
      </h2>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Appointment Statistics */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaCalendarCheck className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Appointments
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {appointmentStats.total || 0}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <div className="font-medium text-blue-700">
                {appointmentStats.completed || 0} completed
              </div>
              <div className="text-gray-500">
                {appointmentStats.upcoming || 0} upcoming
              </div>
            </div>
          </div>
        </div>

        {/* Treatment Statistics */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaTooth className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Treatments
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {treatmentStats.total || 0}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <div className="font-medium text-green-700">
                {treatmentStats.completed || 0} completed
              </div>
              <div className="text-gray-500">
                {treatmentStats.inProgress || 0} in progress
              </div>
            </div>
          </div>
        </div>

        {/* Task Statistics */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaTasks className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Tasks
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {taskStats.total || 0}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <div className="font-medium text-purple-700">
                {taskStats.completed || 0} completed
              </div>
              <div className="text-gray-500">
                {taskStats.pending || 0} pending
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
