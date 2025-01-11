import PropTypes from "prop-types";
import moment from "moment";

const AppointmentTooltip = ({ event }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="fixed z-50 bg-white rounded-lg shadow-lg p-4 max-w-sm w-full">
      <div className="space-y-4">
        <div className="border-b border-gray-200 pb-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {event.patientName}
          </h3>
          <p className="text-sm text-gray-500">
            {moment(event.start).format("HH:mm")} -{" "}
            {moment(event.end).format("HH:mm")}
          </p>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Dentist:</span>
            <span className="text-sm text-gray-900">
              {event.dentistName || "Not assigned"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Type:</span>
            <span className="text-sm text-gray-900">{event.type}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Cabinet:</span>
            <span className="text-sm text-gray-900">{event.cabinet}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Status:</span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                event.status
              )}`}
            >
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
