import React, { useState, useCallback, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/context/authContext';
import useDashboardData from '../hooks/useDashboardData';
import { FaCalendarAlt, FaTasks, FaUserPlus, FaCalendarPlus, FaTooth, FaPrescription } from 'react-icons/fa';
import AppointmentForm from '../components/Appointments/AppointmentForm';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import '../styles/pages/_home.scss';

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  
  const { 
    appointments, 
    tasks, 
    loading, 
    error,
    markTaskComplete 
  } = useDashboardData(user?.role);

  // Memoized handlers
  const handleAddNewPatient = useCallback(() => {
    navigate('/patients', { state: { showAddForm: true } });
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
    <div className="home-container">
      <h1>Welcome, {user?.name}</h1>
      
      <div className="dashboard-grid">
        <section className="upcoming-appointments">
          <h2>
            <FaCalendarAlt />
            Today's Appointments
          </h2>
          {appointments.length > 0 ? (
            <ul>
              {appointments.map((appointment) => (
                <li key={appointment._id}>
                  <p>{appointment.patientName} - {appointment.timeSlot}</p>
                  <Link 
                    to={`/appointments/${appointment._id}`}
                    className="btn-link"
                  >
                    View Details
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-appointments">No appointments scheduled for today</p>
          )}
          <Link to="/appointments" className="btn-primary">
            <FaCalendarAlt /> View Calendar
          </Link>
        </section>

        {user?.role !== 'Patient' && (
          <section className="todays-tasks">
            <h2>
              <FaTasks />
              Today's Tasks
            </h2>
            {tasks.length > 0 ? (
              <ul>
                {tasks.map((task) => (
                  <li key={task._id}>
                    <p>{task.description}</p>
                    <button 
                      onClick={() => markTaskComplete(task._id)}
                      className="btn-action"
                    >
                      Mark Complete
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-tasks">No tasks for today</p>
            )}
            <Link to="/tasks" className="btn-primary">
              <FaTasks /> Manage Tasks
            </Link>
          </section>
        )}
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="button-group">
          {user?.role !== 'Patient' && (
            <>
              <button onClick={handleAddNewPatient} className="btn btn-secondary">
                <FaUserPlus /> Add New Patient
              </button>
              <button onClick={handleNewAppointment} className="btn btn-secondary">
                <FaCalendarPlus /> Schedule Appointment
              </button>
              <Link to="/dental-charts" className="btn btn-secondary">
                <FaTooth /> Dental Charts
              </Link>
              <Link to="/prescriptions/new" className="btn btn-secondary">
                <FaPrescription /> Write Prescription
              </Link>
            </>
          )}
        </div>
      </div>

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
