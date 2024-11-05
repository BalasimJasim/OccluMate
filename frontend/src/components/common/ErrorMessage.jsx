import React from 'react';
import { FaExclamationCircle } from 'react-icons/fa';
import './ErrorMessage.scss';

export const ErrorMessage = ({ message }) => {
  return (
    <div className="error-message">
      <FaExclamationCircle />
      <p>{message || 'An error occurred. Please try again.'}</p>
    </div>
  );
}; 