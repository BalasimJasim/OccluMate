import PropTypes from "prop-types";

const Button = ({
  children,
  variant = "primary",
  disabled,
  type = "button",
  className = "",
  onClick,
}) => {
  const baseStyles =
    "px-4 py-2 rounded-md font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    primary: "bg-primary hover:bg-primary/90 text-white focus:ring-primary/50",
    secondary:
      "bg-secondary hover:bg-secondary/90 text-white focus:ring-secondary/50",
    outline:
      "border-2 border-primary text-primary hover:bg-primary/10 focus:ring-primary/50",
    danger: "bg-danger hover:bg-danger/90 text-white focus:ring-danger/50",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(["primary", "secondary", "outline", "danger"]),
  disabled: PropTypes.bool,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  className: PropTypes.string,
  onClick: PropTypes.func,
};

export default Button;
