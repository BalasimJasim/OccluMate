import { useState, useEffect } from 'react';
import { FaCalendarPlus, FaPrescription, FaFileUpload, FaCog } from 'react-icons/fa';
import { 
  getPatientAppointments, 
  getPatientPrescriptions,
  bookAppointment,
  updateAppointmentStatus
} from '../../api';
import AppointmentBooking from './AppointmentBooking';
import DocumentManager from './DocumentManager';
import PortalSettings from './PortalSettings';
import './PortalDashboard.scss';

const PortalDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching dashboard data...');
      const [appointmentsRes, prescriptionsRes] = await Promise.all([
        getPatientAppointments(),
        getPatientPrescriptions()
      ]);

      console.log('Appointments response:', appointmentsRes);
      console.log('Prescriptions response:', prescriptionsRes);

      setAppointments(appointmentsRes.data || []);
      setPrescriptions(prescriptionsRes.data || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      const errorMessage = err.response?.data?.message || 'Failed to load dashboard data';
      setError(errorMessage);
      setAppointments([]);
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentBooked = async (appointmentData) => {
    try {
      await bookAppointment(appointmentData);
      await fetchDashboardData();
      setShowBookingForm(false);
    } catch (error) {
      console.error('Booking error:', error);
      setError('Failed to book appointment');
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      await updateAppointmentStatus(appointmentId, 'cancelled');
      await fetchDashboardData();
    } catch (error) {
      console.error('Cancellation error:', error);
      setError('Failed to cancel appointment');
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="portal-dashboard">
      <div className="portal-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'appointments' ? 'active' : ''}`}
          onClick={() => setActiveTab('appointments')}
        >
          Appointments
        </button>
        <button 
          className={`tab ${activeTab === 'prescriptions' ? 'active' : ''}`}
          onClick={() => setActiveTab('prescriptions')}
        >
          Prescriptions
        </button>
        <button 
          className={`tab ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          Documents
        </button>
        <button 
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="welcome-card">
              <h2>Welcome to Your Patient Portal</h2>
              <p>Manage your dental care all in one place</p>
            </div>

            <div className="quick-actions">
              <button 
                className="action-btn"
                onClick={() => setActiveTab('appointments')}
              >
                <FaCalendarPlus />
                <span>Book Appointment</span>
              </button>
              <button 
                className="action-btn"
                onClick={() => setActiveTab('prescriptions')}
              >
                <FaPrescription />
                <span>View Prescriptions</span>
              </button>
              <button 
                className="action-btn"
                onClick={() => setActiveTab('documents')}
              >
                <FaFileUpload />
                <span>Upload Documents</span>
              </button>
              <button 
                className="action-btn"
                onClick={() => setActiveTab('settings')}
              >
                <FaCog />
                <span>Settings</span>
              </button>
            </div>

            <div className="upcoming-appointments">
              <h3>Upcoming Appointments</h3>
              {appointments.length > 0 ? (
                <div className="appointments-list">
                  {appointments.map(appointment => (
                    <div key={appointment._id} className="appointment-item">
                      <div className="appointment-info">
                        <span className="date">
                          {new Date(appointment.date).toLocaleDateString()}
                        </span>
                        <span className="time">{appointment.timeSlot}</span>
                        <span className="type">{appointment.type}</span>
                      </div>
                      <button 
                        className="cancel-btn"
                        onClick={() => handleCancelAppointment(appointment._id)}
                      >
                        Cancel
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-appointments">No upcoming appointments</p>
              )}
              <button 
                className="book-appointment-btn"
                onClick={() => setShowBookingForm(true)}
              >
                Book New Appointment
              </button>
            </div>

            {showBookingForm && (
              <div className="booking-modal">
                <AppointmentBooking 
                  onAppointmentBooked={handleAppointmentBooked}
                  onClose={() => setShowBookingForm(false)}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'appointments' && (
          <AppointmentBooking 
            onAppointmentBooked={handleAppointmentBooked}
          />
        )}

        {activeTab === 'prescriptions' && (
          <div className="prescriptions-section">
            <h3>Your Prescriptions</h3>
            <div className="prescriptions-list">
              {prescriptions.map(prescription => (
                <div key={prescription._id} className="prescription-item">
                  <div className="prescription-info">
                    <h4>{prescription.medication}</h4>
                    <p>{prescription.dosage}</p>
                    <p>{prescription.instructions}</p>
                    <span className="date">
                      Prescribed: {new Date(prescription.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <button className="refill-btn">Request Refill</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <DocumentManager />
        )}

        {activeTab === 'settings' && (
          <PortalSettings />
        )}
      </div>
    </div>
  );
};

export default PortalDashboard; 