import React, { useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import './AppointmentList.scss';
import AppointmentEditModal from './AppointmentEditModal';
import ConfirmDialog from '../common/ConfirmDialog';
import { deleteAppointment } from '../../api';

const AppointmentList = ({ 
  appointments = [], 
  onAppointmentUpdated, 
  onAppointmentDeleted 
}) => {
  const [editModal, setEditModal] = useState({ show: false, appointment: null });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, appointment: null });
  const [error, setError] = useState('');

  const handleDelete = async () => {
    try {
      await deleteAppointment(deleteConfirm.appointment._id);
      onAppointmentDeleted(deleteConfirm.appointment._id);
      setDeleteConfirm({ show: false, appointment: null });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete appointment');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleEdit = (appointment) => {
    setEditModal({ show: true, appointment });
  };

  const handleAppointmentUpdate = (updatedAppointment) => {
    onAppointmentUpdated(updatedAppointment);
    setEditModal({ show: false, appointment: null });
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-scheduled';
    }
  };

  return (
    <div className="appointments-list">
      {error && <div className="error-message">{error}</div>}
      
      <div className="list-header">
        <div className="header-date">Date & Time</div>
        <div className="header-patient">Patient</div>
        <div className="header-type">Type</div>
        <div className="header-status">Status</div>
        <div className="header-actions">Actions</div>
      </div>

      {appointments.length === 0 ? (
        <div className="no-appointments">
          <p>No appointments found</p>
        </div>
      ) : (
        appointments.map(appointment => (
          <div key={appointment._id} className="appointment-item">
            <div className="appointment-date">
              <div className="date">
                {moment(appointment.date).format('MMM DD, YYYY')}
              </div>
              <div className="time">{appointment.timeSlot}</div>
            </div>
            
            <div className="appointment-patient">
              {appointment.patientName}
            </div>
            
            <div className="appointment-type">
              {appointment.type}
            </div>
            
            <div className={`appointment-status ${getStatusClass(appointment.status)}`}>
              {appointment.status}
            </div>
            
            <div className="appointment-actions">
              <button 
                className="btn edit"
                onClick={() => handleEdit(appointment)}
              >
                Edit
              </button>
              <button 
                className="btn delete"
                onClick={() => setDeleteConfirm({ show: true, appointment })}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}

      {editModal.show && (
        <AppointmentEditModal
          appointment={editModal.appointment}
          onClose={() => setEditModal({ show: false, appointment: null })}
          onAppointmentUpdated={handleAppointmentUpdate}
          onDelete={() => {
            setEditModal({ show: false, appointment: null });
            setDeleteConfirm({ show: true, appointment: editModal.appointment });
          }}
        />
      )}

      <ConfirmDialog
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, appointment: null })}
        onConfirm={handleDelete}
        title="Delete Appointment"
        message={`Are you sure you want to delete the appointment for ${deleteConfirm.appointment?.patientName}? This action cannot be undone.`}
        type="danger"
      />
    </div>
  );
};

AppointmentList.propTypes = {
  appointments: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    patientName: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    timeSlot: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired
  })).isRequired,
  onAppointmentUpdated: PropTypes.func.isRequired,
  onAppointmentDeleted: PropTypes.func.isRequired
};

export default AppointmentList; 