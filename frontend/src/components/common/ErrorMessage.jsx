import React from 'react';
import { FaExclamationCircle } from 'react-icons/fa';
import PropTypes from "prop-types";

export const ErrorMessage = ({ message }) => {
  return (
    <div
      className="flex items-center p-4 mb-4 text-red-800 bg-red-50 rounded-lg"
      role="alert"
    >
      <FaExclamationCircle className="flex-shrink-0 w-5 h-5 mr-2" />
      <p className="text-sm font-medium">
        {message || "An error occurred. Please try again."}
      </p>
    </div>
  );
};

ErrorMessage.propTypes = {
  message: PropTypes.string,
};

export default ErrorMessage; 