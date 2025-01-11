import { useState, useMemo } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Card from "../../common/Card";
import Button from "../../common/Button";
import Badge from "../../common/Badge";
import { FaCalendarAlt, FaList } from "react-icons/fa";
import PropTypes from "prop-types";

const locales = {
  "en-US": require("date-fns/locale/en-US"),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const AppointmentCalendar = ({ onViewChange, appointments = [] }) => {
  const [view, setView] = useState("month");
  const [date, setDate] = useState(new Date());

  const eventStyleGetter = (event) => {
    const style = {
      backgroundColor:
        event.status === "Confirmed"
          ? "#28a745"
          : event.status === "Pending"
          ? "#ffc107"
          : event.status === "Cancelled"
          ? "#dc3545"
          : "#007bff",
      borderRadius: "4px",
      opacity: 0.8,
      color: "#fff",
      border: "0",
      display: "block",
    };
    return { style };
  };

  const calendarEvents = useMemo(() => {
    return appointments.map((appointment) => ({
      id: appointment.id,
      title: `${appointment.patient} - ${appointment.type}`,
      start: new Date(`${appointment.date} ${appointment.time}`),
      end: new Date(`${appointment.date} ${appointment.time}`),
      status: appointment.status,
      patient: appointment.patient,
      type: appointment.type,
      email: appointment.email,
    }));
  }, [appointments]);

  const CustomToolbar = ({ label, onNavigate, onView }) => (
    <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-b border-gray-200">
      <div className="flex items-center space-x-2 mb-4 sm:mb-0">
        <Button variant="outline" onClick={() => onNavigate("PREV")}>
          &lt;
        </Button>
        <h2 className="text-xl font-semibold px-4">{label}</h2>
        <Button variant="outline" onClick={() => onNavigate("NEXT")}>
          &gt;
        </Button>
        <Button variant="outline" onClick={() => onNavigate("TODAY")}>
          Today
        </Button>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant={view === "month" ? "primary" : "outline"}
          onClick={() => onView("month")}
        >
          Month
        </Button>
        <Button
          variant={view === "week" ? "primary" : "outline"}
          onClick={() => onView("week")}
        >
          Week
        </Button>
        <Button
          variant={view === "day" ? "primary" : "outline"}
          onClick={() => onView("day")}
        >
          Day
        </Button>
      </div>
    </div>
  );

  CustomToolbar.propTypes = {
    label: PropTypes.string.isRequired,
    onNavigate: PropTypes.func.isRequired,
    onView: PropTypes.func.isRequired,
  };

  const CustomEvent = ({ event }) => (
    <div className="p-1">
      <div className="font-medium">{event.patient}</div>
      <div className="text-sm">{event.type}</div>
      <Badge
        variant={
          event.status === "Confirmed"
            ? "success"
            : event.status === "Pending"
            ? "warning"
            : event.status === "Cancelled"
            ? "danger"
            : "primary"
        }
      >
        {event.status}
      </Badge>
    </div>
  );

  CustomEvent.propTypes = {
    event: PropTypes.shape({
      patient: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
    }).isRequired,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Calendar</h1>
        <div className="flex space-x-2">
          <Button onClick={() => onViewChange("list")}>
            <FaList className="w-4 h-4 mr-2" />
            List View
          </Button>
          <Button>
            <FaCalendarAlt className="w-4 h-4 mr-2" />
            New Appointment
          </Button>
        </div>
      </div>

      <Card>
        <div className="h-[700px]">
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            view={view}
            onView={setView}
            date={date}
            onNavigate={setDate}
            eventPropGetter={eventStyleGetter}
            components={{
              toolbar: CustomToolbar,
              event: CustomEvent,
            }}
            popup
            selectable
            className="rounded-lg"
          />
        </div>
      </Card>
    </div>
  );
};

AppointmentCalendar.propTypes = {
  onViewChange: PropTypes.func.isRequired,
  appointments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      time: PropTypes.string.isRequired,
      patient: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
    })
  ),
};

export default AppointmentCalendar;
