import React from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/solid';

const InputField = ({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className = '',
  icon,
  autoComplete,
  maxLength,
  min,
  max,
  pattern,
  helpText,
  ...props
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={id} className="label">
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        
        <input
          id={id}
          name={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`input-field ${icon ? 'pl-10' : ''} ${
            error ? 'border-danger-500 focus:ring-danger-500 focus:border-danger-500' : ''
          } ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
          autoComplete={autoComplete}
          maxLength={maxLength}
          min={min}
          max={max}
          pattern={pattern}
          {...props}
        />
        
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ExclamationCircleIcon className="h-5 w-5 text-danger-500" aria-hidden="true" />
          </div>
        )}
      </div>
      
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-danger-500">{error}</p>
      )}
    </div>
  );
};

export default InputField;