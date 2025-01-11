import { useState } from "react";
import AppointmentList from "./AppointmentList";
import AppointmentCalendar from "./AppointmentCalendar";
import PropTypes from "prop-types";

const AppointmentsContainer = () => {
  const [view, setView] = useState("list"); // 'list' or 'calendar'

  // Sample appointments data (in a real app, this would come from an API)
  const appointments = [
    {
      id: "1",
      date: "2024-03-20",
      time: "09:00 AM",
      patient: "John Doe",
      email: "john.doe@example.com",
      type: "Check-up",
      status: "Confirmed",
      statusVariant: "success",
    },
    {
      id: "2",
      date: "2024-03-20",
      time: "10:30 AM",
      patient: "Jane Smith",
      email: "jane.smith@example.com",
      type: "Cleaning",
      status: "Pending",
      statusVariant: "warning",
    },
    // Add more appointments as needed
  ];

  return (
    <>
      {view === "list" ? (
        <AppointmentList appointments={appointments} onViewChange={setView} />
      ) : (
        <AppointmentCalendar
          appointments={appointments}
          onViewChange={setView}
        />
      )}
    </>
  );
};

AppointmentsContainer.propTypes = {
  appointments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      time: PropTypes.string.isRequired,
      patient: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      statusVariant: PropTypes.string.isRequired,
    })
  ),
};

export default AppointmentsContainer;
