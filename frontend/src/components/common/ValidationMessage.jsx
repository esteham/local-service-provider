import React from 'react';
import { FaSpinner, FaCheck, FaTimes } from 'react-icons/fa';

const ValidationMessage = ({ 
  isChecking, 
  isValid, 
  message, 
  className = '' 
}) => {
  if (!message && !isChecking) return null;

  const getIcon = () => {
    if (isChecking) return <FaSpinner className="fa-spin" />;
    if (isValid === true) return <FaCheck />;
    if (isValid === false) return <FaTimes />;
    return null;
  };

  const getClassName = () => {
    let baseClass = `validation-message d-flex align-items-center gap-2 mt-1 small ${className}`;
    
    if (isChecking) return `${baseClass} text-info`;
    if (isValid === true) return `${baseClass} text-success`;
    if (isValid === false) return `${baseClass} text-danger`;
    
    return `${baseClass} text-muted`;
  };

  return (
    <div className={getClassName()}>
      {getIcon()}
      <span>{isChecking ? 'Checking...' : message}</span>
    </div>
  );
};

export default ValidationMessage;
