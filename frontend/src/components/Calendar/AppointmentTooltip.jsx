import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import './AppointmentTooltip.scss';

const AppointmentTooltip = ({ event }) => {
  return (
    <div className="appointment-tooltip">
      <div className="tooltip-content">
        <div className="tooltip-header">
          <span className="patient-name">{event.patientName}</span>
          <span className="time">
            {moment(event.start).format('HH:mm')} - {moment(event.end).format('HH:mm')}
          </span>
        </div>
        <div className="tooltip-details">
          <div className="detail-row">
            <span className="label">Dentist:</span>
            <span className="value">{event.dentistName || 'Not assigned'}</span>
          </div>
          <div className="detail-row">
            <span className="label">Type:</span>
            <span className="value">{event.type}</span>
          </div>
          <div className="detail-row">
            <span className="label">Cabinet:</span>
            <span className="value">{event.cabinet}</span>
          </div>
          <div className="detail-row">
            <span className="label">Status:</span>
            <span className={`value status-${event.status?.toLowerCase()}`}>
              {event.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

AppointmentTooltip.propTypes = {
  event: PropTypes.shape({
    patientName: PropTypes.string.isRequired,
    dentistName: PropTypes.string,
    type: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    cabinet: PropTypes.string,
    start: PropTypes.instanceOf(Date).isRequired,
    end: PropTypes.instanceOf(Date).isRequired,
  }).isRequired,
};

export default AppointmentTooltip; 