import React, { useEffect, useCallback } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { usePlaid } from '../../hooks/usePlaid';
import { 
  BuildingOfficeIcon, 
  ArrowPathIcon 
} from '@heroicons/react/24/outline';

const PlaidLink = ({ 
  onSuccess, 
  onExit, 
  buttonText = 'Connect Bank Account', 
  className = '', 
  variant = 'primary' 
}) => {
  const { linkToken, generateLinkToken, loading } = usePlaid();
  
  useEffect(() => {
    // Generate a link token if we don't have one
    if (!linkToken) {
      generateLinkToken();
    }
  }, [linkToken, generateLinkToken]);
  
  // Handle successful link
  const handleSuccess = useCallback((publicToken, metadata) => {
    if (typeof onSuccess === 'function') {
      onSuccess(publicToken, metadata);
    }
  }, [onSuccess]);
  
  // Handle exit
  const handleExit = useCallback((err, metadata) => {
    if (typeof onExit === 'function') {
      onExit(err, metadata);
    }
  }, [onExit]);
  
  // Configure Plaid Link
  const config = {
    token: linkToken,
    onSuccess: handleSuccess,
    onExit: handleExit
  };
  
  // Initialize Plaid Link
  const { open, ready } = usePlaidLink(config);
  
  // Button style variants
  const buttonClasses = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    secondary: 'bg-white hover:bg-gray-50 text-indigo-600 border border-indigo-200',
    outline: 'bg-transparent hover:bg-indigo-50 text-indigo-600 border border-indigo-300'
  };
  
  return (
    <button
      onClick={() => open()}
      disabled={!ready || !linkToken || loading.linkToken}
      className={`${buttonClasses[variant] || buttonClasses.primary} ${className} flex items-center justify-center px-4 py-2 rounded-lg font-medium shadow-sm transition-colors`}
    >
      {loading.linkToken ? (
        <>
          <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
          Preparing Connection...
        </>
      ) : (
        <>
          <BuildingOfficeIcon className="h-5 w-5 mr-2" />
          {buttonText}
        </>
      )}
    </button>
  );
};

export default PlaidLink;