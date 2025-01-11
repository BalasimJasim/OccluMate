import { useState, useCallback, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../components/context/authContext";
import useDashboardData from "../hooks/useDashboardData";
import {
  FaCalendarAlt,
  FaTasks,
  FaUserPlus,
  FaCalendarPlus,
  FaTooth,
  FaPrescription,
} from "react-icons/fa";
import AppointmentForm from "../components/Appointments/AppointmentForm";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { ErrorMessage } from "../components/common/ErrorMessage";
import api from "../api";

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [tasks, setTasks] = useState([]);

  const { appointments, loading, error, markTaskComplete } = useDashboardData(
    user?.role
  );

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.get("/tasks/today");
        setTasks(response.data || []);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setTasks([]);
      }
    };

    fetchTasks();
  }, []);

  const handleAddNewPatient = useCallback(() => {
    navigate("/patients", { state: { showAddForm: true } });
  }, [navigate]);

  const handleNewAppointment = useCallback(() => {
    setShowAppointmentForm(true);
  }, []);

  const handleAppointmentAdded = useCallback(() => {
    setShowAppointmentForm(false);
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">
        Welcome, {user?.name}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <FaCalendarAlt className="text-blue-600" />
            Today&apos;s Appointments
          </h2>
          {appointments.length > 0 ? (
            <ul className="space-y-4">
              {appointments.map((appointment) => (
                <li
                  key={appointment._id}
                  className="flex items-center justify-between border-b border-gray-200 pb-4 last:border-0"
                >
                  <p className="text-gray-700">
                    {appointment.patientName} - {appointment.timeSlot}
                  </p>
                  <Link
                    to={`/appointments/${appointment._id}`}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View Details
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No appointments scheduled for today
            </p>
          )}
          <Link
            to="/appointments"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaCalendarAlt className="mr-2" /> View Calendar
          </Link>
        </section>

        {user?.role !== "Patient" && (
          <section className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <FaTasks className="text-blue-600" />
              Today&apos;s Tasks
            </h2>
            {Array.isArray(tasks) && tasks.length > 0 ? (
              <ul className="space-y-4">
                {tasks.map((task) => (
                  <li
                    key={task._id}
                    className="flex items-center justify-between border-b border-gray-200 pb-4 last:border-0"
                  >
                    <p className="text-gray-700">{task.description}</p>
                    <button
                      onClick={() => markTaskComplete(task._id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Mark Complete
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No tasks for today
              </p>
            )}
            <Link
              to="/tasks"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaTasks className="mr-2" /> Manage Tasks
            </Link>
          </section>
        )}
      </div>

      {user?.role !== "Patient" && (
        <section className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={handleAddNewPatient}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaUserPlus className="mr-2" /> Add New Patient
            </button>
            <button
              onClick={handleNewAppointment}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaCalendarPlus className="mr-2" /> Schedule Appointment
            </button>
            <Link
              to="/dental-charts"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaTooth className="mr-2" /> Dental Charts
            </Link>
            <Link
              to="/prescriptions/new"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaPrescription className="mr-2" /> Write Prescription
            </Link>
          </div>
        </section>
      )}

      {showAppointmentForm && (
        <AppointmentForm
          onClose={() => setShowAppointmentForm(false)}
          onAppointmentAdded={handleAppointmentAdded}
        />
      )}
    </div>
  );
};

export default Home;
