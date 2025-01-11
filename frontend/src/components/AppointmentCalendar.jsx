import { useMemo, useState, useRef } from "react";
import PropTypes from "prop-types";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import AppointmentTooltip from "./Calendar/AppointmentTooltip";
import AppointmentEditModal from "./Appointments/AppointmentEditModal";

const eventStyleGetter = (event) => {
  const statusClass = `appointment-${
    event.status?.toLowerCase() || "scheduled"
  }`;
  const cabinetClass = `cabinet-${
    event.cabinet?.replace(/\s+/g, "-").toLowerCase() || "default"
  }`;

  return {
    className: `${statusClass} ${cabinetClass}`.trim(),
  };
};

// Custom styles for react-big-calendar
const calendarCustomStyles = {
  ".rbc-calendar": "min-h-[600px] h-[calc(100vh-180px)]",
  ".rbc-toolbar button":
    "text-gray-600 border border-gray-200 bg-white px-4 py-2 font-medium hover:bg-gray-50",
  ".rbc-toolbar button.rbc-active": "bg-blue-50 text-blue-700 border-blue-400",
  ".rbc-month-view": "border border-gray-200 rounded-lg",
  ".rbc-header": "py-2 font-medium text-sm",
  ".rbc-date-cell":
    "p-1 text-right font-medium hover:bg-gray-50 cursor-pointer",
  ".rbc-today": "bg-blue-50",
  ".rbc-event": "relative p-1 rounded border-l-4 m-px text-xs",
  ".cabinet-cabinet-1":
    "bg-blue-500 bg-opacity-90 border-l-blue-700 text-white",
  ".cabinet-cabinet-2":
    "bg-green-500 bg-opacity-90 border-l-green-700 text-white",
  ".cabinet-cabinet-3":
    "bg-orange-500 bg-opacity-90 border-l-orange-700 text-white",
  ".cabinet-cabinet-4":
    "bg-purple-500 bg-opacity-90 border-l-purple-700 text-white",
  ".appointment-completed":
    'opacity-80 after:content-["✓"] after:absolute after:right-1 after:top-1 after:text-xs',
  ".appointment-cancelled": "opacity-60 line-through",
  ".rbc-time-view": "border border-gray-200 rounded-lg overflow-hidden",
  ".rbc-time-header": "border-b border-gray-200",
  ".rbc-time-content": "h-[calc(100%-60px)] min-h-[500px]",
  ".rbc-time-slot": "min-h-[30px]",
};

const AppointmentCalendar = ({
  appointments = [],
  onTimeSlotSelect,
  onAppointmentUpdated,
  onAppointmentDeleted,
}) => {
  const [tooltipEvent, setTooltipEvent] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Convert appointments to calendar events using proper time handling
  const calendarEvents = useMemo(() => {
    return appointments.map((appointment) => {
      // Parse the date and time properly
      const dateStr = moment(appointment.date).format("YYYY-MM-DD");
      const start = moment(
        `${dateStr} ${appointment.timeSlot}`,
        "YYYY-MM-DD HH:mm"
      ).toDate();
      const end = moment(
        `${dateStr} ${appointment.timeSlot}`,
        "YYYY-MM-DD HH:mm"
      )
        .add(30, "minutes")
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
        resource: appointment.cabinet, // For resource-based views
      };
    });
  }, [appointments]);

  const handleSelectSlot = ({ start }) => {
    const timeSlot = moment(start).format("HH:mm");
    onTimeSlotSelect({
      start,
      timeSlot,
    });
  };

  const handleSelectEvent = (event) => {
    // Find the full appointment data
    const appointment = appointments.find((apt) => apt._id === event.id);
    if (appointment) {
      setSelectedAppointment(appointment);
    }
  };

  const EventComponent = ({ event }) => {
    const eventRef = useRef(null);

    const handleMouseEnter = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY,
      });
      setTooltipEvent(event);
    };

    const handleMouseLeave = () => {
      setTooltipEvent(null);
    };

    return (
      <div
        ref={eventRef}
        className="relative w-full h-full text-xs leading-tight"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={(e) => {
          e.stopPropagation();
          handleSelectEvent(event);
        }}
      >
        <span className="block truncate">{event.title}</span>
      </div>
    );
  };

  EventComponent.propTypes = {
    event: PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      start: PropTypes.instanceOf(Date).isRequired,
      end: PropTypes.instanceOf(Date).isRequired,
      patientName: PropTypes.string.isRequired,
      dentistName: PropTypes.string,
      type: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      cabinet: PropTypes.string,
    }).isRequired,
  };

  const CabinetLegend = () => (
    <div className="mb-4 p-2 bg-white rounded-lg border border-gray-200">
      <h4 className="mb-2 text-sm text-gray-600">Cabinets</h4>
      <div className="flex flex-wrap gap-4">
        {["Cabinet-1", "Cabinet-2", "Cabinet-3", "Cabinet-4"].map((cabinet) => (
          <div key={cabinet} className="flex items-center gap-2">
            <span
              className={`w-4 h-4 rounded ${
                cabinet === "Cabinet-1"
                  ? "bg-blue-500 bg-opacity-90"
                  : cabinet === "Cabinet-2"
                  ? "bg-green-500 bg-opacity-90"
                  : cabinet === "Cabinet-3"
                  ? "bg-orange-500 bg-opacity-90"
                  : "bg-purple-500 bg-opacity-90"
              }`}
            />
            <span className="text-xs text-gray-600">{cabinet}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="relative bg-white rounded-lg shadow-sm p-4">
      <CabinetLegend />
      <Calendar
        localizer={momentLocalizer(moment)}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        step={30}
        timeslots={1}
        defaultView="week"
        views={["month", "week", "day"]}
        min={moment().set("hours", 8).set("minutes", 0).toDate()}
        max={moment().set("hours", 21).set("minutes", 30).toDate()}
        scrollToTime={moment().set("hours", 8).set("minutes", 0).toDate()}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        selectable={true}
        eventPropGetter={eventStyleGetter}
        components={{
          event: EventComponent,
        }}
        formats={{
          timeGutterFormat: "HH:mm",
          eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
            `${localizer.format(start, "HH:mm", culture)} - ${localizer.format(
              end,
              "HH:mm",
              culture
            )}`,
        }}
        dayLayoutAlgorithm="no-overlap"
        tooltipAccessor={null}
      />

      {tooltipEvent && (
        <div
          className={`absolute z-50 ${
            tooltipEvent ? "opacity-100" : "opacity-0"
          }`}
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y - 10}px`,
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

      <style>
        {`
          ${Object.entries(calendarCustomStyles)
            .map(
              ([selector, styles]) => `
              ${selector} {
                @apply ${styles};
              }
            `
            )
            .join("\n")}
          
          @media (max-width: 768px) {
            .rbc-calendar {
              @apply h-[calc(100vh-100px)];
            }
            .rbc-time-view .rbc-time-content {
              @apply min-h-[400px];
            }
            .rbc-time-view .rbc-time-slot {
              @apply min-h-[35px];
            }
          }

          @media (max-width: 480px) {
            .rbc-calendar {
              @apply h-[calc(100vh-80px)];
            }
            .rbc-time-view .rbc-time-slot {
              @apply min-h-[30px];
            }
          }
        `}
      </style>
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
      cabinet: PropTypes.string,
    })
  ).isRequired,
  onTimeSlotSelect: PropTypes.func.isRequired,
  onAppointmentUpdated: PropTypes.func.isRequired,
  onAppointmentDeleted: PropTypes.func.isRequired,
};

export default AppointmentCalendar;
