import PropTypes from "prop-types";

const Stat = ({
  title,
  value,
  icon: Icon,
  variant = "primary",
  className = "",
}) => {
  const variants = {
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger",
    info: "text-info",
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
        </div>
        {Icon && (
          <div
            className={`p-3 rounded-full bg-opacity-10 ${variants[variant]} bg-${variant}`}
          >
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};

Stat.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.elementType,
  variant: PropTypes.oneOf(["primary", "success", "warning", "danger", "info"]),
  className: PropTypes.string,
};

export default Stat;
