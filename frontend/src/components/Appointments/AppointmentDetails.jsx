import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAppointmentById, deleteAppointment } from '../../api';
import moment from 'moment';
import './AppointmentDetails.scss';
import AppointmentEditModal from './AppointmentEditModal';
import ConfirmDialog from '../common/ConfirmDialog';
import { AuthContext } from '../context/authContext';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';

const AppointmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const authorizedRoles = ['Admin', 'Dentist', 'Receptionist'];

  console.log('Current user role:', user?.role);
  console.log('Is Authorized?', authorizedRoles.includes(user?.role));

  useEffect(() => {
    fetchAppointmentDetails();
  }, [id]);

  const fetchAppointmentDetails = async () => {
    try {
      setLoading(true);
      const data = await getAppointmentById(id);
      setAppointment(data);
    } catch (err) {
      console.error('Error fetching appointment:', err);
      setError(err.message || 'Failed to fetch appointment details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAppointment(id);
      navigate('/appointments');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete appointment');
    }
  };

  const handleAppointmentUpdated = (updatedAppointment) => {
    setAppointment(updatedAppointment);
    setShowEditModal(false);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!appointment) return <div className="not-found">Appointment not found</div>;

  return (
    <div className="appointment-details">
      <div className="details-header">
        <h1>Appointment Details</h1>
        {authorizedRoles.includes(user?.role) && (
          <div className="header-actions">
            <button 
              className="btn primary"
              onClick={() => setShowEditModal(true)}
            >
              Edit
            </button>
            <button 
              className="btn danger"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="details-content">
        <div className="detail-section">
          <h2>Patient Information</h2>
          <div className="detail-row">
            <span className="label">Patient Name:</span>
            <span className="value">{appointment.patientName}</span>
          </div>
        </div>

        <div className="detail-section">
          <h2>Appointment Information</h2>
          <div className="detail-row">
            <span className="label">Date:</span>
            <span className="value">{moment(appointment.date).format('MMMM D, YYYY')}</span>
          </div>
          <div className="detail-row">
            <span className="label">Time:</span>
            <span className="value">{appointment.timeSlot}</span>
          </div>
          <div className="detail-row">
            <span className="label">Type:</span>
            <span className="value">{appointment.type}</span>
          </div>
          <div className="detail-row">
            <span className="label">Status:</span>
            <span className={`value status ${appointment.status.toLowerCase()}`}>
              {appointment.status}
            </span>
          </div>
          <div className="detail-row">
            <span className="label">Dentist:</span>
            <span className="value">
              {appointment.dentist?.name || 'Not assigned'}
            </span>
          </div>
        </div>

        {appointment.notes && (
          <div className="detail-section">
            <h2>Notes</h2>
            <p className="notes">{appointment.notes}</p>
          </div>
        )}
      </div>

      {showEditModal && (
        <AppointmentEditModal
          appointment={appointment}
          onClose={() => setShowEditModal(false)}
          onAppointmentUpdated={handleAppointmentUpdated}
          onDelete={() => {
            setShowEditModal(false);
            setShowDeleteConfirm(true);
          }}
        />
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Appointment"
        message="Are you sure you want to delete this appointment?"
      />
    </div>
  );
};

export default AppointmentDetails; 