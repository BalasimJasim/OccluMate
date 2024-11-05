import React, { useMemo, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './AppointmentCalendar.scss';
import AppointmentTooltip from './Calendar/AppointmentTooltip';
import AppointmentEditModal from './Appointments/AppointmentEditModal';

// Helper function to get event colors based on status
const getEventColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return '#4CAF50';
    case 'cancelled':
      return '#F44336';
    case 'scheduled':
      return '#2196F3';
    default:
      return '#9E9E9E';
  }
};

const eventStyleGetter = (event) => {
  const statusClass = `appointment-${event.status?.toLowerCase() || 'scheduled'}`;
  const cabinetClass = `cabinet-${event.cabinet?.replace(/\s+/g, '-').toLowerCase() || 'default'}`;
  
  return {
    className: `${statusClass} ${cabinetClass}`.trim()
  };
};

const AppointmentCalendar = ({
  appointments = [],
  onTimeSlotSelect,
  onAppointmentUpdated,
  onAppointmentDeleted
}) => {
  const [tooltipEvent, setTooltipEvent] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Convert appointments to calendar events using proper time handling
  const calendarEvents = useMemo(() => {
    return appointments.map(appointment => {
      // Parse the date and time properly
      const dateStr = moment(appointment.date).format('YYYY-MM-DD');
      const [hours, minutes] = appointment.timeSlot.split(':');
      
      // Create exact start and end times
      const start = moment(`${dateStr} ${appointment.timeSlot}`, 'YYYY-MM-DD HH:mm')
        .toDate();
      const end = moment(`${dateStr} ${appointment.timeSlot}`, 'YYYY-MM-DD HH:mm')
        .add(30, 'minutes')
        .toDate();

      return {
        id: appointment._id,
        title: appointment.patientName,
        start,
        end,
        patientName: appointment.patientName,
        dentistName: appointment.dentistName,
        type: appointment.type,
        status: appointment.status,
        cabinet: appointment.cabinet,
        resource: appointment.cabinet // For resource-based views
      };
    });
  }, [appointments]);

  const handleSelectSlot = ({ start }) => {
    const timeSlot = moment(start).format('HH:mm');
    onTimeSlotSelect({
      start,
      timeSlot
    });
  };

  const handleEventMouseEnter = (event, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY
    });
    setTooltipEvent(event);
  };

  const handleEventMouseLeave = () => {
    setTooltipEvent(null);
  };

  const handleSelectEvent = (event) => {
    // Find the full appointment data
    const appointment = appointments.find(apt => apt._id === event.id);
    if (appointment) {
      setSelectedAppointment(appointment);
    }
  };

  const EventComponent = ({ event }) => {
    const [isHovering, setIsHovering] = useState(false);
    const eventRef = useRef(null);

    const handleMouseEnter = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY
      });
      setIsHovering(true);
      setTooltipEvent(event);
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
      setTooltipEvent(null);
    };

    return (
      <div
        ref={eventRef}
        className="rbc-event-content"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={(e) => {
          e.stopPropagation();
          handleSelectEvent(event);
        }}
      >
        <span className="event-title">{event.title}</span>
      </div>
    );
  };

  const CabinetLegend = () => (
    <div className="cabinet-legend">
      <h4>Cabinets</h4>
      <div className="legend-items">
        {['Cabinet-1', 'Cabinet-2', 'Cabinet-3', 'Cabinet-4'].map(cabinet => (
          <div key={cabinet} className="legend-item">
            <span className={`color-box cabinet-${cabinet.toLowerCase()}`} />
            <span className="label">{cabinet}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="appointment-calendar-container">
      <CabinetLegend />
      <Calendar
        localizer={momentLocalizer(moment)}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        step={30}
        timeslots={1}
        defaultView="week"
        views={['month', 'week', 'day']}
        min={moment().set('hours', 8).set('minutes', 0).toDate()}
        max={moment().set('hours', 21).set('minutes', 30).toDate()}
        scrollToTime={moment().set('hours', 8).set('minutes', 0).toDate()}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        selectable={true}
        eventPropGetter={eventStyleGetter}
        components={{
          event: EventComponent
        }}
        formats={{
          timeGutterFormat: 'HH:mm',
          eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
            `${localizer.format(start, 'HH:mm', culture)} - ${localizer.format(end, 'HH:mm', culture)}`
        }}
        dayLayoutAlgorithm="no-overlap"
        tooltipAccessor={null}
      />
      
      {tooltipEvent && (
        <div 
          className={`appointment-tooltip-wrapper ${tooltipEvent ? 'visible' : ''}`}
          style={{
            position: 'absolute',
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y - 10}px`
          }}
        >
          <AppointmentTooltip event={tooltipEvent} />
        </div>
      )}

      {selectedAppointment && (
        <AppointmentEditModal
          appointment={selectedAppointment}
          onClose={() => {
            setSelectedAppointment(null);
            setTooltipEvent(null);
          }}
          onAppointmentUpdated={(updatedAppointment) => {
            onAppointmentUpdated(updatedAppointment);
            setSelectedAppointment(null);
            setTooltipEvent(null);
          }}
          onDelete={() => {
            onAppointmentDeleted(selectedAppointment._id);
            setSelectedAppointment(null);
            setTooltipEvent(null);
          }}
        />
      )}
    </div>
  );
};

AppointmentCalendar.propTypes = {
  appointments: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      patientName: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      timeSlot: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      dentistName: PropTypes.string,
      cabinet: PropTypes.string
    })
  ).isRequired,
  onTimeSlotSelect: PropTypes.func.isRequired,
  onAppointmentUpdated: PropTypes.func.isRequired,
  onAppointmentDeleted: PropTypes.func.isRequired
};

export default AppointmentCalendar;
