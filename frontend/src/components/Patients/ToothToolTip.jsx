import PropTypes from "prop-types";

const ToothTooltip = ({ tooth }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-800";
      case "decayed":
        return "bg-red-100 text-red-800";
      case "filled":
        return "bg-blue-100 text-blue-800";
      case "missing":
        return "bg-gray-100 text-gray-800";
      case "crown":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="absolute z-50 w-64 p-4 bg-white rounded-lg shadow-lg border border-gray-200 transform -translate-x-1/2 -translate-y-full mt-2">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-900">
            Tooth {tooth.number}
          </h3>
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
              tooth.status
            )}`}
          >
            {tooth.status}
          </span>
        </div>

        {tooth.notes && (
          <div>
            <h4 className="text-xs font-medium text-gray-700 mb-1">Notes</h4>
            <p className="text-sm text-gray-600">{tooth.notes}</p>
          </div>
        )}

        {tooth.procedures && tooth.procedures.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-700 mb-1">
              Procedures
            </h4>
            <ul className="space-y-1">
              {tooth.procedures.map((procedure, index) => (
                <li key={index} className="text-sm text-gray-600">
                  {procedure}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="absolute w-3 h-3 bg-white border-l border-b border-gray-200 transform rotate-45 left-1/2 -bottom-1.5 -ml-1.5"></div>
    </div>
  );
};

ToothTooltip.propTypes = {
  tooth: PropTypes.shape({
    number: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired,
    notes: PropTypes.string,
    procedures: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};

export default ToothTooltip;
